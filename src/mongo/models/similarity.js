let mongoose = require('mongoose');

let simItemsSchema = new mongoose.Schema({
    sku: String,
    name: String,
    description: String,
    image_url: String,
    price: Number,
    currency: String,
    product_url: String,
});

let similaritySchema = new mongoose.Schema({
    merchantId: String,
    sku: String,
    sim_items: [simItemsSchema],
});

export default mongoose.model('Similarity', similaritySchema);
