/*
 * CREDITS:
 * This app really helped with understanding flowdock api: https://raw.githubusercontent.com/Neamar/flowdock-stats/gh-pages/js/messages.js
 **/
const ora = require('ora')
const moment = require('moment')
const { makeRequest } = require('./http.js')
const { saveToElasticsearch } = require('./elasticsearch.js')
const spinner = ora('')

// returns an array of messages
function downloadMoreMessages (sinceId, flowName) {
  return makeRequest({
    url: `${flowName}/messages?&since_id=${sinceId}&sort=asc&limit=100`,
    method: 'get'
  })
}

// message structure is different between threads and normal messages
function getMessageContent (message) {
  // it's empty
  if (!message || !message.content) {
    return
  }

  // it's a thread
  if (
    typeof message.content === 'object' &&
    typeof message.content.text === 'string'
  ) {
    return message.content.text
  }

  // it's a normal message
  return message.content
}

function getThreadURL (message, flowName) {
  if (message.thread_id) {
    return `https://flowdock.com/app/${flowName}/threads/${message.thread_id}`
  }
}

function decorateMessageProps (messages, flowName) {
  return messages.map(message => ({
    id: message.id,
    uuid: message.uuid,
    flowId: message.id,
    event: message.event,
    user: message.user,
    nick: message.nick,
    name: message.name,
    content: getMessageContent(message),
    threadURL: getThreadURL(message, flowName),
    flowName: flowName,
    organization: flowName.split('/')[0],
    sentEpoch: message.sent,
    sentTimeReadable: moment(message.sent).format('HH:mm - DD-MM-YYYY')
  }))
}

// remove the unneeded event types, like user nick name changes etc
function keepOnlyMessageEvents (messages = []) {
  return messages.filter(
    message => message.event === 'message' || message.event === 'comment'
  )
}

// matches messages with nick names if possible
function addUserInfoToMessages (users = [], messages = []) {
  return messages.map(msg => {
    let haveEqualId = user => user.id === parseInt(msg.user, 10)
    let userWithEqualId = users.find(haveEqualId)
    return Object.assign({}, msg, userWithEqualId)
  })
}

function setSpinnerText (
  spinner,
  messages,
  flowName,
  messageCount,
  latestDownloadedMessageId
) {
  let remainingToDownload = messageCount - latestDownloadedMessageId
  spinner.text =
    'Downloaded ' +
    messages.length +
    ' messages of ' +
    parseInt(remainingToDownload, 10).toLocaleString() +
    ' in ' +
    flowName
}
// give it a flowname and it downloads everything
// and feeds messages into elasticsearch batch by batch
// calls itself again as long as there are messages to download
async function downloadFlowDockMessages (
  flowName,
  latestDownloadedMessageId = 0,
  messages = [],
  users,
  messageCount
) {
  // download the first batch
  downloadMoreMessages(latestDownloadedMessageId, flowName)
    .then(({ data }) => {
      spinner.start()

      // no more messages to download
      if (data.length < 1) {
        // console.log('no more messages to download');
        spinner.succeed(`Download completed for ${flowName}`)
        return messages
      }
      latestDownloadedMessageId =
        data[data.length - 1] && data[data.length - 1].id
      let messagesWithContent = keepOnlyMessageEvents(data)
      let messagesWithUserInfo = addUserInfoToMessages(
        users,
        messagesWithContent
      )

      let decoratedMessages = decorateMessageProps(
        messagesWithUserInfo,
        flowName
      )

      // feed the current batch of messages to Elasticsearch
      saveToElasticsearch(decoratedMessages)

      messages = messages.concat(decoratedMessages)

      setSpinnerText(
        spinner,
        messages,
        flowName,
        messageCount,
        latestDownloadedMessageId
      )

      // download the next batch, starting from the latest downloaded message id
      return downloadFlowDockMessages(
        flowName,
        latestDownloadedMessageId,
        messages,
        users,
        messageCount
      )
    })
    .catch(error => console.log(error))
}

// Return the number of messages in the flow, which seems to be just the latest message id
function getMessagesCount (flowName) {
  return makeRequest({
    url: `${flowName}/messages?limit=1`,
    method: 'get'
  })
    .then(({ data }) => data[0].id)
    .catch(error => console.log('Message Count Panic: ', error))
}

module.exports = {
  getMessagesCount,
  downloadFlowDockMessages
}
