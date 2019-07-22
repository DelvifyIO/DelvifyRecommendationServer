import express from 'express';

// const { similarity, config } = models;
const paginations = ['limit', 'offset'];

const getSimilarities = (req, res) => {
    const { merchantid } = req.headers;
    const { similarity, config } = require(`../../../mongo/models/${merchantid}`);

    const { pid } = req.params;
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    similarity.findOne({ pid })
        .skip(pagination.offset)
        .limit(pagination.limit)
        .then(function (similarities) {
            if (similarities) {
                res.send(similarities.sim_items.map(item => item.pid));
            }
            else {
                res.status(404).send({ message: 'Not found' });
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const getFeatured = (req, res) => {
    const { merchantid } = req.headers;
    const { similarity, config } = require(`../../../mongo/models/${merchantid}`);

    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    config.findOne()
        .sort({ createdAt: -1 })
        .then((result) => {
            return res.send(result.featuredItems || []);
        })
        .catch(function (err) {
            return res.status(404).send(err.message);
        });
};

module.exports = {
    getSimilarities,
    getFeatured,
};