'use strict';

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const restService = express();

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/echo', function(req, res) {
    //console.log(req.body);
    if (req.body.result.action === 'echo') {
        var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText ? req.body.result.parameters.echoText : "Seems like some problem. Speak again."
        return res.json({
            speech: speech,
            displayText: speech,
            source: 'webhook-echo-sample',
            data: {
                google: {
                    expect_user_response: true,
                    is_ssml: true,
                    permissions_request: {
                        opt_context: 'echo',
                        permissions: [
                            'NAME',
                            'DEVICE_COARSE_LOCATION',
                            'DEVICE_PRECISE_LOCATION'
                        ]
                    }
                }
            }
        });
    } else if (req.body.result.action === 'weather') {
        var speech = 'Seems like some problem. Speak again.';
        var displayText = '';
        if (req.body.result && req.body.result.parameters && req.body.result.parameters.city) {
            var url = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text=%27' + escape(req.body.result.parameters.city) + '%27)&format=json';
            //console.log("url: ", url);
            http.get(url, function(resp) {
                var body = '';

                resp.on('data', function(chunk) {
                    body += chunk;
                });

                resp.on('end', function() {
                    var fbResponse = JSON.parse(body);
                    speech = 'Today in ' + fbResponse.query.results.channel.location.city + ': ' + fbResponse.query.results.channel.item.condition.text + ', the temperature is ' + fbResponse.query.results.channel.item.condition.temp + '° fahrenheit that is '+((5/9) * (fbResponse.query.results.channel.item.condition.temp-32)).toFixed(2)+'° celsius, the humidity is ' + fbResponse.query.results.channel.atmosphere.humidity + '%, the wind speed is ' + fbResponse.query.results.channel.wind.speed + ' ' + fbResponse.query.results.channel.units.speed + ' I mean '+(fbResponse.query.results.channel.wind.speed/0.62137).toFixed(2)+' kilometer per hour. Would you like to know more?';
                    displayText = 'Today in ' + fbResponse.query.results.channel.location.city + ': ' + fbResponse.query.results.channel.item.condition.text + ', the temperature is ' + fbResponse.query.results.channel.item.condition.temp + '°' + fbResponse.query.results.channel.units.temperature + ' ('+((5/9) * (fbResponse.query.results.channel.item.condition.temp-32)).toFixed(2)+'°C), the humidity is ' + fbResponse.query.results.channel.atmosphere.humidity + '%, the wind speed is ' + fbResponse.query.results.channel.wind.speed + ' ' + fbResponse.query.results.channel.units.speed + ' ('+(fbResponse.query.results.channel.wind.speed/0.62137).toFixed(2)+' kmph). Would you like to know more?';
                    //console.log("Got a response: ", body);
                    console.log("speech: ", speech);
                    return res.json({
                        speech: speech,
                        displayText: displayText,
                        source: 'webhook-echo-sample'
                    });
                });
            }).on('error', function(e) {
                console.log("Got an error: ", e);
                return res.json({
                    speech: speech,
                    displayText: speech,
                    source: 'webhook-echo-sample'
                });
            });
        }
    }
});
restService.listen((8080), function() {
    console.log("Server up and listening");;
});
