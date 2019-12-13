import express from 'express';

// const { similarity, config } = models;
const paginations = ['limit', 'offset'];
const { similarity, config } = require(`../../../mongo/models`);

const getSimilarities = (req, res) => {
    const { merchantid } = req.headers;
    const { sku } = req.params;

    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });

    similarity.findOne({
        merchantId: merchantid,
        sku: sku,
    })
        .then(function (recommendation) {
            if (recommendation) {
                res.send(recommendation.sim_items.slice(0, pagination.limit));
            }
            else {
                res.status(404).send('Not found');
            }
        })
        .catch(function (err) {
            console.log(err);
            res.status(404).send(err.message);
        });
};

//most clicked
const getTrending = (req, res) => {
    const { merchantid } = req.headers;

};


const getBestSelling = (req, res) => {
    const { merchantid } = req.headers;

};

//least selling
const getInventory = (req, res) => {
    const { merchantid } = req.headers;

};

const getFeatured = (req, res) => {
    const { merchantid } = req.headers;

    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    config.findOne()
        .sort({ createdAt: -1 })
        .then((result) => {
            const featuredItems = result.featuredItems;
            const pids = [];
            while(featuredItems.length !== 0) {
                const rand = Math.floor(Math.random() * featuredItems.length);
                pids.push(featuredItems[rand]);
                featuredItems.splice(rand, 1);
            }
            return res.send(pids.slice(0, pagination.limit));
        })
        .catch(function (err) {
            return res.status(404).send(err.message);
        });
};

module.exports = {
    getSimilarities,
    getFeatured,
};