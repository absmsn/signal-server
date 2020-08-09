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

// 删除user,user_session表中的所有内容
// 以免因为程序异常退出前没能删除这些内容
// 导致后来的用户无法加入会话
db("user").delete().then(() => {
  db("user_session").delete().then()
})