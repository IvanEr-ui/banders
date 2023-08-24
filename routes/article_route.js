const express = require('express')
const router = express.Router();
//подключаем контроллер
const articleController = require('../controllers/article_controller')

const supportedLanguages = [
    '', 'ru', 'fr', 'de', 'es', 'et', 'ja', 'th', 'pt', 'tr', 'uk'
];

// Генерация маршрутов для разных языков
supportedLanguages.forEach(language => {
    (async () => {
        if (language === '') {
            const article = await articleController.Article(language);
            router.get(`${language}/:urlArticle`, article);
        }
        else{
            const article = await articleController.Article(language);
            router.get(`/${language}/:urlArticle`, article);
        }
    })()
});
module.exports = router;