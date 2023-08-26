const fs = require('fs'); // Модуль для работы с файловой системой
const puppeteer = require('puppeteer');// Модуль для управления браузером через программу
const { connect } = require('mongoose');// Модуль для работы с MongoDB

// Массив с языковыми кодами и их путями к моделям
const languages = [
    { code: 'ru', languageName: "Русский/Russia", model: 'ruarticles_model' },
    { code: 'fr', languageName: "Французский/France", model: 'frarticles_model' },
    { code: 'de', languageName: "Немецкий/German", model: 'dearticles_model' },
    { code: 'es', languageName: "Испанский/Spanish", model: 'esarticles_model' },
    { code: 'et', languageName: "Эстонский/Estonian", model: 'etarticles_model' },
    { code: 'ja', languageName: "Японский/Japan", model: 'jaarticles_model' },
    { code: 'th', languageName: "Тайский/Thai", model: 'tharticles_model' },
    { code: 'pt', languageName: "Португальский/Portuguese", model: 'ptarticles_model' },
    { code: 'tr', languageName: "Турецкий/Turkish", model: 'trarticles_model' },
    { code: 'uk', languageName: "Украинский/Ukrainian", model: 'ukarticles_model' },
];

// Загрузка модели по пути и возврат экземпляра модели
const loadLanguageModel = async (modelPath) => {
    return require(`../../models/languages/${modelPath}`);
};
const ParseLatestArticle = async (page, blogUrl, pageCounter, isNextPageAvailable) => {
    try {
        await page.goto(`${blogUrl}${pageCounter}`);
        const LatestArticle = await page.evaluate(async () => {
            let LatestArticlesBPEn = [];
            try {
                const article = document.querySelector('.gh-topic-content article');
                LatestArticlesBPEn.push({
                    class_article: article.className,
                    //ссылка на страницу статьи
                    link: article.querySelector('a.gh-card-link').href,
                    //заголовок
                    title: article.querySelector('h3.gh-card-title').innerText,
                    //описание статьи
                    description: article.querySelector('div.gh-card-excerpt').innerText,
                    //автор
                    autor: article.querySelector('span.gh-card-author').innerText,
                    //дата
                    date: article.querySelector('time.gh-card-date').innerText
                });
            } catch (err) {
                console.log(err);
            }
            console.log("YES")
            return LatestArticlesBPEn;
        });

        await page.goto(LatestArticle[0].link, {
            waitUntil: 'domcontentloaded',
            timeout: 120000
        });

        // Извлечение данных о картинке и контенте статьи
        const articleDetails = await page.evaluate(() => {
            const image = document.querySelector('.gh-article-image img').getAttribute('src');
            const content = document.querySelector('.gh-content').innerHTML;

            return {
                image,
                content
            };
        });

        // Добавление дополнительных данных к объекту статьи
        LatestArticle[0].image = articleDetails.image;
        LatestArticle[0].content = articleDetails.content;
        LatestArticle[0].urlQuery = LatestArticle[0].title.toLowerCase().replaceAll(' ', '-').replace(/[^a-z -]/ig, ""); // Добавляем в json

        //закрываем страницу
        page.close();
        return LatestArticle
    }
    catch (err) {
        console.log(err)
    }
}
const CheckDBLastANDParseArticle = async (ArticleModel, LatestArticle) => {
    try {
        // Подключение к MongoDB
        await connect(`mongodb+srv://${process.env.MONGO_NAME}:${process.env.MONGO_PASSWORD}@cluster0.dylfptx.mongodb.net/BandProtocol`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const LatestArticleDB = await ArticleModel.findOne({}).sort({ id: -1 }).limit( 1 );

        if (LatestArticleDB.link === LatestArticle[0].link) {
            console.log("Статья есть в БД, BandProtocol еще не опубликовал новую статью")
            return false;
        }
        else {
            LatestArticle[0].id = LatestArticleDB.id + 1;
            return true;
        }
    } catch (err) {
        console.log(err)
    }
}
// Сохранение данных в файл JSON
const SaveArticles = async (path, allArticles) => {
    fs.writeFileSync(path, allArticles)
}
// Сохранение новую статью в базу данных
const saveArticlesInDB = async (ArticleModel, newArticle) => {
    try {
        // Подключение к MongoDB
        await connect(`mongodb+srv://${process.env.MONGO_NAME}:${process.env.MONGO_PASSWORD}@cluster0.dylfptx.mongodb.net/BandProtocol`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Вставка новую статью в MongoDB
        const newArticleInstance = new ArticleModel(newArticle[0]);
        await newArticleInstance.save();
    } catch (err) {
        console.log(err);
    }
}
// Перевод и загрузка JSON файла
const translateAndDownloadJSON = async (page, path, TargetLanguage) => {
    try {
        await page.goto('https://translate.i18next.com/', { waitUntil: 'domcontentloaded' });
        const inputUploadHandle = await page.$('input[type=file]');
        await inputUploadHandle.uploadFile(path);

        await page.waitForTimeout(1000);
        // Настройка языка перевода
        await page.evaluate(() => {
            document.querySelector('#targetLng').value = '';// Удаление начального значения
        });
        await page.waitForTimeout(1000);
        await page.type('#targetLng', TargetLanguage);
        await page.click('.conv-btn');

        await page.waitForTimeout(5000);

        // Получение переведенного JSON
        const TranslateData = await page.$eval('#targetJSON', (textarea) => textarea.value);
        // Закрываем страницу
        page.close();
        return TranslateData
    }
    catch (err) {
        console.log(err);
    }
}
// Промежуточные изменения JSON после перевода
const InterimChangestranslateJSON = async (allArticlesBPEn, allArticlesBPLang, TargetLanguage) => {
    try {
        let i = 0;

        for (const article of allArticlesBPLang.flat(2)) {
            // Находим соответствующую статью в allArticlesBPEn по индексу
            const correspondingArticle = allArticlesBPEn.flat()[i++];

            // Копируем свойства из allArticlesBPEn в текущую статью в allArticlesBPLang
            article.class_article = correspondingArticle.class_article;
            article.link = correspondingArticle.link;
            article.autor = correspondingArticle.autor;
            article.image = correspondingArticle.image;
            article.urlQuery = TargetLanguage + correspondingArticle.urlQuery;
        }

        return allArticlesBPLang;
    } catch (err) {
        console.log(err)
    }
}

//мониторинг добавление статьи каждый день
const DayMonitoringArticle = async () => {
    // Запуск браузера Puppeteer
    const browser = await puppeteer.launch({
        //если false, то открывается окно браузера
        headless: true,
        //открываем инструменты разработчика
        devtools: true,
        timeout: 600000,
        protocolTimeout: 300000, // Увеличьте это значение
    });

    try {
        //Путь к анг JSON файлу для перевода на другие языки
        const pathTranslateJSONEn = './parser/BandProtocols/articlesBandProtocol_en.json';

        // Парсинг английских статей BandProtocol
        const LatestArticlesBPEn = await ParseLatestArticle(await browser.newPage(), 'https://blog.bandprotocol.com/page/', 2, true);
        console.log("Спарсил последнюю статью BandProtocol")
        await SaveArticles(pathTranslateJSONEn, JSON.stringify(LatestArticlesBPEn))
        console.log("Сохранил возможную новую статью BandProtocol в JSON формате")

        if (await CheckDBLastANDParseArticle(await loadLanguageModel('enarticles_model'), LatestArticlesBPEn)) {
            console.log("В БД нет такой статьи, можно добавлять")
            //сохраняем статьи в БД по модулю таблицы
            const languageModel = await loadLanguageModel('enarticles_model');

            await saveArticlesInDB(languageModel, LatestArticlesBPEn);
            console.log(`Сохранил новую en статью BandProtocol в БД`);

            for (const lang of languages) {
                //парсим контент статьи
                const translatedArticle = await translateAndDownloadJSON(await browser.newPage(), pathTranslateJSONEn, lang.code);
                console.log(`Перевел en статью BandProtocol на ${lang.languageName}`);

                const articlesLang = await InterimChangestranslateJSON(LatestArticlesBPEn, JSON.parse(translatedArticle), `${lang.code}/`);
                console.log(`Выполнил промежуточные изменения с новым переведенным  ${lang.languageName} статьей`)

                //сохраняем статьи в БД по модулю таблицы
                const languageModel = await loadLanguageModel(lang.model);
                if (await CheckDBLastANDParseArticle(languageModel, articlesLang)) {
                    await SaveArticles(`./parser/BandProtocols/articlesBandProtocol_${lang.code}.json`, JSON.stringify(LatestArticlesBPEn))
                    console.log(`Сохранил ${lang.languageName} статью BandProtocol в JSON формате`)
                    await saveArticlesInDB(languageModel, articlesLang);
                    console.log(`Сохранил ${lang.languageName} статью BandProtocol в БД`);
                }
                else{
                    console.log(`Не сохранил ${lang.languageName} статью BandProtocol в БД, т.к. уже есть данная статья в модуле ${lang.model} БД`);
                }
            }
        }
        else {
            console.log("В БД уже есть такая статья, не добавляем")
        }

    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}

module.exports = DayMonitoringArticle;
