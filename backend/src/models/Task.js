// src/models/Task.js
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('todo', 'in_progress', 'done'), defaultValue: 'todo' },
    dueDate: { type: DataTypes.DATE },
    // foreign keys set via associations
  });
  return Task;
};
