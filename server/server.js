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
    mysql = require('./mysqlQueryExecutor'),
    model = require('./models/modelServerActions.js'),
    port = 3001;

app.use(bodyParser.json());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'merrakesh', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(authentication.serializeUser);
passport.deserializeUser(authentication.deserializeUser);
passport.use(new LocalStrategy(authentication.verifyUserCallback));

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login.html?status=error',
                                   failureFlash: true })
);

app.post('/create-user', authentication.createUser);


// Model
app.post('/create-model', model.createModel)
app.post('/edit-model', model.editModel)
app.post('/delete-model', model.deleteModel);
app.post('/get-identifier', model.getIdentifier);
app.post('/get-user-data', model.getUserData);
app.post('/get-user-data-single', model.getUserDataSingle);
app.post('/get-summary-data', model.getSummaryData);

//TODO: Handle update of entire model, if a single model edit request did not go through
app.post('/amortization-object', amortization.returnAmortizationObject);
app.use('/r-model',express.static(__dirname + '/frontend-build'));

app.get('/health', function(request, response, next) {
	  response.send('{"status": "healthy"}');
});

app.listen(port, function() {
  console.log(`Real Estate Model server running on port ${port}!`);
});
