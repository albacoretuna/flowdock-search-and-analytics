const elasticsearch = require('elasticsearch')
const _ = require('underscore')
const client = new elasticsearch.Client({
  host: 'localhost:9200'
  // log: 'trace' // enable for debugging
})
const INDEX_NAME = process.env.INDEX_NAME || 'flowdock-messages'
async function createElasticsearchIndex () {
  let indexExists = false
  try {
    indexExists = await client.indices.exists({ index: INDEX_NAME })
  } catch (error) {
    console.log('Elasticsearch panic! Make sure elastic is running: ', error)
  }

  if (indexExists) {
    return
  }

  try {
    let createIndex = await client.indices.create({
      index: INDEX_NAME,
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
              organization: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256
                  }
                }
              },
              flowId: {
                type: 'integer'
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

function getLatestMessageIdInFlow (flowName) {
  return client
    .search({
      index: INDEX_NAME,
      body: {
        aggs: {
          max_flowId: { max: { field: 'flowId' } }
        },
        query: {
          type: {
            value: `message-${flowName}`
          }
        }
      }
    })
    .then(data => data.aggregations['max_flowId'].value)
    .catch(error => console.log('getLatestMessageId Panic! :', error))
}

function decorateElasticObject (message) {
  return [
    {
      index: {
        _index: INDEX_NAME,
        _id: message.uuid,
        _type: `message-${message.flowName}`
      }
    },
    {
      flowId: message.flowId,
      content: message.content,
      sentTimeReadable: message.sentTimeReadable,
      sentEpoch: message.sentEpoch,
      user: message.user,
      userNick: message.nick,
      name: message.name,
      flowName: message.flowName,
      organization: message.organization,
      threadURL: message.threadURL
    }
  ]
}

function saveToElasticsearch (messages) {
  let decoratedMessages = messages.map(decorateElasticObject)
  let decoratedMessagesWithBody = decoratedMessages.filter(
    el => el.length === 2
  )
  let flatDecoratedMessages = decoratedMessagesWithBody.reduce(
    (a, b) => a.concat(b),
    []
  )

  if (flatDecoratedMessages.length < 1) {
    return
  }
  client.bulk(
    {
      body: flatDecoratedMessages
    },
    function (err, resp) {
      if (err) console.log('elastic search panic! ', err)
    }
  )
}

module.exports = {
  saveToElasticsearch,
  createElasticsearchIndex,
  getLatestMessageIdInFlow
}
