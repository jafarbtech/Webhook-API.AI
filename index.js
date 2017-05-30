'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const restService = express();

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/echo', function(req, res) {
    if(req.body.action.type === 'echo') {
    var speech = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText ? req.body.result.parameters.echoText : "Seems like some problem. Speak again."
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'webhook-echo-sample'
    });
    }else if(req.body.action.type === 'weather') {
        var speech='Seems like some problem. Speak again.';
         if(req.body.result && req.body.result.parameters && req.body.result.parameters.city){
        var url = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text=%27'+escape(req.body.result.parameters.city)+'%27)&format=json';

http.get(url, function(res){
    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        var fbResponse = JSON.parse(body);
        console.log("Got a response: ", fbResponse);
        speech='Today in ' + fbResponse.query.results.channel.location.city + ': ' + fbResponse.query.results.channel.item.condition.text + ', the temperature is ' + fbResponse.query.results.channel.item.condition.temp + ' ' + fbResponse.query.results.channel.units.temperature;
    });
}).on('error', function(e){
      console.log("Got an error: ", e);
});
         }
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'webhook-echo-sample'
    });
    }
});

restService.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});
