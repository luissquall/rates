const rp = require('request-promise-native');
const cheerio = require('cheerio');
const Boom = require('boom');

exports.convert = async function (request, h) {
    let options = {
        uri: 'http://www.eldolar.info/en/mexico/dia/hoy',
        transform: (body) => {
            return cheerio.load(body);
        }
    };

    let response = await rp(options)
        .then(($) => {
            let result = null;
            let response = {data: []};

            $('#dllsTable tbody > tr').each((i, el) => {
                let $row = $(el);
                let entity = $row.find('td').first().find('.small-hide').text();
                let buy = $($row.find('td.xTimes')[0]).text();
                let sell = $($row.find('td.xTimes')[1]).text();;

                if (!sell) {
                    sell = buy;
                }

				response.data.push({
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

            return response;
        })
        .catch((err) => {
			return Boom.failedDependency(err.toString());
        });

    return response;
}
