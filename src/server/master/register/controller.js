import { authValidator } from '../../validation';
import { client, admin } from '../../../mongo/models';

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

    admin.findOne({ username })
        .then((foundAdmin) => {
            if (!foundAdmin) {
                return res.status(401).send('Username not found');
            }
            if(foundAdmin.validPassword(password)) {
                const newClient = new client();
                newClient.name = name;
                newClient.email = email;
                newClient.merchantId = merchantId;
                newClient.setApiKey(merchantId);
                return newClient.save();
            } else {
                res.status(401).send('Incorrect password');
            }
        })
        .then((newClient) => {
            //TODO: send newClient.apiKey
            res.send(newClient);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
};

export {
    getMerchantId,
    createClient,
};