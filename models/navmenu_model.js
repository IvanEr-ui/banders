const {Schema,model} = require('mongoose')

//свойства которые находятся в объекте коллекции articles
const navmenuSchema = new Schema({
    about:{
        type: Object,
        required: true
    },
    use_cases:{
        type: Object,
        required: true
    },
    oracle:{
        type: Object,
        required: true
    },
    language:{
        type: String,
    }
})

//model-создает объект, который предоставляет методы для работы(описывается с помощью Schem)
module.exports = model('multmenus', navmenuSchema);