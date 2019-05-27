'use strict';
import bluebird from 'bluebird';
import similarity from './similarity';
import item from './item';
import order from './order';
import user from './user';

const env       = process.env.NODE_ENV || 'development';
const config    = require(__dirname + '/../../config/database.js')['mongoose'][env];

let mongoose = require('mongoose');

class Database {
    constructor() {
        this._connect()
    }
    _connect() {

        const server = config.server; // REPLACE WITH YOUR DB SERVER
        const database = config.database;      // REPLACE WITH YOUR DB NAME
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
    item,
    order,
    user,
}