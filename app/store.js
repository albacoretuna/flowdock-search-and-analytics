// packages
const  levelup = require('levelup')
const jsonfile = require('jsonfile')

// native
const util = require('util')
// ours

// our databse
const messagesDatabase = levelup('./messagesDatabase.db')

// gets an array of messages, and makes an object with their ids as keys
function setMessagesObject(messages) {
  let storage = {}
  messages.forEach(el => {
    storage[el.id] = el;
  })
  return storage;
}

function persistMessages(messages, flowName='vegeterian-options') {
  let storage = setMessagesObject(messages);
  messagesDatabase.put(flowName, JSON.stringify(storage), (err) => {
    if (err) return console.log('Ooops! leveldb panic!', err)
    // console.log('saved in db');
    getMessages(flowName);
  })
}

function getMessages(flowName) {
  return messagesDatabase.get(flowName, (err, value) => {
    if (err) return console.log('Ooops! leveldb panic!', err)

    console.dir(JSON.parse(value));
    exportJSON(flowName, JSON.parse(value));
    return JSON.parse(value)
  })
}

function exportJSON(flowName, messages) {
  jsonfile.writeFile('../exports/'+flowName+'.json', messages, (err) => {
  if(err) console.log('writing json panic: ', err)
  })
}

module.exports = {
  persistMessages
}
