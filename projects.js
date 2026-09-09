import { ProjectCard } from './components/project-card.js';

let projectInstances = [];
const base="https://portfolioapi-a7og.onrender.com"; 
document.addEventListener('DOMContentLoaded', async () => {
    const displayArea = document.getElementById('project-display-area');
    const submissionForm = document.getElementById('project-submission-form');
    const statusDiv = document.getElementById('submission-status');

    // Fetch CSRF Token for Secure Submissions
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

    // Fetch and display initial projects list from API
    async function loadProjectsFromAPI() {
        try {
            const response = await fetch(base + '/api/projects');

            const contentType = response.headers.get('content-type');
            if (!response.ok || !contentType || !contentType.includes('application/json')) {
                throw new TypeError('Server returned non-JSON response');
            }

            const data = await response.json();
            projectInstances = data;
            renderProjects(projectInstances);
        } catch (error) {
            console.error('Fetch Error:', error);
            displayArea.innerHTML = '<p>Error loading projects from server.</p>';
        }
    }

    // Render Web Components based on API response
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
            card.setAttribute('title', project.title || 'Untitled');
            card.setAttribute('description', project.description || project.desc || '');
            card.setAttribute('tech', Array.isArray(project.tech) ? project.tech.join(',') : '');
            card.setAttribute('image', project.image || 'profile.jpg');

            displayArea.appendChild(card);
        });
    }

    // Handle Form Submission using fetch POST
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
                const newProject = { title, description: desc, tech, image: 'profile.jpg' };
                projectInstances.push(newProject);
                renderProjects(projectInstances);
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

    // Initialize API Call
    loadProjectsFromAPI();
});
