The purpose of this project is to monitor an endpoint and give the user of this script an insight whether the endpoint is healthy.

With the time given (2 hours), there were a lot of consideration that I cannot implement due to time constraints:

* It is assumed as stated in the requirements that the end user will have a log parser and can aggregate stats
* If this service was to be run on Kubernetes and can scale up, a backing logging service will be a much better choice here
* Did not wrap this as a Docker image due to time but started the approach with configurable environment variables
* Log will print and log when it detects an endpoint is down after 10 retries to the defined URL.  A log parser will be needed to give such statistics.  Also ran out of time to implement a quick shell script to prove this out.



# Setup

To install the monitor app dependencies run the following command

```
npm install
```

## Overriding configuration

If you want the endpoint to monitor to not default to http://localhost:12345 .  It is assumed this is a HTTP GET method.  All other method are not supported except for GET.  Code can be extended to do so by adding a MONITOR_ENDPOINT_METHOD variable for that flexibility

```
export MONITOR_ENDPOINT="<your url>" 
```

If you want the script to run other than every 2 seconds, it is based on the cron format (refer to [https://github.com/node-cron/node-cron](https://github.com/node-cron/node-cron) on how to format it):

```
export MONITOR_SCHEDULE="*/15 * * * * *" # Monitor every 15 seconds 
export MONITOR_SCHEDULE="0 * * * * *" # Monitor every minute at 0 seconds 
```

If you want the script log to a file that is not *monitor.log*:

```
export MONITOR_LOGFILE="<your log file path>"
```

# Run it
```
npm start
```

# Monitor Logs

Monitor logs are generated under *monitor.log* under the root of the execution directory.  To change this please refer to the configuration above.

The logging payload follows the default format from: [https://github.com/winstonjs/winston](https://github.com/winstonjs/winston)

# Author
Kevin Wong <kevinksw@gmail.com>