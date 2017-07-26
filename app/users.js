const { makeRequest } = require('./http.js')

// gets all the users that the token owner is allowed to see
function getUsers () {
  return makeRequest({
    baseURL: `https://api.flowdock.com/users`,
    method: 'get'
  })
}

module.exports = {
  getUsers
}
