# Exchange rates service

## Installation

```bash
npm install
# Configure the service
cp .env.default .env

# Run the service. Runs by default at localhost:9000
node index.js

curl http://localhost:9000/usd/mxn
```

## Endpoints

1. `/usd/mxn/{entity?}`
2. `/eur/mxn/{entity?}`

## Deploy to Now

See Now's [Get started](https://zeit.co/now#get-started).

```bash
# Use dotenv environment config file ./env
now --dotenv
now ls
```

## What's next

1. Change default Hapi error messages format
2. Add more exchange rate sources
