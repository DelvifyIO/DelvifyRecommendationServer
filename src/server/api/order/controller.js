var express = require('express');
import { order, user, item } from '../../../mongo/models';
var moment = require('moment');

const queries = ['oid', 'pid', 'sku', 'uid'];
const paginations = ['limit', 'offset'];

const getOrders = (req, res) => {
    const where = _.pick(req.query, queries);
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    order.find(where)
        .skip(pagination.offset)
        .limit(pagination.limit)
        .then(function (orders) {
            if (orders) {
                res.send(orders);
            }
            else {
                res.status(404).send('Not found');
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const insertOrder = (req, res) => {
    const { oid, uid, items } = req.body;
    const validItems = [];
    const twoHours = 2 * 60 * 60 *1000;
    const now = Date.now();

    user.findOne({ uid })
        .then((foundUser) => {
            if (!foundUser) throw new Error('User not found');
            items.forEach((item) => {
                const { pid, sku } = item;
                let engagement = foundUser.engagements.find((val) => {
                    return (val.pid && val.pid == pid || val.sku && val.sku === sku) &&
                    (!val.purchaseAt) &&
                    (val.addAt || (now - (Date.parse(val.addAt)) <= twoHours))
                });
                if (engagement) {
                    engagement.purchaseAt = new Date();
                    validItems.push(item);
                }
            });

            const newOrders = [];
            const pids = [];
            const skus = [];

            validItems.forEach((item) => {
                newOrders.push({ oid, uid, ...item });
                pids.push(item.pid);
                skus.push(item.sku);
            });
            order.insertMany(newOrders)
                .then((insertedOrders) => {
                    res.send(insertedOrders);
                })
                .catch((err) => {
                    res.status(404).send(err.message);
                });

            item.updateMany(
                { $or: [
                        { $and: [{ pid: { $ne: null } }, { pid: { $in: pids } }] },
                        { $and: [{ sku: { $ne: null } }, { sku: { $in: skus } }] },
                    ] },
                { $inc: { 'stat.purchase': 1 } },
                { new: true, upsert: true },
            ).catch(console.log);

            return foundUser.save();
        }).catch(console.log);
};


module.exports = {
    getOrders,
    insertOrder,
};