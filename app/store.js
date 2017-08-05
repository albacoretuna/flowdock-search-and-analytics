// packages
const levelup = require('levelup')
const Promise = require('bluebird')

// our databse
const db = levelup('./db.db', { keyEncoding: 'json', valueEncoding: 'json' })

db.put = Promise.promisify(db.put)
db.get = Promise.promisify(db.get)

function persist (value, key) {
  return db.put(key, value)
}

function read (key) {
  return db.get(key)
}

async function setStatus (values) {
  try {
    let status = await read('status')

    // add new values to the start of status
    let newStatus = [values, ...status]
    await persist(newStatus, 'status')
    return await read('status')
  } catch (error) {
    console.log('olo')
    await persist([values], 'status')
    return await read('status')
  }
}

async function baghali () {
  console.log(await setStatus({ lastUpdated: Date.now() }))
}
baghali()
// persist({latestUpdate: (new Date).toLocaleString() }, 'status')
module.exports = {
  persist: persist,
  read: read
}
