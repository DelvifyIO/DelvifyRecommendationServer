import express from 'express';
import models from '../../../db/models';

const paginations = ['limit', 'offset'];

const getCategories = (req, res) => {
    const { merchantid } = req.headers;
    const model = models[merchantid];
    model.Category.findAll()
        .then(function (categories) {
            if (categories) {
                res.send(categories);
            }
            else {
                res.status(404);
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const getCategoryProducts = (req, res) => {
    const { merchantid } = req.headers;
    const model = models[merchantid];
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    model.Category.findAll({
        include: [{
            model: model.Product,
            as: 'products',
            limit: 1,
            attributes: ['id', 'sku', 'image_url'],
            order: [
                [Sequelize.literal('RAND()')]
            ],
        }],
        order: [
            [Sequelize.literal('RAND()')]
        ],
        ...pagination,
    })
        .then(function (categories) {
            if (categories) {
                res.send(categories);
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
    getCategories,
    getCategoryProducts,
};