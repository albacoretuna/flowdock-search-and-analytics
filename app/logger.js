'use strict'
const winston = require('winston')
const timeStampFormat = () => new Date().toLocaleString()
const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp: timeStampFormat,
      colorize: true
    })
  ]
})
logger.level = process.env.LOGLEVEL || 'info'

module.exports = {
  logger
}
