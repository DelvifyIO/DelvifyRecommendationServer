var express = require('express');
import {user, item, order} from '../../../mongo/models';
var moment = require('moment');

const queries = ['pid', 'sku'];
const paginations = ['limit', 'offset'];

const getEngagements = (req, res) => {
    const where = _.pick(req.query, queries);
    const action = where.pid || where.sku ?
        item.findOne({ $or: [
                { $and: [{ pid: { $ne: null } }, { pid: where.pid }] },
                { $and: [{ sku: { $ne: null } }, { sku: where.sku }] },
            ] }) :
        item.find(where);
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

const insertEngagement = (req, res) => {
    const { type, pid, sku, uid } = req.body;
    let action = {};
    switch (type) {
        case 'display':
            action.inc = { 'stat.display': 1 };
            break;
        case 'enlarge':
            action.inc = { 'stat.enlarge': 1 };
            break;
        case 'click':
            action.inc = { 'stat.click': 1 };
            action.engagemnet = 'clickAt';
            break;
        case 'addCart':
            action.inc = req.body.from === 'widget' ? { 'stat.add_cart_from_widget': 1 } : { 'stat.add_cart_from_detail': 1 };
            action.engagemnet = 'addAt';
            break;
        case 'purchase':
            action.inc = { 'stat.purchase': 1 };
            action.engagemnet = 'purchaseAt';
            break;
    }
    item.findOneAndUpdate(
        { $or: [
            { $and: [{ pid: { $ne: null } }, { pid: req.body.pid }] },
            { $and: [{ sku: { $ne: null } }, { sku: req.body.sku }] },
         ] },
        { $inc: action.inc, pid: req.body.pid, sku: req.body.sku },
        { new: true, upsert: true },
    ).then((updated) => {
        res.send(updated);
    })
    .catch(function (err) {
        console.log(err);
        res.status(404).send(err.message);
    });

    if (action.engagemnet) {
        console.log(uid);
        user.findOne({ uid })
            .then((foundUser) => {
                if (!foundUser) throw new Error('User not found');

                let engagement = foundUser.engagements.find((val) =>
                    (val.pid && val.pid === pid || val.sku && val.sku === sku) &&
                    (!val[action.engagemnet])
                );
                if (engagement) {
                    engagement[action.engagemnet] = new Date();
                } else {
                    const newEngagement = {};
                    newEngagement[action.engagemnet] = new Date();
                    foundUser.engagements.push({ pid, sku, ...newEngagement});
                }
                return foundUser.save();
            }).catch(console.log);
    }
};

module.exports = {
    getEngagements,
    insertEngagement,
};