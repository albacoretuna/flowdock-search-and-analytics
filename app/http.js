require('dotenv').config()
const axios = require('axios')
const btoa = require('btoa')
const FLOWDOCK_TOKEN = process.env.FLOWDOCK_PERSONAL_API_TOKEN || ''
const authorizationHeader =
  'Basic ' + btoa(FLOWDOCK_TOKEN) + ':password-which-is-ignored'
const axiosInstance = axios.create({
  baseURL: 'https://api.flowdock.com/flows/',
  headers: { Authorization: authorizationHeader }
})

function makeRequest (config) {
  return axiosInstance(config)
}

module.exports = {
  makeRequest
}
