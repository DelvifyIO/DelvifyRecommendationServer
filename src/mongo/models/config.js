let mongoose = require('mongoose');
let timestampPlugin = require('./plugins/timestamp');

let configSchema = new mongoose.Schema({
    featuredItems: [Number],
    createdBy: Number,
});
configSchema.plugin(timestampPlugin);

export default mongoose.model('Config', configSchema);
