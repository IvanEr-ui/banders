const express = require('express')
const router = express.Router();
//подключаем контроллер
const authController = require('../controllers/auth_controller')

//страница статьи
router.get('/', authController.registration_discord);

module.exports = router;