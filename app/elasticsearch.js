const elasticsearch = require('elasticsearch')
const { logger } = require('./logger.js')

const client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_HOST,
  log: process.env.LOGLEVEL === 'debug' ? 'trace' : ''
})
const INDEX_NAME = process.env.INDEX_NAME || 'flowdock-messages'
async function createElasticsearchIndex () {
  let indexExists = false
  try {
    indexExists = await client.indices.exists({ index: INDEX_NAME })
  } catch (error) {
    logger.error('Elasticsearch panic!')
    logger.error('Elasticsearch says: ', error)
    logger.debug('Elastic host: ', process.env.ELASTICSEARCH_HOST)
    process.exit(1)
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
          '*-messages': {
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
    logger.error('Elastic search index creation panic!', indexError)
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
            value: `${flowName}-message`
          }
        }
      }
    })
    .then(data => data.aggregations['max_flowId'].value)
    .catch(error => logger.error('getLatestMessageId Panic! :', error))
}

function decorateElasticObject (message) {
  return [
    {
      index: {
        _index: INDEX_NAME,
        _id: message.uuid,
        _type: `${message.flowName}-message`
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
  let flatDecoratedMessages = messages
    .map(decorateElasticObject)
    .filter(el => el.length === 2 && el[1].lenght !== 0)
    .reduce((a, b) => a.concat(b), [])

  if (flatDecoratedMessages.length < 1) {
    return Promise.resolve({ items: [] })
  }

  return client.bulk({
    body: flatDecoratedMessages
  })
}

module.exports = {
  saveToElasticsearch,
  createElasticsearchIndex,
  getLatestMessageIdInFlow
}
