import { Project } from './modules/project.js';
import { ProjectCard } from './components/project-card.js';

export function createSafeElement(tag, text) {
    const el = document.createElement(tag);
    el.textContent = text;
    return el;
}

let currentId = 0; 

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
        const response = await fetch('/api/projects');
        
        // Ensure the response is OK and actually JSON
        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType || !contentType.includes('application/json')) {
            throw new TypeError("Server returned non-JSON response");
        }
        
        const data = await response.json();
        // ... process data
    } catch (error) {
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
            const { title, description, tech, image } = project.getDetails();
            
            // Make component
            const card = document.createElement('project-card');
            card.setAttribute('title', title);
            card.setAttribute('description', description);
            card.setAttribute('tech', tech.join(','));
            card.setAttribute('image', image);

            displayArea.appendChild(card);
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
        if (!storedToken) {
            statusDiv.textContent = "Security token missing. Refresh the page.";
            return;
        }

        const title = document.getElementById('new-title').value.trim();
        const desc = document.getElementById('new-desc').value.trim();
        const tech = document.getElementById('new-tech').value.split(',').map(t => t.trim()).filter(t => t);

        console.log('[Submitting]:', { title, desc, tech });

        // Client-side validation
        const validationErrors = [];
        if (!title) validationErrors.push("Project title is required.");
        if (!desc) validationErrors.push("Description is required.");
        if (tech.length === 0) validationErrors.push("At least one technology is required.");

        if (validationErrors.length > 0) {
            statusDiv.textContent = validationErrors.join(' ');
            statusDiv.style.color = "red";
            return;
        }


            try {
            const response = await fetch('/api/projects', {
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
            } else {
                const errData = await response.json();
                console.error('[Server Validation Errors]:', errData);
                statusDiv.textContent = "Submission failed: " + (errData.errors?.map(e => e.msg).join(', ') || 'Unknown error');
                statusDiv.style.color = "red";
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