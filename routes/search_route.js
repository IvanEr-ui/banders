const express = require('express')
const router = express.Router();
//подключаем контроллер
const searchController = require('../controllers/search_controller.js')

//основная страница
router.get("/search", searchController.SearchArticlesEn);
router.get("/ru/search", searchController.SearchArticlesRu);

module.exports = router;