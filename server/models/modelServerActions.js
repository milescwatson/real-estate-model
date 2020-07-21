/*jshint node:true */
/*global require */
'use strict';
var mysql = require('../mysqlQueryExecutor'),
    CryptoJS = require('crypto-js'),
    _ = require('lodash');

var decrypt = function(cipher){
  var bytes = CryptoJS.AES.decrypt(cipher, "hvar");
  var result = bytes.toString(CryptoJS.enc.Utf8);
  return(result)
}

var createModel = function(request, response, next){
  var modelString = JSON.stringify(request.body.modelJSON);
  var userID = decrypt(request.body.userIDHash);

  const QcreateModel = {
    sql: 'INSERT INTO Models(`model`, `ownerID`) VALUES(?,?)',
    values: [modelString, userID]
  }
  mysql.query(QcreateModel, function(error, result){
    const insertID = result.insertId;
    response.send(JSON.stringify({iterator: insertID}));
    console.log('created model ', insertID);
  });

}

var editModel = function(request, response, next){
  const requestBody = {
    userID: parseInt(decrypt(request.body.userIDHash)),
    modelID: parseInt(request.body.modelID),
    modelJSON: request.body.modelJSON
  }
  // check if identical to current model
  const queryCurrentModel = {
    sql: 'SELECT model FROM `Models` WHERE `id`=? AND `ownerID`=? ',
    values: [requestBody.modelID, requestBody.userID]
  }

  mysql.query(queryCurrentModel, function(error, result){
    if(error){
      console.log('error could not get model data');
    }
    const jsonStringModel = result[0].model;
    const modelObj = JSON.parse(jsonStringModel);
    const isSyncAgreement = _.isEqual(modelObj.computedArrays, requestBody.modelJSON.computedArrays);

    if(!isSyncAgreement){
      console.log('sync disagree');
      const updateModelQuery = {
        sql: 'UPDATE `Models` SET `model`=? WHERE id=?',
        values: [JSON.stringify(modelObj), requestBody.modelID]
      }
      mysql.query(updateModelQuery, function(error, result){
        if(error){
          console.log('error with update query', error);
        }else{
          console.log('result of updateQuery = ', result);
        }
      });

    }else{
      console.log('sync disagree');
    }

  })
}

var deleteModel = function(request, response, next){
  console.log('/delete-model');
  const modelID = parseInt(request.body.id);
  const ownerID = decrypt(request.body.userIDHash)

  const deleteModelQuery = {
    sql: 'DELETE FROM Models WHERE id=?',
    values: [modelID]
  }
  mysql.query(deleteModelQuery, function(error, result){
    if(error){
      console.log('deleteModel error');
      response.send('0');
    }else{
      console.log('deleted model with ID ', modelID);
      response.send('1');
    }
  })
}

var getIdentifier = function(request, response, next){
  console.log('/get-identifier');
  // find serial number of user
  var clientID = request.body.idHash;

  // create a new user
  console.log('client id is null, creating user');
  var userIP = request.connection.remoteAddress;
  const query = {sql: 'SELECT MAX(id) from User;'}
  mysql.query(query, function(error, result){
    const iteratedKey = result[0]['MAX(id)']++;
    console.log('cu result = ', result);
    console.log('iterated key = ', iteratedKey);

    const cipher = CryptoJS.AES.encrypt(iteratedKey.toString(), "hvar").toString();

    const queryInsertNewUser = {
      sql: 'INSERT INTO User(`ip`) VALUES(?)',
      values: [userIP]
    }

    mysql.query(queryInsertNewUser, function(error, result){
      if(error){
        response.send('error, could not insert new user');
      }
      response.send({
        userIDHash: cipher
      });
    })
  })
}

var getUserData = function(request, response, next){
  var userID = decrypt(request.body.userIDHash);
  var modelID = parseInt(request.body.modelID);

  console.log('get-user-data for user ', userID);
  var queryUserData = {
    sql: 'SELECT model,id,createdDateTime FROM Models WHERE `ownerID`=?',
    values: [userID]
  }

  mysql.query(queryUserData, function(error, result){
    if(error){
      response.send('error, could not retrieve user info');
    } else {
      var returnArray = [];

      _.each(result, (value, key)=> {
        returnArray.push([JSON.parse(value.model),value.id,value.createdDateTime])
      });

      var returnObject = {};

      _.each(returnArray, (value, key)=> {
        returnObject[value[1]] = value[0];
        returnObject[value[1]].metadata.createdDateTime = value[2];
      });

      response.send(returnObject)
    }
  })
}

var getUserDataSingle = function(request, response, next){
  var userID = decrypt(request.body.userIDHash);
  var modelID = parseInt(request.body.modelID);

  var queryUserData = {
    sql: 'SELECT model,id,createdDateTime FROM Models WHERE `ownerID`=? AND `id`=?',
    values: [userID, modelID]
  }
  console.log('userID, modelID', userID, modelID);

  mysql.query(queryUserData, function(error, result){
    if(error){
      response.send('error, could not retrieve user data');
    } else {

      var returnObj = {
        model: result[0].model,
        id: result[0].id,
        createdDateTime: result[0].createdDateTime,
      }
      response.send(returnObj)

    }
  })
}

var getSummaryData = function(request, response, next){
  // TODO: verify working, implement in client
  var userID = decrypt(request.body.userIDHash);
  var modelID = parseInt(request.body.modelID);

  const queryModel = {
    sql: 'SELECT model FROM Models WHERE id=?',
    values: [modelID]
  }

  mysql.query(queryModel, function(error, result){
    if(error){
      response.send('error, could not retrieve user data');
    } else {
      const jsonStringModel = result[0].model;
      const modelObj = JSON.parse(jsonStringModel);
      var returnObj = {
        capRate: ((Math.round((modelObj.computedArrays.netOperatingIncome[0]*12 / modelObj.computedArrays.propertyValue[0]) * 100))+'%'),
        grm: (modelObj.computedArrays.propertyValue[0] / (modelObj.computedArrays.grossRentalIncome[0] * 12)),
        cashOnCashReturn: (((modelObj.computedArrays.cashFlow[0] * 12) + (modelObj.computedArrays.valueOfRealEstateInvestment[1] - modelObj.computedArrays.valueOfRealEstateInvestment[0])  ) / (modelObj.computedArrays.propertyValue[0] * modelObj.model.downPaymentPct)),
        fyCashflow: (modelObj.computedArrays.cashFlow[0]*12)
      }
      response.send(returnObj)
    }
  })
}

exports.createModel = createModel;
exports.editModel = editModel;
exports.deleteModel = deleteModel;
exports.getIdentifier = getIdentifier;
exports.getUserData = getUserData;
exports.getUserDataSingle = getUserDataSingle;
exports.getSummaryData = getSummaryData;
