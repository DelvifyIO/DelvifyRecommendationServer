import crypto from 'crypto';
import jwt from 'jsonwebtoken';

let mongoose = require('mongoose');
let timestampPlugin = require('./plugins/timestamp');

let adminSchema = new mongoose.Schema({
    merchantId: String,
    username: String,
    role: {
        type: String,
        enum: ['ROOT', 'CLIENT'],
    },
    hash: String,
    salt: String,
});
adminSchema.plugin(timestampPlugin);
adminSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};
adminSchema.methods.validPassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};
adminSchema.methods.generateJwt = function (client) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
        admin: {
            id: this._id,
            username: this.username,
            role: this.role,
        },
        client: client,
        exp: parseInt(expiry.getTime()),
    }, process.env.WEB_SECRET)
};

const adminModel = mongoose.model('Admin', adminSchema);

const rootAdmin = new adminModel();

adminModel.findOne({ username: process.env.ROOT_ADMIN, merchantId: null })
    .then((admin) => {
        if (!admin) {
            rootAdmin.role = 'ROOT';
            rootAdmin.username = process.env.ROOT_ADMIN;
            rootAdmin.setPassword(process.env.ROOT_PASSWORD);
            rootAdmin.save();
        }
    });

export default adminModel;
