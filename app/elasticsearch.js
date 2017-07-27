const elasticsearch = require('elasticsearch')
const client = new elasticsearch.Client({
  host: 'localhost:9200'
  // log: 'trace' // enable for debugging
})
createElasticsearchIndex()
async function createElasticsearchIndex () {
  const indexName = 'flowdock-messages'
  try {
    let indexExists = await client.indices.exists({ index: indexName })
    if (indexExists) {
      return
    }
  } catch (error) {
    console.log('Elasticsearch panic!: ', error)
  }
  try {
    let createIndex = await client.indices.create({
      index: indexName,
      body: {
        settings: {
          index: {
            number_of_shards: 3
          }
        },
        mappings: {
          'messages-*': {
            properties: {
              content: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256
                  }
                }
              },
              sentEpoch: {
                type: 'date',
                format: 'strict_date_optional_time||epoch_millis',
                ignore_malformed: true
              },
              setnTimeReadable: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256
                  }
                }
              },
              user: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256
                  }
                }
              },
              nick: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256
                  }
                }
              },
              name: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256
                  }
                }
              },
              flowName: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256
                  }
                }
              },
              flowId: {
                type: 'keyword'
              },
              threadURL: {
                type: 'text'
              }
            }
          }
        }
      }
    })
  } catch (indexError) {
    console.log('Elastic search index creation panic!', indexError)
  }
}

function saveToElasticsearch (message) {
  return client.index(
    {
      index: 'flowdock-messages',
      id: message.uuid,
      type: `message-${message.flowName}`,
      body: {
        flowId: message.flowId,
        content: message.content,
        sentTimeReadable: message.sentTimeReadable,
        sentEpoch: message.sentEpoch,
        user: message.user,
        userNick: message.nick,
        name: message.name,
        flowName: message.flowName,
        threadURL: message.threadURL
      }
    },
    function (error, response) {
      if (error) console.log('elastic search panic! ', error)
    }
  )
}

module.exports = {
  saveToElasticsearch,
  createElasticsearchIndex
}
