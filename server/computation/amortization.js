/*jshint node:true */
/*global require */
'use strict';

var fin = require('./financialjs/dist/formula.min.js'),
    debug = true;

exports.returnAmortizationObject = function(request, response){
    /*
    numYears: this.state.model.loanLengthYears,
    rate: this.state.model.interestRatePct,
    initialPropertyValue: this.state.computedArrays.propertyValue[0],  // aka initial property value
    downPaymentPct: this.state.model.downPaymentPct
    loanLengthYears: this.state.model.loanLengthYears
    */
    var requestObject = (request.body),
        amtObj = {
          PMT: [],
          CUMIPMT: [],
          CUMPRINC: []
        },
        loanValue = requestObject.initialPropertyValue - (requestObject.initialPropertyValue * requestObject.downPaymentPct),

        financialNum = function(x){
          const ret = Number.parseFloat(x).toFixed(2);
          return(parseFloat(ret));
        };

    var generateIPMTArray = function(){

      amtObj.CUMIPMT.push(0);
      for (var year = 1; year < requestObject.yearsOutComputation; year++) {
        if(year <= requestObject.loanLengthYears){
          var startPeriod = ((year*12 - 12) === 0) ? 1 : (year*12 - 12),
              endPeriod = (year*12);
          if (startPeriod !== 1){
            startPeriod++;
          }
          amtObj.CUMIPMT.push(financialNum(fin.CUMIPMT(requestObject.rate / 12, requestObject.loanLengthYears * 12, loanValue, startPeriod, endPeriod, 0)));
        }else{
          amtObj.CUMIPMT.push(0);
        }
      }

      amtObj.CUMIPMT = amtObj.CUMIPMT;
      },

      generateCUMPRINCArray = function(){
        var CUMPRINCArray = [];

          CUMPRINCArray.push(0);
          for (var year = 1; year < requestObject.yearsOutComputation; year++) {
            if(year <= requestObject.loanLengthYears){
              // if start is 0, return 1 instead
              var startPeriod = ((year*12 - 12) === 0) ? 1 : (year*12 - 12),
                  endPeriod = (year*12);
              // now: if startPeriod

              if (startPeriod !== 1){
                startPeriod++;
              }
              CUMPRINCArray.push( financialNum(fin.CUMPRINC(requestObject.rate / 12, requestObject.loanLengthYears * 12, loanValue, startPeriod, endPeriod, 0)));
            }else{
              CUMPRINCArray.push(0);
            }
          }
        amtObj.CUMPRINC = CUMPRINCArray;
      },

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

    generateIPMTArray();
    generateCUMPRINCArray();
    generatePaymentArray();

    if(debug){
      console.log('Sent amortization object to user ');
    }

    response.send(amtObj);
};
