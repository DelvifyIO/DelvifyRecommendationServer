var express = require('express');
import { order, user, item, engagement } from '../../../mongo/models';
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

const getOrderAmount = (req, res) => {
    const where = _.pick(req.query, queries);

    order.aggregate([
        { $project: {
                total: { $multiply: ["$quantity", "$price"] }
            }},
        { $group: {
                _id: null,
                amount: { $sum: "$total" },
            }},
        { $project: {
                _id: 0,
                amount: '$amount',
            }}
    ])
        .then((result) => {
            res.send(result[0] || { amount: 0 });
        })
};

const getTimeToPurchase = (req, res) => {
    const where = _.pick(req.query, queries);

    const getAerage = user.aggregate([
        { $unwind: '$engagements' },
        { $match: { 'engagements.purchaseAt': { $ne: null } }},
        { $sort: { 'engagements.purchaseAt': -1 } },
        { $project:
            {
                _id: 0,
                purchaseAt: '$engagements.purchaseAt',
                interval: { $subtract: [ '$engagements.purchaseAt',
                        { $ifNull: [ '$engagements.clickAt', '$engagements.addAt' ] },
                ]},
                sum: { $sum: 1 },
            }
        },
        { $group: {
                _id: null,
                sum: { $sum: '$sum' },
                interval: { $sum: '$interval' }
            } },
        { $project:
                {
                    _id: 0,
                    average: { $divide: ['$interval', '$sum'] }
                }
        },
    ]);
    const getLatestInterval = user.aggregate([
        { $unwind: '$engagements' },
        { $match: { 'engagements.purchaseAt': { $ne: null } }},
        { $sort: { 'engagements.purchaseAt': -1 } },
        { $limit : 5 },
        { $project:
            {
                _id: 0,
                interval: { $subtract: [ '$engagements.purchaseAt',
                        { $ifNull: [ '$engagements.clickAt', '$engagements.addAt' ] },
                    ]},
            }
        },
    ]);

    Promise.all([getAerage, getLatestInterval])
        .then(([average, intervals]) => {
            res.send({ average: average[0].average, intervals: intervals.map((interval) => interval.interval) });
        }).catch(console.log);
};

const insertOrder = (req, res) => {
    const { oid, uid, order: items } = req.body;
    const twoHours = 2 * 60 * 60 *1000;
    const now = Date.now();

    engagement.find({
        pid: { $in: items.map(item => item.pid) },
    })
        .then((foundEngagements) => {
            const promises = [];
            const foundItems = _.groupBy(foundEngagements, (engagement) => engagement.pid);

            Object.keys(foundItems).forEach((pid) => {
                const engagements = foundItems[pid];
                const lastPurchaseIndex = _.findLastIndex(engagements, (engagement) => engagement.uid === uid && engagement.type === 'PURCHASE');
                const lastAddCartIndex = _.findLastIndex(engagements, (engagement) => engagement.uid === uid && engagement.type.includes('ADD_CART'));
                const lastClickIndex = _.findLastIndex(engagements, (engagement) => engagement.uid === uid && engagement.type === 'CLICK');
                const prevEngagement = lastClickIndex > -1 && (now - (Date.parse(engagements[lastClickIndex].createdAt)) <= twoHours) ? engagements[lastClickIndex] :
                    (lastPurchaseIndex > -1 && lastAddCartIndex > -1 && lastAddCartIndex > lastPurchaseIndex) ||
                    (lastPurchaseIndex <= -1 && lastAddCartIndex > -1) ? engagements[lastAddCartIndex] : null;
                if (prevEngagement) {
                    const purchaseItem = items.find((item) => item.pid == pid);
                    purchaseItem.isRecommended = true;
                    promises.push(engagement.create(
                        {
                            ...prevEngagement,
                            pid: purchaseItem.pid,
                            type: 'PURCHASE',
                            order: {
                                oid: oid,
                                quantity: purchaseItem.quantity,
                                price: purchaseItem.price,
                                currency: purchaseItem.currency,
                                exchangeRate: purchaseItem.exchangeRate,
                            }
                        }
                    ));
                }
            });
            Promise.all(promises)
                .then(() => {
                    const newOrder = new order();
                    newOrder.oid = oid;
                    newOrder.uid = uid;
                    newOrder.items = items;
                    return newOrder.save();
                })
                .then(() => res.status(200).send({}))
                .catch(console.log);
        })
        .catch(console.log);
};


module.exports = {
    getOrders,
    insertOrder,
    getOrderAmount,
    getTimeToPurchase,
};