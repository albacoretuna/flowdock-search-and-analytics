// This app really helped with understanding flowdock api: https://raw.githubusercontent.com/Neamar/flowdock-stats/gh-pages/js/messages.js
const ora = require('ora')
const { makeRequest } = require('./http.js')
const spinner = ora('').start()

function downloadMoreMessages (sinceId, flowName) {
  return makeRequest({
    url: `${flowName}/messages?&since_id=${sinceId}&sort=asc&limit=100`,
    method: 'get'
  })
}

function removeUnneededMessageProps (messages) {
  return messages.map(message => ({
    id: message.id,
    event: message.event,
    user: message.user,
    content: message.content,
    sent: message.sent
  }))
}

// remove the unneeded event types, like user nick name changes etc
function keepOnlyMessageEvents (messages) {
  return messages.map(message => {
    if (message.event === 'message' || message.event === 'comment') {
      return message
    } else {
      return {
        id: message.id
      }
    }
  })
}

// give it a flowname and it downloads everything
function downloadFlowDockMessages (
  flowName,
  latestDownloadedMessageId = 0,
  messages = []
) {
  // download the first set
  return downloadMoreMessages(latestDownloadedMessageId, flowName)
    .then(({ data }) => {
      if (data.length > 0) {
        data = removeUnneededMessageProps(data)
        data = keepOnlyMessageEvents(data)
        messages = messages.concat(data)
        spinner.text = `Downloaded ${messages.length} Messages so far`
        // download the next batch, starting from the latest downloaded message id
        latestDownloadedMessageId = data[data.length - 1].id
        return downloadFlowDockMessages(
          flowName,
          latestDownloadedMessageId,
          messages
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
