//подключаем фреймворк для создание веб-приложения
const express = require('express');
//подключаем mongoose для работы с mongodb (будем работать по схеме MVC - model-view-controller)
const mongoose = require('mongoose');
//env - серверное хранилище
require('dotenv').config();
//подлкючаем routes для включение их в приложение
const index_route = require('./routes/index_route.js');
const article_route = require('./routes/article_route.js');
const search_route = require('./routes/search_route.js');
const auth_route = require('./routes/auth_route.js');
const profile_route = require('./routes/profile_route.js');

const DayMonitoringArticle = require('./parser/BandProtocols/parser_newArticle.js'); // Импортируем функцию из scraping.js

//создаем приложение, которая будет работать на фреймворке express
const app = express();

//указываем шаблонизатор, которая позволяет динамически рендерить данные
app.set('view engine', 'ejs');
//указываем папку, где находятся наши шаблонизаторы
app.set('views', './views');

//предоставляем доступ к Bootstrap
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css/'))
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js/'))
//предоставляем доступ к jquery
app.use('/dist', express.static(__dirname + '/node_modules/jquery/dist/'))
//предоставляем доступ к папке public где находятся css,js,static images шаблонизаторов
app.use(express.static(__dirname + '/views/public'))


//подключаем routes
app.use(index_route);
app.use(search_route);
app.use(article_route);

// Запускаем веб-скрапинг и сохранение данных в MongoDB каждую неделю
setInterval(DayMonitoringArticle, 24 * 60 * 60 * 1000); // Каждую день
const start = async () => {
    try {
        //подключаемся к БД и ждем пока он не выполниться(await)
        await mongoose.connect(`mongodb+srv://${process.env.MONGO_NAME}:${process.env.MONGO_PASSWORD}@cluster0.dylfptx.mongodb.net/BandProtocol`);
        //запускаем сервер
        app.listen(process.env.PORT, (error) => {
            error ? console.log(error) : console.log(`listening port ${process.env.PORT}`)
        })
    }
    catch (e) {
        //отлавливаем ошибку
        console.log(e)
    }
}

start();
