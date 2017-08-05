// libraries
const express = require('express')
const next = require('next')

// ours
const { read } = require('./store.js')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.get('/api/status', function (req, res) {
    read('status')
      .then(data => {
        res.json({ status: { lastUpdate: 'Index last updated' + data } })
      })
      .catch(error => {
        res.json({ status: 'No data' })
      })
  })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(3000, err => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
