var express = require('express');
import {user, item, order} from '../../../mongo/models';
var moment = require('moment');

const queries = ['pid', 'sku'];
const timeRange = ['from', 'to'];
const paginations = ['limit', 'offset'];

const getEngagements = (req, res) => {
    const where = _.pick(req.query, queries);
    const timeFilter = _.pick(req.query, queries);
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

const getEngagementCountByType = (req, res) => {
    item.aggregate([
        { $unwind: '$engagements' },
        { $match: { 'engagements.type': req.query.type }},
        { $group:{
            _id: null,
            count:{ $sum: 1 }
        }},
        { $project: { _id: 0, count: '$count' }}
    ])
        .then((result) => {
            res.send(result[0] || { count: 0 });
        })
        .catch(console.log);
};

const getEngagementCount = (req, res) => {
    if (req.query.type) {
        return getEngagementCountByType(req, res);
    }
    let timeRange = {}, fromMatch = {};
    let labels = [];
    let match = {};
    const timezone = req.headers.timezone;
    switch (req.query.range) {
        case 'day':
            timeRange = { createdAt: { $concat: [
                { $toString: '$createdAt.hour' }, " ",
                        { $toString: '$createdAt.day' }, " ",
                        { $toString: '$createdAt.month' }, " ",
                        { $toString: '$createdAt.year' }]
            } };
            fromMatch = { $gte: moment().subtract(24, 'hour').startOf('hour').toDate() };
            break;
        case 'week':
            timeRange = { createdAt: { $concat: [
                { $toString: '$createdAt.week' }, " ",
                { $toString: '$createdAt.year' }]
            } };
            fromMatch = { $gte: moment().subtract(12, 'week').startOf('day').toDate() };
            break;
        case 'month':
            timeRange = { createdAt: { $concat: [
                        { $toString: '$createdAt.day' }, " ",
                        { $toString: '$createdAt.month' }, " ",
                        { $toString: '$createdAt.year' }]
                } };
            fromMatch = { $gte: moment().subtract(30, 'day').startOf('day').toDate() };
            break;
        case 'year':

            timeRange = { createdAt: { $concat: [
                        { $toString: '$createdAt.month' }, " ",
                        { $toString: '$createdAt.year' }]
                } };
            fromMatch = { $gte: moment().subtract(12, 'month').startOf('month').toDate() };
            break;
    }
    match = { 'engagements.createdAt': fromMatch };
    if (req.query.pid) {
        match['pid'] = parseInt(req.query.pid);
    }
    item.aggregate([
        { $unwind: '$engagements' },
        { $match: match },
        { $sort: { 'engagements.createdAt': 1 } },
        {
            $project:
                {
                    _id: 0,
                    engagement: '$engagements.type',
                    createdAt: {
                        year: { $year: { date: '$engagements.createdAt', timezone } },
                        month: { $month: "$engagements.createdAt" },
                        week: { $week: "$engagements.createdAt" },
                        day: { $dayOfMonth: "$engagements.createdAt" },
                        hour: { $hour: { date: '$engagements.createdAt', timezone }  },
                    },
                }
        },
        { $group:{
            _id:{
                engagement: '$engagement',
                ...timeRange,
            },
            count:{ $sum: 1 } }},
        { $group:{
                _id: '$_id.engagement',
                count:{ $mergeObjects: { $arrayToObject: [[[{ $toString: '$_id.createdAt' }, '$count']]] } } }},
        {
            $project: {
                _id: 0,
                engagement: '$_id',
                count: '$count',
            },
        },
    ])
        .then((result) => {
            res.send(result);
        })
        .catch(console.log);
};



const getItemEngagement = (req, res) => {
    let timeRange = {}, match = {}, sort = { '_id.pid': 1 };
    let date = new Date();
    let labels = [];
    const timezone = req.headers.timezone;
    const from = req.query.from;
    const to = req.query.to;
    const locations = req.query.locations;
    const sources = req.query.sources;
    const sortBy = req.query.sortBy;
    const order = req.query.order;

    const pagination = _.pick(req.query, paginations);

    if (from || to || locations) {
        match['$and'] = [];
    }
    if (from) {
        match['$and'].push({ 'engagements.createdAt':  { $gte: new Date(from) } })
    }
    if (to) {
        match['$and'].push({ 'engagements.createdAt':  { $lte: new Date(to) } })
    }

    if (locations) {
        match['$and'].push({ 'engagements.location': { $in: locations.map((location) => {
            switch(location) {
                case 'home': return 'HOME';
                case 'productDetails': return 'PRODUCT_DETAILS';
                case 'productDetailsFeatured': return 'PRODUCT_DETAILS_FEATURED';
                case 'cart': return 'CART';
            }
        }) }})
    } else {
        match['$and'].push({ 'engagements.location': { $in: [] } });
    }

    if (sources) {
        match['$and'].push({ 'engagements.source': { $in: sources.map((source) => {
            switch(source) {
                case 'similar': return 'SIMILAR';
                case 'mostPopular': return 'MOST_POPULAR';
                case 'leastPopular': return 'LEAST_POPULAR';
                case 'custom': return 'CUSTOM';
            }
        }) }})
    } else {
        match['$and'].push({ 'engagements.source': { $in: [] } });
    }

    if (sortBy && order) {
        let key = '_id.pid';
        switch (sortBy) {
            case 'productId': default: key = 'pid'; break;
            case 'sku': key = 'sku'; break;
            case 'display': key = 'count.DISPLAY'; break;
            case 'enlarge': key = 'count.ENLARGE'; break;
            case 'click': key = 'count.CLICK'; break;
            case 'addCart': key = 'count.ADD_CART'; break;
            case 'purchase': key = 'count.PURCHASE'; break;
        }
        const isAsc = order === 'asc' ? 1 : -1;
        sort = _.fromPairs([[key, isAsc]]);
    }
    const aggragation = [
        { $unwind: '$engagements' },
        { $match: match },
        {
            $project:
                {
                    _id: 0,
                    pid: '$pid',
                    sku: '$sku',
                    engagement: '$engagements.type',
                }
        },
        { $group: {
                _id:{
                    pid: '$pid',
                    sku: '$sku',
                    engagement: '$engagement',
                },
                count:{ $sum: 1 } }},
        { $group: {
                _id: {
                    pid: '$_id.pid',
                    sku: '$_id.sku',
                },
                count:{ $mergeObjects: { $arrayToObject: [[[{ $toString: '$_id.engagement' }, '$count']]] } } }},
        {
            $project: {
                _id: 0,
                pid: '$_id.pid',
                sku: '$_id.sku',
                count: { $mergeObjects: ['$count', { ADD_CART: { $add: [{ $ifNull: ['$count.ADD_CART_FROM_DETAIL', 0] }, { $ifNull: ['$count.ADD_CART_FROM_WIDGET', 0] }] } }] },
            },
        },
        { $sort: sort },
        { $group: {
                _id: null,
                total: { $sum: 1 },
                rows: { $push: '$$ROOT' },
            }},
    ];
    if (pagination.offset && pagination.limit) {
        aggragation.push({
            $project: {
                _id: 0,
                    total: 1,
                    rows: { $slice: ['$rows', parseInt(pagination.offset), parseInt(pagination.limit)] }
            }
        });
    }
    item.aggregate(aggragation)
        .then((result) => {
            res.send(result[0] || { total: 0, rows: [] });
        })
        .catch(console.log);
};

const insertEngagement = (req, res) => {
    const { type, pid, uid, location, source, from, geo_location, device } = req.body;
    let action = {};
    action.type = _.get({
        display: 'DISPLAY',
        showOverlay: 'SHOW_OVERLAY',
        click: 'CLICK',
        addCart: from === 'widget' ? 'ADD_CART_FROM_WIDGET' : 'ADD_CART_FROM_DETAIL',
    }, type);
    action.location = _.get({
        home: 'HOME',
        productDetails: 'PRODUCT_DETAILS',
        productDetailsFeatured: 'PRODUCT_DETAILS_FEATURED',
        cart: 'CART',
    }, location);
    action.source = _.get({
        similar: 'SIMILAR',
        mostPopular: 'MOST_POPULAR',
        leastPopular: 'LEAST_POPULAR',
        custom: 'CUSTOM',
    }, source);
    item.findOneAndUpdate(
        { pid },
        { $push: { engagements: {
            ...action,
            geo_location,
            device,
            uid,
        } } },
        { new: true, upsert: true },
    ).then((updated) => {
        res.send(updated);
    })
    .catch(function (err) {
        console.log(err);
        res.status(404).send(err.message);
    });
};

module.exports = {
    getEngagements,
    insertEngagement,
    getEngagementCount,
    getItemEngagement,
};