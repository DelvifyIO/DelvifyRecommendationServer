import { authValidator } from '../../validation';
const { admin } = require(`../../../mongo/models`);

const getAdmins = (req, res) => {
    const { merchantid } = req.headers;
    admin.find({ merchantId: merchantid })
        .then((admins) => {
            if (admins && admin.length > 0) {
                return res.send(admins.filter((admin) => admin.username !== 'root'));
            } else {
                return res.status(404).send('Not found');
            }
        })
        .catch((err) => {
            res.status(400).send(err);
        })
};
const addAdmin = (req, res) => {
    const { merchantid } = req.headers;
    const { username, password, createdBy } = req.body;
    const { errors, isValid } = authValidator({ username, password });
    if (!isValid) {
        return res.status(400).send(errors);
    }
    const newAdmin = new admin();
    newAdmin.merchantId = merchantid;
    newAdmin.username = username;
    newAdmin.createdBy = createdBy;
    newAdmin.setPassword(password);
    admin.findOne({ username })
        .then((foundAdmins) => {
            if (foundAdmins) {
                return res.status(400).send({ message: 'Username has already been taken' });
            } else {
                return newAdmin.save(() => {
                    res.send(newAdmin);
                })
            }
        })
        .catch((err) => {
            res.status(400).send(err);
        })
};

const updateAdmin = (req, res) => {
    const { merchantid } = req.headers;
    const { id } = req.params;
    const { username } = req.body;
    admin.findOneAndUpdate({ _id: id }, { username }, { new: true })
        .then((updatedAdmin) => {
            res.send(updatedAdmin);
        })
        .catch((err) => {
            res.status(400).send(err);
        })
};

const removeAdmin = (req, res) => {
    const { merchantid } = req.headers;
    const { ids } = req.body;
    admin.deleteMany({ _id: { $in: ids } })
        .then(() => {
            res.status(200).send({});
        })
        .catch((err) => {
            res.status(400).send(err);
        })
};

export {
    getAdmins,
    addAdmin,
    updateAdmin,
    removeAdmin,
};