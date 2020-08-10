exports.up = function (knex) {
  return knex.schema.createTable('user', (table) => {
      table.string('userID', 36)
        .notNullable().primary()
        .index().unique()
      table.string('socketID', 20)
      table.engine('memory')
    })
    .createTable('session', (table) => {
      table.string('sessionID', 32)
        .notNullable().primary()
        .index().unique()
      table.timestamp('lastAccessTime')
      table.string('password').defaultTo(null)
    })
    .createTable('user_session', (table) => {
      table.string('sessionID', 32)
        .notNullable()
        .index()
      table.string('userID', 36)
        .notNullable()
        .index()
      table.timestamp('joinTime')
      table.primary(["sessionID", "userID"])
      table.engine('memory')
    })
    .createTable('offline', (table) => {
      table.integer('msgID')
        .notNullable().primary()
        .index().unique()
      table.string('msgType')
      table.string('msg')
      table.string('userID', 36).index()
      table.string('sessionID', 32).index()
      table.timestamp('sendTime')
      table.charset("utf8")
    })
    .createTable("counter", (table) => {
      table.string('counterName')
        .notNullable()
        .primary()
        .unique()
      table.integer("value").defaultTo(0)
    });
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('user')
    .dropTable('session')
    .dropTable('user_session')
    .dropTable('offline')
    .dropTable('counter');
}