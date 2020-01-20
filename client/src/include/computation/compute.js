var xhrRequest = require('../scripts/xhrRequest');
var _ = require('lodash');
var waterfall = require('async-waterfall');

exports.asyncComputeArraysIncomeStatement = function(model, computedArrays, callback){
  // utility functions
  var generateGrowthArray = (startingPoint, yrg, callback) => {
        var returnArray = [];
        returnArray[0] = 0;
        for(var i = 1; i <= model.yearsOutComputation; i++){
          returnArray[i] = startingPoint * (Math.pow(Math.E, (yrg * i)));
        }
        callback(null, returnArray);
      },
      mergeArrays = (arrays, callback) => {
        var combinedArray = [];
        for (var i = 0; i <= model.yearsOutComputation; i++){
          combinedArray[i] = 0;
          for (var j = 0; j < arrays.length; j++){
            combinedArray[i] += arrays[j][i];
          }
        }
        callback(null, combinedArray);
      };

  // computation functions
  var generateGRIArray = function(callback){
      var sumRents = 0.0;
      _.each(model.units, (value, key) => {
        sumRents += value.rentPerMonth;
      });
      const griInit = sumRents - (model.vaccancyPct * sumRents);
      generateGrowthArray(griInit, model.rentYRG, (error, resultingArray) => {
        resultingArray[0] = sumRents;
        computedArrays.grossRentalIncome = resultingArray;
        callback(null);
      });
      },
      generateAndMergeExpenseArray = function(callback){
        var expenseArrays = [],
            expenses = model.expenses,
            sumExpenses = 0;

        // collect all expense growth arrays
        Object.keys(expenses).forEach((item) => {
          sumExpenses += expenses[item].amount;
          generateGrowthArray(expenses[item].amount, expenses[item].yrg, (error, resultingArray) => {
            // expenses[item].growthArray = resultingArray;
            expenseArrays.push(resultingArray)
          });
        });

        // merge these into one noe array
        mergeArrays(expenseArrays, (error, resultingArray) => {
          // add in property management
          _.each(resultingArray, (value, key) => {
              resultingArray[key] += (computedArrays.grossRentalIncome[key] * model.propertyManagerPercentageOfGrossRent);
            });
            computedArrays.netOperatingExpenses = resultingArray;
            computedArrays.netOperatingExpenses[0] += sumExpenses;

            callback(null);
        });
      },
      generateNOIArray = function(callback){
        _.each(computedArrays.grossRentalIncome, (value, key) => {
          computedArrays.netOperatingIncome[key] = value - computedArrays.netOperatingExpenses[key];
        });
        callback(null);
      },
      generateAmortizationArrays = function(callback){
        var amortizationValues = {
          loanLengthYears: model.loanLengthYears,
          yearsOutComputation: model.yearsOutComputation,
          rate: model.interestRatePct,
          initialPropertyValue: computedArrays.propertyValue[0],  // aka initial property value
          downPaymentPct: model.downPaymentPct
        };

        xhrRequest.xhrRequestJSON('/amortization-object','POST', amortizationValues, function(error, response){
          if(error){
            alert('error: Could not calculate amortization values.');
          }else{
            var amortizationResponse = JSON.parse(response);
            // annualize cumPrincipal

            var annualizeCumulative = function(periodCumPrincipal){
              var cumArray = [];
              cumArray[0] = 0;

              const numPeriods = amortizationResponse.numPeriods;
              for (var i = 0; i <= numPeriods; i += 12) {
                if(i !== 0){
                  cumArray.push(periodCumPrincipal[i]);
                }
              }
              return(cumArray);
            }

            computedArrays.cumPrincipal = annualizeCumulative(amortizationResponse.cumPrincipal);
            computedArrays.annualInterest = amortizationResponse.annualInterest;
            computedArrays.paymentsAnnualized = amortizationResponse.paymentsAnnualized;
            computedArrays.cumInterest = annualizeCumulative(amortizationResponse.cumInterest);
            computedArrays.remainingBalance = amortizationResponse.remainingBalance;
            callback(null);
          }
        });
      },
      // investment related calculation
      generateAppreciatedValueArray = function(callback){
        generateGrowthArray(computedArrays.propertyValue[0], model.appreciationYRG, (error, resultingArray) => {
          resultingArray[0] = computedArrays.propertyValue[0];
          computedArrays.propertyValue = resultingArray;
          callback(null);
        });
      },
      generateEquityArray = function(callback){
        //calculate total equity
        //equity[year] = appreciatedValue - remainingBalance

        // at purchase equity = down payment
        computedArrays.totalEquity[0] = computedArrays.propertyValue[0] * model.downPaymentPct;

        for (var year = 1; year <= model.yearsOutComputation; year++) {
          computedArrays.totalEquity[year] = computedArrays.propertyValue[year] - computedArrays.remainingBalance[year];
        }
        callback(null);
      },
      generateCashflowArray = function(callback){
        for(var year = 0; year <= model.yearsOutComputation; year++){
          computedArrays.cashFlow[year] = (computedArrays.netOperatingIncome[year] - Math.abs(computedArrays.paymentsAnnualized[year]));
          // console.log('year = ', year);
          // console.log(Math.abs(computedArrays.paymentsAnnualized[year]));
        }
        callback(null);
      },
      generateComparableInvestmentValueArray = function(callback){
        const downPaymentAmount = (computedArrays.propertyValue[0] * model.downPaymentPct);
        generateGrowthArray(downPaymentAmount, model.stockYRG, (error, resultingArray) => {
          resultingArray[0] = downPaymentAmount;
          computedArrays.valueOfStockMarketInvestment = resultingArray;
          callback(null);
        });
      },
      generateDepreciationArray = function(callback){
        const purchasePrice = computedArrays.propertyValue[0];
        const depPerYear = (purchasePrice - model.valueOfLand) / model.depreciateOver;

        for(var i = 1; i <= model.yearsOutComputation; i++){
          if (i <= model.depreciateOver){
            computedArrays.depreciation[i] = depPerYear;
          }else{
            computedArrays.depreciation[i] = 0.00;
          }
        }
        callback(null);

      },
      generateValueOfREInvestment = function(callback){
        var cumCashflow = 0;
        for (var year = 0; year <= model.yearsOutComputation; year++) {
          cumCashflow += computedArrays.cashFlow[year];
          computedArrays.valueOfRealEstateInvestment[year] = computedArrays.totalEquity[year] + cumCashflow;
        }
        callback(null);
      },
      generateTaxFlowIRSArray = function(callback){

      };

      waterfall([generateGRIArray, generateAndMergeExpenseArray, generateNOIArray, generateAmortizationArrays, generateCashflowArray, generateAppreciatedValueArray, generateEquityArray, generateComparableInvestmentValueArray, generateDepreciationArray, generateValueOfREInvestment], (result)=> {
        callback(null, computedArrays);
      })
}
