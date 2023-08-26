// Импорт необходимых модулей
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
// Сохранение данных в файл JSON
const SaveArticles = async (path, allArticles) => {
    fs.writeFileSync(path, allArticles)
}
// Парсинг статей с веб-страницы BandProtocol
const parserBandProtocolArticles = async (page, blogUrl, pageCounter, isNextPageAvailable) => {
    try {
        page.setDefaultTimeout(600000); // Устанавливаем таймаут для страницы
        const allArticlesBPEn = [];
        // Итерация по страницам для сбора данных
        while (isNextPageAvailable) {
            // Открываем страницу
            await page.goto(`${blogUrl}${pageCounter}`);

            // Извлекаем данные из DOM
            const pageArticles = await page.evaluate(() => {
                let extractedArticles = [];
                try {
                    // Получаем статьи из страницы
                    document.querySelectorAll('article').forEach((article) => {
                        extractedArticles.push({
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
                    });
                } catch (e) {
                    console.log(e);
                }
                return extractedArticles;
            });

            // Проверяем, есть ли следующая страница
            if (pageArticles.length === 0) {
                isNextPageAvailable = false;
            } else {
                allArticlesBPEn.push(pageArticles);
            }

            pageCounter++;
        }

        let id = allArticlesBPEn.flat().length;
        for (const article of allArticlesBPEn.flat()) {
            try {
                await page.goto(article.link, {
                    waitUntil: 'domcontentloaded',
                    timeout: 120000
                });

                // Извлечение данных и ожидание

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
                article.image = articleDetails.image;
                article.content = articleDetails.content;
                article.id = id--;
                article.urlQuery = article.title.toLowerCase().replaceAll(' ', '-').replace(/[^a-z -]/ig, ""); // Добавляем в json

            } catch (error) {
                console.error('Error during page navigation:', error);
            }
        }
        //закрываем страницу
        page.close();
        //возвращаем статьи
        return allArticlesBPEn;
    } catch (err) {
        console.log(err)
    }
}
// Сохранение статей в базу данных
const saveArticlesInDB = async (ArticleModel, allArticles) => {
    try {
        // Подключение к MongoDB
        await connect(`mongodb+srv://${process.env.MONGO_NAME}:${process.env.MONGO_PASSWORD}@cluster0.dylfptx.mongodb.net/BandProtocol`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Удаляем все существующие записи в MongoDB перед вставкой новых данных
        await ArticleModel.deleteMany({});

        // Вставка обновленных данных в MongoDB
        await ArticleModel.insertMany(allArticles.flat().reverse());
    } catch (err) {
        console.log(err);
    }
}
// Перевод и загрузка JSON файла
const translateAndDownloadJSON = async (page, path, TargetLanguage) => {
    try {
        await page.goto('https://translate.i18next.com/', { timeout: 3000000, waitUntil: 'domcontentloaded'});
        const inputUploadHandle = await page.$('input[type=file]');
        await inputUploadHandle.uploadFile(path);

        await page.waitForTimeout(2000);
        // Настройка языка перевода
        await page.evaluate(() => {
            const targetLngInput = document.querySelector('#targetLng');
            targetLngInput.setAttribute('value', ''); // Удаление начального значения    
        });
        await page.waitForTimeout(2000);

        await page.type('#targetLng', TargetLanguage);
        await page.click('.conv-btn');

        await page.waitForTimeout(80000);

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
// Основная функция для парсинга и сохранения статей
async function scrapeAndSaveArticles() {
    // Запуск браузера Puppeteer
    const browser = await puppeteer.launch({
        //если false, то открывается окно браузера
        headless: false,
        //открываем инструменты разработчика
        devtools: true,
        timeout: 6000000,
    });

    try {
        // Парсинг английских статей BandProtocol
        const allArticlesBPEn = await parserBandProtocolArticles(await browser.newPage(), 'https://blog.bandprotocol.com/page/', 2, true);
        
        console.log("Спарсил английские статьи BandProtocol")
        // Сохранение английских статей в JSON файл
        await SaveArticles('./parser/BandProtocols/articlesBandProtocol_en.json', JSON.stringify(allArticlesBPEn))
        console.log("Сохранил английские статьи BandProtocol в JSON формате")

        // Сохранение английских статей в базу данных
        const enModel = await loadLanguageModel('enarticles_model');
        await saveArticlesInDB(enModel, allArticlesBPEn);
        console.log(`Сохранил английские статьи BandProtocol в БД`);

        //Путь к анг JSON файлу для перевода на другие языки
        const pathTranslateJSONEn = './parser/BandProtocols/articlesBandProtocol_en.json';

        for (const lang of languages) {
            //переводим английский JSON файл на разные языки
            const translatedArticlesCode = await translateAndDownloadJSON(await browser.newPage(), pathTranslateJSONEn, lang.code)
            console.log(`Перевел английские статьи BandProtocol на ${lang.languageName}`);

            //Выполнил промежуточные изменения JSON.parse - создает новый объект с новой ссылкой на объект
            const articlesLang = await InterimChangestranslateJSON(allArticlesBPEn, JSON.parse(translatedArticlesCode), `${lang.code}/`);
            console.log(`Выполнил промежуточные изменения с переведенными  ${lang.languageName} статьями`)

            // Сохранение переведенного JSON в файл
            await SaveArticles(`./parser/BandProtocols/articlesBandProtocol_${lang.code}.json`, JSON.stringify(articlesLang))
            console.log(`Сохранил ${lang.languageName} статьи BandProtocol в JSON формате`)

            //сохраняем статьи в БД по модулю таблицы
            const languageModel = await loadLanguageModel(lang.model);
            await saveArticlesInDB(languageModel, articlesLang);
            console.log(`Сохранил ${lang.languageName} статьи BandProtocol в БД`);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}

// Экспорт основной функции для использования в других файлах
module.exports = scrapeAndSaveArticles;