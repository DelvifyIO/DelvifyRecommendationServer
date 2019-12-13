let mongoose = require('mongoose');
let timestampPlugin = require('./plugins/timestamp');

let orderSchema = new mongoose.Schema({
    oid: mongoose.Mixed,
    price: Number,
    quantity: Number,
    currency: String,
    exchangeRate: Number,
});

let engagementSchema = new mongoose.Schema({
    merchantId: String,
    pid: mongoose.Mixed,
    type: {
        type: String,
        enum: ['WIDGET_IMPRESSION', 'IMPRESSION', 'SHOW_OVERLAY', 'CLICK', 'ADD_CART_FROM_WIDGET', 'ADD_CART_FROM_DETAIL', 'PURCHASE'],
    },
    location: {
        type: String,
        enum: ['HOME_PAGE', 'PRODUCT_PAGE', 'CART_PAGE'],
    },
    source: {
      type: String,
      enum: ['SIMILAR', 'TRENDING', 'BEST_SELLING', 'INVENTORY'],
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

export default mongoose.model('Engagement', engagementSchema);
