#### 03/12/2015

### 3.35.2

#### Fixed Bugs

- Ability to specify source currency issuer

#### 02/13/2015

### 3.35.0

#### Added Features
- Added support for new bridge quote and bridge payment functionality
- Added pagination to external_transactions resource endpoint

#### Fixed Bugs

- `pm2 start` command not showing lists of process
- Exception when passing query parameters in the resource endpoints
- Made incoming process backwards compatible to the new ripple rest response structure
- Removed unneeded associations and foreign key constraints
- Model associations were adding random columns that don't exist to queries
- Change config to correct `createdAt` column no being able to be changed to a future date
- Withdrawals to lookup using the correct field

### 01/06/2014

### 3.34.1

### Fixed Bugs:
- gatewayd set_trust CLI call
- Travis build issues
- update outgoing, incoming payments with actual amounts
- bump gatewayd admin minor version
- mark withdrawal error as failed in ripple_transactions table
- fix ProcessSet #add and #remove
- Fix pm2 process starting using node.js pm2 library

### 12/30/2014

### 3.34.0

### Added Features:
- Make to_issuer, from_issuer optional on ripple payment
  Previously defaulted to COLD_WALLET

### Fixed Bugs:
- Bump bridge-quote-service-client version
- Remove logs/ directory from git
- Automatically create logs/ directory and log file

### 12/25/2014

### 3.33.0

### AddedFeatures:
- Enable XRP Payments by removing requirement for issuer
- Ripple REST error handler class
- Ripple Account Monitor replaces old ripple listener
- Aggregate liabilities by currency
- Enable optional features behind feature flag
- [FEATURE FLAG] Run all gatewayd processes in single Node.js/system process
- [FEATURE FLAG] Support Raygun for error reporting optionally
- auto-generate invoice id if empty
- Add HTTP Response handler from ripple rest
- Paginate Ripple Transactions results
- Include toAccount and fromAccount assocations in External Transactions

### 12/3/2014

### 3.32.0

### Fixed Bugs:
- Store memos and invoice_id when enqueuing outgoing payments
- Issue with travis build and added coveralls and istanbul for coverage
- Typo in externalAccount assocation
- Circular dependency caused by requiring gatewayd
- Deposits endpoint now validating that external_account_id points to valid externalAccount


### Added Features
- Associate ExternalAccounts to ExternalTransactions
- Add properties `to_account_id` and `from_account_id`

### 11/12/2014

### 3.31.0

### Fixed Bugs:
- Config file overwriting file issues
- Replaced database.example.json with database.json

### Added Features
- Support for memos and invoice_id fields
- Mark unconfirmed payments pending
- Associate ripple addresses and ripple transactions in database
- Add direction to ripple transactions (to-ripple, from-ripple)
- Add invoice_id to external transactions
- Validate Ripple Address using validator
- Commandline interface for seeding ripple records
- Enabled sqlite in memory and sqlite persistent connectors

##11/05/2014

###3.30.1

### Fixed Bugs:
- Handle all Ripple-REST responses in outgoing payments
- Remove faulty logic to start local ripple-rest instance

### Added Features:
- Use https://api.ripple.com/ by default for Ripple-REST's base url
- Ability to install gatewayd globally

##11/03/2014

###3.30.0

### Fixed Bugs:

- Restart gateway command line call
- mark successful payments only after payment is confirmed

### Added Features:

- Policy engine to manage and determine policies to apply to payments (alpha)
- Config initializers for adding custom behavior at bootup
- Config initializers for adding custom behavior at bootup
- Initializer that attaches the Host Meta plugin to gatewayd's express app
- Database table for "configs" items, move to store configuration in SQL
- Automatically get and set last payment hash in database

##10/08/2014

###3.29.0

### Fixed Bugs:
- Move config/config.js to config/environment.js to prevent confusion.
- Fix broken link to configuration in docs.
- Default WEBAPP to true

### Added Features:

- Automatically set LAST_PAYMENT_HASH if not provided
- Update admin webapp to use new styles, behavior, rename to gatewayd-admin
- Include setup wizard with comments in Gatewaydfile
- New database configuration scheme from environment / config variables
- Add enqueue_outgoing_payment CLI command
- Add Bridge REST resource
- Add bluebird Promise library dependency
- Include destination tag on outgoing payments if provided
- Add address, type to external_accounts
- Add global export (gatewayd.database) of the sequelize.js db object

##09/22/2014

###3.28.0

### Fixed Bugs:
- fund_hot_wallet without issuer no longer crashes Ripple REST
- Mac installation instructions
- Remove duplicate ExternalAccounts controller actions
- Remove duplicate RippleAddresses controller actions
- Remove duplicate Users controller actions
- Remove unused files in lib/core and test/core

