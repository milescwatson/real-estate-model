/*jshint node:true */
/*global require */
'use strict';

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    passport = require('passport'),
    session = require('session'),
    LocalStrategy = require('passport-local').Strategy,
    authentication = require('./authenticate'),
    amortization = require('./computation/amortization'),
    port = 80;

app.use(bodyParser.json());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'merrakesh', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// app.use(compression());


passport.serializeUser(authentication.serializeUser);
passport.deserializeUser(authentication.deserializeUser);
passport.use(new LocalStrategy(authentication.verifyUserCallback));

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login.html?status=error',
                                   failureFlash: true })
);

app.get('/logout', authentication.logout);

app.get('/login-status', authentication.loginStatus);

app.post('/create-user', authentication.createUser);

app.get('/health', function(request, response, next) {
	  response.send('{"status": "healthy"}');
});

app.post('/amortization-object', amortization.returnAmortizationObject);

app.use(express.static(__dirname + '/frontend-build'));

app.listen(port, function() {
  console.log(`listening on port ${port}!`);
});
