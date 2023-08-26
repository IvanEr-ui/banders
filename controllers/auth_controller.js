const { createPath_profile, createPath_index } = require('../path/create-path')
const EnArticles = require('../models/languages/enarticles_model')
const Filter = require('../models/filter_model')
const unirest = require('unirest')

const DomainName = "https://banders.onrender.com/"

class authController {
    async registration_discord(req, res) {
        try {
            //если существует такой code входа 
            if (req.query.code) {
                //как найти пользователя discord?
                //code->token->user
                //id моего приложения https://discord.com/developers/applications/
                let CLIENT_ID = "1130916586690183198";
                //URL-адрес  моего приложения https://discord.com/developers/applications/
                let REDIRECT_URI = "http://localhost:4000/profile"
                //Когда кто-то перейдет по этому URL-адресу, ему будет предложено авторизовать ваше приложение для запрошенных областей.
                //При принятии они будут перенаправлены на ваш redirect_uri, который будет содержать дополнительный параметр строки запроса

                //Секрет клиента моего приложения https://discord.com/developers/applications/
                let CLIENT_SECRET = "vytkDBxjBDgy0eBp2TvLWI_dSPoReGSr"
                //данные для запроса
                let req_data = {
                    redirect_uri: REDIRECT_URI,
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    code: req.query.code
                }
                //используем библиотеку unirest для отправки запросов
                //Создаем запрос, который будет брать данные пользователя(user token, type token ...)
                unirest.post("https://discordapp.com/api/oauth2/token").send(req_data).headers({
                    //передаем данные на сервер
                    /*Это простой формат — ключ равно значение и амперсанд между ними. 
                    Таким нехитрым способом мы можем продолжать строку, передавая столько данных, сколько захотим. */
                    'Content-Type': 'application/x-www-form-urlencoded',

                    'User-Agent': 'DiscordBot'
                }).then((data) => {
                    //отправляем get запрос чтобы получить пользователя и передаем токен
                    unirest.get("https://discordapp.com/api/users/@me").headers({
                        'Authorization': `${data.body.token_type} ${data.body.access_token}`
                    })
                    .then((data)=>{
                        //выводим данные о пользователя(user)
                        console.log(data.body)

                        //если авторизация прошла успешно
                        res.render(createPath_profile("profile"), {})  
                    })
                    .catch((error)=> res.render(createPath_profile("profile"), {})  )
 
                })
                .catch((error) => {
                    res.render(createPath_profile("profile"), {})  
                })
            }
            else {
                //если не существует, то возвращаемся на главную en - страницу
                let actionFormSearch = `${DomainName}search`;
                const articlesClient = await EnArticles.find({})
                let filter = await Filter.find({ language: "en" });
                res.render(createPath_index("index"), { articlesClient, DomainName, actionFormSearch, filter: filter[0] })
            };
        } catch (e) {
            console.log(e);
            //res.status(400).json({ message: "Registration error" })
        }
    }
}

module.exports = new authController();
