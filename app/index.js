"use strict";
// libraries
require("dotenv").config();
const CronJob = require("cron").CronJob;
const timer = require("timer-stopwatch");

// ours
const { logger } = require("./logger.js");
const { getMessagesCount, downloadFlowDockMessages } = require("./messages.js");
const { getFlowUsers } = require("./users.js");
const {
  elasticsearchIsFound,
  createElasticsearchIndex,
  getLatestMessageIdInFlow
} = require("./elasticsearch.js");
let inProgress = false;

function setInProgress(value) {
  inProgress = value;
}
// instructions in ./env-sample file
const flowsToDownload = process.env.FLOWS_TO_DOWNLOAD
  .replace(/ /gm, "")
  .split(",");

function welcomeMessage() {
  logger.info(
    "Starting index messages from",
    flowsToDownload.length,
    "flows.",
    "\n Total message numbers are just estimates.",
    "\n First run might take half an hour, but next runs probably under a minute.",
    "\n as only new messages after the last indexing will be downloaded"
  );
}

async function init() {
  if (inProgress) return;
  // retry init if elasticsearch isn't responding
  if (!await elasticsearchIsFound()) {
    logger.info("Elastic search not found, trying again in 60 second");
    setTimeout(init, 60000);
    return;
  }

  setInProgress(true);
  const stopWatch = new timer();
  stopWatch.start();
  await createElasticsearchIndex();
  welcomeMessage();
  let downloadOneFlow = async (flowName, index, array) => {
    try {
      await downloadFlowDockMessages({
        flowName,
        latestDownloadedMessageId: await getLatestMessageIdInFlow(flowName),
        messages: [],
        users: await getFlowUsers(flowName),
        messageCount: await getMessagesCount(flowName),
        flowsNumber: array.length,
        stopWatch,
        setInProgress
      });
    } catch (error) {
      logger.error(error);
    }
  };

  flowsToDownload.forEach(downloadOneFlow);
}

// to repeat indexing
const indexingJob = new CronJob({
  cronTime: process.env.CRON_TIME,
  onTick: function() {
    logger.info(
      "This job will run based on this crontab schedule:",
      process.env.CRON_TIME
    );

    // let it begin!
    init();
  },
  runOnInit: true
});

indexingJob.start();
