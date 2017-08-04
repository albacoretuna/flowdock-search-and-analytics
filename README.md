# Flowdock Analytics

A nodejs app to mport Flowdock messages into elasticsearch, so that search and analytics becomes easier for Flowdock. Once messages are indexed Kibana can be used to search and visualize results in realtime. 

# Install
### 1. clone and add dependencies  
```bash
git clone git@github.com:omidfi/flowdock-analytics.git
cd flowdock-analytics
npm install
```
### 2. Set environment veriables
Copy env-sample to .env and add your flowdock api token, and other details.
Your api token can be found at [flowdock's user account page ](https://www.flowdock.com/account/tokens).

### 3. Get yourself elasticsearch and Kibana
You can use your exisiting elasticsearch and Kibana services, use a hosted version, or start one by the docker images proved: 

```bash
# start elasticsearch
cd docker-elk
docker-compose up
```
If it doesn't work, check out [Docker ELK Project on Github](https://github.com/deviantony/docker-elk)

### 4. Start indexing!

```bash
# start the app
npm start
```
This process might take some time depending on the number of messages that need to be indexed.

# Developer notes
What are we trying to achieve here?
Import all the flows into Elasticsearch.

## Why?
  * Flowdock doesn't provide a global search. 
  * Flowdock doesn't provide any search in the mobile version. 

## How?
  * Make a list of interesting flows
  * Make an api call to get all the users
  * Ask Elasticsearch how far each flow has been downloaded
  * Download new messages and store it into elastic search recursively
  * Merge with the messages with user information so that each message gets user's name etc.
  * Index those into Elasticsearch
