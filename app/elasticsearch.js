"use strict";
const elasticsearch = require("elasticsearch");
const { logger } = require("./logger.js");

const client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_HOST,
  log: process.env.LOGLEVEL === "debug" ? "trace" : ""
});

function elasticsearchIsFound() {
  return client
    .ping({
      requestTimeout: 1000
    })
    .then(() => true)
    .catch(() => false);
}

const INDEX_NAME = process.env.INDEX_NAME || "flowdock-messages";
async function createElasticsearchIndex() {
  let indexExists = false;
  try {
    indexExists = await client.indices.exists({ index: INDEX_NAME });
  } catch (error) {
    logger.error("Elasticsearch panic!");
    logger.error("Elasticsearch says: ", error);
    logger.debug("Elastic host: ", process.env.ELASTICSEARCH_HOST);
    process.exitCode = 1;
    throw new Error("Indexing won't continue!");
  }

  if (indexExists) {
    return;
  }
  try {
    await client.indices.create({
      index: INDEX_NAME,
      body: {
        settings: {
          index: {
            number_of_shards: 3
          }
        }
      }
    });
  } catch (indexError) {
    logger.error("Elastic search index creation panic!", indexError);
    process.exitCode = 1;
    throw indexError;
  }
}

function getLatestMessageIdInFlow(flowName) {
  return client
    .search({
      index: INDEX_NAME,
      body: {
        size: 0,
        aggs: {
          max_flowId: { max: { field: "flowId" } }
        },
        query: {
          type: {
            value: `${flowName}-message`
          }
        }
      }
    })
    .then(data => data.aggregations["max_flowId"].value)
    .catch(error => logger.error("getLatestMessageId Panic! :", error));
}

function saveToElasticsearch(messages) {
  let flatDecoratedMessages = messages
    .filter(el => el.length === 2 && el[1].length !== 0)
    .reduce((a, b) => a.concat(b), []);

  if (flatDecoratedMessages.length < 1) {
    return Promise.resolve({ items: [] });
  }

  return client.bulk({
    body: flatDecoratedMessages
  });
}

module.exports = {
  elasticsearchIsFound,
  saveToElasticsearch,
  createElasticsearchIndex,
  getLatestMessageIdInFlow
};
