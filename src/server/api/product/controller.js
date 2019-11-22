import express from 'express';
import models from '../../../db/models';
import { Op } from "sequelize";

const queries = ['categoryId', 'price', 'keywords', 'sku'];
const paginations = ['limit', 'offset'];

const searchProducts = (req, res) => {
    const { merchantid } = req.headers;
    const model = models[merchantid];
    const keyword = req.query.keyword;
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    const queryTokens = _.map(keyword.split(' '), (token) => `%${_.lowerCase(token)}%`);
    console.log(queryTokens);
    model.Product.findAndCountAll({
        where: {
            [Op.and]: queryTokens.map((token) => ({ name: { [Op.like]: token } }))
        },
        attributes: ['id', 'sku', 'name', 'price', 'categoryId', 'currencyId'],
        include: ['images', 'category', 'currency'],
        ...pagination,
    })
        .then(function(product) {
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
        attributes: ['id', 'sku', 'name', 'price', 'categoryId', 'image_url'],
        include: ['category'],
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
        include: ['category'],
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
        include: ['category'],
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
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    model.Product.findAndCountAll({
        where: { sku: req.query.skus },
        include: ['category'],
        ...pagination,
    })
        .then(function (result) {
            if (result) {
                const products = result.rows;
                products.sort((a, b) => _.indexOf(skus, a.sku) - _.indexOf(skus, b.sku));
                res.send({ count: result.count, rows: products.splice(pagination.offset, pagination.limit)});
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

module.exports = {
    getProducts,
    getProduct,
    getProductBySku,
    searchProducts,
};