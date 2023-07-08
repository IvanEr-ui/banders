const { Schema, model } = require('mongoose')

//свойства которые находятся в объекте коллекции articles
const filterSchema = new Schema({
    All: {
        type: String,
        required: true
    },
    Update:{
        type: String,
        required: true
    },
    Bandchain:{
        type: String,
        required: true
    },
    Integration:{
        type: String,
        required: true
    },
    Product:{
        type: String,
        required: true
    },
    Oracle:{
        type: String,
        required: true
    },
    Community:{
        type: String,
        required: true
    },
    Partners:{
        type: String,
        required: true
    },
    VRF:{
        type: String,
        required: true
    },
})

//model-предоставляет методы для работы(описывается с помощью Schem)

module.exports = model('multfilters', filterSchema);