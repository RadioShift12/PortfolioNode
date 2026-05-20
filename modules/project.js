// Part 3: Object-Oriented Implementation

class Project {
    #id;
    constructor({ title, description, technologiesUsed, image, currentId}) {
        this.#id = currentId; 
        this.title = title;
        this.description = description;
        this.technologiesUsed = technologiesUsed;
        this.image = image || 'placeholder.png';
    }

    get ID() { return this.#id; }

    getDetails() {
        return {
            title: this.title,
            description: this.description,
            tech: this.technologiesUsed,
            image: this.image
        };
    }
}
export { Project };
