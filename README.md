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

At the moment there's only one endpoint: `/usd/mxn`.

## Deploy to Now

See Now's [Get started](https://zeit.co/now#get-started).

```bash
now --dotenv
now ls
```

## What's next

1. Change default Hapi error messages format
2. Add more exchange rate sources
3. Add more currencies
4. Add option to change default entity using a query parameter (`entity=Bancomer`)