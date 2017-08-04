// packages
const levelup = require('levelup')
const Promise = require('bluebird')

// our databse
const db = levelup('./db.db')

db.put = Promise.promisify(db.put)
db.get = Promise.promisify(db.get)

function persist (value, key) {
  return db.put(key, JSON.stringify(value))
}

function read (key) {
  return db.get(key)
}

// persist({latestUpdate: (new Date).toLocaleString() }, 'status')
module.exports = {
  persist: persist,
  read: read
}
