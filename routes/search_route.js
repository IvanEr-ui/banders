const express = require('express')
const router = express.Router();
//подключаем контроллер
const searchController = require('../controllers/search_controller.js')

const supportedLanguages = [
    '', 'ru', 'fr', 'de', 'es', 'et', 'ja', 'th', 'pt', 'tr', 'uk'
];
//основная страница
supportedLanguages.forEach(language => {
    //Обязательно заварачиваем ансихронную функцию, т.к. это нужно для того, чтобы ждать возвращения функции
    //У нас много роутеров, если не будем ждать, то будет ошибка
    (async () => {
        if (language === '') {
            const search = await searchController.SearchArticle(language);
            router.get(`${language}/search`, search);
        }
        else {
            const search = await searchController.SearchArticle(language);
            router.get(`/${language}/search`, search);
        }
    })()
});


module.exports = router;