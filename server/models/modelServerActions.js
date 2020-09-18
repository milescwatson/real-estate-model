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

var modelExists = function(id, callback){

  const checkIfExistsQuery = {
    sql: 'SELECT COUNT(*) FROM `real-estate-model`.`Models` WHERE `id` = ?',
    values: [id]
  }
  mysql.query(checkIfExistsQuery, function(error, result){
    if(error){
      callback(error, null);
    }else{
      const count = parseInt(result[0]['COUNT(*)']);
      if(count >= 1){
        callback(null, true);
      }else{
        callback(null, false);
      }
    }
  });
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
    console.log('created model ', insertID);
    response.send(JSON.stringify({iterator: insertID}));
  });
}

var editModel = function(request, response, next){
  const requestBody = {
    // userID: parseInt(decrypt(request.body.userIDHash)),
    modelID: parseInt(request.body.modelID),
    modelJSON: request.body.modelJSON
  }

  // check if identical to current model
  const queryCurrentModel = {
    sql: 'SELECT model FROM `Models` WHERE `id`=?',
    values: [requestBody.modelID]
  }

  mysql.query(queryCurrentModel, function(error, result){
    if(error){
      console.log('error, could not edit model');
    }else{
      const modelObj = JSON.parse(result[0].model);

      const isSyncAgreement = _.isEqual(modelObj, requestBody.modelJSON);

      if(!isSyncAgreement){
        console.log('sync disagree');
        const updateModelQuery = {
          sql: 'UPDATE `Models` SET `model`=? WHERE `id`=?',
          values: [JSON.stringify(requestBody.modelJSON), requestBody.modelID]
        }
        mysql.query(updateModelQuery, function(error, result){
          if(error){
            console.log('error with update query', error);
            response.send('error')
          }else{
            response.send('{"status":"sync-disagree"}')
          }
        });
      }else{
        console.log('sync AGREE');
        response.send('{"status":"sync-agree"}')
      }
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

  modelExists(modelID, function(error, exists){
    if(exists){
      var queryUserData = {
        sql: 'SELECT model,id,createdDateTime FROM Models WHERE `id`=?',
        values: [modelID]
      }
      console.log('sent single userData for user,model ', modelID);

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
    }else{
      const errorMessage = JSON.stringify({
        status: "error",
        message: "Model does not exist"
      });

      response.send(errorMessage);
    }
  });
}

var getSummaryData = function(request, response){
  // TODO: also send all userModel title, dates, etc.
  var userID = decrypt(request.body.userIDHash);
  var modelID = parseInt(request.body.modelID);

  const queryModel = {
    sql: 'SELECT model, id, createdDateTime FROM Models WHERE `id`=?',
    values: [modelID]
  }

  mysql.query(queryModel, function(error, result){
    if(error){
      response.send('error, could not retrieve user data');
    } else {
      // console.log(modelID,'sd result = ', result);
      if(result.length !== 0){
        const jsonStringModel = result[0].model;
        const modelObj = JSON.parse(jsonStringModel);
        // console.log('modelObj = ', modelObj);

        var returnObj = {
          summaryData: {
            title: (modelObj.metadata.title),
            capRate: ((Math.round((modelObj.computedArrays.netOperatingIncome[0]*12 / modelObj.computedArrays.propertyValue[0]) * 100))+'%'),
            grm: (modelObj.computedArrays.propertyValue[0] / (modelObj.computedArrays.grossRentalIncome[0] * 12)).toFixed(2),
            cashOnCashReturn: (((modelObj.computedArrays.cashFlow[0] * 12) + (modelObj.computedArrays.valueOfRealEstateInvestment[1] - modelObj.computedArrays.valueOfRealEstateInvestment[0])  ) / (modelObj.computedArrays.propertyValue[0] * modelObj.model.downPaymentPct)),
            fyCashflow: (modelObj.computedArrays.cashFlow[0]*12),
            createdDateTime: result[0].createdDateTime
          }
        }
        response.send(returnObj);
      }
    }
  })
}

var getIds = function(request, response, next){
  var userID = decrypt(request.body.userIDHash);
  const queryModel = {
    sql: 'SELECT id FROM Models WHERE ownerID=?',
    values: [userID]
  }

  mysql.query(queryModel, function(error, results){
    if(error){
      response.send('error, could not retrieve user data');
    } else {
      var usersModelIds = [];
      for (var i = 0; i < results.length; i++) {
        usersModelIds.push(results[i].id);
      }
      response.send(JSON.stringify(usersModelIds));
    }
  })
}


// var getSummaryModelList = function(request, response){
//   var userID = decrypt(request.body.userIDHash);
//   var queryUserData = {
//     sql: 'SELECT model,id,createdDateTime FROM Models WHERE `ownerID`=?',
//     values: [userID]
//   }
//
//   mysql.query(queryUserData, function(error, result){
//     if(error){
//       response.send('error, could not retrieve user data');
//     } else {
//       var returnModelArray = [];
//
//       for (var i = 0; i < result.length; i++) {
//         var summary = {}
//         const createdDateTime = result[i].createdDateTime;
//         const id = result[i].id;
//         const jsonModel = JSON.parse(result[i].model);
//
//         summary.id = id;
//         summary.grm = (jsonModel.computedArrays.propertyValue[0] / (jsonModel.computedArrays.grossRentalIncome[0] * 12));
//         summary.createdDateTime = createdDateTime;
//         summary.capRate = ((Math.round((jsonModel.computedArrays.netOperatingIncome[0]*12 / jsonModel.computedArrays.propertyValue[0]) * 100))+'%');
//         summary.cashOnCashReturn = (((jsonModel.computedArrays.cashFlow[0] * 12) + (jsonModel.computedArrays.valueOfRealEstateInvestment[1] - jsonModel.computedArrays.valueOfRealEstateInvestment[0])  ) / (jsonModel.computedArrays.propertyValue[0] * jsonModel.model.downPaymentPct))
//         summary.fyCashflow = (jsonModel.computedArrays.cashFlow[0] * 12)
//         summary.title = jsonModel.metadata.title;
//
//         returnModelArray.push(summary)
//       }
//       response.send(returnModelArray)
//     }
//   })
// }

exports.createModel = createModel;
exports.editModel = editModel;
exports.deleteModel = deleteModel;
exports.getIdentifier = getIdentifier;
exports.getUserData = getUserData;
exports.getUserDataSingle = getUserDataSingle;
exports.getSummaryData = getSummaryData;
exports.getIds = getIds;
