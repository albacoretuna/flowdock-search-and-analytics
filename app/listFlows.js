"use strict";
const { logger } = require("./logger.js");
const { makeRequest } = require("./http.js");

// returns an array of messages
function getFlowNames() {
  return makeRequest({
    method: "get"
  })
    .then(({ data: flows }) => {
      /* eslint-disable no-console */
      console.log(
        flows
          .map(
            flow =>
              `${flow.organization
                .parameterized_name}/${flow.parameterized_name}`
          )
          .join(", ")
      );
    })
    .catch(error => {
      logger.error(error);
      throw error;
    });
}

getFlowNames();
