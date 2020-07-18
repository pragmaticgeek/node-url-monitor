const fetch = require("node-fetch");
const cron = require("node-cron");
const winston = require("winston");

const MONITOR_ENDPOINT =
  process.env.MONITOR_ENDPOINT || "http://localhost:12345"; // default to check localhost on port 12345
const MONITOR_SCHEDULE = process.env.MONITOR_SCHEDULE || "*/2 * * * * *"; // schedule a check every 2 seconds
const MONITOR_LOGFILE = process.env.MONITOR_LOGFILE || "monitor.log";

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: MONITOR_LOGFILE }),
  ],
});

console.log("Monitor Started...");
console.log(`Endpoint to monitor: ${MONITOR_ENDPOINT}`);
console.log(`Monitor Schedule: ${MONITOR_SCHEDULE}`);
console.log(`Monitor logfile: ${MONITOR_LOGFILE}`);

const RETRY_THRESHOLD = 10;
let numberOfErrorsInARow = 0;
let numberOfRequestsMade = 0;
let numberOfSuccess = 0;
let numberOfError = 0;

cron.schedule(MONITOR_SCHEDULE, () => {
  logger.info(
    `Health Info for endpoint: ${MONITOR_ENDPOINT}, Total Requests: ${numberOfRequestsMade} Total Successes: ${numberOfSuccess} Total Errors: ${numberOfError}  Success Rate: ${
      numberOfRequestsMade > 0 ? numberOfSuccess / numberOfRequestsMade * 100 : 0
    }%  Error Rate: ${
      numberOfRequestsMade > 0 ? numberOfError / numberOfRequestsMade * 100 : 0
    }%`
  );
  fetch(MONITOR_ENDPOINT)
    .then((res) => {
      numberOfRequestsMade++;
      if (res.ok) {
        numberOfErrorsInARow = 0;
        numberOfSuccess++;
        return res.text();
      }
      numberOfErrorsInARow++;
      numberOfError++;
      if (numberOfErrorsInARow > RETRY_THRESHOLD) {
        logger.error(`Error - Endpoint: ${MONITOR_ENDPOINT} is likely down!!!`);
      }
      throw res;
    })
    .then((text) => {
      logger.info(`Success - endpoint: ${MONITOR_ENDPOINT} - Payload: ${text}`);
    })
    .catch((err) => {
      if (err && err.text) {
        err.text().then((errorMessage) => {
          logger.error(
            `Error - Endpoint: ${MONITOR_ENDPOINT} - Error: ${errorMessage}.`
          );
        });
      }
    });
});
