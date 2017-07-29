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
  let users = await getUsers()
  let downloadOneFlow = async flowName => {
    try {
      await downloadFlowDockMessages(
        flowName,
        await getLatestMessageIdInFlow(flowName),
        [],
        users,
        await getMessagesCount(flowName)
      )
    } catch (error) {
      console.log(error)
    }
  }

  flowsToDownload.forEach(downloadOneFlow)
}

init()
