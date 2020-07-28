import express from 'express';
import model from '../../../db/models';
import { Op } from "sequelize";

const queries = ['categoryId', 'price', 'keywords', 'sku'];
const paginations = ['limit', 'offset'];

const searchProducts = (req, res) => {
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
        attributes: ['id', 'sku', 'name', 'price', 'categoryId', 'currency', 'image_url'],
        include: ['category'],
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
    const pagination = _.pick(req.query, paginations);
    const skus = req.query.skus;
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    model.Product.findAndCountAll({
        where: { sku: skus },
        include: ['category'],
        ...pagination,
    })
        .then(function (result) {
            if (result) {
                const products = result.rows;
                products.sort((a, b) => _.indexOf(skus, a.sku) - _.indexOf(skus, b.sku));
                res.send({ count: result.count, rows: pagination.limit ? products.splice(pagination.offset, pagination.limit) : products });
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