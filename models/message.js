let db = require('../lib/db')

async function getMsgID() {
  let value
  db.transactionProvider({

  })
  await db.transaction(async trx => {
    value = await db('counter')
      .select('value')
      .where({
        counterName: 'msgCount'
      })
      .transacting(trx)
    value = value[0].value + 1
    await db('counter')
      .where({
        counterName: 'msgCount'
      })
      .update({
        value: value
      })
      .transacting(trx)
  })
  return value
}

async function addOffline(msg) {
  await db('offline').insert(msg)
}

// 获取某个用户在其登录后在某个会话里发送的所有离线消息
async function popOfflineByUserSession(userID, sessionID) {
  let offlines = await db('offline').select().where({
    userID: userID,
    sessionID: sessionID
  }).orderBy('msgID')
  await db('offline').where({
    userID: userID,
    sessionID: sessionID
  }).delete()
  return JSON.parse(JSON.stringify(offlines))
}

async function getOfflineBySessionID(sessionID) {
  let offlines = await db('offline').select().where({
    sessionID: sessionID
  })
  return JSON.parse(JSON.stringify(offlines))
}

async function removeOffline(msgID) {
  let count = await db('offline').where({
    msgID: msgID
  }).delete()
  return count > 0
}

async function removeOfflinesBySessionTimeRange(
  sessionID, startTime, endTime) {
  await db('offline').where({
    sessionID: sessionID
  }).andWhereBetween("sendTime", [startTime, endTime]).delete()
}

module.exports = {
  getMsgID,
  addOffline,
  removeOffline,
  removeOfflinesBySessionTimeRange,
  getOfflineBySessionID,
  popOfflineByUserSession
}