let mongoose = require('mongoose');

let simItemsSchema = new mongoose.Schema({
    pid: String,
    similarity: Number,
});

let similaritySchema = new mongoose.Schema({
    pid: String,
    sim_items: [simItemsSchema],
});

export default mongoose.model('Similarity', similaritySchema);
