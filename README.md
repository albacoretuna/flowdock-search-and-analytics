# Flowdock Analytics

A nodejs app to import Flowdock messages into elasticsearch, so that search and analytics becomes easier for Flowdock. Once messages are indexed Kibana can be used to search and visualize results in real time.

# Install

Everything needed for this app is included, and will be running with a single command! 

If docker-compose works in your command line, you're good to go.

#### 1. clone the repo
```bash
git clone git@github.com:omidfi/flowdock-analytics.git
```
#### 2. Set environment veriables
Copy env-sample to .env and add your flowdock api token, and other details.
Your api token can be found at [flowdock's user account page ](https://www.flowdock.com/account/tokens).

#### 3. Start it!
```bash
# in the root directoly!
docker-compose up
```

# Development
For development you need node, npm, and an elasticsearch instance, which is included via docker. 
#### 1. clone and add dependencies
```bash
git clone git@github.com:omidfi/flowdock-analytics.git
cd flowdock-analytics
npm install
```
#### 2. Set environment variables
Copy env-sample to .env and add your flowdock api token, and other details.
Your api token can be found at [flowdock's user account page ](https://www.flowdock.com/account/tokens).
Remember you need to set the elasticsearch host in the .env file.

#### 3. Get yourself elasticsearch and Kibana
You can use your exisiting elasticsearch and Kibana services, use a hosted version, or start one by the docker images proved:

```bash
# start elasticsearch
cd docker-elk
docker-compose up
```
If it doesn't work, check out [Docker ELK Project on Github](https://github.com/deviantony/docker-elk)

#### 4. Start indexing!

```bash
# start the app
npm start
```
This process might take some time, say half an hour, depending on the number of messages that need to be indexed.

There's a crontab file in the setup, which updates the index every half an hour. See ./crontab



# Usage
After the setup is done and indexing is started, you can immediately use Kibana to search and analyze the data. Point your browser to localhost:5601 and you'll be good to go!

You will need to insert "flowdock" as a index pattern name in the kibana's setup page.


# Frequently asked questions
<details>
<summary>open</summary>

1. How long indexing might take?

The first time for 71 flows, and 600,000 messages, it took about half an hour on my laptop. And next runs were around one minute, as only new messages need to be downloaded.

2. How to get list of the flow names?

There's an npm script for it. Run npm run list-flows. 

3. How to setup Kibana? What's an index pattern?

Index pattern is simply the index name you have used for indexing data into elastic search. The default here is "flowdock".

3. How to setup Kibana? What's the time stamp field?

Choose "sentEpoch" as your time stamp field.

4. I got tons of messages and errors in console, what's hapenning? 

Try openning Kibana, and see if the indexing is working, if it's working forget about the erros :D 

5. I get "elasticsearch not found, trying again in 60 seconds" what's that? 
Wait for 60 seconds, probably it will find it, if not, you need to check your settings in .env file
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

