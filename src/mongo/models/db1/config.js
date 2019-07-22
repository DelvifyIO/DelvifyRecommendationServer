import database from '../index';

let mongoose = require('mongoose');
let timestampPlugin = require('../plugins/timestamp');

let configSchema = new mongoose.Schema({
    featuredItems: [mongoose.Mixed],
    createdBy: Number,
});
configSchema.plugin(timestampPlugin);
const configModel = database.db1.model('Config', configSchema);

export default configModel;
