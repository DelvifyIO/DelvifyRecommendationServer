const checkPassword = (req, res) => {
    if (req.query.password === 'Delvify10Demo') {
        return res.send('OK');
    } else {
        res.status(401).send('Incorrect Password');
    }
};

export {
    checkPassword,
};