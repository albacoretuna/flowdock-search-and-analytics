require('dotenv').config();
const FLOWDOCK_TOKEN=process.env.FLOWDOCK_PERSONAL_API_TOKEN || '';
const { getMessagesCount, downloadFlowDockMessages } = require('./messages.js');
const { persistMessages } = require('./store.js');

getMessagesCount('vegeterian-options')
  .then(({data}) => { console.log('Probably ', data[0].id, ' Messages to download')})
  .catch((data) => { console.warn(data)})

downloadFlowDockMessages('vegeterian-options')
  .then(data => {
    persistMessages(data, 'vegeterian-options')
    })
  .catch((data) => { console.warn(data)})
