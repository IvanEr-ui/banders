const { createPath_search } = require('../path/create-path')
const EnArticles = require('../models/enarticles_model')
const RuArticles = require('../models/ruarticles_model')

const DomainName = "https://banders.onrender.com/"

class searchController {
    async SearchArticlesEn(req, res) {
        try {
            //введенное клиентом текст в поисковой строке
            const text = req.query.resText.toLowerCase();
            let actionFormSearch = `${DomainName}search`;
            const SearchArticlesResult = [];
            //получаем данные(статьи) из БД
            const articlesClient = await EnArticles.find({})
            for (let i = 0; i < articlesClient.length; i++) {
                //если найдем найденное слово в свойства content и title
                if ((articlesClient[i].content).search(text) > -1
                    || (articlesClient[i].title).search(text) > -1
                    || (articlesClient[i].class_article).search(text) > -1) {
                    SearchArticlesResult.push(articlesClient[i])
                }
            }
            //читаем файл html и загружаем данные из БД коллекции articles,indexes
            res.render(createPath_search('search'), { DomainName, actionFormSearch, text, SearchArticlesResult })

        } catch (e) {
            console.log(e);
        }
    }
    async SearchArticlesRu(req, res) {
        try {
            //введенное клиентом текст в поисковой строке
            const text = req.query.resText.toLowerCase();
            let actionFormSearch = `${DomainName}ru/search`;
            const SearchArticlesResult = [];
            //получаем данные(статьи) из БД
            const articlesClient = await RuArticles.find({})
            for (let i = 0; i < articlesClient.length; i++) {
                //если найдем найденное слово в свойства content и title
                if ((articlesClient[i].content).search(text) > -1
                    || (articlesClient[i].title).search(text) > -1
                    || (articlesClient[i].class_article).search(text) > -1) {
                    SearchArticlesResult.push(articlesClient[i])
                }
            }
            //читаем файл html и загружаем данные из БД коллекции articles,indexes
            res.render(createPath_search('search'), { DomainName, actionFormSearch, text, SearchArticlesResult })
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new searchController();