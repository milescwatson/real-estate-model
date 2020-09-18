/*
Add an "add to my models" button, if user is not the owner
Fix undefined model error
*/

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
import MetadataComponent from './MetadataComponent';
import Spinner from 'react-bootstrap/Spinner'

var _ = require('lodash');
var nameMappings = require('./include/nameMappings.js');

var isIconSize = 22;

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      _isLoaded: false,
      _isMounted: true,
      _modelExists: true
    };
  };

  componentDidMount = function(){
    this.syncDown((error, modelState) => {
      if(error){
        // model does not exist
        this.setState({
          _modelExists: false
        });
      }else{
        this.setState((workingState)=>{
          workingState = JSON.parse(modelState);
          workingState._isLoaded = true;
          return(workingState);
        }, ()=> {
          this.computeEverything();
        })
      }
    })
  };

  componentDidUpdate = function(prevProps, prevState, snapshot){
    this.syncUp();
  }

  syncDown = function(callback){
    // get id from url
    const modelID = document.location.pathname.split('/')[document.location.pathname.split('/').length-1];

    const userHash = this.props.userHash;
    const toSend = {
      userIDHash: userHash,
      modelID: modelID
    }

    fetch('/get-user-data-single', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toSend),
    })
    .then(response => response.json())
    .then((serverObject) => {
      // if(serverObject.status)
      if(serverObject.status === 'error'){
        callback(true, null);
      }else{
        var newModel = JSON.parse(serverObject.model);
        newModel.metadata.id = parseInt(serverObject.id);
        newModel.metadata.createdDateTime = serverObject.createdDateTime;
        callback(null, serverObject.model)
      }

    })
  }

  syncUp = function(){
    // syncs up a single model
    const modelID = document.location.pathname.split('/')[document.location.pathname.split('/').length-1];
    if(this.state._isLoaded){
      const userHash = this.props.userHash;
      const toSend = {
        modelID: modelID,
        modelJSON: this.state
      }

      fetch('/edit-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(toSend),
      })
      .then(response => response.json())
      .then((serverResponse) => {
        // var newModel = JSON.parse(serverObject.model);
        // newModel.metadata.id = parseInt(serverObject.id);
        // newModel.metadata.createdDateTime = serverObject.createdDateTime;
        // callback(JSON.parse(serverObject.model))
        console.log('serverResponse = ', serverResponse);
      })
    }
  }

  financialNum = function(x){
    return Number.parseFloat(x).toFixed(2);
  };

  computeAllCompoundInterestArrays = () => {
    compute.asyncComputeArraysIncomeStatement(this.state.model, this.state.computedArrays, (error, result) => {
      this.setState({
        computedArrays: result
      })
    });
  };

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

    var incomeStatementTitleStyle = {
      display: 'inline'
    }

    return(
      <React.Fragment>
        <div className="is-container container-padding-margin">
        <Icon icon={'dollar'} intent="primary" iconSize={24} />

        <h3 style={incomeStatementTitleStyle}>  Income Statement</h3>

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
  updateParameter = function(parameter, value, isMetadataValue){
    if(isMetadataValue){
      this.setState((previousState)=>{
        previousState.metadata[parameter] = value;
        return({
          model: previousState.model
        });
      });
    }else{
      this.setState((previousState)=>{
        previousState.model[parameter] = value;
        return({
          model: previousState.model
        });
      },this.computeEverything());
    }
  }.bind(this);

  render(){
    if(this.state._isLoaded){
      return(
        <React.Fragment>
          <section id="app-sections">
            <MetadataComponent
              updateParentParameter = {(parameter, value) => {
                console.log('updating title: ', parameter, value);
                this.updateParameter(parameter, value, true);
              }}
              title = {this.state.metadata.title}
            />
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
                    yearsOutComputation = {this.state.model.yearsOutComputation}
                    data={{
                      'cumEquity': this.state.computedArrays.totalEquity,
                      'stockMarketValue': this.state.computedArrays.valueOfStockMarketInvestment,
                      'cashFlow': this.state.computedArrays.cashFlow,
                    }}
                    amortization={{
                      'cumEquity': this.state.computedArrays.totalEquity,
                      'cumInterest': this.state.computedArrays.cumInterest,
                      'cumPrincipal': this.state.computedArrays.cumPrincipal
                    }}
                  />
                </div>

                <div className="container-padding-margin">
                  <h3>Key Metrics</h3>
                  <div className="metrics-container">
                  <Metric
                    value={(this.state.computedArrays.netOperatingIncome[0]*12) / this.state.computedArrays.propertyValue[0]}
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
                    value={(this.state.computedArrays.cashFlow[0])*12 / (this.state.computedArrays.propertyValue[0] * this.state.model.downPaymentPct)}
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
                nameMappings = {nameMappings.nameMappings}
                yearsOutComputation = {this.state.model.yearsOutComputation}
              />
            </div>

          </section>
        </React.Fragment>
      )
    }else if(!this.state._modelExists){
      return(
        <section id="app-sections">
          <div className="app">
            <h4>Error: Model does not exist.</h4>
          </div>
        </section>
      )
    }else{
      return(
        <section id="app-sections">
          <div className="app">
            <h4>Model loading...</h4><Spinner animation="grow" variant="success" />
          </div>
        </section>
      )
    }

  }
}
export default App;
