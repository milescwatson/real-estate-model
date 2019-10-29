import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/app.css';
import './include/css/universal.css';
import Units from './Units';
import Table from './Table.js';
import Expenses from './Expenses';
import UserView from './UserView';
import computation from './include/computation/compute';

class App extends React.Component{
  constructor(props){
    super(props);
    this.initialState = {
      model : {
        rentYRG: .02,
        appreciationYRG: .015,
        unitsPerMonth: {
          1: {
            name: 'Unit 1',
            amount: 2300.00,
            amountYearly: 27600.00
          }
        },
        expenses: {
          1: {
            name: 'Insurance',
            amount: 100,
            amountYearly: 1200.00,
            yrg: .02
          },
          2: {
            name: 'Property Tax',
            amount: 180.00,
            amountYearly: 2160.00,
            yrg: .02
          }
        },
        vaccancyPct: .05,
        downPaymentPct: .2,
        interestRatePct: .03,
        loanStartingDate: null,
        valueOfLand: 0,
        propertyManagerPercentageOfGrossRent: .05,
        incomeTaxRate: 0,
        yearsOutComputation: 35,
        loanLengthYears: 30,
        initialFixedCost: 0,
        closingCostsPct: 0.05
      },

      view: {
        unitRows: []
      },

      computed: {
        loanValue: null,
        loanEndingDate: null,
        cap: 0,
        grm: 0,
        closingCosts: 0
      },

      computedArrays: {
        propertyValue: [200000],
        grossRentalIncome: [], // total rents less vaccancy - put the initial value in [0]
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
        ipmts: [],
        cumPrinc: [],
        pmt: []
      },

      userViews: {
        defaultView: ['year', 'propertyValue', 'netOperatingIncome', 'netOperatingExpenses', 'cashFlow'],
        all: ['year', 'pmt', 'ipmts', 'cumPrinc', 'propertyValue',  'grossRentalIncome', 'netOperatingExpenses', 'netOperatingIncome', 'totalEquity', 'loanBalance', 'cashFlow', 'depreciation', 'cashFlowIRS', 'resultingTaxWriteoff', 'valueOfRealEstateInvestment', 'valueOfRealEstateInvestmentIncludingWriteoffs', 'valueOfStockMarketInvestment'],
        operatingView: ['year', 'propertyValue', 'netOperatingExpenses', 'netOperatingIncome', 'cashFlow'],
        selectedView: 'all'
      }
    }
    this.state = this.initialState;
  };

  financialNum = function(x){
    return Number.parseFloat(x).toFixed(2);
  };
  computeAllCompoundInterestArrays = () => {
    computation.asyncComputeArrays(this.state.model, this.state.computedArrays, (error, result) => {
      this.setState({
        computedArrays: result
      });
    });
  };
  computeAllInitialValues = () => {
    computation.asyncComputeInitial(this.state.model, this.state.computed, this.state.computedArrays, (error, computedResult) => {
      this.setState({
        computed: computedResult
      });
    });
  };

  updateModelState = (e, modelStateParameter) => {
    var valuesStoredInArrayZero = {
      'purchasePrice': 'propertyValue'
    };

    const parameter = e.target.name;
    const value = e.target.value;

    var workingComputedArrays = this.state.computedArrays;

    // If this value is stored at zero
    if (Object.keys(valuesStoredInArrayZero).includes(parameter)) {
      workingComputedArrays[valuesStoredInArrayZero[parameter]][0] = value;
    };

    const initStateModel = this.state.model;
    initStateModel[parameter] = value;

    this.setState({
      model: initStateModel,
      computedArrays: workingComputedArrays
    });
  };

  generateAllInputs = function(){
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

    visualObjects.push(
      <React.Fragment key = "purchase">
        <label>Purchase Price</label> <input key="purchase" className="form-control" type="number" name="purchasePrice" onChange={this.updateModelState} />
      </React.Fragment>
    );

    var initialState = this.state.view;
    initialState.allInputs = visualObjects;
    this.setState({
      view: initialState
    });

  }.bind(this);

  showAllVariables = () => {
    var visualObjects = [],
        count = 0;

    Object.keys(this.state.model).forEach( (item) => {
      if(typeof(this.state.model[item]) !== 'object'){
        visualObjects.push(<p key={count}> {item}: {this.state.model[item]} </p>);
        count++;
      }
    });

    var initialState = this.state.view;
    initialState.allVariables = visualObjects;
    this.setState({
      view: initialState
    });

  };

  componentDidMount = function(){
    this.computeEverything();
  };

  computeEverything = function(){
    this.computeAllCompoundInterestArrays();
    this.computeAllInitialValues();
    this.showAllVariables();
    this.generateAllInputs();
  }.bind(this);

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
        <b>Propety value: $</b> {this.financialNum(this.state.computedArrays.propertyValue[0])}
        <br />
        <b>Loan value: $</b> {this.financialNum(this.state.computed.loanValue)}
        <br />
        <b>Loan interest rate: $</b> {this.financialNum(this.state.model.interestRatePct)}
        <br />

        <br />

        <UserView
          computedArrays = {this.state.computedArrays}
          userViews = {this.state.userViews}
        />

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
          userViews = {this.state.userViews}
          loanLengthYears = {this.state.model.loanLengthYears}
        />

      <button className='btn btn-outline-primary' onClick = {this.computeEverything} >Compute Everything</button>

      </React.Fragment>
    )
  }
}
export default App;
