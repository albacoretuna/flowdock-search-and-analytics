// This app really helped with understanding flowdock api: https://raw.githubusercontent.com/Neamar/flowdock-stats/gh-pages/js/messages.js
const ora = require('ora')
const moment = require('moment')
const { makeRequest } = require('./http.js')
const spinner = ora('').start()
const { saveToElasticsearch } = require('./elasticsearch.js')
const _ = require('underscore')
function downloadMoreMessages (sinceId, flowName) {
  return makeRequest({
    url: `${flowName}/messages?&since_id=${sinceId}&sort=asc&limit=100`,
    method: 'get'
  })
}

function getMessageContent (message) {
  if (!message || !message.content) {
    return
  }

  if (
    typeof message.content === 'object' &&
    typeof message.content.text === 'string'
  ) {
    return message.content.text
  }

  return message.content
}
function getThreadURL (message, flowName) {
  if (message.thread_id) {
    return `/${flowName}/threads/${message.thread_id}`
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
    sentEpoch: message.sent,
    sentTimeReadable: moment(message.sent).format('HH:mm - DD-MM-YYYY')
  }))
}

// remove the unneeded event types, like user nick name changes etc
function keepOnlyMessageEvents (messages) {
  return messages.filter(
    message => message.event === 'message' || message.event === 'comment'
  )
}

// matches messages with nick names if possible
function addUserInfoToMessages (users = [], messages = []) {
  return _.map(messages, function (message) {
    return Object.assign(
      {},
      message,
      _.findWhere(users, { id: parseInt(message.user, 10) })
    )
  })
}

// give it a flowname and it downloads everything
function downloadFlowDockMessages (
  flowName,
  latestDownloadedMessageId = 0,
  messages = [],
  users
) {
  // download the first set
  return downloadMoreMessages(latestDownloadedMessageId, flowName)
    .then(({ data }) => {
      if (data.length > 0) {
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
        decoratedMessages.forEach(message => {
          if (message && message.content) {
            saveToElasticsearch(message)
          }
        })
        messages = messages.concat(decoratedMessages)
        spinner.text = `Downloaded ${messages.length} Messages so far`
        // download the next batch, starting from the latest downloaded message id
        return downloadFlowDockMessages(
          flowName,
          latestDownloadedMessageId,
          messages,
          users
        )
      } else {
        // console.log('no more messages to download');
        spinner.succeed('Download completed')

        return messages
      }
    })
    .catch(error => console.log(error))
}

// Return the number of messages in the flow, which seems to be just the latest message id
function getMessagesCount (flowName) {
  return makeRequest({
    url: `${flowName}/messages?limit=1`,
    method: 'get'
  })
}

module.exports = {
  getMessagesCount,
  downloadFlowDockMessages
}
