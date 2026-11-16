export function buildTechIndex(projects) {
    const index = {};
    projects.forEach(project => {
        (project.technologiesUsed || []).forEach(tech => {
            const key = tech.trim().toLowerCase();
            if (!index[key]) index[key] = [];
            index[key].push(project.title);
        });
    });
    return index;
}

// how many projects use each technology
export function countTechnologies(projects) {
    const counts = {};
    projects.forEach(project => {
        (project.technologiesUsed || []).forEach(tech => {
            const name = tech.trim();
            counts[name] = (counts[name] || 0) + 1;
        });
    });
    return counts;
}

export function makeAcronym(title) {
    const words = (title || '').match(/[A-Za-z]+/g) || [];
    return words.map(word => word[0].toUpperCase()).join('') || '?';
}