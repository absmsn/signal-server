let Knex = require('knex')
let conf = require('../knexfile.js')

let db = Knex(conf)

module.exports = db