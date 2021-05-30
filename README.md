# Chitter Challenge

## Introduction
This programme replicates Twitter, allowing users to post and reply to one another's 'peeps'. Three databases are used to store the user information, their peeps and their replies to other peeps. Many-to-one relationships allow each user to post multiple peeps and replies, and each peep to contain many replies.

The peeps and replies can be viewed without signing into the app. However, in order to post and reply to peeps, one must create an account. This is done by clicking the 'Register' button on the homepage and entering a unique email and username, as well as a password and name.

## Running the App
To run this programme, clone this repository and run the command 'npm install' in the command line to install the dependencies. Create a '.env' file in the root directory and add to this 'NODE_ENV=production', representing the environment used to run the app. As well as this, add 'DATABASE_USERNAME' and 'DATABASE_PASSWORD', setting these quantities equal to the user's postgres username and password. Run the commands 'npx sequelize-cli db:create' and 'npx sequelize-cli db:migrate' to create and migrate to the production database, respectively. Finally, use 'node app.js' to run and interact with the app.
