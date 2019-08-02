const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    try {
        const result = {
            message: 'Sucessfully GETTED public: ' + process.env.SAMPLE_TEXT
        };
        res.json(result);
    } catch (e) {
        res.status(500).json({ statusCode: 500, message: e.message });
    }
});

router.post('/', function (req, res, next) {
    try {
        const result = {
            message: 'Successfully POSTED public: ' + process.env.SAMPLE_TEXT,
            echoedData: req.body
        };
        res.json(result);
    } catch (e) {
        res.status(500).json({ statusCode: 500, message: e.message });
    }
});

router.get('/generatesError', function (req, res, next) {
    try {
        const result = {
            message: 'Sucessfully GETTED public: ' + process.env.SAMPLE_TEXT
        };
        inexistantObject.inexistantFunction();
        res.json(result);
    } catch (e) {
        res.status(500).json({ statusCode: 500, message: e.message });
    }
});

module.exports = router;