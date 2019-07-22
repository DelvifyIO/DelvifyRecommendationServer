import { authValidator } from '../../validation';

const login = (req, res) => {
    const { merchantid, username, password } = req.body;
    const {admin} = require(`../../../mongo/models/${merchantid}`);
    const { errors, isValid } = authValidator(req.body);
    if (!isValid) {
        return res.status(400).send(errors);
    }
    admin.findOne({ username })
        .then((foundAdmin) => {
            if (!foundAdmin) {
                return res.status(401).send('Username not found');
            }
            if(foundAdmin.validPassword(password)) {
                const token = foundAdmin.generateJwt(merchantid);
                return res.send({ admin: foundAdmin, merchantid: merchantid, token });
            } else {
                return res.status(401).send('Incorrect password');
            }
        })
        .catch(console.log);
};

export {
    login,
};