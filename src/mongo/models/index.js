'use strict';
import bluebird from 'bluebird';
import similarity from './similarity';
import order from './order';
import config from './config';
import admin from './admin';
import engagement from './engagement';

const env       = process.env.NODE_ENV || 'development';
const dbConfig  = require(__dirname + '/../../config/database.js')['mongoose'][env];

let mongoose = require('mongoose');

class Database {
    constructor() {
        this._connect()
    }
    _connect() {

        const server = dbConfig.server; // REPLACE WITH YOUR DB SERVER
        const database = dbConfig.database;      // REPLACE WITH YOUR DB NAME
        mongoose.Promise = bluebird;
        mongoose.connect(`mongodb://${server}/${database}`, { useFindAndModify: false })
            .then(() => {
                console.log('Database connection successful')
            })
            .catch(err => {
                console.error('Database connection error')
            });
    }
}

const db = new Database();
export default db;
export {
    similarity,
    order,
    config,
    admin,
    engagement,
}