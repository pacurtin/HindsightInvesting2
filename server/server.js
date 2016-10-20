var express = require('express');
var request = require('request');
var cors = require('cors');
var app = express();

app.use(cors({origin: 'http://localhost:5000'}));

app.get('/getIndividualStockData', function (req, res) {
  request('http://ichart.finance.yahoo.com/table.csv?s='+req.query.stockTicker+'&g=w', function (error, response, body) {
    console.log(req.query.stockTicker)
    if (!error && response.statusCode == 200) {
      console.log('Stock data retrieval success');
      res.end( body );
    }
    if (!error && response.statusCode == 404) {
      console.log('Stock not found');
      res.end('Stock not found');
    }
  })
})

var server = app.listen(8000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Stock data server listening at http://%s:%s", host, port)

})
