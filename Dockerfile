FROM node:alpine

# Copy source code
COPY . /app

# Change working directory
WORKDIR /app

# Install dependencies
RUN yarn install --production
RUN yarn build

# Expose API port to the outside
EXPOSE 4000

CMD [ "yarn", "start" ]
