var express = require('express');
import {config} from '../../../mongo/models';

const getConfig = (req, res) => {
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
    const featuredItems = req.body.featuredItems;

    const newConfig = new config({
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