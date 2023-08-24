const {Schema,model} = require('mongoose')

//свойства которые находятся в объекте коллекции articles
const FrArticlesSchema = new Schema({
    class_article: {
        type: String,
    },
    link:{
        type: String,
    },
    title:{
        type: String,
    },
    description:{
        type: String,
    },
    autor:{
        type: String,
    },
    date:{
        type: String,
    },
    image:{
        type: String,
    },
    content:{
        type: String,
    },
    urlQuery:{
        type: String,
    },
    id:{
        type: Number,
    }
})

//model-создает объект, который предоставляет методы для работы(описывается с помощью Schem)
module.exports = model('frarticles', FrArticlesSchema) ;