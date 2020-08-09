const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const {
  handleGetMsgID,
  handleMsgR,
  handleAckN,
  handleRemoveOffline, 
  handleRemoveOfflines
} = require('./controller/message')

const {
  handleJoinSession,
  handleQuitSession
} = require('./controller/user')
const {
  handleAddUser,
  handleRemoveUser,
  handleRejoin
} = require('./controller/user')

require('./lib/db_init')

const port = 3000

io.on("connect", (socket) => {

  // 写入user到表中
  socket.on("getUserID", async () => {
    await handleAddUser(socket)
  })

  // 断线，删除user,user_session，退出聊天室
  socket.on("disconnect", async () => {
    await handleRemoveUser(socket)
  })

  // 检查人数是否超过上限，
  // 若会话未存在则插入会话
  // 未超过插入user, user_session
  socket.on("joinSession", async (msg) => {
    await handleJoinSession(socket, msg);
  })

  socket.on("quitSession", async (msg) => {
    await handleQuitSession(socket, msg);
  })

  socket.on("getMsgID", async (msg) => {
    await handleGetMsgID(socket, msg)
  })

  socket.on("msgr", async (msg) => {
    await handleMsgR(socket, msg)
  })

  socket.on("ackn", async (msg) => {
    await handleAckN(io, msg)
  })

  // 断线重连成功，插入user,user_session
  // 发送离线消息，通知对端
  socket.on("rejoin", async (msg) => {
    await handleRejoin(socket, io, msg);
  })

  socket.on("removeOffline", async (msgID)=>{
    await handleRemoveOffline(msgID);
  })

  socket.on("removeOfflines", async (msg)=>{
    await handleRemoveOfflines(msg);
  })
})

server.listen(port, () => {
  console.log("server started!")
})

// TODO:学习MYSQL DONE
// TODO:完成分配消息ID过程 DONE
// TODO:完成消息投递过程 DONE
// TODO:离线消息推送 DONE
// TODO:在线状态更新 DONE
// TODO:完成文件服务器部分

// TODO:添加事务支持
// TODO:添加日志功能
// TODO:使用ORM框架
// TODO:消息对象使用OOP的方式表示