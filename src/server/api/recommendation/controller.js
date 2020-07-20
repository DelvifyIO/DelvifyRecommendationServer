import express from 'express';

const paginations = ['limit', 'offset'];
const { similarity, engagement } = require(`../../../mongo/models`);

const getSimilarities = (req, res) => {
    const { merchantid } = req.query;
    const { sku } = req.params;

    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    similarity.findOne({
        merchantId: merchantid,
        sku: sku,
    })
        .then(function (item) {
            if (item) {
                const skus = item.similar_sku.slice(0, pagination.limit);
                return similarity.find({ merchantId: merchantid, sku: { $in: skus } },
                    ['sku', 'name', 'description', 'image_url', 'price', 'currency', 'product_url']);
            }
            else {
                res.status(404).send('Not found');
            }
        })
        .then((items) => {
            res.send(items);
        })
        .catch(function (err) {
            console.log(err);
            res.status(404).send(err.message);
        });
};

//most clicked
const getTrending = (req, res) => {
    const { merchantid } = req.query;
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });

    getItemEngagement(merchantid, 'CLICK', 'desc', pagination.limit)
        .then((result) => {
            const skus = result.map((item) => item.pid);
            return similarity.find({ merchantId: merchantid, sku: { $in: skus } },
                ['sku', 'name', 'description', 'image_url', 'price', 'currency', 'product_url'])
        })
        .then((result) => {
            res.send(result);
        })
        .catch(function (err) {
            console.log(err);
            res.status(404).send(err.message);
        });
};


const getBestSelling = (req, res) => {
    const { merchantid } = req.query;
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });

    getItemEngagement(merchantid, 'PURCHASE', 'desc', pagination.limit)
        .then((result) => {
            const skus = result.map((item) => item.pid);
            return similarity.find({ merchantId: merchantid, sku: { $in: skus } },
                ['sku', 'name', 'description', 'image_url', 'price', 'currency', 'product_url'])
        })
        .then((result) => {
            res.send(result);
        })
        .catch(function (err) {
            console.log(err);
            res.status(404).send(err.message);
        });
};

//least selling
const getInventory = (req, res) => {
    const { merchantid } = req.query;
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });

    getItemEngagement(merchantid, 'PURCHASE', 'asc', pagination.limit)
        .then((result) => {
            const skus = result.map((item) => item.pid);
            return similarity.find({ merchantId: merchantid, sku: { $in: skus } },
                ['sku', 'name', 'description', 'image_url', 'price', 'currency', 'product_url'])
        })
        .then((result) => {
            res.send(result);
        })
        .catch(function (err) {
            console.log(err);
            res.status(404).send(err.message);
        });
};



const getItemEngagement = (merchantid, sortBy, order, limit) => {
    let match = { merchantId: merchantid, type: sortBy };
    match['$and'] = [{ 'pid': { $ne: null }}];

    const sort = _.fromPairs([['count', order === 'desc' ? -1 : 1]]);

    const aggragation = [
        { $match: match },
        { $group: {
                _id:{
                    pid: '$pid',
                    type: '$type',
                },
                count: { $sum: 1 },
            }},
        { $group: {
                _id: { pid: '$_id.pid' },
                count: { $mergeObjects: { $arrayToObject: [[[{ $toString: '$_id.type' }, '$count']]] } },
        }   },
        {
            $project: {
                _id: 0,
                pid: '$_id.pid',
                count: `$count.${sortBy}`
            }
        },
        { $sort: sort },
        { $limit: limit },
    ];
    return engagement.aggregate(aggragation)
        .allowDiskUse(true);
};

module.exports = {
    getSimilarities,
    getTrending,
    getInventory,
    getBestSelling,
};