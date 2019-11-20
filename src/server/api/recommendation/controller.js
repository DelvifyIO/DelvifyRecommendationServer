import express from 'express';

// const { similarity, config } = models;
const paginations = ['limit', 'offset'];
const { similarity, config } = require(`../../../mongo/models`);

const getSimilarities = (req, res) => {
    const { merchantid } = req.headers;

    const { pid } = req.params;
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    similarity.findOne({ pid })
        .then(function (similarities) {
            if (similarities) {
                console.log(similarities);
                const pids = similarities.sim_items.slice(0, pagination.limit).map(item => item.pid);
                return similarity.find({ pid: { $in: pids }});
            }
            else {
                throw new Error('Not Found');
            }
        })
        .then(function (similarities) {
            // console.log(similarities.map((item) => item.pid));
            res.send(similarities.map((item) => item.pid));
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
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