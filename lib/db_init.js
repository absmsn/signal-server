let db = require('./db.js')

//初始化消息计数
db('counter')
  .select()
  .where({
    counterName: 'msgCount'
  })
  .then(data => {
    if (data.length === 0) {
      db('counter').insert({
        counterName: 'msgCount',
        value: 0
      }).then()
    }
  })