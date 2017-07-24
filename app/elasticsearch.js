const elasticsearch = require('elasticsearch')
const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
})

function saveToElasticsearch (flowName, message) {
  return client.index(
    {
      index: 'flowdock',
      type: flowName,
      id: message.id,
      body: {
        content: message.content,
        sentTime: message.sent,
        user: message.user
      }
    },
    function (error, response) {
      if (error) console.log('elastic search panic! ', error)

      console.log('saved to elastic')
    }
  )
}

module.exports = {
  saveToElasticsearch
}
