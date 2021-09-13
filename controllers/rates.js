const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Boom = require('@hapi/boom');
const kebabCase = require('lodash.kebabcase');

function formatResponse(rates, entity) {
	let response = {};
	let result = null;

	if (entity) {
		for (let rate of rates) {
			if (rate.key == entity) {
				result = rate;
				break;
			}
		}

		if (result) {
			response = { data: result };
		} else {
			response = Boom.failedDependency(`Entity ${entity} was not found`);
		}
	} else {
		response = { data: rates };
	}

	return response;
}

const Rates = {
	async usd_mxn(entity) {
		const url = 'https://www.eldolar.info/en/mexico/dia/hoy';
		let response = {};

		try {
			const _resp = await fetch(url);

			if (_resp.ok) {
				const body = await _resp.text();
				const $ = cheerio.load(body);
				let rates = [];

				// Find & extract exchange rates
				$('#dllsTable tbody > tr').each((i, el) => {
					let $row = $(el);
					let entity = $row.find('td').first().find('.small-hide').text();
					let buy = $($row.find('td.xTimes')[0]).text();
					let sell = $($row.find('td.xTimes')[1]).text();;

					if (!sell) {
						sell = buy;
					}

					rates.push({
						key: kebabCase(entity),
						from: 'USD',
						to: 'MXN',
						rate: sell,
						buy: buy,
						sell: sell,
						entity: entity,
						source: {
							name: 'ElDolar.Info',
							url: url
						}
					});
				});

				response = formatResponse(rates, entity);
			}
		} catch (error) {
			// Errors originating from node core libraries, like network errors, and
			// operational errors which are instances of FetchError
			return Boom.failedDependency(error.toString());
		}

		return response;
	},

	async eur_mxn(entity) {
		// Free plan provides hourly updates
		const url = 'https://openexchangerates.org/api/latest.json';
		const options = {
			headers: {
				'Authorization': `Token ${process.env.OPEN_EXCHANGE_RATE_KEY}`
			}
		};
		let response = {};

		if (entity && entity != 'open-exchange-rates') {
			return Boom.failedDependency(`Entity ${entity} was not found`);
		}

		try {
			const _resp = await fetch(url, options);
			const data = await _resp.json();

			if (_resp.ok) {
				let rates = [];
				let sell = data.rates.MXN / data.rates.EUR;
				let buy = sell;

				rates.push({
					key: 'open-exchange-rates',
					from: 'EUR',
					to: 'MXN',
					timestamp: data.timestamp,
					rate: sell,
					buy: buy,
					sell: sell,
					entity: 'Open Exchange Rates',
					source: {
						name: 'Open Exchange Rates',
						url: 'https://openexchangerates.org/'
					}
				});

				response = formatResponse(rates, entity);
			}
		} catch (error) {
			return Boom.failedDependency(error.toString());
		}

		return response;
	}
}

exports.convert = async function(request, h) {
	const [from, to] = request.path.substring(1).split('/');
	const entity = request.params.entity ? request.params.entity : '';
	const key = `${from}_${to}`;

	return await Rates[key](entity);
}
