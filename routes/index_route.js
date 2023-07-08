const express = require('express')
const router = express.Router();
//подключаем контроллер
const indexController = require('../controllers/index_controller')

//основная страница
router.get('/', indexController.ArticlesEn);
router.get('/ru', indexController.ArticlesRu);

module.exports = router;