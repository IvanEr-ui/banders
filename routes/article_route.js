const express = require('express')
const router = express.Router();
//подключаем контроллер
const articleController = require('../controllers/article_controller')

//страница статьи
router.get('/:urlArticle', articleController.ArticleEn);
router.get('/ru/:urlArticle', articleController.ArticleRu);
router.get('/fr/:urlArticle', articleController.ArticleFr);
router.get('/gr/:urlArticle', articleController.ArticleGr);

module.exports = router;