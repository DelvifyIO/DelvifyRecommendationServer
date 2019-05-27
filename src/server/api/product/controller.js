import express from 'express';
import models from '../../../db/models';

const queries = ['categoryId', 'price', 'keywords', 'sku'];
const paginations = ['limit', 'offset'];

const getProducts = (req, res) => {
    if (req.query.sku) {
        return getProductBySku(req, res);
    }
    const where = _.pick(req.query, queries);
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });

    models.Product.findAndCountAll({
        where,
        attributes: ['id', 'name', 'price', 'categoryId', 'currencyId'],
        include: ['images', 'category', 'currency'],
        ...pagination,
    })
        .then(function (product) {
            if (product) {
                res.send(product);
            }
            else {
                res.status(404);
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const getProduct = (req, res) => {
    models.Product.findByPk(req.params.id, {
        include: ['images', 'category', 'currency'],
    })
        .then(function (product) {
            if (product) {
                res.send(product);
            }
            else {
                res.status(404);
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const getProductBySku = (req, res) => {
    models.Product.findOne({
        where: { sku: req.query.sku },
        include: ['images', 'category', 'currency'],
    })
        .then(function (product) {
            if (product) {
                res.send(product);
            }
            else {
                res.status(404);
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