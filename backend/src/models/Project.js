// src/models/Project.js
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    // The owner is the admin who created the project
    ownerId: { type: DataTypes.UUID, allowNull: false },
  });
  return Project;
};
