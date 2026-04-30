// src/models/index.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
 db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.Project = require('./Project')(sequelize, Sequelize);
db.Task = require('./Task')(sequelize, Sequelize);

// Associations
db.User.belongsToMany(db.Project, { through: 'UserProjects' });
db.Project.belongsToMany(db.User, { through: 'UserProjects' });

db.Project.hasMany(db.Task);
 db.Task.belongsTo(db.Project);

db.User.hasMany(db.Task, { as: 'AssignedTasks', foreignKey: 'assigneeId' });
 db.Task.belongsTo(db.User, { as: 'Assignee', foreignKey: 'assigneeId' });

module.exports = db;
