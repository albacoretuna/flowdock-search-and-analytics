require('dotenv').config()
const FLOWDOCK_TOKEN = process.env.FLOWDOCK_PERSONAL_API_TOKEN || ''
const { getMessagesCount, downloadFlowDockMessages } = require('./messages.js')
const { persistMessages } = require('./store.js')
const flowName = 'vegeterian-options'
getMessagesCount(flowName)
  .then(({ data }) => {
    console.log('Probably ', data[0].id, ' Messages to download')
  })
  .catch(data => {
    console.warn(data)
  })

downloadFlowDockMessages(flowName)
  .then(data => {
    persistMessages(data, flowName)
  })
  .catch(data => {
    console.warn(data)
  })
