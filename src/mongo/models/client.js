import crypto from "crypto";

let mongoose = require('mongoose');
let timestampPlugin = require('./plugins/timestamp');

let clientSchema = new mongoose.Schema({
    name: String,
    email: String,
    merchantId: String,
    apiKey: String,
    salt: String,
});

clientSchema.plugin(timestampPlugin);
clientSchema.methods.setApiKey = function (merchantId) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.apiKey = crypto.pbkdf2Sync(merchantId, this.salt, 1000, 16, 'sha512').toString('hex');
};
const clientModel = mongoose.model('Client', clientSchema);

export default clientModel;
