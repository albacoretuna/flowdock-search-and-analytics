FROM node:8.15.1

# Create app directory
WORKDIR /usr/src/app

# Add crontab file in the cron directory
ADD crontab /etc/cron.d/flowdock-indexer

RUN apt-get update -y
RUN apt-get install cron -y

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/flowdock-indexer

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Run the command on container startup

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8000

# Run the command on container startup
CMD npm start && cron && tail -f /var/log/cron.log
