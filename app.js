var express = require('express');
var app = express();
console.log("Serving on process.env.PORT or defaulting to 3000");
app.use(express.static(__dirname + '/app'));
app.listen(process.env.PORT || 3000);