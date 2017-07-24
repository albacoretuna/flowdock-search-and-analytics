// packages
const levelup = require('levelup')
const jsonfile = require('jsonfile')

// our databse
const messagesDatabase = levelup('./messagesDatabase.db')

function persistMessages (messages, flowName = 'vegeterian-options') {
  messagesDatabase.put(flowName, JSON.stringify(messages), err => {
    if (err) return console.log('Ooops! leveldb panic!', err)
    // console.log('saved in db');
    getMessages(flowName)
  })
}

function getMessages (flowName) {
  return messagesDatabase.get(flowName, (err, value) => {
    if (err) return console.log('Ooops! leveldb panic!', err)

    exportJSON(flowName, JSON.parse(value))
    return JSON.parse(value)
  })
}

function exportJSON (flowName, messages) {
  jsonfile.writeFile('../exports/' + flowName + '.json', messages, err => {
    if (err) console.log('writing json panic: ', err)
  })
}

module.exports = {
  persistMessages
}
