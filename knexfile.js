module.exports = {
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: '', // username here
    password: '', // your password here
    database: 'signal_data'
  },
  migrations: {
    directory: './lib/migrations'
  }
}