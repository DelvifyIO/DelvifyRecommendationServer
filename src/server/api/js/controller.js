import widgetJs from './widget';

const getWidgetJs = (req, res) => {
    const merchantid = req.query.merchantid;
    res.send(widgetJs(merchantid));
};

module.exports = {
    getWidgetJs,
};