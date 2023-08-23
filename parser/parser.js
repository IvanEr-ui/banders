const fs = require('fs');
const puppeteer = require('puppeteer');
const { connect } = require('mongoose');
// Путь к вашей модели статей
const EnArticleModel = require('../models/enarticles_model');
const RuArticleModel = require('../models/ruarticles_model')
const FrArticleModel = require('../models/frarticles_model')
const GrArticleModel = require('../models/grarticles_model')

const SaveArticles = async (path, allArticles) => {
    fs.writeFileSync(path, allArticles)
}
const parserBandProtocolArticles = async (page, blogUrl, pageCounter, isNextPageAvailable) => {
    try {
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
const translateAndDownloadJSON = async (page, path, TargetLanguage) => {

    await page.goto('https://translate.i18next.com/', { timeout: 3000000, waitUntil: 'domcontentloaded' });
    const inputUploadHandle = await page.$('input[type=file]');
    await inputUploadHandle.uploadFile(path);

    await page.waitForTimeout(2000);
    // Настройка языка перевода
    await page.evaluate(() => {
        const targetLngInput = document.querySelector('#targetLng');
        targetLngInput.setAttribute('value', ''); // Удаление начального значения    
    });

    await page.type('#targetLng', TargetLanguage);
    await page.click('.conv-btn');

    await page.waitForTimeout(100000);

    // Получение переведенного JSON
    const TranslateData = await page.$eval('#targetJSON', (textarea) => textarea.value);
    // Закрываем страницу
    page.close();
    return TranslateData
}
const InterimChangestranslateJSON = async (allArticlesBPEn, allArticlesBPLang, TargetLanguage) => {
    let i = 0;

    for (const article of allArticlesBPLang.flat(2)) {
        // Находим соответствующую статью в allArticlesBPEn по индексу
        const correspondingArticle = allArticlesBPEn.flat()[i++];

        // Копируем свойства из allArticlesBPEn в текущую статью в allArticlesBPLang
        article.class_article = correspondingArticle.class_article;
        article.link = correspondingArticle.link;
        article.autor = correspondingArticle.autor;
        article.urlQuery = TargetLanguage + correspondingArticle.urlQuery;
    }

    return allArticlesBPLang;
}






async function scrapeAndSaveArticles() {
    // Запуск браузера Puppeteer
    const browser = await puppeteer.launch({
        //если false, то открывается окно браузера
        headless: false,
        //открываем инструменты разработчика
        devtools: true
    });
    const page = await browser.newPage();

    try {
        //парсим и получаем статьи в переменную allArticlesBP 
        const allArticlesBPEn = await parserBandProtocolArticles(await browser.newPage(), 'https://blog.bandprotocol.com/page/', 2, true);
        console.log("Спарсил en статьи BandProtocol")

        // Сохранение переведенного JSON в файл
        await SaveArticles('./parser/articlesBandProtocol_en.json', JSON.stringify(allArticlesBPEn))
        console.log("Сохранил en статьи BandProtocol в JSON формате")

        //сохраняем статьи в БД по модулю таблицы
        await saveArticlesInDB(EnArticleModel, allArticlesBPEn)
        console.log("Сохранил en статьи BandProtocol в БД")

        //переводим английский JSON файл на разные языки
        const TranslateAllArticlesBPRu = await translateAndDownloadJSON(await browser.newPage(), 'D:/Projects/BandProtocol2/parser/articlesBandProtocol_en.json', 'ru')
        console.log("Перевел en статьи BandProtocol на ru")
        const TranslateAllArticlesBPFr = await translateAndDownloadJSON(await browser.newPage(), 'D:/Projects/BandProtocol2/parser/articlesBandProtocol_en.json', 'fr')
        console.log("Перевел en статьи BandProtocol на fr")
        const TranslateAllArticlesBPGr = await translateAndDownloadJSON(await browser.newPage(), 'D:/Projects/BandProtocol2/parser/articlesBandProtocol_en.json', 'gr')
        console.log("Перевел en статьи BandProtocol на gr")


        //Выполнил промежуточные изменения JSON.parse - создает новый объект с новой ссылкой на объект
        const articlesLangRu = await InterimChangestranslateJSON(allArticlesBPEn, JSON.parse(TranslateAllArticlesBPRu), 'ru/');
        console.log("Выполнил промежуточные изменения с переведенными ru статьями")
        const articlesLangFr = await InterimChangestranslateJSON(allArticlesBPEn, JSON.parse(TranslateAllArticlesBPFr), 'fr/');
        console.log("Выполнил промежуточные изменения с переведенными fr статьями")
        const articlesLangGr = await InterimChangestranslateJSON(allArticlesBPEn, JSON.parse(TranslateAllArticlesBPGr), 'gr/');
        console.log("Выполнил промежуточные изменения с переведенными gr статьями")


        // Сохранение переведенного JSON в файл
        await SaveArticles('./parser/articlesBandProtocol_ru.json', JSON.stringify(articlesLangRu))
        console.log("Сохранил ru статьи BandProtocol в JSON формате")
        await SaveArticles('./parser/articlesBandProtocol_ru.json', JSON.stringify(articlesLangFr))
        console.log("Сохранил fr статьи BandProtocol в JSON формате")
        await SaveArticles('./parser/articlesBandProtocol_ru.json', JSON.stringify(articlesLangGr))
        console.log("Сохранил gr статьи BandProtocol в JSON формате")

        
        //сохраняем статьи в БД по модулю таблицы
        await saveArticlesInDB(RuArticleModel, articlesLangRu)
        console.log("Сохранил ru статьи BandProtocol в БД")
        await saveArticlesInDB(FrArticleModel, articlesLangFr)
        console.log("Сохранил fr статьи BandProtocol в БД")
        await saveArticlesInDB(GrArticleModel, articlesLangGr)
        console.log("Сохранил gr статьи BandProtocol в БД")

    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}


module.exports = scrapeAndSaveArticles;