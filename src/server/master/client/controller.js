import { authValidator } from '../../validation';
import { client } from '../../../mongo/models';

const getClients = (req, res) => {
    client.find()
        .then((clients) => {
            res.send(clients);
        })
        .catch((e) => {
            res.status(404).send(e);
        })
};

export {
    getClients,
};