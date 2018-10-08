const rp = require('request-promise-native');
const cheerio = require('cheerio');
const Boom = require('boom');
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
		let options = {
			uri: 'http://www.eldolar.info/en/mexico/dia/hoy',
			transform: (body) => {
				return cheerio.load(body);
			}
		};

		let response = await rp(options)
			.then(($) => {
				let rates = [];
				let result = null;

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
							url: options.uri
						}
					});
				});

				return formatResponse(rates, entity);
			})
			.catch((err) => {
				return Boom.failedDependency(err.toString());
			});

		return response;
	},

	async eur_mxn(entity) {
		// Free plan provides hourly updates
		let options = {
			uri: 'https://openexchangerates.org/api/latest.json',
			headers: {
				'Authorization': `Token ${process.env.OPEN_EXCHANGE_RATE_KEY}`
			},
			json: true
		};

		if (entity && entity != 'open-exchange-rates') {
			return Boom.failedDependency(`Entity ${entity} was not found`);
		}

		let response = await rp(options).then(data => {
			let rates = [];
			let result = null;
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

			return formatResponse(rates, entity);
		}).catch((err) => {
			return Boom.failedDependency(err.toString());
		});

		return response;
	}
}

exports.convert = async function(request, h) {
	const [from, to] = request.path.substring(1).split('/');
	const entity = request.params.entity ? request.params.entity : '';
	const key = `${from}_${to}`;

	return await Rates[key](entity);
}
