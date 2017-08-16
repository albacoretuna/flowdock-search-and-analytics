"use strict";
const moment = require("moment-timezone");
const winston = require("winston");
const timeStampFormat = () => moment().tz("Europe/Helsinki").format();
const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp: timeStampFormat,
      colorize: true
    })
  ]
});
logger.level = process.env.LOGLEVEL || "info";

module.exports = {
  logger
};
