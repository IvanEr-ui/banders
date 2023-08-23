const fs = require('fs');
const puppeteer = require('puppeteer');
//ссылка на страницу
let link = 'https://blog.bandprotocol.com/page/';
//результат
let articles_en = [];
//ансихронная функция, с безымянной функией
const Articles = async function () {
    let flag = true;
    //количетсво страниц
    let counter = 2;
    try {
        //параметры браузераssd
        let browser = await puppeteer.launch({
            //если false, то открывается окно браузера
            headless: true,
            //открываем инструменты разработчика
            devtools: true
        })

        //открывем новую страницу
        let page = await browser.newPage();
        //выставим параметры страницы
        while (flag) {
            //открываем страницу
            await page.goto(`${link}${counter}`);

            //работа с DOM-деревом, результат в htmlPage
            let htmlPage = await page.evaluate(async () => {
                //данные
                let ArticlesPage = [];
                //загружаем в page объект с необходимыми свойствами о статье
                try {
                    //получаем статьи из страницы
                    document.querySelectorAll('article').forEach((article) => {
                        //загружаем в переменную 
                        ArticlesPage.push({
                            class_article: article.className + 'gh-card',
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
                        })
                    })
                } catch (e) {
                    console.log(e);
                }

                //возвращаем в htmlPage переменную
                return ArticlesPage;
            })
            //загружаем в переменную и проверяем размер переменной
            htmlPage.length === 0 ? flag = false : await articles_en.push(htmlPage);
            counter++;
        }
        //закрываем браузер
        await browser.close()
        //избавляемся от квадратных скобок
        articles_en = articles_en.flat();
    } catch (e) {
        console.log(e);
        //в случае ошибки, закрываем браузер
        await browser.close();
    }
};
Articles().then(
    result => {
        const InformationArticle = async function () {

            //количетсво статей
            try {
                let counter = 0;
                //параметры браузераssd
                let browser = await puppeteer.launch({
                    //если false, то открывается окно браузера
                    headless: false,
                    //открываем инструменты разработчика
                    devtools: true
                })

                //открывем новую страницу
                let page = await browser.newPage();
                //размер объекта
                let length = Object.keys(articles_en).length;

                while (length !== counter) {
                    //открываем страницу
                    await page.goto(articles_en[counter].link,{
                        waitUntil: 'networkidle2',
                        // Remove the timeout
                        timeout: 0
                    });       
   
                    //работа с DOM-деревом, результат в htmlPage2
                    let htmlPageImage = await page.evaluate(async () => {
                        //ссылка на картинку
                        let image = document.querySelector('.gh-article-image img').getAttribute('src');
                        let content = document.querySelector('.gh-content').innerHTML;
                        console.log(image,content)
                        return { image, content };
                    })
                    articles_en[counter].image = htmlPageImage.image;
                    articles_en[counter].content = htmlPageImage.content;

                    counter++;
                }
                //закрываем браузер
                browser.close();
            } catch (e) {
                console.log(e);
                //в случае ошибки, закрываем браузер
                await browser.close();
            }
        }
        InformationArticle().then(
            result => {
                let id = articles_en.length - 1;
                articles_en.forEach((element) => {
                    let url = element.title.toLowerCase().replaceAll(' ', '-'); // заменяем все пробелы на -;
                    url = url.replace(/[^a-z -]/ig, "");//удаляем все символы кроме букв и тире
                    element.urlQuery = url; //добавляем в json
                    element.id = id--;
                });

                //избавляемся от квадратных скобок
                articles_en = articles_en.flat().reverse();
                fs.writeFile('./parser/articlesBandProtocol_en.json', JSON.stringify({ 'articles': articles_en }), err => {
                    console.log('articlesBandProtocol.json сохранился')
                });
            },
            error => console.log(error)
        );
    },
    error => console.log(error)
);

module.exports = Articles;