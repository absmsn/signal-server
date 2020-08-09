module.exports = {
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: '129126hz',
    database: 'signal_data'
  },
  migrations: {
    directory: './lib/migrations'
  }
}