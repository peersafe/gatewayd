var gateway = require(__dirname + '/../');
var express = require('express');
var bodyParser = require('body-parser');
var publicCtrl = require(__dirname + '/http/controllers/public');
var apiRouter = require(__dirname+'/http/routers/api_router.js');
var resourcesRouter = require(__dirname+'/http/routers/resources_router.js');
const cors = require('cors')();

process.env.DATABASE_URL = gateway.config.get('DATABASE_URL');

var app = express();
app.use(cors);
app.use('/', express.static(gateway.config.get('WEBAPP_PATH')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/v1', resourcesRouter);
app.use('/v1', apiRouter);

app.get('/ripple.txt', publicCtrl.rippleTxt);

module.exports = app;

