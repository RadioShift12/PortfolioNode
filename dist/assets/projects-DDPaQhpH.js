import{n as e,r as t,t as n}from"./script-BlsglCz6.js";var r,i=t((()=>{r=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:`open`}),this.lastTap=0}connectedCallback(){this.render()}static get observedAttributes(){return[`title`,`description`,`tech`,`image`]}attributeChangedCallback(){this.shadowRoot.hasChildNodes()&&this.render()}createSafeElement(e,t=``,n=``){let r=document.createElement(e);return t&&(r.textContent=t),n&&(r.className=n),r}render(){this.shadowRoot.replaceChildren();let e=document.createElement(`style`);e.textContent=`
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
        `;let t=this.getAttribute(`title`)||`Untitled Project`,n=this.getAttribute(`description`)||``,r=this.getAttribute(`tech`)||``,i=r?r.split(`,`).map(e=>e.trim()):[],a=this.getAttribute(`image`)||`placeholder.png`,o=document.createElement(`article`);o.className=`project-item`,o.addEventListener(`touchstart`,()=>{let e=Date.now();e-this.lastTap<300&&(o.style.backgroundColor=o.style.backgroundColor===`rgb(224, 242, 254)`?``:`rgb(224, 242, 254)`),this.lastTap=e},{passive:!0});let s=this.createSafeElement(`h2`,t),c=document.createElement(`img`);c.src=a,c.srcset=`${a} 600w, ${a} 1200w`,c.sizes=`(max-width: 600px) 100vw, 50vw`,c.alt=t,c.onerror=()=>{c.src=`placeholder.png`,c.srcset=``};let l=this.createSafeElement(`p`,n),u=this.createSafeElement(`div`,``,`tech-tags`);i.forEach(e=>{let t=this.createSafeElement(`span`,e,`tag`);u.appendChild(t)}),o.append(s,c,l,u),this.shadowRoot.append(e,o)}},customElements.define(`project-card`,r)})),a=e((()=>{i();var e=[];document.addEventListener(`DOMContentLoaded`,async()=>{let t=document.getElementById(`project-display-area`),n=document.getElementById(`project-submission-form`),r=document.getElementById(`submission-status`);async function i(){try{return(await(await fetch(`/api/csrf-token`)).json()).csrfToken}catch(e){return console.error(`Failed to obtain CSRF Token:`,e),null}}async function a(){try{let t=await fetch(`/api/projects`),n=t.headers.get(`content-type`);if(!t.ok||!n||!n.includes(`application/json`))throw TypeError(`Server returned non-JSON response`);e=await t.json(),o(e)}catch(e){console.error(`Fetch Error:`,e),t.innerHTML=`<p>Error loading projects from server.</p>`}}function o(e){if(t.replaceChildren(),e.length===0){let e=document.createElement(`p`);e.textContent=`No projects found.`,t.appendChild(e)}else e.forEach(e=>{let n=document.createElement(`project-card`);n.setAttribute(`title`,e.title||`Untitled`),n.setAttribute(`description`,e.description||e.desc||``),n.setAttribute(`tech`,Array.isArray(e.tech)?e.tech.join(`,`):``),n.setAttribute(`image`,e.image||`profile.jpg`),t.appendChild(n)})}n.addEventListener(`submit`,async t=>{t.preventDefault();let a=document.getElementById(`new-title`).value.trim(),s=document.getElementById(`new-desc`).value.trim(),c=document.getElementById(`new-tech`).value.split(`,`).map(e=>e.trim()).filter(Boolean),l=await i();if(!l)r.textContent=`Security token missing.`;else try{let t=await fetch(`/api/projects`,{method:`POST`,headers:{"Content-Type":`application/json`,"csrf-token":l},body:JSON.stringify({title:a,desc:s,tech:c})});if(t.ok){let t={title:a,description:s,tech:c,image:`profile.jpg`};e.push(t),o(e),n.reset(),r.textContent=`Project added successfully!`,r.style.color=`green`}else{let e=await t.json();r.textContent=`Failed: `+(e.errors?.map(e=>e.msg).join(`, `)||`Error`),r.style.color=`red`}}catch{r.textContent=`Server communication error.`,r.style.color=`red`}}),a()})}));n(),a();