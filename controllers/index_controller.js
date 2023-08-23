const {createPath_index} = require('../path/create-path')
const EnArticles = require('../models/enarticles_model')
const RuArticles = require('../models/ruarticles_model')
const FrArticles = require('../models/frarticles_model')
const GrArticles = require('../models/grarticles_model')
const Filter = require('../models/filter_model')
const redstone = require('redstone-api');


const DomainName = "http://localhost:4000/"

class indexController {
    async ArticlesEn(req, res) {
        try {
            let actionFormSearch = `${DomainName}search`;
            const articlesClient = await EnArticles.find({})
            console.log(articlesClient)
            let filter = await Filter.find({language:"en"});
            //читаем файл html и загружаем данные из БД коллекции articles,indexes
            res.render(createPath_index("index"), { articlesClient,DomainName,actionFormSearch,filter:filter[0] })
        } catch (e) {
            console.log(e);
        }
    }
    async ArticlesRu(req, res) {
        try {
            let actionFormSearch = `${DomainName}ru/search`;
            //получаем данные с БД
            const articlesClient = await RuArticles.find({})

            let filter = await Filter.find({language:"ru"});
            res.render(createPath_index('index'), { articlesClient,DomainName,actionFormSearch,filter:filter[0] });
        } catch (e) {
            console.log(e);
        }
    }
    async ArticlesFr(req, res) {
        try {
            let actionFormSearch = `${DomainName}fr/search`;
            //получаем данные с БД
            const articlesClient = await FrArticles.find({})
            let filter = await Filter.find({language:"ru"});
            res.render(createPath_index('index'), { articlesClient,DomainName,actionFormSearch,filter:filter[0] });
        } catch (e) {
            console.log(e);
        }
    }
    async ArticlesGr(req, res) {
        try {
            let actionFormSearch = `${DomainName}gr/search`;
            //получаем данные с БД
            const articlesClient = await GrArticles.find({})
            let filter = await Filter.find({language:"ru"});
            res.render(createPath_index('index'), { articlesClient,DomainName,actionFormSearch,filter:filter[0] });
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new indexController();