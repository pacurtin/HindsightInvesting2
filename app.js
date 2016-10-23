//serves up our static files
var express = require('express');
var app = express();
var request = require('request');
var cors = require('cors');
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/app'));
//app.use(cors({origin: 'http://localhost:3000'}));
expressApp.use(cors({origin: 'http://hindsightinvesting.herokuapp.com/#!/investments'}));

app.get('/getIndividualStockData', function (req, res) {
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

var server = app.listen(port, function () {

    var host = server.address().address;
    var port = server.address().port;

    //serves up our static files
    console.log("Serving statics on port: "+port);
    //this server also acts as a middleman between the client side angular app and Yahoo finance.
    console.log("Stock data server listening at http://%s:%s", host, port);

});