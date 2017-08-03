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

function welcomeMessage () {
  logger.info(
    'Hello! starting to download and index messages for',
    flowsToDownload.length,
    'flows.',
    '\n Total message numbers are just estimates.',
    '\n Only new messages after the last indexing will be downloaded'
  )
}

async function init () {
  await createElasticsearchIndex()
  welcomeMessage()
  let users = await getUsers()
  let downloadOneFlow = async (flowName, index, array) => {
    try {
      await downloadFlowDockMessages({
        flowName,
        latestDownloadedMessageId: await getLatestMessageIdInFlow(flowName),
        messages: [],
        users,
        messageCount: await getMessagesCount(flowName),
        isLastFlow: index === array.length - 1
      })
    } catch (error) {
      logger.error(error)
    }
  }

  flowsToDownload.forEach(downloadOneFlow)
}

init()
