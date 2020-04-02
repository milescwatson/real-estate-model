import React from 'react';
import { Icon } from "@blueprintjs/core";
import './include/css/bootstrap.min.css';
import './include/css/app.css';
import './include/css/universal.css';
import compute from './include/computation/compute';
import ChartContainer from './ChartContainer';
import Metric from './Metric.js';
import NumberFormat from 'react-number-format';
import InputContainer from './InputContainer';
import ProjectionTable from './ProjectionTable';
import {Navbar, Nav} from 'react-bootstrap';

var _ = require('lodash');

var isIconSize = 22;

class App extends React.Component{
  constructor(props){
    super(props);
    this.initialState = {
      model : {
        rentYRG: 0.02,
        appreciationYRG: 0.015,
        units: {
          1: {
            name: 'Unit 1',
            rentPerMonth: 2300.00,
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
        stockYRG: 0.06,
        vaccancyPct: 0.05,
        downPaymentPct: 0.2,
        interestRatePct: 0.03,
        loanStartingDate: null,
        valueOfLand: 40000,
        propertyManagerPercentageOfGrossRent: 0.05,
        incomeTaxRate: 0.3,
        yearsOutComputation: 35,
        loanLengthYears: 30,
        initialFixedCost: 0,
        depreciateOver: 25,
        maxWriteoffPerYear: 15000
      },
      // used to store the state of input components - these values are re-computed as decimal percents and stored in the main model
      visualModel: {
        stockYRG: null,
        vaccancyPct: null,
        downPaymentPct: null,
        interestRatePct: null,
        propertyManagerPercentageOfGrossRent: null,
        incomeTaxRate: null
      },

      view: {
        unitRows: []
      },

      metadata: {
        name: 'untitled model',
        active: true
      },

      computedArrays: {
        propertyValue: [200000],
        grossRentalIncome: [], // total rents less vaccancy - put the initial value in [1]
        netOperatingExpenses: [],
        netOperatingIncome: [],
        cashFlow: [],
        depreciation: [],
        cashFlowIRS: [],
        resultingTaxWriteoff: [],
        valueOfRealEstateInvestment: [],
        valueOfRealEstateInvestmentIncludingWriteoffs: [],
        valueOfStockMarketInvestment: [],
        remainingBalance: [],
        totalEquity: [],
        annualInterest: [],
        cumPrincipal: [],
        cumInterest: [],
        paymentsAnnualized: []
      },

      nameMappings: {
        propertyValue: "Property Value",
        grossRentalIncome: "Gross Rental Income (M)",
        netOperatingExpenses: "Net Operating Expenses (M)",
        netOperatingIncome: "Net Operating Income (M)",
        paymentsAnnualized: "Mortgage Payment (M)",
        cashFlow: "Cashflow (A)",
        depreciation: "Depreciation (A)",
        cashFlowIRS: "Cash Flow IRS (A)",
        resultingTaxWriteoff: "Resulting Tax Writeoff (A)",
        valueOfRealEstateInvestment: "Value of Real Estate Investment",
        valueOfRealEstateInvestmentIncludingWriteoffs: "Value of Real Estate Investment Incl. Writeoffs",
        valueOfStockMarketInvestment: "Value of Stock Market Investment",
        remainingBalance: "Loan Balance Remaining",
        totalEquity: "Total Equity",
        annualInterest: "Annual Interest",
        cumPrincipal: "Cumulative Principal",
        cumInterest: "Cumulative Interest"
      }
      // userViews: {
      //   defaultView: ['year', 'propertyValue', 'netOperatingIncome', 'netOperatingExpenses', 'cashFlow'],
      //   all: ['year', 'propertyValue', 'grossRentalIncome', 'netOperatingExpenses', 'netOperatingIncome', 'cashFlow', 'depreciation', 'cashFlowIRS', 'resultingTaxWriteoff', 'valueOfRealEstateInvestment', 'valueOfRealEstateInvestmentIncludingWriteoffs', 'remainingBalance', 'totalEquity', 'cumPrincipal', 'cumInterest', 'annualInterest', 'paymentsAnnualized', 'valueOfStockMarketInvestment'],
      //   operatingView: ['year', 'propertyValue', 'netOperatingExpenses', 'netOperatingIncome', 'cashFlow'],
      //   selectedView: 'all'
      // }
    }
    this.state = this.initialState;
  };

  financialNum = function(x){
    return Number.parseFloat(x).toFixed(2);
  };

  computeAllCompoundInterestArrays = () => {
    compute.asyncComputeArraysIncomeStatement(this.state.model, this.state.computedArrays, (error, result) => {
      this.setState({
        computedArrays: result
      });
    });
  };
  // computeAllInitialValues = () => {
  //   compute.asyncComputeInitial(this.state.model, this.state.computed, this.state.computedArrays, (error, computedResult) => {
  //     this.setState({
  //       computed: computedResult
  //     });
  //   });
  // };

  updateModelState = (e, modelStateParameter) => {
    var valuesStoredInArrayZero = {
      'purchasePrice': 'propertyValue'
    };

    const parameter = e.target.name;
    const value = e.target.value;

    var workingComputedArrays = this.state.computedArrays;

    // If this value is stored at array sub 1
    if (Object.keys(valuesStoredInArrayZero).includes(parameter)) {
      workingComputedArrays[valuesStoredInArrayZero[parameter]][1] = value;
    };

    const initStateModel = this.state.model;
    initStateModel[parameter] = value;

    this.setState({
      model: initStateModel,
      computedArrays: workingComputedArrays
    });
  };

  componentDidMount = function(){
    this.computeEverything();
  };

  computeEverything = function(){
    this.computeAllCompoundInterestArrays();
  }.bind(this);

  getDebtServiceString = function(){
    if(this.state.computedArrays.paymentsAnnualized[1] === 'undefined' || isNaN(this.state.computedArrays.paymentsAnnualized[1])){
      return(0.00);
    }else{
      return(this.state.computedArrays.paymentsAnnualized[1]);
    }
  }.bind(this);


  IncomeStatement = function(){
    var unitRowsVisual = [],
        expenseRowsVisual = [];

    var handleAddUnit = function(){
      var workingModel = this.state.model;

      if(this.state.model.units === 'undefined'){
        workingModel.units = {}
      }

      var index = Math.max(...Object.keys(workingModel.units)) + 1;
      if(Object.keys(this.state.model.units).length === 0){
        index = 1;
      }

      var newBlankUnit = {
        name: 'Unit ' + index,
        rentPerMonth: 0.00
      };
      workingModel.units[index] = newBlankUnit;

      this.setState({
        model: workingModel
      }, this.computeEverything());

    }.bind(this);

    var handleAddExpense = function(){
      var workingModel = this.state.model;

      if(this.state.model.expenses === 'undefined'){
        workingModel.expenses = {}
      }

      var index = Math.max(...Object.keys(workingModel.expenses)) + 1;
      if(Object.keys(this.state.model.expenses).length === 0){
        index = 1;
      }

      var blankExpense = {
        amount:0,
        amountYearly:0,
        yrg: 0.02,
        name: 'Expense ' + index,
      }
      workingModel.expenses[index] = blankExpense;
      this.setState({
        model: workingModel
      }, this.computeEverything());
    }.bind(this);

    var handleDeleteRow = function(dataType, id){
      var workingModel = this.state.model;
      if(dataType === 'units'){
        delete workingModel.units[id];
      }else if (dataType === 'expense'){
        delete workingModel.expenses[id];
      }

      this.setState({
        model: workingModel
      }, this.computeEverything());
    }.bind(this);

    var handleEditNumber = function(value, id){
      if(!isNaN(value.floatValue)){
        this.setState((previousState) => {
          previousState.model.units[id].rentPerMonth = value.floatValue;
          return({
            model: previousState.model
          });
        }, this.computeEverything());
      }

    }.bind(this);

    // only handles names
    var handleEditRow = function(event, dataType){
      var input = event.target.name.split('_'),
          name = input[0],
          id = input[1],
          workingModel = this.state.model,
          isTitle = false;

      if(dataType === 'units'){
        switch (name) {
          case 'unitName':
            workingModel.units[id].name = event.target.value;
            break;
          default:
            break;
        }
      } else if (dataType === 'expense'){
        if(name === 'expenseName'){
          workingModel.expenses[id].name = event.target.value;
          isTitle = true;
        }
      }

      this.setState({
        model: workingModel
      }, () => {
        if(!isTitle){
          this.computeEverything();
        }
      });

    }.bind(this);

    var handleEditYRG = function(value,id){
      this.setState((workingState) => {
        workingState.model.expenses[id].yrg = value.floatValue/100;
        return({
          model: workingState.model
        })
      }, this.computeEverything())
    }.bind(this);

    var GenerateUnitRows = function(){
          var index = Object.keys(this.state.model.units).length;
          Object.keys(this.state.model.units).forEach((id) => {
                if(typeof(this.state.model.units[id].name) !== 'undefined'){
                  unitRowsVisual.push(
                    <tr className={'income-statement-item-row'} key={index}>
                      <td><input className={"bp3-input"} type="text" value={this.state.model.units[id].name} onChange={(event) => {handleEditRow(event, 'units')}} name={'unitName_'+id} /></td>

                      <td>
                          <NumberFormat
                            className={"bp3-input"}
                            value={this.state.model.units[id].rentPerMonth}
                            onValueChange={(value) => {
                              handleEditNumber(value, id);
                            }}
                            name={'unitRentPerMonth_'+id}
                            thousandSeparator={true} prefix={'$'}
                            allowNegative = {false}
                            defaultValue = {0}
                            fixedDecimalScale = {true}
                            decimalScale = {2}
                          />
                      </td>

                      <td>
                      <NumberFormat
                        value={this.state.model.units[id].rentPerMonth * 12}
                        name={'rentPerYearDisplay'+id}
                        thousandSeparator={true} prefix={'$'}
                        defaultValue = {0}
                        fixedDecimalScale = {true}
                        decimalScale = {2}
                        displayType = {'text'}
                      />

                      </td>

                      <td>
                      </td>

                      <td name={'thisIStheID'} onClick={() => {handleDeleteRow('units', id)}}>
                        <Icon className={"hyper-tooltip"} icon={'remove'} intent="danger" iconSize={isIconSize} />
                      </td>
                    </tr>
                  )
                  index++;
                }
          });
    }.bind(this);

    var handleEditExpenseNumber = function(event){
      var input = event.target.name.split('_'),
          name = input[0],
          id = input[1],
          value = event.target.value;

          value = value.replace(/[, ]+/g, "").trim();
          if(value[0] === '$'){
            value = value.substr(1);
          }
          value = parseFloat(value);
      if(!isNaN(value)){
        switch (name) {
          case 'unitExpensePerMonth':
            this.setState((workingState)=>{
              workingState.model.expenses[id].amount = parseFloat(value);
              workingState.model.expenses[id].amountYearly = parseFloat(value * 12);
              return({
                model: workingState.model
              });
            }, this.computeEverything());
            break;
          case 'unitExpensePerYear':
            this.setState((workingState)=>{
              workingState.model.expenses[id].amountYearly = parseFloat(value);
              workingState.model.expenses[id].amount = parseFloat(value / 12);
              return({
                model: workingState.model
              });
            }, this.computeEverything());
            break;
          default:
            break;
        }
      }
    }.bind(this);

    var GenerateExpenseRows = function(){
      var index = Object.keys(this.state.model.expenses).length;

      Object.keys(this.state.model.expenses).forEach((id) => {
        if(typeof(this.state.model.expenses[id] !== 'undefined')){
          expenseRowsVisual.push(
            <tr className={'income-statement-item-row'} key={index}>
              <td><input className={'bp3-input'} type="text" value={this.state.model.expenses[id].name} onChange={(event) => {handleEditRow(event, 'expense')}} name={'expenseName_'+id} /></td>
            <td>
                <NumberFormat
                  className = {'bp3-input'}
                  value={this.state.model.expenses[id].amount}
                  onBlur={(event) => {
                    handleEditExpenseNumber(event);
                  }}
                  name={'unitExpensePerMonth_'+id}
                  thousandSeparator={true} prefix={'$'}
                  allowNegative = {false}
                  defaultValue = {0}
                  fixedDecimalScale = {true}
                  decimalScale = {2}
                />
            </td>

            <td>
                <NumberFormat
                  className = {'bp3-input'}
                  value={this.state.model.expenses[id].amountYearly}
                  onBlur={(event) => {
                    handleEditExpenseNumber(event);
                  }}
                  name={'unitExpensePerYear_'+id}
                  thousandSeparator={true} prefix={'$'}
                  allowNegative = {false}
                  defaultValue = {0}
                  fixedDecimalScale = {true}
                  decimalScale = {2}
                />
            </td>

            <td>
              <NumberFormat
                className = {'bp3-input'}
                value={this.state.model.expenses[id].yrg*100}
                onValueChange={(value) => {handleEditYRG(value, id)}}
                name={'yrg_'+id}
                thousandSeparator={true} suffix={'%'}
                allowNegative = {false}
                defaultValue = {2.0}
                fixedDecimalScale = {true}
                decimalScale = {2}
              />
            </td>

            <td onClick={()=> {
                handleDeleteRow('expense', id);
              }}>
              <Icon className={"hyper-tooltip"} icon={'remove'} intent="danger" iconSize={isIconSize} />
            </td>

            </tr>
          );
        }
        index++;
      })
    }.bind(this);

    GenerateUnitRows();
    GenerateExpenseRows();

    var cashflowRowStyle = {};
    var generateCashflowStyle = function(){
      if (this.state.computedArrays.cashFlow[0] < 0){
        // negative
        cashflowRowStyle = {
          'backgroundColor': '#f8d7da',
          'fontWeight': 'bold'
        }
      }else{
        // positive
        cashflowRowStyle = {
          'backgroundColor': '#D4EDDB',
          'fontWeight': 'bold'
        }
      }
    }.bind(this);
    generateCashflowStyle();

    var rentSum = 0.0;

    var sumRents = function(){
      _.each(this.state.model.units, (value, key) => {
        rentSum += value.rentPerMonth;
      });
    }.bind(this);
    sumRents();

    return(
      <React.Fragment>
        <div className="is-container container-padding-margin">
        <h3>Income Statement</h3>
        <table className="is-table">
          <tbody>
          <tr className="income-statement-header">
            <td className="td-noborder"> <h5>Units / Income</h5></td>
            <td className="income-statement-title td-noborder">Monthly</td>
            <td className="income-statement-title td-noborder">Annual</td>
            <td className="td-noborder"></td>
            <td className="td-noborder" onClick={handleAddUnit}>
              <Icon className={"hyper-tooltip"} icon={'add'} intent="success" iconSize={isIconSize} />
            </td>
          </tr>
          {unitRowsVisual}
          <tr>
            <td>Total</td>
            <td>

              <NumberFormat
                value = {rentSum }
                name={'totalRents_'}
                thousandSeparator={true}
                prefix={'$'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />

            </td>
            <td>
              <NumberFormat
                value = {this.state.computedArrays.grossRentalIncome[0] * 12}
                name={'totalRents_'}
                thousandSeparator={true}
                prefix={'$'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />
            </td>
          </tr>
          <tr>
            <td>
              Less Vaccancy Loss ({this.state.model.vaccancyPct*100}%)
            </td>
            <td>
              <NumberFormat
                value = {rentSum - (this.state.computedArrays.grossRentalIncome[0])}
                name={'vaccancyLossMonthly_'}
                thousandSeparator={true}
                prefix={'$('}
                suffix={')'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />
            </td>
            <td>
              <NumberFormat
                value = {(this.state.computedArrays.grossRentalIncome[0] * this.state.model.vaccancyPct) * 12}
                name={'vaccancyLossAnnual_'}
                thousandSeparator={true}
                prefix={'$('}
                suffix={')'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />
            </td>

          </tr>

          <tr>
            <td>Gross Rental Income</td>
            <td>
              <NumberFormat
                value = {this.state.computedArrays.grossRentalIncome[0] }
                name={'griMonth_'}
                thousandSeparator={true}
                prefix={'$'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />
            </td>
            <td>
              <NumberFormat
                value = {this.state.computedArrays.grossRentalIncome[0] * 12}
                name={'griAnnual_'}
                thousandSeparator={true}
                prefix={'$'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />
            </td>
          </tr>

          <tr className="income-statement-exp-header">
            <td><h5>Expenses</h5></td>
            <td></td>
            <td></td>
            <td className="income-statement-title">Rate of Growth</td>
            <td onClick={handleAddExpense}>
                <Icon className={"hyper-tooltip"} icon={'add'} intent="success" iconSize={isIconSize} />
            </td>
          </tr>
          {expenseRowsVisual}

          <tr>
            <td>Property Management Expense</td>
            <td>
              <NumberFormat
                value = { (this.state.computedArrays.grossRentalIncome[1] * this.state.model.propertyManagerPercentageOfGrossRent) }
                name={'pmMonth'}
                thousandSeparator={true}
                prefix={'$'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />
            </td>

            <td>
              <NumberFormat
                value = { (this.state.computedArrays.grossRentalIncome[1] * this.state.model.propertyManagerPercentageOfGrossRent) * 12 }
                name={'pmYear'}
                thousandSeparator={true}
                prefix={'$'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />
            </td>

          </tr>

          <tr>
            <td>Net Operating Expenses</td>

            <td>
              <NumberFormat
                value = { this.state.computedArrays.netOperatingExpenses[0] }
                name={'noeMonth'}
                thousandSeparator={true}
                prefix={'$'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />
            </td>

            <td>
              <NumberFormat
                value = { this.state.computedArrays.netOperatingExpenses[0] * 12 }
                name={'noeAnn_'}
                thousandSeparator={true}
                prefix={'$'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />
            </td>

          </tr>

          <tr>
            <td>Net Operating Income</td>
            <td>
              <u>
                <NumberFormat
                  value = { this.state.computedArrays.netOperatingIncome[0]}
                  name={'noi_'}
                  thousandSeparator={true}
                  prefix={'$'}
                  defaultValue = {0}
                  fixedDecimalScale = {true}
                  decimalScale = {2}
                  displayType = {'text'}
                />
              </u>
            </td>

            <td>
              <u>
                <NumberFormat
                  value = { this.state.computedArrays.netOperatingIncome[0] * 12 }
                  name={'noiYear_'}
                  thousandSeparator={true}
                  prefix={'$'}
                  defaultValue = {0}
                  fixedDecimalScale = {true}
                  decimalScale = {2}
                  displayType = {'text'}
                />
              </u>
            </td>

          </tr>

          <tr>
            <td>Debt Service</td>
            <td>
              <NumberFormat
                value={Math.abs(this.getDebtServiceString())}
                thousandSeparator={true} prefix={'$('}
                suffix={')'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType={'text'}
              />
            </td>

            <td>
              <NumberFormat
                value={Math.abs(this.getDebtServiceString()*12)}
                thousandSeparator={true} prefix={'$('}
                suffix={')'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType={'text'}
              />
            </td>

          </tr>

          <tr style={cashflowRowStyle}>
            <td>Cashflow</td>
            <td>
              <NumberFormat
                value = { this.state.computedArrays.cashFlow[0] }
                name={'cashflow'}
                thousandSeparator={true}
                prefix={'$'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />
            </td>
            <td>
              <NumberFormat
                value = { this.state.computedArrays.cashFlow[0] * 12 }
                name={'cashflowYear'}
                thousandSeparator={true}
                prefix={'$'}
                defaultValue = {0}
                fixedDecimalScale = {true}
                decimalScale = {2}
                displayType = {'text'}
              />
            </td>
          </tr>

        </tbody>
        </table>
      </div>

      </React.Fragment>
    );
  }.bind(this);

  MetadataComponent = function(){
    return(
      <React.Fragment>
        <h1>metadata component</h1>
        <input type="text" value={this.state.model.name} onChange={(event) => {
            const value = event.target.value;

            this.setState((previousState) => {
              previousState.model.name = value;
              return({
                model: previousState.model
              })
            });

          }} />
      </React.Fragment>

    )
  }.bind(this);

  // update inputContainer values callback
  // check if this is neccesary
  updateParametersCallback = function(value, param){
    var updateIndividualParameter = function(param){
      this.setState((previousState) => {
        previousState.model[param] = value;
        return({
          model: previousState.model
        });
      }, this.computeEverything) ;
    }.bind(this)

    switch (param) {
      case 'purchasePrice':
        var workingComputedArrays = this.state.computedArrays;
        workingComputedArrays.propertyValue[0] = value;

        this.setState({
          computedArrays: workingComputedArrays
        }, () => {
          this.computeEverything();
        });
        break;
      case 'loanLengthYears':
        updateIndividualParameter('loanLengthYears');
        break;
      default:
        break;
    }
  }.bind(this);

  // updates parameter model
  updateParameter = function(parameter, value){
    this.setState((previousState)=>{
      previousState.model[parameter] = value;
      return({
        model: previousState.model
      });
    },this.computeEverything());
  }.bind(this);

  render(){
    return(
      <React.Fragment>

        <Navbar bg="light" variant="light">
          <Navbar.Brand href="">Real Estate Model</Navbar.Brand>
          <Nav className="mr-auto">
          </Nav>
        </Navbar>


        <section>

          <div className="app">
              <div className="app-row-1">
                <br />
                <InputContainer
                  className = "input-container container-padding-margin"
                  purchasePrice = {this.state.computedArrays.propertyValue[0]}
                  appModel = {this.state.model}
                  loanLengthYears = {this.state.model.loanLengthYears}
                  valueOfLand = {this.state.model.valueOfLand}
                  yearsOutComputation = {this.state.model.yearsOutComputation}
                  depreciateOver = {this.state.model.depreciateOver}
                  maxWriteoffPerYear = {this.state.model.maxWriteoffPerYear}

                  updateParametersCallback = {this.updateParametersCallback}
                  updateParameterCallback = {this.updateParameter}
                />

                <ChartContainer
                  className = "chart-container"
                  data={{
                    'propertyValue': this.state.computedArrays.propertyValue,
                    'stockMarketValue': this.state.computedArrays.valueOfStockMarketInvestment,
                  }}
                />
              </div>

              <div className="container-padding-margin">
                <h3>Key Metrics</h3>
                <div className="metrics-container">
                <Metric
                  value={(this.state.computedArrays.netOperatingIncome[1]*12) / this.state.computedArrays.propertyValue[1]}
                  label={'Cap Rate'}
                  hint={'NOI / Purchase Price'}
                  range={[0,10]}
                  colorProgression={['#721c24','#856404','#155724']}
                  highPositive={true}
                  prefix={''}
                  postfix={'%'}
                />

                <Metric
                  value={this.state.computedArrays.propertyValue[0] / (this.state.computedArrays.grossRentalIncome[0] * 12)}
                  label={'Gross Rent Multiplier'}
                  hint={'PP / GRI'}
                  range={[0,40]}
                  colorProgression={['#721c24','#856404','#155724']}
                  highPositive={false}
                  prefix={''}
                />

                <Metric
                  value={(this.state.computedArrays.cashFlow[0] * 12) / (this.state.computedArrays.propertyValue[0] * this.state.model.downPaymentPct)}
                  label={'Cash-On-Cash Return'}
                  hint={'pre-tax cash flow / cash invested (down payment)'}
                  range={[0,100]}
                  colorProgression={['#721c24','#856404','#155724']}
                  highPositive={true}
                  prefix={''}
                  postfix={'%'}
                />

                <Metric
                  value={((this.state.computedArrays.cashFlow[0] * 12) + (this.state.computedArrays.valueOfRealEstateInvestment[1] - this.state.computedArrays.valueOfRealEstateInvestment[0])  ) / (this.state.computedArrays.propertyValue[0] * this.state.model.downPaymentPct)}
                  label={'Cash-On-Cash Return, incl. Equity'}
                  hint={'pre-tax cash flow / cash invested (down payment)'}
                  range={[0,100]}
                  colorProgression={['#721c24','#856404','#155724']}
                  highPositive={true}
                  prefix={''}
                  postfix={'%'}
                />

                <Metric
                  value={this.state.computedArrays.cashFlow[0] * 12}
                  label={'First Year Cashflow'}
                  hint={'pre-tax cash flow / cash invested (down payment)'}
                  range={[0,0]}
                  colorProgression={['#721c24','#856404','#155724']}
                  highPositive={true}
                  prefix={'$'}
                />
            </div>
              </div>

          </div>

          <div className="app-row-2">
            <this.IncomeStatement />
          </div>

          <div className="container-padding-margin">
            <ProjectionTable
              computedArrays={this.state.computedArrays}
              nameMappings = {this.state.nameMappings}
            />
          </div>

        </section>

      </React.Fragment>
    )
  }
}
export default App;
