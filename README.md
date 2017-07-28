# Flowdock Analytics
 asdf asdf
An app to import all flowdock messages into elastic search stack, so that search and analytics becomes easier for flowdock.

## Work in progress


# Install
```bash
# 1 
git clone git@github.com:omidfi/flowdock-analytics.git
cd flowdock-analytics
npm install
```
2. Copy app/env-sample to app/.env and add your flowdock api token, and other details. 
Your api tokenc can be found at [flowdock's user account ](https://www.flowdock.com/account/tokens).

```bash
#3
# start elasticsearch
cd docker-elkasdf
docker-compose up

# start the app
cd app
node app/index.js
```
This process might take some time depending on the number of messages that need to be indexed. 

# Developer notes
What are we trying to achieve here?
Import all the flows into elasticsearch.

## How?
  * define a list of interesting flows
  * An api call to get all the users
  * Ask elasticsearch how far each flow has been downloaded
  * download new messages and store it into elastic search
  * the user info needs to be merged with the messages so that each message gets user's name and nick
