'use strict'
require('dotenv').config()
const { logger } = require('./logger.js')
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

logger.info(
  'Hello! starting to download and index messages for',
  flowsToDownload.length,
  'flows.',
  '\n Total message numbers are just estimates.',
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
      logger.error(error)
    }
  }

  flowsToDownload.forEach(downloadOneFlow)
}

init()
