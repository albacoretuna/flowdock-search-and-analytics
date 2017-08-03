const { makeRequest } = require('./http.js')

// returns an array of messages
function getFlowNames () {
  return makeRequest({
    method: 'get'
  })
    .then(({ data: flows }) => {
      console.log(
        flows
          .map(
            flow =>
              `${flow.organization
                .parameterized_name}/${flow.parameterized_name}`
          )
          .join(', ')
      )
    })
    .catch(error => {
      console.error(error)
    })
}

getFlowNames()
