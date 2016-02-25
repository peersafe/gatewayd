var gateway = require(__dirname + '/../');
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var publicCtrl = require(__dirname + '/http/controllers/public');
var apiRouter = require(__dirname+'/http/routers/api_router.js');
var userRouter = require(__dirname+'/http/routers/user_router.js');
var adminRouter = require(__dirname+'/http/routers/admin_router.js');
var resourcesRouter = require(__dirname+'/http/routers/resources_router.js');
var passportAuth = require(__dirname + '/http/passport_auth');
const cors = require('cors')();

process.env.DATABASE_URL = gateway.config.get('DATABASE_URL');

passport.use(passportAuth.adminBasic);
passport.use(passportAuth.userBasic);

var app = express();
app.use(cors);
app.use('/', express.static(gateway.config.get('WEBAPP_PATH')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

if (gateway.config.get('BASIC_AUTH')) {
  app.use('/v1', passport.authenticate('adminBasic', { session: false }), adminRouter);
  app.use('/v1', passport.authenticate('adminBasic', { session: false }), resourcesRouter);
  app.use('/v1', passport.authenticate('adminBasic', { session: false }), apiRouter);
} else {
  app.use('/v1', resourcesRouter);
  app.use('/v1', apiRouter);
}

if (gateway.config.get('USER_AUTH')) {
  app.post('/v1/register', publicCtrl.registerUser);
  app.use('/v1', passport.authenticate('userBasic', { session: false }), userRouter);
}

app.get('/ripple.txt', publicCtrl.rippleTxt);
app.get('/activate/:addr', publicCtrl.activateRippleAddress);

module.exports = app;

