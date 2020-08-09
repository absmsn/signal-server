const {
  getMsgID,
  addOffline,
  removeOffline,
  removeOfflinesBySessionTimeRange
} = require('../models/message')
const {
  checkPeerOnline
} = require('../models/session')
const {
  getSocketID
} = require('../models/user')

async function handleGetMsgID(socket, msg) {
  let msgID = await getMsgID()
  msg.msgID = msgID
  socket.emit('msgID', msg)
}

async function handleMsgR(socket, msg) {
  let status = await checkPeerOnline(msg.userID, msg.sessionID)
  msg.sendTime = new Date()
  if (status) {
    socket.to(msg.sessionID).emit('msgn', msg)
    status = 'server_received'
  } else {
    // TODO:在客户端删掉这些字段
    // 删掉不需要的字段 
    delete msg.localMsgID
    delete msg.source
    delete msg.msgStatus

    await addOffline(msg)
    status = 'cached'
  }
  socket.emit('ackr', {
    msgStatus: status,
    sessionID: msg.sessionID,
    msgID: msg.msgID,
    sendTime: msg.sendTime
  })
}

async function handleAckN(io, msg) {
  let socketID = await getSocketID(msg.userID)
  if (socketID) {
    io.to(socketID).emit('acka', msg)
  }
}

async function handleRemoveOffline(msgID) {
  await removeOffline(msgID)
}

async function handleRemoveOfflines(msg) {
  let sessionID = msg.sessionID
  if (msg.startTime && typeof msg.startTime === "string") {
    msg.startTime = new Date(msg.startTime)
  }
  if (msg.endTime && typeof msg.endTime === "string") {
    msg.endTime = new Date(msg.endTime)
  }
  await removeOfflinesBySessionTimeRange(sessionID, msg.startTime, msg.endTime)
}

module.exports = {
  handleGetMsgID,
  handleMsgR,
  handleAckN,
  handleRemoveOffline,
  handleRemoveOfflines
}