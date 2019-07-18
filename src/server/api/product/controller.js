import express from 'express';
import models from '../../../db/models';

const queries = ['categoryId', 'price', 'keywords', 'sku'];
const paginations = ['limit', 'offset'];

const getProducts = (req, res) => {
    const { merchantid } = req.headers;
    const model = models[merchantid];
    if (req.query.sku) {
        return getProductBySku(req, res);
    } else if (req.query.skus) {
        return getProductBySkus(req, res);
    }
    const where = _.pick(req.query, queries);
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });

    model.Product.findAndCountAll({
        where,
        attributes: ['id', 'sku', 'name', 'price', 'categoryId', 'currencyId'],
        include: ['images', 'category', 'currency'],
        ...pagination,
    })
        .then(function (product) {
            if (product) {
                res.send(product);
            }
            else {
                res.status(404).send('Not found');
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const getProduct = (req, res) => {
    const { merchantid } = req.headers;
    const model = models[merchantid];
    model.Product.findByPk(req.params.id, {
        include: ['images', 'category', 'currency'],
    })
        .then(function (product) {
            if (product) {
                res.send(product);
            }
            else {
                res.status(404).send('Not found');
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const getProductBySku = (req, res) => {
    const { merchantid } = req.headers;
    const model = models[merchantid];
    model.Product.findOne({
        where: { sku: req.query.sku },
        include: ['images', 'category', 'currency'],
    })
        .then(function (product) {
            if (product) {
                res.send(product);
            }
            else {
                res.status(404).send('Not found');
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const getProductBySkus = (req, res) => {
    const { merchantid } = req.headers;
    const model = models[merchantid];
    model.Product.findAll({
        where: { sku: req.query.skus },
        include: ['images', 'category', 'currency'],
    })
        .then(function (product) {
            if (product) {
                res.send(product);
            }
            else {
                res.status(404).send('Not found');
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

module.exports = {
    getProducts,
    getProduct,
    getProductBySku,
};