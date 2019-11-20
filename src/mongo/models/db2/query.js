import database from '../index';

let mongoose = require('mongoose');
let timestampPlugin = require('../plugins/timestamp');

let querySchema = new mongoose.Schema({
    query: String,
});

querySchema.plugin(timestampPlugin);
const queryModel = database.db2.model('Query', querySchema);

export default queryModel;
