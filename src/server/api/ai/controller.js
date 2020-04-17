import fetch from 'node-fetch';
import FormData from 'form-data';
import request from 'request';

const searchByText = (req, res) => {
    const { keyword } = req.query;
    if (keyword) {
        fetch(`http://13.67.88.182:5001/computeSimilarity?text=${keyword}`)
            .then((response) => response.json())
            .then(response => {
                res.send(response);
            })
            .catch((err) => {
                res.status(400).send(err.message);
            })
    } else {
        res.status(400).send('No search query');
    }
};

const searchByImage = (req, res) => {
    if (req.file) {
        const image = req.file;
        console.log(image);
        const formData = { file: image.buffer };
        // formData.append('file', image.buffer);

        request.post({ url: 'http://13.67.88.182:5000/get_imageskus' }, (err, response, body) => {
            if (err) {
                return res.status(400).send(err.message);
            }
            res.send(response);
        })
        // fetch('http://13.67.88.182:5000/get_imageskus', { method: 'POST', body: formData })
        //     .then((response) => response.text())
        //     .then(response => {
        //         res.send(response);
        //     })
        //     .catch((err) => {
        //         res.status(400).send(err.message);
        //     })
    } else {
        res.status(400).send('No search query');
    }
};

module.exports = {
    searchByText,
    searchByImage,
};