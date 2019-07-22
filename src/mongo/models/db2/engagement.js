import database from '../index';
let mongoose = require('mongoose');
let timestampPlugin = require('../plugins/timestamp');

let orderSchema = new mongoose.Schema({
    oid: mongoose.Mixed,
    price: Number,
    quantity: Number,
    currency: String,
    exchangeRate: Number,
});

let engagementSchema = new mongoose.Schema({
    pid: mongoose.Mixed,
    type: {
        type: String,
        enum: ['WIDGET_IMPRESSION', 'IMPRESSION', 'SHOW_OVERLAY', 'CLICK', 'ADD_CART_FROM_WIDGET', 'ADD_CART_FROM_DETAIL', 'PURCHASE'],
    },
    location: {
        type: String,
        enum: ['HOME', 'PRODUCT_DETAILS', 'PRODUCT_DETAILS_FEATURED', 'CART'],
    },
    source: {
      type: String,
      enum: ['SIMILAR', 'MOST_POPULAR', 'LEAST_POPULAR', 'CUSTOM'],
    },
    geo_location: String,
    device: {
        type: String,
        enum: ['DESKTOP', 'MOBILE', 'TABLET'],
    },
    uid: String,
    order: orderSchema,
});

engagementSchema.plugin(timestampPlugin);

export default database.db2.model('Engagement', engagementSchema);
