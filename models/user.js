let db = require('../lib/db')

async function addUser(userID, socketID) {
  let exist = await db('user').select('userID').where({
    userID: userID
  })
  if (exist.length > 0) {
    await db('user').where({
      userID: userID
    }).update({
      socketID: socketID
    })
  } else {
    await db('user').insert({
      userID: userID,
      socketID: socketID
    })
  }
}

async function removeUser(userID) {
  await db('user').where({
    userID: userID
  }).delete()
}

async function joinSession(userID, sessionID, joinTime) {
  let session = await db('user_session').select('userID').where({
    userID: userID,
    sessionID: sessionID
  })
  if (session.length === 0) {
    await db('user_session').insert({
      userID: userID,
      sessionID: sessionID,
      joinTime: joinTime
    })
  }
}

async function quitSession(userID, sessionID) {
  await db('user_session').where({
    userID: userID,
    sessionID: sessionID
  }).delete()
}

async function quitAllSessions(userID) {
  await db('user_session').where({
    userID: userID
  }).delete()
}

async function joinAllSessions(userID, sessions) {
  let data = sessions.map(s => {
    return {
      userID: userID,
      sessionID: s.sessionID,
      joinTime: s.sendTime
    }
  })
  if (data.length > 0) {
    await db('user_session').insert(data)
  }
}

async function getSessionsJoined(userID) {
  let sessionIDs = await db('user_session').select('sessionID').where({
    userID: userID
  })
  return sessionIDs.map(x => x.sessionID)
}

async function getSocketID(userID) {
  let socketID = await db('user').select('socketID').where({
    userID: userID
  })
  if (socketID.length > 0) {
    return socketID[0].socketID
  }
}

async function getUserIDBySocketID(socketID) {
  let userID = await db('user').select('userID').where({
    socketID: socketID
  })
  if (userID.length > 0) {
    return userID[0].userID
  }
}

module.exports = {
  addUser,
  removeUser,
  joinSession,
  quitSession,
  quitAllSessions,
  getSocketID,
  getUserIDBySocketID,
  getSessionsJoined
}