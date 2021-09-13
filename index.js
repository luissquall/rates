'use strict';

// Import modules
require('dotenv').config();

const Hapi = require('@hapi/hapi');

// Controllers
const Rates = require('./controllers/rates.js');

// Init server
const init = async () => {
	const server = Hapi.server({
		port: process.env.PORT
	});

	// Add routes
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

	await server.start();

	console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
	console.log(err);
	process.exit(1);
});

init();
