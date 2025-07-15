require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

// Define Sector model
const Sector = sequelize.define('Sector', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sector_name: Sequelize.STRING
}, {
  timestamps: false
});

// Define Project model
const Project = sequelize.define('Project', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: Sequelize.STRING,
  feature_img_url: Sequelize.STRING,
  summary_short: Sequelize.TEXT,
  intro_short: Sequelize.TEXT,
  impact: Sequelize.TEXT,
  original_source_url: Sequelize.STRING
}, {
  timestamps: false
});

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

// Initialize
function initialize() {
  return sequelize.sync();
}

// Get all projects
function getAllProjects() {
  return Project.findAll({ include: [Sector] });
}

// Get one project
function getProjectById(id) {
  return Project.findAll({
    include: [Sector],
    where: { id }
  }).then(data => {
    if (data.length > 0) return data[0];
    throw "Unable to find requested project";
  });
}

// Get projects by sector
function getProjectsBySector(sector) {
  return Project.findAll({
    include: [Sector],
    where: {
      '$Sector.sector_name$': {
        [Sequelize.Op.iLike]: `%${sector}%`
      }
    }
  });
}

// Add a new project
function addProject(projectData) {
  return Project.create(projectData)
    .then(() => {})
    .catch(err => {
      throw err.errors[0].message;
    });
}

// Edit a project
function editProject(id, projectData) {
  return Project.update(projectData, { where: { id } })
    .then(() => {})
    .catch(err => {
      throw err.errors[0].message;
    });
}

// Delete a project
function deleteProject(id) {
  return Project.destroy({ where: { id } })
    .then(deletedCount => {
      if (deletedCount === 0) throw `No project found with ID ${id} to delete`;
    })
    .catch(err => {
      if (err.errors && err.errors.length > 0) throw err.errors[0].message;
      else throw err.message || "Unknown error during delete";
    });
}

// Get all sectors
function getAllSectors() {
  return Sector.findAll();
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  addProject,
  editProject,
  deleteProject,
  getAllSectors,
  Project,
  Sector
};
