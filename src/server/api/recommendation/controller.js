import express from 'express';
import { similarity } from '../../../mongo/models';

const queries = ['pid', 'sku'];
const paginations = ['limit', 'offset'];

const getSimilarities = (req, res) => {
    const where = _.pick(req.query, queries);
    const action = where.pid || where.sku ?
        similarity.findOne({
            $or: [{ pid: parseInt(where.pid) }, { sku: where.sku }]
        }) :
        similarity.find(where);
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    action
        .skip(pagination.offset)
        .limit(pagination.limit)
        .then(function (similarities) {
            if (similarities) {
                res.send(similarities);
            }
            else {
                res.status(404).send('Not found');
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const getFeatured = (req, res) => {
    const where = _.pick(req.query, queries);
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    similarity.count()
        .then((count) => {
            const random = Math.floor(Math.random() * count);
            return similarity.findOne(where)
                .skip(random)
        })
        .then(function (similarity) {
            if (similarity) {
                res.send(similarity);
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
    getSimilarities,
    getFeatured,
};