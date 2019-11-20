var express = require('express');
const { config } = require(`../../../mongo/models`);

const getConfig = (req, res) => {
    const { merchantid } = req.headers;
    config.findOne({ merchantId: merchantid })
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

    config.findOne({ merchantId: merchantid })
        .sort({ createdAt: -1 })
        .then((result) => {
            const prevConfig = result || {};

            const widgets = req.body.widgets || prevConfig.widgets;
            const addToCartButton = req.body.addToCartButton || prevConfig.addToCartButton;
            const currencies = req.body.currencies || prevConfig.currencies;
            const themedColor = req.body.themedColor || prevConfig.themedColor;
            const gaUtmCode = req.body.gaUtmCode || prevConfig.gaUtmCode;
            const affiliatePrefix = req.body.affiliatePrefix || prevConfig.affiliatePrefix;
            const attributes = req.body.attributes || prevConfig.attributes;

            const newConfig = new config({
                widgets,
                addToCartButton,
                currencies,
                themedColor,
                gaUtmCode,
                affiliatePrefix,
                attributes,
            });
            newConfig.save()
                .then((result) => {
                    res.send(result);
                })
                .catch(function (err) {
                    res.status(404).send(err.message);
                });
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });


};

module.exports = {
    getConfig,
    insertConfig,
};