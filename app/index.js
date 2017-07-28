require('dotenv').config()
const { getMessagesCount, downloadFlowDockMessages } = require('./messages.js')
const { getUsers } = require('./users.js')
const {
  createElasticsearchIndex,
  getLatestMessageIdInFlow
} = require('./elasticsearch.js')

// instructions in ./env-sample file
const flowsToDownload = process.env.FLOWS_TO_DOWNLOAD
  .replace(/ /gm, '')
  .split(',')

console.log(
  'Hello! starting to download and index messages',
  flowsToDownload.length,
  'flows'
)
console.log(
  'Total message numbers are just estimates.',
  '\n Only new messages after the last indexing will be downloaded'
)

async function init () {
  await createElasticsearchIndex()
  let requestUsers = await getUsers()
  let users = requestUsers.data

  flowsToDownload.forEach(async flowName => {
    try {
      let requestMessageCount = await getMessagesCount(flowName)
      let messageCount = requestMessageCount.data[0].id
      let requestLatestMessageId = await getLatestMessageIdInFlow(flowName)
      latestMessageIdInFlow =
        requestLatestMessageId.aggregations['max_flowId'].value
      await downloadFlowDockMessages(
        flowName,
        latestMessageIdInFlow,
        [],
        users,
        messageCount
      )
    } catch (error) {
      console.log(error)
    }
  })
}

init()
