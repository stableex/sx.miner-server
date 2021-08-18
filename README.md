# SX - Server

> SX Server faciliates pushing high speed transactions to the SX Network.

## Requirements

- [NodeJS](https://nodejs.org/en/download/) (LTS or Current)
- [PM2](https://pm2.keymetrics.io/)
- [Git](https://git-scm.com/downloads)

## Install

```bash
$ git clone https://github.com/stableex/sx.server.git
$ cd sx.server
$ npm install
```

## `.env` settings

Copy-paste the following environment settings as `.env` file in the root folder (ex: `sx.server/.env`) and replace `<ACCOUNT>` & `<PRIVATE KEY>` with your own credentials.

```bash
# REQUIRED
PRIVATE_KEYS="<PRIVATE KEY ACTOR>,<PRIVATE KEY CPU>"
ACTOR="<ACCOUNT>@<PERMISSION>"

# OPTIONAL
CPU_ACTOR="<ACCOUNT>@<PERMISSION>"
CONCURRENCY=5
TIMEOUT_MS=10
VERBOSE=false
HEADERS='{"Referer": "https://github.com/stableex/sx.server"}'

# Up to 32 API endpoints separated by comma
NODEOS_ENDPOINTS="https://eos.greymass.com,https://api.eosflare.io,https://api.main.alohaeos.com,https://api.eossweden.org"
```

## Quickstart

```
$ npm start
```

## Advanced - PM2 server

PM2 is a daemon process manager that will help you manage and keep your application online 24/7

```bash
# install typescript
$ pm2 install typescript

# start server
$ pm2 start

# monitor status
$ pm2 log

# stop server
$ pm2 stop all
```
