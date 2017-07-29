const { makeRequest } = require('./http.js')

// gets all the users that the token owner is allowed to see
async function getUsers () {
  return await makeRequest({
    baseURL: `https://api.flowdock.com/users`,
    method: 'get'
  })
    .then(({ data }) => data)
    .catch(error => console.log('getUsers panic!: ', error))
}

module.exports = {
  getUsers
}
