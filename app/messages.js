/*
 * CREDITS:
 * Ideas on how Flowdock api works:
 * https://raw.githubusercontent.com/Neamar/flowdock-stats/gh-pages/js/messages.js
 *
 **/

"use strict";
// libraries
const ora = require("ora");
const moment = require("moment");

// ours
const { makeRequest } = require("./http.js");
const { saveToElasticsearch } = require("./elasticsearch.js");
const spinner = new ora();
const { logger } = require("./logger.js");
const INDEX_NAME = process.env.INDEX_NAME || "flowdock-messages";
// global store for all stats
let indexingStat = { total: { updated: 0, created: 0, flowsDone: 0 } };

// returns an array of messages
function downloadMoreMessages(sinceId, flowName) {
  return makeRequest({
    url: `${flowName}/messages?&since_id=${sinceId}&sort=asc&limit=100`,
    method: "get"
  });
}

// message structure is different between threads and normal messages
function getMessageContent(message) {
  // it's empty
  if (!message || !message.content) {
    return;
  }

  // it's a thread
  if (
    typeof message.content === "object" &&
    typeof message.content.text === "string"
  ) {
    return message.content.text;
  }

  // it's a normal message
  return message.content;
}

function getThreadURL(message, flowName) {
  if (message.thread_id) {
    return `https://flowdock.com/app/${flowName}/threads/${message.thread_id}`;
  }
}

function setSpinnerText({
  spinner,
  messages,
  flowName,
  messageCount,
  latestDownloadedMessageId
}) {
  let remainingToDownload = parseInt(
    messageCount - latestDownloadedMessageId,
    10
  );
  spinner.text = `Indexed ${messages.length} of ${flowName} Remaining: ${remainingToDownload.toLocaleString()} (just a guess)`;
}

function setSpinnerSucceed({ spinner, flowName, indexingStat }) {
  let getUpdateStats = indexingStat => {
    if (!indexingStat[flowName]) {
      return "";
    }
    return `| updated: ${indexingStat[flowName]
      .updated} created: ${indexingStat[flowName].created}`;
  };

  spinner.succeed(`${flowName} ${getUpdateStats(indexingStat)}`);

  indexingStat.total.flowsDone += 1;
}

function getStat(elasticsearchResponse) {
  let reducer = (result, item) => {
    switch (item["index"]["result"]) {
      case "updated":
        result.updated = result.updated + 1;
        return result;
      case "created":
        result.created = result.created + 1;
        return result;
      default:
        return result;
    }
  };

  let initialValue = { updated: 0, created: 0 };

  return elasticsearchResponse.items.reduce(reducer, initialValue);
}

function setStat(result, flowName) {
  if (!indexingStat[flowName]) {
    indexingStat[flowName] = result;
  } else {
    indexingStat[flowName].updated =
      indexingStat[flowName].updated + result.updated;
    indexingStat[flowName].created =
      indexingStat[flowName].created + result.created;
  }
  indexingStat.total.updated += result.updated;
  indexingStat.total.created += result.created;
}

const formatMessages = (messages, users, flowName) =>
  messages
    .filter(
      message => message.event === "message" || message.event === "comment"
    )
    .map(msg => {
      let haveEqualId = user => user.id === parseInt(msg.user, 10);
      let userWithEqualId = users.find(haveEqualId);
      return Object.assign({}, msg, userWithEqualId);
    })
    .map(message => {
      let messageContent = getMessageContent(message);
      let messageWordCount = (messageContent || "").split(" ").length;
      return [
        {
          index: {
            _index: INDEX_NAME,
            _id: message.uuid,
            _type: `${flowName}-message`
          }
        },
        {
          flowId: message.id,
          content: messageContent,
          sentTimeReadable: moment(message.sent).format("HH:mm DD-MM-YYYY"),
          sentEpoch: message.sent,
          user: message.user,
          userNick: message.nick,
          name: message.name,
          flowName: flowName,
          organization: flowName.split("/")[0],
          threadURL: getThreadURL(message, flowName),
          messageWordCount
        }
      ];
    });
// give it a flowname and it downloads everything
// and feeds messages into elasticsearch batch by batch
// calls itself again as long as there are messages to download
async function downloadFlowDockMessages({
  flowName,
  latestDownloadedMessageId = 0,
  messages = [],
  users,
  messageCount,
  flowsNumber,
  stopWatch,
  setInProgress
}) {
  // download the first batch
  downloadMoreMessages(latestDownloadedMessageId, flowName)
    .then(async ({ data }) => {
      spinner.start();

      // no more messages to download
      if (data.length < 1) {
        setSpinnerSucceed({ spinner, flowName, indexingStat });
        if (indexingStat.total.flowsDone === flowsNumber) {
          logger.info(
            `
Index updated for ${flowsNumber} flows \\o/ updated: ${indexingStat.total
              .updated}, created: ${indexingStat.total
              .created} took: ${Math.floor(stopWatch.ms / 1000)}s
`
          );
          stopWatch.stop();
          indexingStat.total.flowsDone = 0;
          setInProgress(false);
        }
        return messages;
      }
      latestDownloadedMessageId =
        data[data.length - 1] && data[data.length - 1].id;

      let decoratedMessages = formatMessages(data, users, flowName);

      // feed the current batch of messages to Elasticsearch
      await saveToElasticsearch(decoratedMessages)
        .then(response => getStat(response))
        .then(result => setStat(result, flowName))
        .catch(error => {
          logger.error("savetoElasticsearch panic! ", error);
        });

      messages = messages.concat(decoratedMessages);

      setSpinnerText({
        spinner,
        messages,
        flowName,
        messageCount,
        latestDownloadedMessageId
      });

      // download the next batch, starting from the latest downloaded message id
      return downloadFlowDockMessages({
        flowName,
        latestDownloadedMessageId,
        messages,
        users,
        messageCount,
        flowsNumber,
        stopWatch,
        setInProgress
      });
    })
    .catch(error => logger.error(error));
}

// Return the number of messages in the flow, which seems to be just the latest message id
function getMessagesCount(flowName) {
  return makeRequest({
    url: `${flowName}/messages?limit=1`,
    method: "get"
  })
    .then(({ data }) => data[0].id)
    .catch(error => logger.error("Message Count Panic: ", error));
}

module.exports = {
  getMessagesCount,
  downloadFlowDockMessages
};
