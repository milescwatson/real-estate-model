import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/app.css';
import Units from './Units';
import Table from './Table.js';
import Expenses from './Expenses';

class App extends React.Component{
  constructor(props){
    super(props);
    this.initialState = {
      model : {
        rentYRG: 0,
        appreciationYRG: 1,
        unitsPerMonth: {
          1: {
            name: 'Unit 1',
            amount: 2300,
            amountYearly: 27600
          }
        },
        expenses: {
          1: {
            name: 'Insurance',
            amount: 100,
            amountYearly: 1200,
            yrg: .02
          },
          2: {
            name: 'Property Tax',
            amount: 180,
            amountYearly: 2160,
            yrg: .02
          }
        },
        vaccancyPct: .05,
        downPaymentPct: 20,
        interestRatePct: 3,
        loanLengthYears: 30,
        loanStartingDate: null,
        valueOfLand: 0,
        propertyManagerPercentageOfGrossRent: 5,
        incomeTaxRate: 0,
        yearsOutComputation: 31,
        initialFixedCost: 0,
        closingCostsPct: 0
      },

      view: {
        unitRows: []
      },
      computed: {
        grm: null,
        cap: null,
        downPaymentAmount: null,
        loanValue: null,
        loanEndingDate: null,
        closingCosts: null,
        monthlyAmortizationArrays: {
          loanPaymentPerMonth: {
            allPeriods: [],
            annualized: []
          },
        }
      },

      computedArrays: {
        propertyValue: [],
        grossRentalIncome: [], // total rents less vaccancy
        netOperatingExpenses: [],
        netOperatingIncome: [],
        cashFlow: [],
        depreciation: [],
        cashFlowIRS: [],
        resultingTaxWriteoff: [],
        valueOfRealEstateInvestment: [],
        valueOfRealEstateInvestmentIncludingWriteoffs: [],
        valueOfStockMarketInvestment: [],
        loanBalance: [],
        totalEquity: [],
        totalPrincipalPaid: [],
      },

      userViews: {
        defaultView: {

        }
      }
    }

    this.state = this.initialState;
  };

  dotProduct = (arrays, callback) => {
    var combinedArray = [];
    for (var i = 0; i <= this.state.model.yearsOutComputation; i++){
      combinedArray[i] = 0;
      for (var j = 0; j < arrays.length; j++){
        combinedArray[i] += arrays[j][i];
      }
    }
    callback(null, combinedArray);
  }

  computeAllCompoundInterestArrays = () => {

    var generateGrowthArray = (startingPoint, callback) => {
      var returnArray = [];
      for(var i = 0; i <= this.state.model.yearsOutComputation; i++){
        returnArray[i] = startingPoint * (Math.pow(Math.E, (this.state.model.appreciationYRG * .01) * i));
      }
      callback(null, returnArray)
    };

    //need to a list of starting points, turn them into an array, combine all arrays into one "expenses" array, store as netOperatingExpenses
    var expenses = this.state.model.expenses;
    var listOfArrays = [];

    Object.keys(expenses).forEach((item) => {
      generateGrowthArray(expenses[item].amount, (error, resultingArray) => {
        expenses[item].growthArray = resultingArray;
        listOfArrays.push(resultingArray)
      });
    });
    // combine all arrays into one "expenses" array
    // grab all expenses arrays
    this.dotProduct(listOfArrays, (error, resultingArray) => {
      // console.log('resultingArray: ', resultingArray);
      //TODO: Put in the temporary computedArray storage object
      var workingComputedArrays = this.state.computedArrays;
      workingComputedArrays.netOperatingExpenses = resultingArray;

      this.setState({
        computedArrays: workingComputedArrays
      });
    });
    //now, compute everything starting at the first element of the array
  };

  updateModelState = (e, modelStateParameter) => {
    var valuesStoredInArrayZero = {
      'purchasePrice': 'propertyValue'
    };

    const parameter = e.target.name;
    const value = e.target.value;

    var workingComputedArrays = this.state.computedArrays;

    // TODO: fix direct state access
    if(Object.keys(valuesStoredInArrayZero).includes(parameter)){
      workingComputedArrays[valuesStoredInArrayZero[parameter]][0] = value;
    };

    const initStateModel = this.state.model;
    initStateModel[parameter] = value;

    this.setState({
      model: initStateModel,
      computedArrays: workingComputedArrays
    }, function(){
      this.computeEverything();
    });
  };

