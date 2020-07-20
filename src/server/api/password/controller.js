const checkPassword = (req, res) => {
    const password = req.query.password;
    const site = req.query.site || 'default';
    if (site === 'avantLink' && password === 'AvantLinkDemo') {
        return res.send('OK');
    }
    if (site === 'default' && password === 'Delvify10Demo') {
        return res.send('OK');
    } else {
        res.status(401).send('Incorrect Password');
    }
};

export {
    checkPassword,
};