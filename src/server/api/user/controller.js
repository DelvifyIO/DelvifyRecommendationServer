var express = require('express');
import {user} from '../../../mongo/models';
var moment = require('moment');

const queries = ['uid', 'location', 'device'];
const paginations = ['limit', 'offset'];

const getUsers = (req, res) => {
    const where = _.pick(req.query, queries);
    const action = where.uid ?
        user.findOne({
            uid: where.uid
        }) :
        user.find(where);
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    action
        .skip(pagination.offset)
        .limit(pagination.limit)
        .then(function (similarities) {
            if (similarities) {
                res.send(similarities);
            }
            else {
                res.status(404).send('Not found');
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const insertUser = (req, res) => {
    const { uid } = req.body;
    user.findOneAndUpdate(
        { uid },
        req.body,
        { new: true, upsert: true },
    )
        .then((user) => {
            res.send(user);
        })
        .catch((err) => {
            res.status(404).send(err.message);
        })
};


module.exports = {
    getUsers,
    insertUser,
};