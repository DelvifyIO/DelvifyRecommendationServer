import fetch from 'node-fetch';
import FormData from 'form-data';
import request from 'request';
import model from "../../../db/models";
import {Op} from "sequelize";

const AI_API_HOST = "http://18.162.143.188:5000";
const API_KEY = "c7c8af5e-65a8-4a42-832c-eee9c3eb4777";

const searchDemo = (req, res) => {
    const { keyword } = req.query;
    const queryTokens = _.map(keyword.split(' '), (token) => `%${_.lowerCase(token)}%`);
    const searchWithAI = fetch(`${AI_API_HOST}/${API_KEY}/getSkusForQuery?query=${keyword}`).then((response) => response.json());
    const searchWithoutAI = model.Product.findAll({
            where: {
                [Op.and]: queryTokens.map((token) => ({ name: { [Op.like]: token } }))
            },
            attributes: ['sku'],
        });
    Promise.all([searchWithAI, searchWithoutAI])
        .then(([resultWithAI, resultWithoutAI]) => {
            const skuWithAI = resultWithAI.skus;
            const skuWithoutAI = _.difference(resultWithoutAI.map((item) => item.sku), skuWithAI);
            res.send({ skuWithAI, skuWithoutAI });
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const searchByText = (req, res) => {
    const { keyword } = req.query;
    if (keyword) {
        fetch(`${AI_API_HOST}/${API_KEY}/getSkusForQuery?query=${keyword}`)
            .then((response) => response.json())
            .then(response => {
                res.send(response);
            })
            .catch((err) => {
                res.status(400).send(err.message);
            })
    } else {
        res.status(400).send('No search query');
    }
};

const searchByImage = (req, res) => {
    if (req.file) {
        const image = req.file;

        const formData = { file: {
            value: image.buffer,
                options: {
                    filename: image.originalname
                },
        } };

        request.post({ url: `${AI_API_HOST}/${API_KEY}/imageSearch`, formData: formData }, (err, httpResponse, body) => {
            if (err) {
                return res.status(400).send(err.message);
            }
            try {
                const response = JSON.parse(body);
                const result = response.skus.map((sku) => sku.split('.')[0]);
                res.send({ skus: result });
            } catch (e) {
                console.log(e);
                res.status(400).send(body);
            }
        })
    } else {
        res.status(400).send('No image');
    }
};

const recognizeAudio = (req, res) => {
    if (req.file) {
        const audio = req.file;

        const formData = { audio: {
            value: audio.buffer,
                options: {
                    filename: audio.originalname
                },
        } };

        request.post({ url: `${AI_API_HOST}/${API_KEY}/audioToText`, formData: formData }, (err, httpResponse, body) => {
            if (err) {
                return res.status(400).send(err.message);
            }
            res.send(body);
        })
    } else {
        res.status(400).send('No audio');
    }
};

module.exports = {
    searchByText,
    searchByImage,
    recognizeAudio,
    searchDemo,
};