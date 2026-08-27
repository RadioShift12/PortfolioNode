export class ProjectCard extends HTMLElement {
    constructor() {
        super();
        // Attach a Shadow DOM to keep styles and scope isolated
        this.attachShadow({ mode: 'open' });
        this.lastTap = 0;
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['title', 'description', 'tech', 'image'];
    }

    attributeChangedCallback() {
        if (this.shadowRoot.hasChildNodes()) {
            this.render();
        }
    }

    // Helper to safely build
    createSafeElement(tag, text = '', className = '') {
        const el = document.createElement(tag);
        if (text) el.textContent = text;
        if (className) el.className = className;
        return el;
    }

    render() {
        this.shadowRoot.replaceChildren();
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                margin-bottom: 40px;
            }
            article {
                overflow: auto;
                transition: transform 0.2s ease, background-color 0.2s ease;
                border-radius: 8px;
                padding: 10px;
            }
            h2 {
                color: rgb(30, 41, 53);
                margin-top: 0;
            }
            img {
                float: left;
                margin: 0 20px 10px 0;
                width: 250px;
                height: auto;
                border-radius: 8px;
                border: 1px solid rgb(226, 232, 240);
            }
            p {
                color: rgb(51, 69, 85);
                line-height: 1.6;
            }
            .tech-tags {
                margin-top: 10px;
            }
            .tag {
                background: #e0f2f1;
                color: #00796b;
                padding: 4px 10px;
                border-radius: 15px;
                font-size: 0.8rem;
                margin-right: 5px;
                display: inline-block;
            }
        `;

        // attribute data
        const title = this.getAttribute('title') || 'Untitled Project';
        const description = this.getAttribute('description') || '';
        const techAttr = this.getAttribute('tech') || '';
        const techList = techAttr ? techAttr.split(',').map(t => t.trim()) : [];
        const image = this.getAttribute('image') || 'placeholder.png';

        // Container
        const article = document.createElement('article');
        article.className = 'project-item';

        // Mobile Feature (taken from projects.js)
        article.addEventListener('touchstart', () => {
            const now = Date.now();
            const DOUBLE_TAP_DELAY = 300;
            if (now - this.lastTap < DOUBLE_TAP_DELAY) {
                article.style.backgroundColor = 
                    article.style.backgroundColor === 'rgb(224, 242, 254)' ? '' : 'rgb(224, 242, 254)';
            }
            this.lastTap = now;
        }, { passive: true });

        // Title
        const h2 = this.createSafeElement('h2', title);

        // Responsive Image
        const img = document.createElement('img');
        img.src = image;
        img.srcset = `${image} 600w, ${image} 1200w`;
        img.sizes = "(max-width: 600px) 100vw, 50vw";
        img.alt = title;
        img.onerror = () => {
            img.src = 'placeholder.png';
            img.srcset = '';
        };

        // Description Paragraph
        const p = this.createSafeElement('p', description);

        // Tech Tag
        const techDiv = this.createSafeElement('div', '', 'tech-tags');
        techList.forEach(techName => {
            const span = this.createSafeElement('span', techName, 'tag');
            techDiv.appendChild(span);
        });

        // Assemble
        article.append(h2, img, p, techDiv);
        this.shadowRoot.append(style, article);
    }
}

// Register Custom Element Pattern
customElements.define('project-card', ProjectCard);