import { authValidator } from '../../validation';
const { admin, client } = require(`../../../mongo/models`);

const login = (req, res) => {
    const { merchantid, username, password } = req.body;
    const { errors, isValid } = authValidator(req.body);
    let loginAdmin = null;
    if (!isValid) {
        return res.status(400).send(errors);
    }
    admin.findOne({ username, merchantId: merchantid })
        .then((foundAdmin) => {
            console.log('foundAdmin', foundAdmin);
            if (!foundAdmin) {
                return res.status(401).send('Username not found');
            }
            if(foundAdmin.validPassword(password)) {
                loginAdmin = foundAdmin;
                return client.findOne({ merchantId: merchantid });
            } else {
                return res.status(401).send('Incorrect password');
            }
        })
        .then((client) => {
            const token = loginAdmin.generateJwt(client);
            return res.send({ admin: loginAdmin, token, client });
        })
        .catch(console.log);
};

export {
    login,
};