//serves up our static files
var express = require('express');
var app = express();
console.log("Serving on process.env.PORT or defaulting to 3000");
app.use(express.static(__dirname + '/app'));
app.listen(process.env.PORT || 3000);


//this server acts as a middleman between the client side angular app and Yahoo finance.
var request = require('request');
var cors = require('cors');
var expressApp = express();

//expressApp.use(cors({origin: 'http://localhost:3000'}));
expressApp.use(cors({origin: 'http://hindsightinvesting.herokuapp.com/#!/investments'}));

expressApp.get('/getIndividualStockData', function (req, res) {
    request('https://ichart.finance.yahoo.com/table.csv?s='+req.query.stockTicker+'&g=w', function (error, response, body) {
        console.log(req.query.stockTicker);
        if (!error && response.statusCode == 200) {
            console.log('Stock data retrieval success');
            res.end( body );
        }
        if (!error && response.statusCode == 404) {
            console.log('Stock not found');
            res.end('Stock not found');
        }
    })
});

var server = expressApp.listen(8000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("express app server:   " + server.address().address);

    console.log("Stock data server listening at http://%s:%s", host, port);

});