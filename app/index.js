require('dotenv').config();
const FLOWDOCK_TOKEN=process.env.FLOWDOCK_PERSONAL_API_TOKEN || '';
const { getMessagesCount, downloadFlowDockMessages } = require('./messages.js');
const { persistMessages } = require('./store.js');

getMessagesCount('futurice')
  .then(({data}) => { console.log(data[0].id, 'messages to download')})
  .catch((data) => { console.warn(data)})

downloadFlowDockMessages('futurice')
  .then(data => {
    persistMessages(data, 'futurice')
    })
  .catch((data) => { console.warn(data)})
