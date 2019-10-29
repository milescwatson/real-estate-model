var xhrRequest = require('../scripts/xhrRequest');

exports.asyncComputeInitial = function(model, computed, computedArrays, callback){

  if (isNaN(computedArrays.propertyValue[0] / computedArrays.grossRentalIncome[0]) || computedArrays.propertyValue[0] / computed.grossRentalIncome === 'Infinity'){
    computed.grm = null;
  }else{
    computed.grm = computedArrays.propertyValue[0] / computedArrays.grossRentalIncome[0];
  }

  //cap rate
  computed.cap = (computedArrays.netOperatingIncome[0] / computedArrays.propertyValue[0]) * 100;

  //down payment
  const downPaymentAmount = (computedArrays.propertyValue[0] * model.downPaymentPct);

  computed.loanValue = computedArrays.propertyValue[0] - downPaymentAmount;

  computed.closingCosts = computedArrays.propertyValue[0] * (model.closingCostsPct);

  // TODO: initialComputed.loanEndingDate
  callback(null, computed);
};

exports.asyncComputeArrays = function(model, computedArrays, callback){
  var generateGrowthArray = (startingPoint, yrg, callback) => {
    var returnArray = [];
    for(var i = 0; i <= model.yearsOutComputation; i++){
      returnArray[i] = startingPoint * (Math.pow(Math.E, (model.appreciationYRG * yrg) * i));
    }
    callback(null, returnArray)
  },
  expenses = model.expenses,
  listOfArrays = [],
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

  Object.keys(expenses).forEach((item) => {
    generateGrowthArray(expenses[item].amount, expenses[item].yrg, (error, resultingArray) => {
      expenses[item].growthArray = resultingArray;
      listOfArrays.push(resultingArray)
    });
  });

  mergeArrays(listOfArrays, (error, resultingArray) => {
    computedArrays.netOperatingExpenses = resultingArray;
  });

  // calculate out propertyValue
  generateGrowthArray(computedArrays.propertyValue[0], model.appreciationYRG, (error, resultingArray) => {
    computedArrays.propertyValue = resultingArray;
  });

  // calculate out grossRentalIncome
  var sumRents = 0,
      sumRentsF = function() {
        Object.keys(model.unitsPerMonth).forEach((id) => {
          sumRents += parseFloat(model.unitsPerMonth[id].amount);
        });
      };
      sumRentsF();

    var griInit = sumRents - (model.vaccancyPct * sumRents);
    generateGrowthArray(parseFloat(griInit), model.appreciationYRG, (error, resultingArray) => {
      computedArrays.grossRentalIncome = resultingArray;
    });

    // calculate out netOperatingIncome array
    computedArrays.grossRentalIncome.forEach((griItem, index) => {
      computedArrays.netOperatingIncome.push(griItem - computedArrays.netOperatingExpenses[index]);
    });

    // TODO: request amortization values

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
        computedArrays.cumPrinc = amortizationResponse.CUMPRINC;
        computedArrays.ipmts = amortizationResponse.CUMIPMT;
        computedArrays.pmt = amortizationResponse.PMT;
        callback(null, computedArrays);
      }
    });
};
