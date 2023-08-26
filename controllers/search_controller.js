const { createPath_search } = require('../path/create-path')

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

const DomainName = "https://banders.onrender.com/"

class searchController {
    async loadLanguageModel(modelPath) {
        return require(`../models/languages/${modelPath}`);
    };

    async SearchArticle(lang) {
        return async (req, res) => {
            try {
                const currentArticle = Articles.find(article => article.code === lang);
                const { model } = currentArticle;

                //введенное клиентом текст в поисковой строке
                const text = req.query.resText.toLowerCase();
                let actionFormSearch = `${DomainName}${lang}/search`;
                if (lang === '') {
                    actionFormSearch = `${DomainName}search`;
                }
                const SearchArticlesResult = [];
                //получаем данные(статьи) из БД
                const languageModel = await this.loadLanguageModel(model);
                const articlesClient = await languageModel.find({});
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
            } catch (err) {
                console.log(text)
                console.log(err);
            }
        }
    }
}

module.exports = new searchController();
