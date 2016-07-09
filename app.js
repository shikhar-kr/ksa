var express = require('express');
//var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var config = require('./config');

//var db = mongoose.connect('mongodb://localhost/productAPI') ;

//var Product = require('./models/productModel');

var app = express();

var port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var sRouter = {} ;

for(var s in config.sites){
    sRouter[s] = require('./Routes/'+s+'Routes')(config.sites[s]) ;
    app.use('/'+s, sRouter[s]);
}

////productRouter = require('./Routes/productRoutes')(Product) ;
////app.use('/api', productRouter);
configRouter = require('./Routes/configRoutes')() ;
app.use('/config', configRouter);

app.get('/', function(req,res){
    res.send('Welcome to ixiapi');
});

app.listen(port, function(){
    console.log('Running app on port ' + port) ;
});