  generateAllInputs = () =>{
    var visualObjects = [];
    var that = this;
    var count = 0;

    Object.keys(this.state.model).forEach(function(item){
      if(typeof(that.state.model[item]) !== 'object'){
        visualObjects.push(
          <div key={count}>
            <label>{item}: </label>
            <input className="form-control" type="number" name={item} onChange={that.updateModelState} />
          </div>
        );
        count++;
      }
    });

    var initialState = this.state.view;
    initialState.allInputs = visualObjects;
    this.setState({
      view: initialState
    });

  }

  showAllVariables = () => {
    var visualObjects = [];
    var that = this;
    var count = 0;

    Object.keys(this.state.model).forEach(function(item){
      if(typeof(that.state.model[item]) !== 'object'){
        visualObjects.push(<p key={count}> {item}: {that.state.model[item]} </p>);
        count++;
      }
    });

    var initialState = this.state.view;
    initialState.allVariables = visualObjects;
    this.setState({
      view: initialState
    });

  };

  generateAllTables = () => {
    var visualObjects = [];

    // https://menubar.io/reactjs-tables
    // https://dev.to/abdulbasit313/an-easy-way-to-create-a-customize-dynamic-table-in-react-js-3igg

    // visualObjects.push(<table className="table table-sm table-striped table-bordered projection-table table-hover">);
    // visualObjects.push(<tr>);
    // visualObjects.push(<tbody>);
    //
    // Object.keys(this.state.computedArrays).forEach(function(item){
    //   if (typeof(item) !== 'object'){
    //     visualObjects.push(<thead>{item}</thead>)
    //   }
    // });
    // visualObjects.push(</tbody>);
    // visualObjects.push(</tr>);
    // visualObjects.push(</table>);

    var initialState = this.state.view;
    initialState.table = visualObjects;

    this.setState({
      view: initialState,
    })

  };

  computeTable = () => {
  }

  computeAllInitialValues = () => {
    var initialComputed = this.state.computed;

    // compute expenses
    initialComputed.netOperatingExpenses = 0;
    Object.keys(this.state.model.expenses).forEach((item) => {
      initialComputed.netOperatingExpenses += this.state.model.expenses[item].amount;
    });

    if (isNaN(this.state.computedArrays.propertyValue[0] / initialComputed.grossRentalIncome) || this.state.computedArrays.propertyValue[0] / initialComputed.grossRentalIncome === 'Infinity'){
      initialComputed.grm = null;
    }else{
      initialComputed.grm = this.state.computedArrays.propertyValue[0] / initialComputed.grossRentalIncome;
    }

    //cap rate
    initialComputed.cap = (initialComputed.netOperatingIncome / this.state.computedArrays.propertyValue[0]) * 100;

    //down payment
    initialComputed.downPaymentAmount = this.state.computedArrays.propertyValue[0] * (this.state.model.interestRatePct * .01);

    initialComputed.loanValue = this.state.computedArrays.propertyValue[0] - initialComputed.downPaymentAmount;

    initialComputed.closingCosts = this.state.computedArrays.propertyValue[0] * (this.state.model.closingCostsPct * .01);
    // TODO: initialComputed.loanEndingDate
  }

  componentDidMount = function(){
    this.computeEverything();
  };

  computeEverything = function(){
    this.showAllVariables();
    this.generateAllInputs();
    this.generateAllTables();
    this.computeAllInitialValues();
    this.computeAllCompoundInterestArrays();
  };

  updateUnitsCallback = function(unitsObj){
    var workingModel = this.state.model;
    workingModel.unitsPerMonth = unitsObj;
    this.setState({
      model: workingModel
    });
  }.bind(this);

  updateExpensesCallback = function(expensesObject) {
    var workingModel = this.state.model;
    workingModel.expenses = expensesObject;

    this.setState({
      model: workingModel
    });
  }.bind(this);

  render(){
    return(
      <React.Fragment>
        <div class="inputs">
          {this.state.view.allInputs}
        </div>

        <table>
          <tbody>
            <tr>
              <td></td>
              <td><b>Monthly</b></td>
              <td><b>Annual</b></td>
            </tr>
            <Units
              name='Units'
              initialUnits={this.state.model.unitsPerMonth}
              vaccancyPct={this.state.model.vaccancyPct}
              updateUnitsInParent = {this.updateUnitsCallback}
            />
            <tr>
            </tr>
            <Expenses
              name='Expenses'
              initialExpenses = {this.state.model.expenses}
              updateExpensesInParent = {this.updateExpensesCallback}
              userViews={this.state.userViews}
            />
          </tbody>
        </table>
        <br />
        <Table
          yearsOutComputation={this.state.model.yearsOutComputation}
          computedArrays = {this.state.computedArrays}
        />

      </React.Fragment>
    )
  }
}
export default App;
