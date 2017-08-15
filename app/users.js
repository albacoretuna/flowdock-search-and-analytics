"use strict";

const { makeRequest } = require("./http.js");
const { logger } = require("./logger.js");

// returns an array of users in the flow
function getFlowUsers(flowName) {
  return makeRequest({
    method: "get",
    url: flowName
  })
    .then(({ data }) => data.users)
    .catch(error => {
      logger.error(error);
      throw error;
    });
}

module.exports = {
  getFlowUsers
};
