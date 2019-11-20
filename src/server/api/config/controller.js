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
                res.send({});
            }
        })
        .catch(function (err) {
            console.log(err);
            res.status(404).send(err.message);
        });
};

const insertAttributes = (req, res) => {
    const { merchantid } = req.headers;

    config.findOneAndUpdate({ merchantId: merchantid }, { attributes: req.body.attributes}, { new: true })
        .sort({ createdAt: -1 })
        .then((result) => {
            res.send(result);
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

            const merchantId = merchantid;
            const widgets = req.body.widgets;
            const addToCartButton = req.body.addToCartButton;
            const currencies = req.body.currencies;
            const themedColor = req.body.themedColor;
            const fontSize = req.body.fontSize;
            const fontFamily = req.body.fontFamily;
            const gaUtmCode = req.body.gaUtmCode;
            const affiliatePrefix = req.body.affiliatePrefix;
            const attributes = req.body.attributes || prevConfig.attributes;

            const newConfig = new config({
                merchantId,
                widgets,
                addToCartButton,
                currencies,
                themedColor,
                fontSize,
                fontFamily,
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
    insertAttributes,
};