/********************************************************************************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Yash Verma Student ID: 166404236 Date: 30-6-25
*
* Published URL: https://webassignmenttwo.vercel.app/
*
********************************************************************************/

const express = require("express");
const path = require("path");
const projectData = require("./modules/projects"); // Adjust path if needed

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Set EJS as the view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Initialize project data before starting the server and defining routes
projectData.initialize()
  .then(() => {
    console.log("Project data initialized successfully.");

    // Home page
    app.get("/", (req, res) => {
      res.render("home", { page: "/" });
    });

    // About page
    app.get("/about", (req, res) => {
      res.render("about", { page: "/about" });
    });

    // Projects list with optional sector filter
    app.get("/solutions/projects", (req, res) => {
      const sector = req.query.sector;

      if (sector) {
        projectData.getProjectsBySector(sector)
          .then(projects => {
            if (projects.length > 0) {
              res.render("projects", { projects, page: "/solutions/projects" });
            } else {
              res.status(404).render("404", { page: "", message: `No projects found for sector: ${sector}` });
            }
          })
          .catch(err => {
            console.error(err);
            res.status(500).render("404", { page: "", message: `Error fetching projects: ${err}` });
          });
      } else {
        projectData.getAllProjects()
          .then(projects => {
            if (projects.length > 0) {
              res.render("projects", { projects, page: "/solutions/projects" });
            } else {
              res.status(404).render("404", { page: "", message: "No projects found." });
            }
          })
          .catch(err => {
            console.error(err);
            res.status(500).render("404", { page: "", message: `Error fetching projects: ${err}` });
          });
      }
    });

    // Single project details by ID
    app.get("/solutions/projects/:id", (req, res) => {
      const projectId = parseInt(req.params.id, 10);

      if (isNaN(projectId)) {
        return res.status(400).render("404", { page: "", message: "Invalid project ID." });
      }

      projectData.getProjectById(projectId)
        .then(project => {
          if (project) {
            res.render("project", { project, page: "" });
          } else {
            res.status(404).render("404", { page: "", message: `Project with ID ${projectId} not found.` });
          }
        })
        .catch(err => {
          console.error(err);
          res.status(500).render("404", { page: "", message: `Error fetching project: ${err}` });
        });
    });

    // Catch-all 404 for all other routes
    app.use((req, res) => {
      res.status(404).render("404", { page: "", message: "Page not found." });
    });

    // Start server
    app.listen(HTTP_PORT, () => {
      console.log(`Server listening on port ${HTTP_PORT}`);
    });

  })
  .catch(err => {
    console.error("Failed to initialize project data or start server:", err);
  });

