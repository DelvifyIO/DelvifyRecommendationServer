let mongoose = require('mongoose');

let similaritySchema = new mongoose.Schema({
    merchantId: String,
    sku: String,
    name: String,
    description: String,
    image_url: String,
    price: Number,
    currency: String,
    product_url: String,
    similar_sku: [String],
});

export default mongoose.model('Similarity', similaritySchema);