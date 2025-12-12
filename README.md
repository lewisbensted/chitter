# Chitter

## Description

A full-stack Twitter-style web application where users can post **cheets** (short messages up to 50 characters) to a public timeline, follow other users, reply to cheets and send private direct messages. Built with React, Express and MySQL.

## Features

- &#x1F510; **Authentication:** Sign up, log in and maintain secure sessions
- &#x1F465; **User interactions:** Search for other users and follow/unfollow them
- &#x1F4F0; **Timeline:** View a feed of relevant cheets
- &#x1F426; **Cheets:** Post new cheets and reply to others
- &#x1F4AC; **Messages:** Send and receive private messages, view conversations


## Requirements

- [Node.js](https://nodejs.org/en)
- [MySQL](https://www.mysql.com/) (Server)

## Setup

1. Clone this repo:

```sh
  git clone https://github.com/lewisbensted/chitter-challenge.git
  cd chitter-challenge
```

&#x1F4DD; Run all commands from the project [root directory](/).

2. Install dependencies:

```sh
  npm run install-all
```

3. Create a _.env_ file suffixed with the environment you wish to run:

```sh
  touch .env.<development|test|production>
```

4. Populate the _.env_ file with the following environment variables, assigning required values:

```sh
  FRONTEND_PORT =       # Defaults to 5173
  SERVER_PORT =

  VITE_SERVER_URL = http://localhost:${SERVER_PORT}

  DB_NAME =
  DB_USER =
  DB_PASSWORD =
  DB_PORT =             # Defaults to 3306

  DATABASE_URL = mysql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}

```

5. Migrate the relevant database and generate the prisma client :

```sh
  npm run migrate:<dev|test|prod>
```

&#9888;&#xFE0F; To destructively reset the database:

```sh
  npm run reset:<dev|test>
```

&#x1F4DD; New migration files are only generated in `development` or `test` environments. Only existing migration files can be deployed to `production`.

## Getting Started

To start the server and frontend in `development`, run:

```sh
npm run start:dev
```

To run the app in `production`, first compile the code so that the frontend static files can be served:

```sh
npm run build:prod
npm run start:prod
```

## Testing
Backend features are covered by unit and integration tests. Run them with:
```sh
npm run test:server
```

## To-do
&#x2B1C; Handle prisma client Error  

&#x2B1C; Add API documentation

&#x2B1C; Add Frontend testing

&#x2B1C; Add E2E Testing

## Tech Stack

[![My Skills](https://skillicons.dev/icons?i=nodejs,ts,express,react,prisma,mysql,vitest,materialui,vscode,github)](https://skillicons.dev)
