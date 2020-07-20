import { authValidator } from '../../validation';
import { admin } from '../../../mongo/models/master';

const login = (req, res) => {
    const { username, password } = req.body;
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
                const token = foundAdmin.generateJwt();
                return res.send({ admin: foundAdmin, token });
            } else {
                return res.status(401).send('Incorrect password');
            }
        })
        .catch(console.log);
};

export {
    login,
};