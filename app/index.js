require('dotenv').config()
const FLOWDOCK_TOKEN = process.env.FLOWDOCK_PERSONAL_API_TOKEN || ''
const { getMessagesCount, downloadFlowDockMessages } = require('./messages.js')
const { getUsers } = require('./users.js')
const { persistMessages } = require('./store.js')
const { createElasticsearchIndex } = require('./elasticsearch.js')
const flowName = 'futurice'

async function init () {
  await createElasticsearchIndex()
  let users = await getUsers()
  users = users.data
  getMessagesCount(flowName)
    .then(({ data }) => {
      console.log('Probably ', data[0].id, 'Messages to download')
    })
    .catch(data => {
      console.warn(data)
    })

  downloadFlowDockMessages(flowName, 0, [], users)
    .then(data => {
      console.log('downloaded all messages in the flow: ', flowName)
      // persistMessages(data, flowName)
    })
    .catch(data => {
      console.warn(data)
    })
}

init()
