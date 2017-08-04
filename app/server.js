const express = require('express')
const app = express()
const { read } = require('./store.js')

app.get('/', function (req, res) {
  read('status')
    .then(data => {
      res.send('Last updated' + data)
    })
    .catch(error => console.error)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
