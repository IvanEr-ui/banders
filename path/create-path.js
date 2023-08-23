//библиотека для формирования корректного пути файла
const path = require('path');

//Определяем путь к файлу
//Решает проблему с прямой и косой чертой
const createPath_index = (page) => path.resolve(__dirname, '../views/layouts', `${page}.ejs`);
const createPath_article = (page) => path.resolve(__dirname, '../views/layouts', `${page}.ejs`);
const createPath_search = (page) => path.resolve(__dirname, '../views/layouts', `${page}.ejs`);
const createPath_profile= (page) => path.resolve(__dirname, '../views/layouts', `${page}.ejs`);

module.exports = { 
    createPath_index, 
    createPath_article,
    createPath_search,
    createPath_profile
};