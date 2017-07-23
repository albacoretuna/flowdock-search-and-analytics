require('dotenv').config();
const axios = require('axios');
const FLOWDOCK_TOKEN=process.env.FLOWDOCK_PERSONAL_API_TOKEN || '';
const flowdockOrg = 'futurice-nonda';
const { getMessagesCount, downloadFlowDockMessages } = require('./messages.js');

getMessagesCount('futurice')
  .then(({data}) => { console.log(data[0].id)})
  .catch((data) => { console.warn(data)})

downloadFlowDockMessages('futurice')
  .then(data => console.log(data))
  .catch((data) => { console.warn(data)})
