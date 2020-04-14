let mongoose = require('mongoose');
let timestampPlugin = require('./plugins/timestamp');

let querySchema = new mongoose.Schema({
    query: String,
});

querySchema.plugin(timestampPlugin);
const queryModel = mongoose.model('Query', querySchema);

export default queryModel;
