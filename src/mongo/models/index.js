'use strict';
import bluebird from 'bluebird';
const env       = process.env.NODE_ENV || 'development';
const dbConfig  = require(__dirname + '/../../config/database.js')['mongoose'][env];

let mongoose = require('mongoose');

class Database {
    constructor(config) {
        this.config = config;
        this._connect();
    }
    _connect() {
        const server = this.config.server; // REPLACE WITH YOUR DB SERVER
        const database = this.config.database;      // REPLACE WITH YOUR DB NAME
        mongoose.Promise = bluebird;
        this.connection = mongoose.createConnection(`mongodb://${server}/${database}`, { useFindAndModify: false });
    }
}
const db = {};
const databases = Object.keys(dbConfig);
for (let i=0; i<databases.length; i++) {
    db[databases[i]] = new Database(dbConfig[databases[i]]).connection;
}

export default db;