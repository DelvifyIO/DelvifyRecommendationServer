var express = require('express');
var moment = require('moment');
const { engagement } = require(`../../../mongo/models`);

const queries = ['pid', 'type'];
const timeRange = ['from', 'to'];
const paginations = ['limit', 'offset'];

const getEngagements = (req, res) => {
    const { merchantid } = req.headers;
    const where = { merchantId: merchantid, ..._.pick(req.query, queries) };
    const timeFilter = _.pick(req.query, queries);
    const action = where.pid ?
        engagement.findOne(where) :
        engagement.find(where);
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

const getEngagementCount = (req, res) => {
    const { merchantid } = req.query;
    let group = {}, timeRangeMatch = {}, groupKey = '';
    let labels = [];
    let match = {};
    let aggragation = [];
    const { from, to, groupBy } = req.query;
    const timezone = req.headers.timezone;
    switch (groupBy) {
        case 'hour':
            group = { createdAt: { $concat: [
                { $toString: '$createdAt.hour' }, " ",
                        { $toString: '$createdAt.day' }, " ",
                        { $toString: '$createdAt.month' }, " ",
                        { $toString: '$createdAt.year' }]
            } };
            groupKey = 'createdAt';
            break;
        case 'day':
            group = { createdAt: { $concat: [
                        { $toString: '$createdAt.day' }, " ",
                        { $toString: '$createdAt.month' }, " ",
                        { $toString: '$createdAt.year' }]
                } };
            groupKey = 'createdAt';
            break;
        case 'week':
            group = { createdAt: { $concat: [
                { $toString: '$createdAt.week' }, " ",
                { $toString: '$createdAt.year' }]
            } };
            groupKey = 'createdAt';
            break;
        case 'month':
            group = { createdAt: { $concat: [
                        { $toString: '$createdAt.month' }, " ",
                        { $toString: '$createdAt.year' }]
                } };
            groupKey = 'createdAt';
            break;
        case 'year':
            group = { createdAt: { $concat: [
                        { $toString: '$createdAt.year' }]
                } };
            groupKey = 'createdAt';
            break;
        case 'location':
            group = { location: '$location' };
            groupKey = 'location';
            break;
        case 'geo_location':
            group = { geo_location: '$geo_location' };
            groupKey = 'geo_location';
            break;
        case 'source':
            group = { source: '$source' };
            groupKey = 'source';
            break;
        case 'device':
            group = { device: '$device' };
            groupKey = 'device';
            break;
    }

    if (from) {
        timeRangeMatch['$gte'] = moment(from).startOf('hour').toDate();
        const defaultRange = moment(from).add(1, 'year').endOf('hour');
        const toClamp = to ? moment(to).endOf('hour') : moment().endOf('hour');
        timeRangeMatch['$lte'] = defaultRange.diff(toClamp) > 0 ? toClamp.toDate() : defaultRange.toDate();
    } else if (to) {
        const defaultRange = moment(to).subtract(1, 'year').endOf('hour');
        timeRangeMatch['$lte'] = moment(to).endOf('hour').toDate();
        timeRangeMatch['$gte'] = defaultRange.startOf('hour').toDate();
    } else {
        const defaultRange = moment().subtract(1, 'year').endOf('hour');
        timeRangeMatch['$lte'] = moment().endOf('hour').toDate();
        timeRangeMatch['$gte'] = defaultRange.startOf('hour').toDate();
    }
    match = { merchantId: merchantid, 'createdAt': timeRangeMatch };

    aggragation = [
        { $match: match },
        { $sort: { 'createdAt': 1 } },
        {
            $project:
                {
                    _id: 0,
                    type: '$type',
                    location: '$location',
                    geo_location: '$geo_location',
                    device: '$device',
                    source: '$source',
                    order: '$order',
                    createdAt: {
                        year: { $year: { date: '$createdAt', timezone } },
                        month: { $month: { date: '$createdAt', timezone } },
                        week: { $sum: [{ $week: { date: '$createdAt', timezone } }, 1] },
                        day: { $dayOfMonth: { date: '$createdAt', timezone } },
                        hour: { $hour: { date: '$createdAt', timezone }  },
                    },
                }
        },
        { $group:{
                _id:{
                    type: '$type',
                    oid: '$order.oid',
                    ...group,
                },
                count:{ $sum: 1 },
                value:{ $sum: { $multiply: ['$order.price', '$order.quantity'] } }} },

    ];
    if (groupBy) {
        aggragation.push(
            { $group:{
                    _id: { $arrayToObject: [[['type', '$_id.type'], [groupKey, `$_id.${groupKey}`]]] },
                    count: { $sum: '$count' },
                    value: { $sum: '$value' },
                    order: { $sum: { $cond: [{ $gt: ['$_id.oid', 0] }, 1, 0] } } } });
        aggragation.push({ $group:{
                _id: '$_id.type',
                data: { $mergeObjects: { $arrayToObject: [[[
                    { $cond: [{ $eq: [{ $toString: `$_id.${groupKey}` }, null] }, '', { $toString: `$_id.${groupKey}` }] },
                    { $arrayToObject: [[['count', '$count'], ['value', '$value'], ['order', '$order']]] },
                ]]] } },
            }});
    } else {
        aggragation.push(
            { $group:{
                    _id: { $arrayToObject: [[['type', '$_id.type']]] },
                    count: { $sum: '$count' },
                    value: { $sum: '$value' },
                    order: { $sum: { $cond: [{ $gt: ['$_id.oid', 0] }, 1, 0] } } } });
    }
    aggragation.push({
        $project: {
            _id: 0,
            type: groupBy ? '$_id' : '$_id.type',
            data: groupBy ? '$data' : { count: '$count', value: '$value', order: '$order' },
        }});
    engagement.aggregate(aggragation)
        .allowDiskUse(true)
        .then((result) => {
            const resultObject = {};
            const action = {};
            result.forEach((type) => {
                resultObject[type.type] = type.data;
                if (type.type === 'ADD_CART_FROM_WIDGET' ||
                    type.type === 'CLICK' ||
                    type.type === 'SHOW_OVERLAY') {
                    if (groupBy) {
                        Object.keys(type.data).forEach((key) => {
                            if (action[key]) {
                                action[key].count += type['data'][key].count;
                            } else {
                                action[key] = { count: type['data'][key].count }
                            }
                        });
                    } else {
                        if (action.count) {
                            action.count += type.data.count;
                        } else {
                            action.count = type.data.count;
                        }
                    }
                }
            });
            res.send({ ...resultObject, ACTION: action });
        })
        .catch(console.log);
};



const getItemEngagement = (req, res) => {
    const { merchantid } = req.query;
    let match = { merchantId: merchantid }, timeRangeMatch = {}, sort = {}, paginationPipeline = {}, key = 'pid';
    const { from, to, sortBy, order } = req.query;

    const pagination = _.pick(req.query, paginations);
    match['$and'] = [{ 'pid': { $ne: null }}];

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

    if (sortBy) {
        key = `${sortBy !== 'pid' ? 'count.' : ''}${sortBy}`;
    }
    sort = _.fromPairs([[key, order === 'desc' ? -1 : 1]]);
    const aggragation = [
        { $match: match },
        { $group: {
                _id:{
                    pid: '$pid',
                    type: '$type',
                },
                count: { $sum: 1 },
                value: { $sum: { $multiply: ['$order.price', '$order.quantity'] } },
            }},
        { $group: {
                _id: { pid: '$_id.pid' },
                count: { $mergeObjects: { $arrayToObject: [[[{ $toString: '$_id.type' }, '$count']]] } },
                value: { $sum: '$value' }, } },
        {
            $project: {
                _id: 0,
                pid: '$_id.pid',
                count: {
                    $mergeObjects: ['$count', {
                        IMPRESSION: { $ifNull: ['$count.IMPRESSION', 0] },
                        CLICK: { $ifNull: ['$count.CLICK', 0] },
                        SHOW_OVERLAY: { $ifNull: ['$count.SHOW_OVERLAY', 0] },
                        ADD_CART: { $add: [{ $ifNull: ['$count.ADD_CART_FROM_DETAIL', 0] }, { $ifNull: ['$count.ADD_CART_FROM_WIDGET', 0] }] },
                        ACTION: { $add: [
                            { $ifNull: ['$count.ADD_CART_FROM_DETAIL', 0] },
                            { $ifNull: ['$count.ADD_CART_FROM_WIDGET', 0] },
                            { $ifNull: ['$count.SHOW_OVERLAY', 0] },
                            { $ifNull: ['$count.CLICK', 0] },
                            ] },
                        CTR: { $ifNull: [{ $divide: ['$count.CLICK', '$count.IMPRESSION'] }, 0] },
                        PURCHASE: { $ifNull: ['$count.PURCHASE', 0] },
                        VALUE: { $ifNull: ['$value', 0] },
                        AVERAGE_VALUE: { $ifNull: [{ $divide: ['$value', '$count.PURCHASE'] } , 0] },
                    }] },
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
        paginationPipeline['total'] = 1;
        paginationPipeline['rows'] = { $slice: ['$rows', parseInt(pagination.offset), parseInt(pagination.limit)] };
    }

    aggragation.push({
        $project: {
            _id: 0,
            ...paginationPipeline,
        }
    });
    engagement.aggregate(aggragation)
        .allowDiskUse(true)
        .then((result) => {
            res.send(result[0] || { total: 0, rows: [] });
        })
        .catch(console.log);
};

const insertEngagement = (req, res) => {
    const { merchantid } = req.headers;
    const { pid, type, location, source, geo_location, device, uid } = req.body;
    const newEngagement = new engagement({
        merchantId: merchantid,
        pid,
        type,
        location,
        source,
        geo_location,
        device,
        uid,
    });
    newEngagement.save()
        .then((result) => {
            res.send(result);
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