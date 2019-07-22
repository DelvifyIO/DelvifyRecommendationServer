import database from '../index';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

let mongoose = require('mongoose');
let timestampPlugin = require('../plugins/timestamp');

let adminSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        require: true,
    },
    hash: String,
    salt: String,
    createdBy: mongoose.Schema.ObjectId,
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
adminSchema.methods.generateJwt = function (merchantid) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
        id: this._id,
        username: this.username,
        merchantid,
        exp: parseInt(expiry.getTime()),
    }, process.env.WEB_SECRET)
};

const adminModel = database.db1.model('Admin', adminSchema);
const rootAdmin = new adminModel();

rootAdmin.username = process.env.ROOT_ADMIN;
rootAdmin.setPassword(process.env.ROOT_PASSWORD);
rootAdmin.save();

export default adminModel;
