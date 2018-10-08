'use strict';

// Import modules
require('dotenv').config();

const Hapi =  require('hapi');

// Controllers
const Rates = require('./controllers/rates.js');

// Create a server with a host and port
const server = Hapi.server({
    port: process.env.PORT
});

// Add the routes
server.route({
	method: 'GET',
	path: '/usd/mxn/{entity?}',
	handler: Rates.convert
});
server.route({
	method: 'GET',
	path: '/eur/mxn/{entity?}',
	handler: Rates.convert
});

// Start the server
async function start() {
    try {
        await server.start();
    } catch (err) {
        console.log(err);

        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();
