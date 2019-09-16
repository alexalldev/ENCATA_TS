const Sequelize = require('sequelize');
const db = require('../config/database');

const Course = db.define('course', {
    CourseId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Last: {
        type: Sequelize.FLOAT
    },
    First: {
        type: Sequelize.BOOLEAN
    },
    UID: {
        type: Sequelize.TEXT
    },
    Timestamp: {
        type: Sequelize.DATE
    }
});

module.exports = Course;