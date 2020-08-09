let db = require('../lib/db')

async function addSession(sessionID) {
  await db('session').insert({
    sessionID: sessionID,
    lastAccessTime: new Date(),
    password: null
  })
}

// 查找哪些用户加入了此会话
async function getUsersJoined(sessionID) {
  let userIDs = await db('user_session')
    .select('userID')
    .where('sessionID', sessionID)
  return userIDs.map(x => x.userID)
}

// 检查聊天室中是否有其他人在线
async function checkPeerOnline(userID, sessionID) {
  let ids = await getUsersJoined(sessionID)
  if (ids.length === 0) return false
  for (let id of ids) {
    if (id !== userID) return true
  }
  return false
}

async function getPeerUserID(userID, sessionID){
  let ids = await getUsersJoined(sessionID)
  for (let id of ids) {
    if (id !== userID) return id
  }
}

// 检查会话是否存在
async function checkSessionExist(sessionID) {
  let session = await db('session')
    .select()
    .where({
      sessionID: sessionID
    })
  return session.length > 0
}

// 检查会话内的用户数是否已达到上限
async function checkSessionFull(sessionID) {
  let userIDs = await getUsersJoined(sessionID)
  return userIDs.length > 1
}

module.exports = {
  getUsersJoined,
  getPeerUserID,
  checkPeerOnline,
  checkSessionFull,
  checkSessionExist,
  addSession
}