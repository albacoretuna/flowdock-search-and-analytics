'use strict'
// libraries
require('dotenv').config()
const CronJob = require('cron').CronJob
const timer = require('timer-stopwatch')

// ours
const { logger } = require('./logger.js')
const { getMessagesCount, downloadFlowDockMessages } = require('./messages.js')
const { getUsers } = require('./users.js')
const {
  createElasticsearchIndex,
  getLatestMessageIdInFlow
} = require('./elasticsearch.js')
let inProgress = false

function setInProgress (value) {
  inProgress = value
}
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
  if (inProgress) return

  setInProgress(true)
  const stopWatch = new timer()
  stopWatch.start()
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
        flowsNumber: array.length,
        stopWatch,
        setInProgress
      })
    } catch (error) {
      logger.error(error)
    }
  }

  flowsToDownload.forEach(downloadOneFlow)
}

// to repeat indexing
const indexingJob = new CronJob({
  cronTime: process.env.CRON_TIME,
  onTick: function () {
    logger.info(
      'This job will run based on this crontab schedule:',
      process.env.CRON_TIME
    )

    // let it begin!
    init()
  },
  runOnInit: true
})

indexingJob.start()
