let mongoose = require('mongoose');
let timestampPlugin = require('../plugins/timestamp');

let itemSchema = new mongoose.Schema({
    pid: mongoose.Mixed,
    price: Number,
    currency: String,
    quantity: Number,
    exchangeRate: Number,
    isRecommended: Boolean,
});

let orderSchema = new mongoose.Schema({
    oid: mongoose.Mixed,
    uid: mongoose.Mixed,
    geo_location: String,
    device: String,
    items: [itemSchema],
});
orderSchema.plugin(timestampPlugin);

export default mongoose.model('Order', orderSchema);
