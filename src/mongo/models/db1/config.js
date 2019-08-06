import database from '../index';

let mongoose = require('mongoose');
let timestampPlugin = require('../plugins/timestamp');

let placementSchema = new mongoose.Schema({
    location: {
        type: String,
        enum: ['HOME', 'PRODUCT_DETAILS', 'PRODUCT_DETAILS_FEATURED', 'CART'],
    },
    noOfItems: Number,
    heading: String,
});

let configSchema = new mongoose.Schema({
    placements: [placementSchema],
    featuredItems: [mongoose.Mixed],
    createdBy: Number,
});

configSchema.plugin(timestampPlugin);
const configModel = database.db1.model('Config', configSchema);

export default configModel;
