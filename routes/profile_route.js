const express = require('express')
const router = express.Router();
//подключаем контроллер
const profileController = require('../controllers/profile_controller')

//основная страница
router.get('/profile', profileController.profileEn);

module.exports = router;