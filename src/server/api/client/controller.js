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

const getClient = (req, res) => {
    const { merchantid: merchantId } = req.headers;
    client.findOne({ merchantId })
        .then((client) => {
            res.send(client);
        })
        .catch((e) => {
            res.status(404).send(e);
        })
};

const updateClient = (req, res) => {
    const { merchantid: merchantId } = req.headers;
    const { name, email, contactNumber, billingAddress, billingEmail } = req.body;
    client.findOneAndUpdate({ merchantId }, {
        name,
        email,
        contactNumber,
        billingAddress,
        billingEmail,
    }, { new: true })
        .then((client) => {
            res.send(client);
        })
        .catch((e) => {
            res.status(404).send(e);
        })
};

export {
    getClients,
    getClient,
    updateClient,
};