### Added Features:
- Extract capistrano into https://github.com/gatewayd/gatewayd-capistrano
- Extract docker into https://github.com/gatewayd/gatewayd-docker
- Add Procfile for process management on Heroku and / or with Foreman
- Support currency amount in CLI
- Bridges database table migration and ORM Model
- Add controller actions for gateway_transactions database table
- Refactor CRUD routes for all resources to be DRY


##09/16/2014

###3.27.0

### Fixed Bugs:

- pm2 installation documentation error

### Added Features:

- HTTP REST CRUD routes for all database tables
- Use express.Router instead of custom ResourcesRouter
- Enable Cross Origin Resource Sharing by default

##09/14/2014

###3.26.1

### Fixed Bugs:

- Use absolute paths with __dirname when adding processes
  to the ProcessSet instance, which fixes bin/gateway start
  when running in a current working directory somewhere
  other than the gatewayd directory itself.

##09/09/2014

###3.26.0

### Added Features:

- Process Manager can add/remote arbitrary processes
- Installation Guide for Mac

### Fixed Bugs:

- Process manager variable not found exception fixed
- Install doc now dictates using config.json not config.js
  for custom database url

##09/02/2014

###3.25.1

### Fixed Bugs
- Add empty log files for production, staging, and development
- Enable HTTP_SERVER option to toggle server process

### Added Features:
- Use api key as either user or password in basic auth.

##08/19/2014

###3.25.0

### Added Features:

- GatewayTransactions database table to tie a RippleTransaction
  to an ExternalTransaction and a Policy
- Extract setup wizard to a separate NPM module

##08/11/2014

###3.24.1

### Fixed Bugs
- Handle error cases when confirming outgoing payment
- Handle uncaught exceptions in process/outgoing.js by logging
- Only callback on queued withdrawals, not queued deposits

###Added Features:
- Update to Express 4, use body-parser library

##08/07/2014

###
3.24.0

###Added Features:
- Gatewaydfile.js for plugins
- Enable Loggly winston transport
- Add Policy database table and model
- No longer require user id for external account

###Fixed Bugs:
- api.stopGateway now stops processes

##07/28/2014

###
3.23.1

###Fixed Bugs:
- Do not log when there are no new notifications
- In WithdrawalProcessor update incomingPayment ripple transaction
  record state to 'succeeded'
- In Listener change log level from 'error' to 'info' and the event
  from 'processed' to 'received'

##07/27/2014

###
3.23.0

###Fixed Bugs:
- Check for source tag before appending
- Remove abbreviations
- Use options object instead of multiple arguments

###Added Features:
- api.enqueueOutgoingPayment and POST /payments/outgoing


##07/16/2014

###
3.22.1

###Fixed bugs:
- Handle ripple rest to rippled connection issues by retrying

###Added Features:
- Capistrano for deployment and setup
- Replace ripple-lib functionality with ripple rest client
- Winston logging
- Add http api integration tests
- Add code climate for code gpa score card
- JS Hint for code linting

##06/30/2014

###
3.22.0

###Fixed bugs:
- Outgoing payments now have logging
- Retry Failed Payment is now tested and properly implemented
- Bad outgoing payments now fail and are not retried
- Properly document fund_hot_wallet cli call parameters

###Added features:
- Robust logger with Winston
- Use ripple-rest-client for many ripple-rest related calls
- Capistrano configuration for deployment
- Use sql-mq-worker module for processing queues
- Add CLI for generate_wallet

##06/24/2014

##Version:
3.21.1

###Fixed bugs:
- On incoming payments record to_address_id not from_address_id
- Fix generate_wallet cli command
- Update fund_hot_wallet CLI command notes

##06/17/2014

##Version:
3.21.0

###Fixed bugs:
- Use 'state' column in list failed payments api call
- Default webapp paths under USER_AUTH

###Added features:
- HTTP / JSON Api Documenation
- List Trust Lines endpoint from account to cold wallet

##06/10/2014

###Version:
3.20.0

###Fixed bugs:
- Validate ripple address in registerUser api call
- correct migration task with gruntfile
- correct installation / setup instructions
- remove redundant list_users http endpoint

###Added features:
- CRUD http routes for external accounts
- HTTP route to create a user
- Add validator with isRippleAddress validation method
- Validate setup wizard parameters with tests

##06/03/2014

###Version: 
3.19.0

###Fixed bugs:
- Fix method name for startGateway http api endpoint
- Handle error for setKey http api endpoint
- Handle error for setRippleRestUrl http api endpoint
- Fix CLI function for setLastPaymentHash

###Added features:
- Add basic jsdoc to core api funtions
- Add setRippleRestUrl core api function
- Test http interface status codes
- Configure Travis.CI for continuous integration testing
- Merge gateway-data-sequelize into project

