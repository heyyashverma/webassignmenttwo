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
const projectData = require("./modules/projects");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Initialize and start server
projectData.initialize().then(() => {
  console.log("Project data initialized successfully.");

  // Home
  app.get("/", (req, res) => {
    res.render("home", { page: "/" });
  });

  // About
  app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
  });

  // All Projects or Filtered by Sector
  app.get("/solutions/projects", (req, res) => {
    const sector = req.query.sector;

    const renderPage = (projects) => {
      if (projects.length > 0) {
        res.render("projects", { projects, page: "/solutions/projects" });
      } else {
        res.status(404).render("404", {
          page: "",
          message: `No projects found${sector ? ' for sector: ' + sector : '.'}`
        });
      }
    };

    const handleError = (err) => {
      console.error(err);
      res.status(500).render("404", {
        page: "",
        message: `Error fetching projects: ${err}`
      });
    };

    if (sector) {
      projectData.getProjectsBySector(sector).then(renderPage).catch(handleError);
    } else {
      projectData.getAllProjects().then(renderPage).catch(handleError);
    }
  });

  // Single Project by ID
  app.get("/solutions/projects/:id", (req, res) => {
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      return res.status(400).render("404", {
        page: "",
        message: "Invalid project ID."
      });
    }

    projectData.getProjectById(projectId)
      .then(project => {
        res.render("project", { project, page: "" });
      })
      .catch(err => {
        res.status(404).render("404", { page: "", message: err });
      });
  });

  // Add Project (GET)
  app.get("/solutions/addProject", (req, res) => {
    projectData.getAllSectors()
      .then(sectors => {
        res.render("addProject", { sectors, page: "/solutions/addProject" });
      })
      .catch(err => {
        res.render("500", {
          message: `I'm sorry, but we have encountered the following error: ${err}`
        });
      });
  });

  // Add Project (POST)
  app.post("/solutions/addProject", (req, res) => {
    projectData.addProject(req.body)
      .then(() => {
        res.redirect("/solutions/projects");
      })
      .catch(err => {
        res.render("500", {
          message: `I'm sorry, but we have encountered the following error: ${err}`
        });
      });
  });

  // Edit Project (GET)
  app.get("/solutions/editProject/:id", (req, res) => {
    const projectId = parseInt(req.params.id, 10);

    Promise.all([
      projectData.getProjectById(projectId),
      projectData.getAllSectors()
    ])
      .then(([project, sectors]) => {
        res.render("editProject", { project, sectors, page: "" });
      })
      .catch(err => {
        res.status(404).render("404", { message: err });
      });
  });

  // Edit Project (POST)
  app.post("/solutions/editProject", (req, res) => {
    const projectId = parseInt(req.body.id, 10);

    projectData.editProject(projectId, req.body)
      .then(() => {
        res.redirect("/solutions/projects");
      })
      .catch(err => {
        res.render("500", {
          message: `I'm sorry, but we have encountered the following error: ${err}`
        });
      });
  });

  // Delete Project
  app.get("/solutions/deleteProject/:id", (req, res) => {
    const projectId = parseInt(req.params.id, 10);

    projectData.deleteProject(projectId)
      .then(() => {
        res.redirect("/solutions/projects");
      })
      .catch(err => {
        res.render("500", {
          message: `I'm sorry, but we have encountered the following error: ${err}`
        });
      });
  });

  // Catch-all 404
  app.use((req, res) => {
    res.status(404).render("404", { page: "", message: "Page not found." });
  });

  // Start server
  app.listen(HTTP_PORT, () => {
    console.log(`Server listening on port ${HTTP_PORT}`);
  });

}).catch(err => {
  console.error("Failed to initialize project data or start server:", err);
});
