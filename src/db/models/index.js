'use strict';

import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';

const basename  = path.basename(__filename);
const env       = process.env.NODE_ENV || 'development';
const config    = require(__dirname + '/../../config/database.js')['mysql'][env];
const db        = {};
const sequelize = {};

const databases = Object.keys(config);

for (let i=0; i<databases.length; i++) {
    let database = databases[i];
    let dbPath = config[database];

    sequelize[database] = new Sequelize(
        dbPath.database,
        dbPath.username,
        dbPath.password,
        { host: dbPath.host, dialect: dbPath.dialect },
    );
}

for (let i=0; i<databases.length; i++) {
    let database = databases[i];
    db[database] = {};
    fs.readdirSync(__dirname + config[database].modelsDir)
        .filter(file => {
            return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
        })
        .forEach(file => {
            var model = sequelize[database]['import'](path.join(__dirname + config[database].modelsDir, file));
            db[database][model.name] = model;
        });
}


Object.keys(db).forEach(dbName => {
    Object.keys(db[dbName]).forEach(modelName => {
        if (db[dbName][modelName].associate) {
            db[dbName][modelName].associate(db);
        }
    })
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;