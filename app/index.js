"use strict";
// libraries
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
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
  // retry init if elasticsearch isn't responding
  if (!await elasticsearchIsFound()) {
    logger.info("Elastic search not found, trying again in 60 second");
    setTimeout(init, 60000);
    return;
  }

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
        stopWatch
      });
    } catch (error) {
      logger.error(error);
    }
  };

  flowsToDownload.forEach(downloadOneFlow);
}

// let it begin!
init();
