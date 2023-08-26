const { createPath_article } = require('../path/create-path');
const Filter = require('../models/filter_model');
const NavMenu = require('../models/navmenu_model');
const DomainName = "https://banders.onrender.com/";

const Articles = [
    { code: '', categories: "categories", model: 'enarticles_model' },
    { code: 'ru', categories: "категории", model: 'ruarticles_model' },
    { code: 'fr', categories: "catégories", model: 'frarticles_model' },
    { code: 'de', categories: "kategorien", model: 'dearticles_model' },
    { code: 'es', categories: "categorías", model: 'esarticles_model' },
    { code: 'et', categories: "kategooriad", model: 'etarticles_model' },
    { code: 'ja', categories: "カテゴリー", model: 'jaarticles_model' },
    { code: 'th', categories: "หมวดหมู่", model: 'tharticles_model' },
    { code: 'pt', categories: "categorias", model: 'ptarticles_model' },
    { code: 'tr', categories: "kategoriler", model: 'trarticles_model' },
    { code: 'uk', categories: "категорії", model: 'ukarticles_model' },
];

class articleController {
    async loadLanguageModel(modelPath) {
        return require(`../models/languages/${modelPath}`);
    };

    // Функция-обработчик для создания маршрутов для разных языков
    async Article(lang) {
        return async (req, res) => {
            try {
                const currentArticle = Articles.find(article => article.code === lang);
                const { categories, model } = currentArticle;

                let filter = await Filter.find({ language: lang });
                let navmenu = await NavMenu.find({ language: lang });
                let actionFormSearch = `${DomainName}${lang}/search`;
                if (lang === '') {
                    filter = await Filter.find({ language: 'en' });
                    navmenu = await NavMenu.find({ language: 'en' });
                    actionFormSearch = `${DomainName}search`;
                }


                const languageModel = await this.loadLanguageModel(model);
                const articlesClient = await languageModel.find({});

                const matchingArticle = await articlesClient.find(article => {
                    if (lang === '') {
                        return article.urlQuery === req.params.urlArticle
                    }
                    else {
                        return article.urlQuery === (`${lang}/` + req.params.urlArticle)
                    }
                }
                );
                res.render(createPath_article("article"), {
                    article: matchingArticle,
                    DomainName,
                    actionFormSearch,
                    filter: filter[0],
                    navmenu: navmenu[0],
                    categories
                });
            } catch (err) {
                console.log(err);
            }
        };
    }
}

module.exports = new articleController();
