# Chitter

A mock Twitter app where users are able to post cheets (messages up to 50 characters in length) to a public forum, as well as view and reply to other users' cheets. The app also allows direct messages to be sent between users.

## Setup

1. Clone this repo:

```sh
  git clone https://github.com/lewisbensted/chitter.git
```

2. Install dependencies from the project [root directory](/):
```sh
  npm install
```  
3. Create *.env* files for the respective environments in the [root directory](/):
```sh
  touch .env.development
  touch .env.test
  touch .env.production
``` 
4. Populate the *.env* files with the following environment variables:
```sh
  PORT =                # Port to access to frontend app
  SERVER_PORT =         # Port to access the server

  DB_NAME =             # Name of the database in a particular environment, for example chitter_dev
  DB_USERNAME =         # Username of MySQL connection
  DB_PASSWORD =         # Password of MySQL connection 
  DB_PORT =             # Port to access MySQL server - 3306 by default
  DB_HOST =             # "localhost" if being run on user's local machine

  DATABASE_URL = mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

``` 
5. Migrate databases:
```sh
  npm run migrate:dev
  npm run migrate:test
  npm run migrate:prod
  ```

  ## Tech Stack

  [![My Skills](https://skillicons.dev/icons?i=ts,express,react,prisma,mysql,vitest)](https://skillicons.dev)



