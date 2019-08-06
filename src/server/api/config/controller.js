var express = require('express');

const getConfig = (req, res) => {
    const { merchantid } = req.headers;
    const {config} = require(`../../../mongo/models/${merchantid}`);
    config.findOne()
        .sort({ createdAt: -1 })
        .then((result) => {
            if (result) {
                res.send(result);
            } else {
                res.status(404).send({ message: 'Not found' });
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const insertConfig = (req, res) => {
    const { merchantid } = req.headers;
    const {config} = require(`../../../mongo/models/${merchantid}`);
    const placements = req.body.placements;
    const featuredItems = req.body.featuredItems;

    const newConfig = new config({
        placements,
        featuredItems,
    });
    newConfig.save()
        .then((result) => {
            res.send(result);
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

module.exports = {
    getConfig,
    insertConfig,
};