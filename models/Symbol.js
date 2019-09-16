const Sequelize = require('sequelize');
const db = require('../config/database');

const Symbol = db.define('symbol', {
    SymbolId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Symbol: {
        type: Sequelize.TEXT
    },
    Course_Id: {
        type: Sequelize.INTEGER
    }
});

module.exports = Symbol;