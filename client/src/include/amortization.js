/*jshint node:true */
/*global require */
'use strict';

var pmt = function(rate, numPeriods, period, principal){
    rate = rate / 12;
    var payment = (rate * principal) / (1 - Math.pow(1+rate, (numPeriods * -1)));

    if(period > numPeriods){
      return 0;
    }
    return(payment);
  };

var ipmt = function(rate, numPeriods, period, principal){
    rate = rate / 12;
    var pmt = this.pmt(rate, numPeriods, period, principal);
    console.log(pmt);
    var interestPayment = pmt + Math.pow((1 + rate), (numPeriods-1)) * (principal * rate - pmt);
    console.log(interestPayment);
    return(interestPayment);
};

var comprinc = function(){

};

var simpleIpmt = function(rate, numPeriods, period, principal){

};


// amort.pmt(0.03, 360, 1, 200000);

console.log(pmt(0.03, 60, 0, 20000));
