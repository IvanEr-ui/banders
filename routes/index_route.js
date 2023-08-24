const express = require('express');
const router = express.Router();

const indexController = require('../controllers/index_controller.js');

const supportedLanguages = [
    '', 'ru', 'fr', 'de', 'es', 'et', 'ja', 'th', 'pt', 'tr', 'uk'
];

supportedLanguages.forEach(language => {
    (async () => {
        const index = await indexController.indexArticle(language);
        router.get(`/${language}`, index);
    })()
});

module.exports = router;