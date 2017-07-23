require('dotenv').config();
const FLOWDOCK_TOKEN=process.env.FLOWDOCK_PERSONAL_API_TOKEN || '';
const { getMessagesCount, downloadFlowDockMessages } = require('./messages.js');

getMessagesCount('futurice')
  .then(({data}) => { console.log(data[0].id)})
  .catch((data) => { console.warn(data)})

downloadFlowDockMessages('vegeterian-options')
  .then(data => console.log(data))
  .catch((data) => { console.warn(data)})
