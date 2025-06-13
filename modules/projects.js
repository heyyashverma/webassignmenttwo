// modules/projects.js

const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

function initialize() {
    return new Promise((resolve, reject) => {
        try {
            projects = projectData.map(proj => {
                const sectorMatch = sectorData.find(sec => sec.id === proj.sector_id);
                return {
                    ...proj,
                    sector: sectorMatch ? sectorMatch.sector_name : "Unknown"
                };
            });
            resolve(); 
        } catch (err) {
            reject("Initialization failed: " + err);
        }
    });
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
        if (projects.length > 0) {
            resolve(projects);
        } else {
            reject("No projects found.");
        }
    });
}

function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            resolve(project);
        } else {
            reject(`Project with ID ${projectId} not found.`);
        }
    });
}

function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const results = projects.filter(p =>
            p.sector.toLowerCase().includes(sector.toLowerCase())
        );
        if (results.length > 0) {
            resolve(results);
        } else {
            reject(`No projects found for sector: ${sector}`);
        }
    });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };


