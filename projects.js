import { Project } from './modules/project.js';
export function createSafeElement(tag, text) {
    const el = document.createElement(tag);
    el.textContent = text;
    return el;
}

let currentId = 0; 

// Part 2: Security - Rate Limiting Closure (Maintained from B2)
const checkRateLimit = (() => {
    let lastSubmit = 0;
    const limit = 5000; 
    return () => {
        const now = Date.now();
        if (now - lastSubmit < limit) return false;
        lastSubmit = now;
        return true;
    };
})();

document.addEventListener('DOMContentLoaded', async () => {
    // Part 2: CSRF Protection Setup
    const csrfToken = Math.random().toString(36).substring(2);
    sessionStorage.setItem('project_csrf_token', csrfToken);

    const displayArea = document.getElementById('project-display-area');
    const searchInput = document.getElementById('project-search');
    const submissionForm = document.getElementById('project-submission-form');
    const statusDiv = document.getElementById('submission-status');

    let projectInstances = [];


    //Load from Local Storage first
    const cachedProjects = localStorage.getItem('portfolio_projects');
    if (cachedProjects) {
        const data = JSON.parse(cachedProjects);
        projectInstances = data.map(item => new Project({ ...item, currentId: currentId++ }));
        renderProjects(projectInstances);
    }

    // Part 3: Secure data loading using Fetch
    async function loadInitialData() {
        try {
            // 1. Fetch the CSRF token from your new server endpoint
            const tokenResponse = await fetch('/api/csrf-token');
            const { csrfToken } = await tokenResponse.json();
            sessionStorage.setItem('project_csrf_token', csrfToken);

            const response = await fetch('/api/projects'); // Part 3: Secure data loading
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            // Merge with existing instances if local storage is empty
            if (projectInstances.length === 0) {
                projectInstances = data.map(item => new Project({ ...item, currentId: currentId++ }));
                console.log("Fetched Projects:", projectInstances);
                renderProjects(projectInstances);
                localStorage.setItem('portfolio_projects', JSON.stringify(data));
            }
        } catch (error) {
            // Part 2 and 3: User-friendly error feedback
            if (projectInstances.length === 0) {
                statusDiv.textContent = "Unable to load new projects. Please check your connection.";
                statusDiv.style.color = "red";
            }
            console.error("Fetch Error:", error);
        }
    }

    function renderProjects(list) {
        displayArea.replaceChildren();

        if (list.length === 0) {
            displayArea.appendChild(createSafeElement('p', "No projects found matching your search."));
            return;
        }

        list.forEach(project => {
            try {
                const { title, description, tech, image } = project.getDetails();
                console.log(tech);
                const article = document.createElement('article');
                article.className = 'project-item';

                const h2 = createSafeElement('h2', title);
                
                const img = document.createElement('img');
                img.src = image;
                img.className = 'project-img';
                img.alt = title; 
                img.onerror = () => { img.src = 'placeholder.png'; };

                const p = createSafeElement('p', description);

                const techDiv = document.createElement('div');
                techDiv.className = 'tech-tags';

                tech.forEach(t => {
                    const span = createSafeElement('span', t);
                    span.className = 'tag';
                    techDiv.appendChild(span);
                });

                article.append(h2, img, p, techDiv);
                displayArea.appendChild(article);
            } catch (err) {
                console.error("Render Item Error:", err);
            }
        });
    }

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = projectInstances.filter(p => {
            const details = p.getDetails();
            return details.title.toLowerCase().includes(term) || 
                   details.tech.some(t => t.toLowerCase().includes(term));
        });
        renderProjects(filtered);
    });

    submissionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Rate Limit Check
        if (!checkRateLimit()) {
            statusDiv.textContent = "Too many requests. Please wait.";
            statusDiv.style.color = "orange";
            return;
        }

        // Token Validation
        const storedToken = sessionStorage.getItem('project_csrf_token');
        if (!storedToken || storedToken !== csrfToken) {
            console.error("Security: CSRF validation failed.");
            statusDiv.textContent = "Security validation failed.";
            return;
        }

        const title = document.getElementById('new-title').value;
        const desc = document.getElementById('new-desc').value;
        const tech = document.getElementById('new-tech').value.split(',').map(t => t.trim());


            try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': storedToken
                },
                body: JSON.stringify({ title, desc, tech })
            });

            if (response.ok) {
                // PART 4: Only update the UI if the server validates the data
                const newProj = new Project({ title, description: desc, technologiesUsed: tech });
                projectInstances.push(newProj);
                renderProjects(projectInstances);
                submissionForm.reset();
                statusDiv.textContent = "Project added securely!";
            }
        } catch (err) {
            statusDiv.textContent = "Server communication error.";
        }
        
        const dataToSave = projectInstances.map(p => {
            const details = p.getDetails();
            return {
                title: details.title,
                description: details.description,
                technologiesUsed: details.tech,
                image: details.image
            };
        });

        localStorage.setItem('portfolio_projects', JSON.stringify(dataToSave));
        
        renderProjects(projectInstances);
        submissionForm.reset();
        statusDiv.textContent = "Project added and cached successfully!";
        statusDiv.style.color = "green";
    });

    // Initial load
    loadInitialData();
});