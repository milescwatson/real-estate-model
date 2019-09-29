/*jshint node:true */
/*global require */
'use strict';

var mysqlQueryExecutor = require('./mysqlQueryExecutor'),
    dbconfig = require('./dbconfig.json'),
    crypto = require('crypto'),
    generateHashAndSalt = function(password, callback){
      var salt = crypto.randomBytes(64).toString('base64');
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', function(error, hash){
        if (error) {
          callback('error: could not generate hash', null);
        }
        callback(hash.toString('hex'), salt);
      });
    },
    verifyPassword = function(password, storedHash, storedSalt, callback){
      crypto.pbkdf2(password, storedSalt, 100000, 64, 'sha512', function(error, hash){
        if (error){
          callback(error, null)
        }
        callback(null, hash.toString('hex') === storedHash);
      });
    },
    isValidEmail = function(email){
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(re.test(String(email).toLowerCase())){
        return([true]);
      }else{
        return([false, 'Invalid email.']);
      }
    },
    isValidPassword = function(password){
      if(password.length < 3){
        return([false, 'error: password must be greater 3 characters.']);
      }else{
        return([true]);
      }
    },
    userExists = function(email, callback){
      // deal with situation where user signs in with different method, but same e-mail
      mysqlQueryExecutor.executeCallableStatement({
        "sql": 'SELECT COUNT(*) FROM User WHERE email=?',
        "values": [email]
      }, function(error, results){
        if(results[0]['COUNT(*)'] >= 1){
          callback('Cannot create a new account: email address already in use.', true);
        }else if(results[0]['COUNT(*)'] === 0){
          callback(null, false);
        }else{
          callback('userExists() error');
        }
      });
    };

exports.signIn = function(request, response){
  console.log('request.user: ', request.user);
  response.status(200).send('sign in');
}

exports.verifyUserCallback = function(username, password, done){
  mysqlQueryExecutor.executeCallableStatement({
    "sql" : "SELECT * FROM User WHERE email=?",
    "values": [username]
  }, function(error, results){
    if (results.length === 1){
      //username/ email addresses are unique.
      verifyPassword(password, results[0].passwordHASH, results[0].salt, function(error, isValidPassword){
        if (isValidPassword){
          var userObject = {
            id : results[0].id
          }
          console.log(results[0].firstname + ' ' + results[0].lastname + ' has logged in.');
          done(null, userObject);
        }else{
          done(null, false)
        }
      });
    }
  });
};

exports.findById = function(id, done){
  // Used in deserialize user
  // TODO: Add firstname, lastname, email to the user object
  var userObject = {
    id : id
  }
  done(null, userObject);
}

exports.deserializeUser = function(id, done){
  module.exports.findById(id, function(error, user){
    if(error){
      return done(error)
    }
    done(null, user)
  })
}

exports.serializeUser = function(user, done){
  done(null, user.id);
}

exports.createUser = function(request, response){
  userExists(request.body.email, function(error, userExists){
    if(!userExists){
      if (!isValidPassword(request.body.password)[0]) {
        response.status(403).send(isValidPassword(request.body.password)[1]);
      } else if(!isValidEmail(request.body.email)[0]) {
        response.status(403).send(isValidEmail(request.body.email)[1]);
      }else{
        //proceed, valid email and password
        generateHashAndSalt(request.body.password, function(hash, salt){
          var newUserArray = [request.body.firstname, request.body.lastname, request.body.email, salt, hash, 1];
          mysqlQueryExecutor.executeCallableStatement({"sql": "INSERT INTO User (firstname, lastname, email, salt, passwordHASH, createdByUserId) VALUES(?,?,?,?,?,?)", "values": newUserArray}, function(error, results){
            if(error){
              response.status(403).send('mysql error: ' + error);
            }else{
              response.status(200).send('create user success: ' + JSON.stringify(results));
            }
          });
        });
      }
    }else{
      response.status(200).send(error);
    }
  })
}

exports.loginStatus = function(request, response){
  if(request.user !== undefined){
    var userObject = request.user;
    response.status(200).send(userObject);
  }else{
    response.status(200).send('null');
  }
}

exports.logout = function(request, response){
  // console.log('logout triggered');
  // try {
  //   request.user = undefined;
  //   response.status(200).send('logout-success');
  // } catch (error) {
  //   response.status(200).send(error.toString());
  // }
  request.logout();
  response.redirect('/');

}
