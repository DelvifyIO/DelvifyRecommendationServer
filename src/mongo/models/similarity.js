let mongoose = require('mongoose');

let simItemsSchema = new mongoose.Schema({
    sku: String,
    similarity: Number,
});

let similaritySchema = new mongoose.Schema({
    pid: Number,
    sku: String,
    sim_items: [simItemsSchema],
});

export default mongoose.model('Similarity', similaritySchema);
