let mongoose = require('mongoose');
let timestampPlugin = require('./plugins/timestamp')

let orderSchema = new mongoose.Schema({
    oid: mongoose.Mixed,
    uid: mongoose.Mixed,
    pid: Number,
    price: Number,
    currency: String,
    quantity: Number,
});
orderSchema.plugin(timestampPlugin);

export default mongoose.model('Order', orderSchema);
