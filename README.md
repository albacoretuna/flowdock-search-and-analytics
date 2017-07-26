# Flowdock Analytics

An app to import all flowdock messages into elastic search stack, so that search and analytics becomes easier for flowdock.

## Work in progress


# Install
```
git clone git@github.com:omidfi/flowdock-analytics.git
cd flowdock-analytics
npm install
```
Copy app/env-sample to app/.env and add your flowdock api token to it

# Run
```
# start elasticsearch
cd elk
docker-compose up

# start the app
cd app
node app/index.js
```

# Developer notes
What are we trying to achieve here?

## Goals
Import all the flows into elasticsearch.

## How?
  * define a list of interesting flows
  * An api call to get all the users
  * Ask elasticsearch how far each flow has been downloaded
  * download new messages and store it into elastic search
  * the user info needs to be merged with the messages so that each message gets user's name and nick
