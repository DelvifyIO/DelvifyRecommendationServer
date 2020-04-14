import { authValidator } from '../../validation';
import { client, admin } from '../../../mongo/models';
import adminModel from "../../../mongo/models/admin";
import Http from "../../utils/Http";
const http = new Http();

const checkMerchantIdUnique = (merchantId) => {
    return client.findOne({ merchantId })
        .then((client) => {
            if(client) {
                return Promise.reject(new Error('merchantId existed'));
            }
            else return Promise.resolve(merchantId);
        })
};

const generateMerchantId = (name, newName) => {
    const merchantId = _.snakeCase(newName);
    return checkMerchantIdUnique(merchantId)
        .then((merchantId) => {
            return Promise.resolve(merchantId);
        })
        .catch((e) => {
            return generateMerchantId(name, `${name}${_.random(1, 20)}`);
        })
};

const getMerchantId = (req, res) => {
    const { name } = req.body;
    generateMerchantId(name, name)
        .then((merchantId) => {
            res.send({ merchantId })
        });
};

const createClient = (req, res) => {
    const { name, email, merchantId, username, password } = req.body;

    admin.findOne({ username, merchantId: null })
        .then((foundAdmin) => {
            if (!foundAdmin) {
                const error = new Error('Username not found');
                error.statusCode = 401;
                throw error;
            }
            else if(foundAdmin.validPassword(password)) {
                const newClient = new client();
                newClient.name = name;
                newClient.email = email;
                newClient.merchantId = merchantId;
                newClient.setApiKey(merchantId);
                return newClient.save();
            } else {
                const error = new Error('Incorrect password');
                error.statusCode = 401;
                throw error;
            }
        })
        .then((newClient) => {
            const rootAdmin = new adminModel();
            rootAdmin.merchantId = newClient.merchantId;
            rootAdmin.role = 'ROOT';
            rootAdmin.username = process.env.ROOT_ADMIN;
            rootAdmin.setPassword(process.env.ROOT_PASSWORD);
            rootAdmin.save();

            const clientAdmin = new adminModel();
            clientAdmin.merchantId = newClient.merchantId;
            clientAdmin.role = 'CLIENT';
            clientAdmin.username = 'admin';
            clientAdmin.setPassword('admin');
            clientAdmin.save();
            //TODO: send newClient.apiKey
            res.status(200).send(newClient);
        })
        .catch((err) => {
            res.status(err.statusCode || 400).send(err.message);
        });
};

export {
    getMerchantId,
    createClient,
};