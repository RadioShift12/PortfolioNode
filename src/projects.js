import './components/project-card.js';
import { buildTechIndex, countTechnologies, makeAcronym } from './utils/projectTools.js';

let projectInstances = [];
const base = "";

document.addEventListener('DOMContentLoaded', async () => {
    const displayArea = document.getElementById('project-display-area');
    const submissionForm = document.getElementById('project-submission-form');
    const statusDiv = document.getElementById('submission-status');
    const searchInput = document.getElementById('project-search');
    const techUsageList = document.getElementById('tech-usage');

    async function getCsrfToken() {
        try {
            const res = await fetch(base + '/api/csrf-token');
            const data = await res.json();
            return data.csrfToken;
        } catch (err) {
            console.error('Failed to obtain CSRF Token:', err);
            return null;
        }
    }

    // Make every project use the same shape (fixes the tech / technologiesUsed bug)
    function normalizeProject(project) {
        return {
            title: project.title || 'Untitled',
            description: project.description || project.desc || '',
            image: project.image || 'profile.jpg',
            technologiesUsed: project.technologiesUsed || project.tech || []
        };
    }

    async function loadProjectsFromAPI() {
        try {
            const response = await fetch(base + '/api/projects');

            const contentType = response.headers.get('content-type');
            if (!response.ok || !contentType || !contentType.includes('application/json')) {
                throw new TypeError('Server returned non-JSON response');
            }

            const data = await response.json();
            projectInstances = data.map(normalizeProject);
            renderProjects(projectInstances);
            renderTechCounts();
        } catch (error) {
            console.error('Fetch Error:', error);
            displayArea.textContent = 'Error loading projects from server.';
        }
    }

    function renderProjects(list) {
        displayArea.replaceChildren();

        if (list.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'No projects found.';
            displayArea.appendChild(emptyMsg);
            return;
        }

        list.forEach(project => {
            const card = document.createElement('project-card');
            card.setAttribute('title', project.title);
            card.setAttribute('description', project.description);
            card.setAttribute('tech', project.technologiesUsed.join(','));
            card.setAttribute('image', project.image);
            card.setAttribute('acronym', makeAcronym(project.title));
            displayArea.appendChild(card);
        });
    }

    // Tech Usage summary in the sidebar
    function renderTechCounts() {
        if (!techUsageList) return;
        techUsageList.replaceChildren();

        const counts = countTechnologies(projectInstances);
        Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([tech, count]) => {
                const li = document.createElement('li');
                li.className = 'asideText';
                li.textContent = `${tech}: ${count} project${count === 1 ? '' : 's'}`;
                techUsageList.appendChild(li);
            });
    }

    // Search using the ETL index
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            renderProjects(projectInstances);
            return;
        }

        const index = buildTechIndex(projectInstances);
        const matchedTitles = new Set();
        Object.keys(index).forEach(tech => {
            if (tech.includes(query)) {
                index[tech].forEach(title => matchedTitles.add(title));
            }
        });

        renderProjects(projectInstances.filter(p => matchedTitles.has(p.title)));
    });

    submissionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('new-title').value.trim();
        const desc = document.getElementById('new-desc').value.trim();
        const tech = document.getElementById('new-tech').value.split(',').map(t => t.trim()).filter(Boolean);

        const csrfToken = await getCsrfToken();
        if (!csrfToken) {
            statusDiv.textContent = 'Security token missing.';
            return;
        }

        try {
            const response = await fetch(base + '/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'csrf-token': csrfToken
                },
                body: JSON.stringify({ title, desc, tech })
            });

            if (response.ok) {
                projectInstances.push(normalizeProject({ title, description: desc, technologiesUsed: tech }));
                searchInput.value = '';
                renderProjects(projectInstances);
                renderTechCounts();
                submissionForm.reset();
                statusDiv.textContent = 'Project added successfully!';
                statusDiv.style.color = 'green';
            } else {
                const errData = await response.json();
                statusDiv.textContent = 'Failed: ' + (errData.errors?.map(e => e.msg).join(', ') || 'Error');
                statusDiv.style.color = 'red';
            }
        } catch (err) {
            statusDiv.textContent = 'Server communication error.';
            statusDiv.style.color = 'red';
        }
    });

    loadProjectsFromAPI();
});