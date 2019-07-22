var express = require('express');
var moment = require('moment');

const queries = ['oid', 'pid', 'sku', 'uid'];
const paginations = ['limit', 'offset'];

const getAllOrders = (req, res) => {
    const { merchantid } = req.headers;
    const { order } = require(`../../../mongo/models/${merchantid}`);
    const where = _.pick(req.query, queries);
    const action = where.pid ?
        order.findOne(where) :
        order.find(where);
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    action
        .skip(pagination.offset)
        .limit(pagination.limit)
        .then(function (engagements) {
            if (engagements) {
                res.send(engagements);
            }
            else {
                res.status(404).send('Not found');
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};
const getOrders = (req, res) => {
    const { merchantid } = req.headers;
    const { order } = require(`../../../mongo/models/${merchantid}`);
    let match = {}, timeRangeMatch = {}, sort = {}, paginationPipeline = {}, key = 'oid';
    const { from, to, sortBy, order: sortOrder } = req.query;

    const pagination = _.pick(req.query, paginations);
    match['$and'] = [{ 'oid': { $ne: null }}];

    if (from) {
        timeRangeMatch['$gte'] = moment(from).startOf('hour').toDate();
        const threeDays = moment(from).add(6, 'year').endOf('hour');
        const toClamp = to ? moment(to).endOf('hour') : moment().endOf('hour');
        timeRangeMatch['$lte'] = threeDays.diff(toClamp) > 0 ? toClamp.toDate() : threeDays.toDate();
    } else if (to) {
        const threeDays = moment(to).subtract(6, 'year').endOf('hour');
        timeRangeMatch['$lte'] = moment(to).endOf('hour').toDate();
        timeRangeMatch['$gte'] = threeDays.startOf('hour').toDate();
    } else {
        const threeDays = moment().subtract(6, 'year').endOf('hour');
        timeRangeMatch['$lte'] = moment().endOf('hour').toDate();
        timeRangeMatch['$gte'] = threeDays.startOf('hour').toDate();
    }
    match['createdAt'] = timeRangeMatch;

    sort = _.fromPairs([[sortBy, sortOrder === 'desc' ? -1 : 1]]);
    const aggragation = [
        { $match: match },
        { $unwind: '$items' },
        { $group: {
                _id:{
                    oid: '$oid',
                    geo_location: '$geo_location',
                    device: '$device',
                    createdAt: '$createdAt',
                },
                items: { $push: '$items' },
                items_count: { $sum: 1 },
                total_value: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                sales: { $sum: { $cond: [
                    { $eq: ['$items.isRecommended', true] },
                    { $multiply: ['$items.price', '$items.quantity'] }, 0] } },
            }},
        { $project: {
                _id: 0,
                oid: '$_id.oid',
                geo_location: '$_id.geo_location',
                device: '$_id.device',
                items: '$items',
                items_count: '$items_count',
                total_value: '$total_value',
                sales: '$sales',
                createdAt: '$_id.createdAt',
            } },
        { $sort: sort },
        { $group: {
                _id: null,
                total: { $sum: 1 },
                rows: { $push: '$$ROOT' },
            }},
    ];
    if (pagination.offset && pagination.limit) {
        paginationPipeline['total'] = 1;
        paginationPipeline['rows'] = { $slice: ['$rows', parseInt(pagination.offset), parseInt(pagination.limit)] };
    }

    aggragation.push({
        $project: {
            _id: 0,
            ...paginationPipeline,
        }
    });
    order.aggregate(aggragation)
        .allowDiskUse(true)
        .then((result) => {
            res.send(result[0] || { total: 0, rows: [] });
        })
        .catch(console.log);
};

const getOrderAmount = (req, res) => {
    const { merchantid } = req.headers;
    const { order } = require(`../../../mongo/models/${merchantid}`);
    const { from, to } = req.query;
    let match = {}, timeRangeMatch = {};

    if (from) {
        timeRangeMatch['$gte'] = moment(from).startOf('hour').toDate();
        const threeDays = moment(from).add(6, 'year').endOf('hour');
        const toClamp = to ? moment(to).endOf('hour') : moment().endOf('hour');
        timeRangeMatch['$lte'] = threeDays.diff(toClamp) > 0 ? toClamp.toDate() : threeDays.toDate();
    } else if (to) {
        const threeDays = moment(to).subtract(6, 'year').endOf('hour');
        timeRangeMatch['$lte'] = moment(to).endOf('hour').toDate();
        timeRangeMatch['$gte'] = threeDays.startOf('hour').toDate();
    } else {
        const threeDays = moment().subtract(6, 'year').endOf('hour');
        timeRangeMatch['$lte'] = moment().endOf('hour').toDate();
        timeRangeMatch['$gte'] = threeDays.startOf('hour').toDate();
    }
    match = { 'createdAt': timeRangeMatch };
    order.aggregate([
        { $match: match },
        { $unwind: '$items' },
        { $group: {
                _id: null,
                quantitySum: { $sum: '$items.quantity' },
                amountSum: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                quantityRecommended: { $sum: { $cond: [{ $eq: ['$items.isRecommended', true] }, '$items.quantity', 0] } },
                amountRecommended: { $sum: { $cond: [{ $eq: ['$items.isRecommended', true] }, { $multiply: ['$items.price', '$items.quantity'] }, 0] } },
                quantityNotRecommended: { $sum: { $cond: [{ $not: { $eq: ['$items.isRecommended', true] } }, '$items.quantity', 0] } },
                amountNotRecommended: { $sum: { $cond: [{ $not: { $eq: ['$items.isRecommended', true] } }, { $multiply: ['$items.price', '$items.quantity'] }, 0] } },
            } },
        { $project: {
            _id: 0,
            total: {
                quantity: '$quantitySum',
                value: '$amountSum',
                average: { $cond: [{ $not: { $eq: ['$quantitySum', 0] } }, { $divide: ['$amountSum', '$quantitySum'] } , 0] },
            },
            recommended: {
                quantity: '$quantityRecommended',
                value: '$amountRecommended',
                average: { $cond: [{ $not: { $eq: ['$quantityRecommended', 0] } }, { $divide: ['$amountRecommended', '$quantityRecommended'] }, 0] },
            },
            notRecommended: {
                quantity: '$quantityNotRecommended',
                value: '$amountNotRecommended',
                average: { $cond: [{ $not: { $eq: ['$quantityNotRecommended', 0] } }, { $divide: ['$amountNotRecommended', '$quantityNotRecommended'] }, 0] },
            }
        }}
    ])
        .allowDiskUse(true)
        .then((result) => {
            res.send(result && result.length > 0 ? result[0] : { total: {}, recommended: {}, notRecommended: {} });
        })
};

const getTimeToPurchase = (req, res) => {
    const { merchantid } = req.headers;
    const { order, user, engagement } = require(`../../../mongo/models/${merchantid}`);
    const where = _.pick(req.query, queries);
    const getAverage = user.aggregate([
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
    ])
        .allowDiskUse(true);
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
    ])
        .allowDiskUse(true);

    Promise.all([getAverage, getLatestInterval])
        .then(([average, intervals]) => {
            res.send({ average: average[0].average, intervals: intervals.map((interval) => interval.interval) });
        }).catch(console.log);
};

const insertOrder = (req, res) => {
    const { merchantid } = req.headers;
    const { order, engagement } = require(`../../../mongo/models/${merchantid}`);
    const { oid, uid, geo_location, device, order: items } = req.body;
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
                    purchaseItem.price = purchaseItem.price * purchaseItem.exchangeRate;
                    promises.push(engagement.create(
                        {
                            uid: prevEngagement.uid,
                            pid: purchaseItem.pid,
                            type: 'PURCHASE',
                            geo_location: prevEngagement.geo_location,
                            source: prevEngagement.source,
                            location: prevEngagement.location,
                            device: prevEngagement.device,
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
                    newOrder.geo_location = geo_location;
                    newOrder.device = device;
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
    getAllOrders,
};