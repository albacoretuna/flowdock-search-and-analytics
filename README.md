# Flowdock Analytics

An app to import Flowdock messages into elastic search stack, so that search and analytics becomes easier for Flowdock.

# Install
1.
```bash
git clone git@github.com:omidfi/flowdock-analytics.git
cd flowdock-analytics
npm install
```
2. Copy env-sample to .env and add your flowdock api token, and other details.
Your api tokenc can be found at [flowdock's user account page ](https://www.flowdock.com/account/tokens).

3.
```bash
# start elasticsearch
cd docker-elkasdf
docker-compose up
```
4.
```bash
# start the app
npm start
```
This process might take some time depending on the number of messages that need to be indexed.

# Developer notes
What are we trying to achieve here?
Import all the flows into Elasticsearch.

## How?
  * Make a list of interesting flows
  * Make an api call to get all the users
  * Ask Elasticsearch how far each flow has been downloaded
  * Download new messages and store it into elastic search recursively
  * Merge with the messages with user information so that each message gets user's name etc.
  * Index those into Elasticsearch
