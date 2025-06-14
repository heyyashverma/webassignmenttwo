/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Yash Verma Student ID: 166404236 Date: 9-6-25
*
* Published URL: https://webassignmenttwo.vercel.app/
*
********************************************************************************/

const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const path = require('path');

const projectData = require("./modules/projects"); // Ensure this path is correct

// Serve static files from the 'public' directory 
app.use(express.static(path.join(__dirname, 'public')));

projectData.initialize()
    .then(() => {
        console.log("Project data initialized successfully.");

        // Update the "/" route to respond with "views/home.html" 
        app.get("/", (req, res) => {
            res.sendFile(__dirname + "/views/home.html");
        });

        // Add an "/about" route that responds with "views/about.html" 
        app.get("/about", (req, res) => {
            res.sendFile(__dirname + "/views/about.html");
        });

        // Update "/solutions/projects" route to handle "sector" query parameter 
        app.get("/solutions/projects", (req, res) => {
            const sector = req.query.sector;
            if (sector) {
                projectData.getProjectsBySector(sector)
                    .then(data => {
                        if (data.length > 0) {
                            res.json(data);
                        } else {
                            // Return 404 if no projects found for sector 
                            res.status(404).json({ message: `No projects found for sector: ${sector}` });
                        }
                    })
                    .catch(err => {
                        // Return 404 on error 
                        res.status(404).json({ message: err });
                    });
            } else {
                // If no sector query, respond with all unfiltered Project data 
                projectData.getAllProjects()
                    .then(data => {
                        if (data.length > 0) {
                            res.json(data);
                        } else {
                            res.status(404).json({ message: "No projects found." });
                        }
                    })
                    .catch(err => {
                        // Return 404 on error 
                        res.status(404).json({ message: err });
                    });
            }
        });

        // Update "/solutions/projects/:id" route for dynamic ID 
        app.get("/solutions/projects/:id", (req, res) => {
            const projectId = parseInt(req.params.id); // Convert ID to number
            projectData.getProjectById(projectId)
                .then(data => {
                    if (data) {
                        res.json(data);
                    } else {
                        // Return 404 if project not found 
                        res.status(404).json({ message: `Project with ID: ${projectId} not found.` });
                    }
                })
                .catch(err => {
                    // Return 404 on error 
                    res.status(404).json({ message: err });
                });
        });

        // The "/solutions/projects/sector-demo" route has been removed as per assignment requirements 

        // Custom 404 error page - must be the last route 
        app.use((req, res) => {
            res.status(404).sendFile(__dirname + "/views/404.html");
        });

        // Start the server only after data is initialized and routes are set up
        app.listen(HTTP_PORT, () => {
            console.log("Server listening on port " + HTTP_PORT);
        });

    })
    .catch(err => {
        console.log("Failed to initialize project data or start server:", err);
    });