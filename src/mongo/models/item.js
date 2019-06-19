let mongoose = require('mongoose');
let timestampPlugin = require('./plugins/timestamp');

let engagementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['DISPLAY', 'SHOW_OVERLAY', 'CLICK', 'ADD_CART_FROM_WIDGET', 'ADD_CART_FROM_DETAIL', 'PURCHASE'],
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
});

engagementSchema.plugin(timestampPlugin);

let itemSchema = new mongoose.Schema({
    pid: mongoose.Mixed,
    engagements: [engagementSchema],
});

export default mongoose.model('Item', itemSchema);
