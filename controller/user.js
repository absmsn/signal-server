const {
  addUser,
  removeUser,
  joinSession,
  quitSession,
  quitAllSessions,
  getUserIDBySocketID,
  getSessionsJoined
} = require('../models/user')
const {
  v1
} = require('uuid')

const {
  addSession,
  checkSessionFull,
  checkSessionExist,
  checkPeerOnline,
  getPeerUserID
} = require('../models/session')

const {
  getOfflineBySessionID,
  popOfflineByUserSession
} = require('../models/message')
const {
  join
} = require('../lib/db')

async function handleAddUser(socket) {
  let userID = v1()
  await addUser(userID, socket.id)
  socket.emit("userID", userID)
}

async function handleRemoveUser(socket) {
  let userID = await getUserIDBySocketID(socket.id)
  if (userID) {
    let sessionsJoined = await getSessionsJoined(userID)
    for (let sessionID of sessionsJoined) {
      socket.to(sessionID).emit("peerStatus", {
        sessionID: sessionID,
        peerStatus: false
      })
    }
    await removeUser(userID)
    await quitAllSessions(userID)
  }
}

// TODO:把此处拆为添加添加会话和推送消息两部分
// TODO:或者把离线消息直接放到joinSession包中
// client:joinSession -> server:joinSession
// -> client:offlineMsg -> server:offlineMsg
async function handleJoinSession(socket, msg) {
  let peerStatus
  let status = "joined"
  let userID = msg.userID
  let sessionID = msg.sessionID
  let exist = await checkSessionExist(msg.sessionID)
  let full = await checkSessionFull(msg.sessionID)

  if (exist && full) {
    status = "full"
    peerStatus = true
  } else {
    // TODO:添加事务支持
    if (!exist) {
      await addSession(sessionID)
    }
    // 加入会话
    let joinTime = new Date()
    msg.joinTime = joinTime
    await joinSession(userID, sessionID, joinTime)
    socket.join(sessionID)
  }
  // 如果加入了会话且对方在线
  if (!full) {
    // TODO:提取方法
    peerStatus = await checkPeerOnline(userID, sessionID)
    if (peerStatus) {
      // 提示对端用户我已上线
      socket.to(sessionID).emit('peerStatus', {
        sessionID: sessionID,
        peerStatus: true
      })
      let peerUserID = await getPeerUserID(userID, sessionID)
      // 将对端发送的离线消息以在线消息形式发送
      if (peerUserID) {
        let msgs = await popOfflineByUserSession(peerUserID, sessionID)
        if (msgs.length > 0) {
          msg.messages = msgs
        }
      }
    }
    // 得到会话内所有的离线消息
    let offlines = await getOfflineBySessionID(sessionID)
    if (offlines.length > 0) {
      msg.offlines = offlines
    }
  }
  msg.peerStatus = peerStatus
  msg.sessionStatus = status
  socket.emit('joinSession', msg)
}

async function handleQuitSession(socket, msg) {
  // let online = await checkPeerOnline(msg.userID, msg.sessionID)
  // if(online){
  socket.to(msg.sessionID).emit("peerStatus", {
    sessionID: msg.sessionID,
    peerStatus: false
  })
  // }
  socket.leave(msg.sessionID)
  await quitSession(msg.userID, msg.sessionID)
}

async function handleRejoin(socket, io, msg) {
  let rejoinResults = []
  let userID = msg.userID
  await addUser(userID, socket.id)
  for (let session of msg.sessions) {
    let sessionID = session.sessionID
    let rejoinResult = {
      sessionID: sessionID
    }
    let full = await checkSessionFull(sessionID)
    if (full) {
      // 提示已无法加入会话
      rejoinResult.result = "full"
      rejoinResult.peerStatus = true
      // 向已加入会话的用户发出警告
      io.in(session.sessionID).emit('rejoinWarn', {
        sessionID: sessionID
      })
    } else {
      let peerStatus = await checkPeerOnline(userID, sessionID)

      socket.join(sessionID)
      let joinTime = new Date(session.joinTime)
      await joinSession(userID, sessionID, joinTime)
      rejoinResult.result = "joined"
      rejoinResult.peerStatus = peerStatus

      if (peerStatus) {
        // 提示对端用户我已上线
        socket.to(sessionID).emit('peerStatus', {
          sessionID: sessionID,
          peerStatus: true
        })
        let peerUserID = await getPeerUserID(userID, sessionID)
        // 将对端发送的离线消息以在线消息形式发送
        if (peerUserID) {
          let msgs = await popOfflineByUserSession(peerUserID, sessionID)
          if (msgs.length > 0) {
            rejoinResult.messages = msgs
          }
        }
      }
      // 得到会话内所有的离线消息
      let offlines = await getOfflineBySessionID(sessionID)
      // 过滤掉自己向这个会话内发送的离线消息
      // FIXME:更改过滤数据的方式，改变查询数据库的方法
      offlines = offlines.filter(x => {
        return x.userID !== userID && new Date(x.sendTime) > new Date(msg.sendTime)
      })
      if (offlines.length > 0) {
        rejoinResult.offlines = offlines
      }
    }
    rejoinResults.push(rejoinResult)
  }
  socket.emit("rejoinResults", rejoinResults)
}

module.exports = {
  handleAddUser,
  handleRemoveUser,
  handleJoinSession,
  handleQuitSession,
  handleRejoin
}