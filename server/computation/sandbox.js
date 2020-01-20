/*jshint node:true */
/*global require */
'use strict';

var fin = require('./financialjs/dist/formula.min.js');

/*
Tests:

fin.
*/

var asyncAmortizationObject = function(requestObject, callback){
  var operations = {
    PMT: [],
    CUMIPMT: [],
    CUMPRINC: []
  };

  for(var operation in operations){
    operations[operation].push(0);
    for (var year = 1; year < requestObject.yearsOutComputation; year++){
      operations[operation].push();
      switch (operation) {
        case expression:

          break;
        default:

      }
    }
    //fin[key]();
  }

};

/*
generatePaymentArray = function(){
  var monthlyPayment = financialNum(fin.PMT(requestObject.rate/12,requestObject.loanLengthYears*12,loanValue));

  amtObj.PMT.push(0);
  for(var year = 1; year < requestObject.yearsOutComputation; year++){
    if(year <= requestObject.loanLengthYears){
      amtObj.PMT.push(monthlyPayment);
    }else{
      amtObj.PMT.push(0.00);
    }
  }
};
*/

asyncAmortizationObject({
  loanLengthYears: 30,
  yearsOutComputation: 35,
  rate: 0.03,
  initialPropertyValue: 200000,
  downPaymentPct: 0.2
}, function(){

});
