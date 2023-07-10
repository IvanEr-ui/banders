const { createPath_article } = require('../path/create-path')
const EnArticles = require('../models/enarticles_model')
const RuArticles = require('../models/ruarticles_model')
const Filter = require('../models/filter_model')
const NavMenu = require('../models/navmenu_model')

const fs = require('fs');

const addRuArticles = async (ArticleParse) =>{
    const ruarticle = new RuArticles({
        class_article: ArticleParse.class_article,
        link: ArticleParse.link,
        title: ArticleParse.title,
        description: ArticleParse.description,
        autor: ArticleParse.autor,
        date: ArticleParse.date,
        image: ArticleParse.image,
        content: ArticleParse.content,
        urlQuery: ArticleParse.urlQuery,
        id: ArticleParse.id
    })
    await ruarticle.save();
}

const DomainName = "https://banders.onrender.com/"

class articleController {
    async ArticleEn(req, res) {
        try {
            const categories="categories";
            let actionFormSearch = `${DomainName}search`;
            const articlesClient = await EnArticles.find({});
            let filter = await Filter.find({language:"en"});
            let navmenu = await NavMenu.find({language:"en"});
            for (let i = 0; i < articlesClient.length; i++) {
                if(articlesClient[i].urlQuery == req.params.urlArticle){
                    let article = articlesClient[i];
                    res.render(createPath_article("article"), { article,DomainName,actionFormSearch,filter:filter[0],navmenu:navmenu[0],categories });
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
    async ArticleRu(req, res) {
        try {
            const categories="категории";
            let actionFormSearch = `${DomainName}ru/search`;
            const articlesClient = await RuArticles.find({})
            let filter = await Filter.find({language:"ru"});
            let navmenu = await NavMenu.find({language:"ru"});
            for (let i = 0; i < articlesClient.length; i++) {
                if(articlesClient[i].urlQuery.slice(3,articlesClient[i].urlQuery.length) == req.params.urlArticle){
                    let article = articlesClient[i];
                    res.render(createPath_article("article"), { article,DomainName,actionFormSearch,filter:filter[0],navmenu:navmenu[0],categories });
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new articleController();