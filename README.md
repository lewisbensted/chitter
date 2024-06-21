# Chitter

A mock Twitter app where users are able to post "cheets" (messages up to 50 characters in length) to a public forum, as well as view and reply to other users' cheets. The app also allows direct messages to be sent between users.

## Requirements

## Setup

1. Clone this repo:

```sh
  git clone https://github.com/lewisbensted/chitter.git
```

2. Install dependencies from the project [root directory](/):

```sh
  npm install
```

3. Create _.env_ files for the respective environments in the [root directory](/):

```sh
  touch .env.development
  touch .env.test
  touch .env.production
```

4. Populate the _.env_ files with the following environment variables, assigning values where necessary:

```sh
  PORT =                # Point of access to the frontend app for non-prod environments only. Defaults to 3000.
  SERVER_PORT =         # Point of access to the server.

  REACT_APP_SERVER_URL = http://localhost:${SERVER_PORT}

  DB_NAME =             # Name of the database in a particular environment, eg. chitter_dev.
  DB_USERNAME =         # Username of MySQL connection.
  DB_PASSWORD =         # Password of MySQL connection.
  DB_PORT =             # Point of access to the MySQL server - 3306 by default.
  DB_HOST =             # "localhost" if running on user's local machine.

  DATABASE_URL = mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

```

5. Migrate databases:

```sh
  npm run migrate:dev
  npm run migrate:test
  npm run migrate:prod
```

## Execution

Run from the [root directory](/):

```sh
npm run start:dev
npm run start:test
npm run start:prod
```

Non-production environments require the client and server to be run on separate ports. In the production environment, however, the frontend app is first built and then served by the backend. This allows the app to run on a single port.

## Testing

## Tech Stack

[![My Skills](https://skillicons.dev/icons?i=ts,express,react,prisma,mysql,vitest)](https://skillicons.dev)
