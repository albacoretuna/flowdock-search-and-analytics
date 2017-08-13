# Flowdock Analytics

A nodejs app to import Flowdock messages into elasticsearch, so that search and analytics becomes easier for Flowdock. Once messages are indexed Kibana can be used to search and visualize results in real time.

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


# Alternative setup
(full docker, no node/npm needed)

If you like to run everything including the node app using docker-compose.
Only take the step 2 from the above, and then in the root folder of the project run

```bash
docker-compose up
```

This way you don't need to worry about setting up node and npm. It will be setup along with elasticsearch and kibana. And it starts indexing messages. However running node is preferred as it shows more beautiful spinners :)

# Usage
After the setup is done and indexing is started, you can immediately use Kibana to search and analyze the data. Point your browser to localhost:5601 and you'll be good to go!

You will need to insert "flowdock" as a index pattern name in the kibana's setup page.


# Frequently asked questions
<details>
 <summary>open</summary>
1. How long indexing might take?

The first time for 71 flows, and 9 million messages took me about half an hour. And next runs were around one minute, as only new messages need to be downloaded.

2. How to get list of the flow names?

There's an npm script for it. Run npm run list-flows.
</details>

# Developer notes

<details>
 <summary>open</summary>
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

</details>

