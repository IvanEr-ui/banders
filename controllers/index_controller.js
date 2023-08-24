const { createPath_index } = require('../path/create-path');
const Filter = require('../models/filter_model');
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

class indexController {
    async loadLanguageModel(modelPath) {
        return require(`../models/languages/${modelPath}`);
    };

    // Функция-обработчик для создания маршрутов для разных языков
    async indexArticle(lang) {
        return async (req, res) =>{
            try {
                const currentArticle = Articles.find(article => article.code === lang);
                const { model } = currentArticle;


                let actionFormSearch = `${DomainName}${lang}/search`;
                let filter = await Filter.find({ language: lang });
                if (lang === '') {
                    actionFormSearch = `${DomainName}search`;
                    filter = await Filter.find({ language: "en" });
                }
                const languageModel = await this.loadLanguageModel(model);
                const articlesClient = await languageModel.find({});

                //читаем файл html и загружаем данные из БД коллекции articles,indexes
                res.render(createPath_index("index"), { articlesClient, DomainName, actionFormSearch, filter: filter[0] })
            } catch (err) {
                console.log(err);
            }
        };
    }
}


module.exports = new indexController();
