/*jshint node:true */
/*global require */
'use strict';

var fin = require('./financialjs/dist/formula.min.js'),
    waterfall = require('async-waterfall'),
    debug = true;

exports.returnAmortizationObject = function(request, response){

  /*
  numYears: this.state.model.loanLengthYears,
  rate: this.state.model.interestRatePct,
  initialPropertyValue: this.state.computedArrays.propertyValue[0],  // aka initial property value
  downPaymentPct: this.state.model.downPaymentPct
  loanLengthYears: this.state.model.loanLengthYears
  */
  // var requestObject = {
  //   numYears: 30,
  //   yearsOutComputation: 35,
  //   rate: 0.03,
  //   initialPropertyValue: 200000,
  //   downPaymentPct: 0.2,
  //   loanLengthYears: 30
  // }
  var requestObject = request.body,
      financialNum = function(x){
        const ret = Number.parseFloat(x).toFixed(2);
        return(parseFloat(ret));
      };

  // contains all periods (360 for 30 years)
  var amortization = {
    numPeriods: 0,
    cumInterest: [],
    paymentsAnnualized: [],
    cumPrincipal: [],
    remainingBalance: [],
    interestPayment: [], // interest payment at given month
    annualInterest: [],
    totalEquity: [],
    balanceAtYear: function(year, presentValue){
      // returns loan balance at the end of a year
      const period = year * 12;
      const result = presentValue + this.cumPrincipal[period];
      // console.log('result =', result);
      return ((result < 1 || isNaN(result)) ? 0.0 : result);
    }
  };

  // utility functions
  const numPeriods = requestObject.loanLengthYears*12;
  const presentValue = requestObject.initialPropertyValue - (requestObject.initialPropertyValue * requestObject.downPaymentPct);
  amortization.numPeriods = numPeriods;

  waterfall([
    function(callback){
      // calculate cumPrinc
      amortization.cumPrincipal[0] = 0.0;
      for(var period = 1; period <= numPeriods; period++){
        amortization.cumPrincipal[period] = fin.CUMPRINC(requestObject.rate/12, numPeriods, presentValue, 1, period, 0);
      }

      callback(null);
    },
    function(callback){
      // calculate ipmt
      amortization.interestPayment[0] = 0.0;
      for(var period = 1; period <= numPeriods; period++){
        amortization.interestPayment[period] = fin.IPMT(requestObject.rate/12, period, numPeriods, presentValue);
      }
      callback(null);
    },
    function(callback){
      // calculate cumInterest
      amortization.cumInterest[0] = 0.0;
      for(var period = 1; period <= numPeriods; period++){
        amortization.cumInterest[period] = fin.CUMIPMT(requestObject.rate/12, numPeriods, presentValue, 1, period, 0);
      }
      callback(null);
    },
    function(callback){
      // calculate payment - annual
      var monthlyPayment = financialNum(fin.PMT(requestObject.rate/12,requestObject.loanLengthYears*12,presentValue));
      amortization.paymentsAnnualized.push(0);
      for(var year = 1; year <= requestObject.yearsOutComputation; year++){
        if(year <= requestObject.loanLengthYears){
          amortization.paymentsAnnualized.push(monthlyPayment);
        }else{
          amortization.paymentsAnnualized.push(0.00);
        }
      }
      amortization.paymentsAnnualized[0] = amortization.paymentsAnnualized[1];
      callback(null);
    },
    function(callback){
      // cumulative interest at end of year
      amortization.annualInterest.push(0);
      for (var year = 1; year < requestObject.yearsOutComputation; year++) {
        if(year <= requestObject.loanLengthYears){
          var startPeriod = ((year*12 - 12) === 0) ? 1 : (year*12 - 12),
              endPeriod = (year*12);
          if (startPeriod !== 1){
            startPeriod++;
          }
          amortization.annualInterest.push(financialNum(fin.CUMIPMT(requestObject.rate / 12, requestObject.loanLengthYears * 12, presentValue, startPeriod, endPeriod, 0)));
        }else{
          amortization.annualInterest.push(0);
        }
      }
      callback(null);
    },
    function(callback){
      // calculate remainingBalance array
      amortization.remainingBalance[0] = presentValue;
      for (var i = 1; i <= requestObject.yearsOutComputation; i++) {
        amortization.remainingBalance[i] = amortization.balanceAtYear(i, presentValue);
      }
      callback(null);
    }
  ], (result) => {
    response.send(amortization);
  });
}
