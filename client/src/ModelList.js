import React from 'react';
// import moment from 'moment';
import App from './App';
import './include/css/universal.css';
import './include/css/modelList.css';
import { Icon } from "@blueprintjs/core";
import NumberFormat from 'react-number-format';
// <NumberFormat
//   value={value}
//   thousandSeparator={true}
//   defaultValue = {0}
//   fixedDecimalScale = {true}
//   decimalScale = {2}
//   displayType={'text'}
// />
var _ = require('lodash');
var reIcon = require('./include/media/real-estate-1.svg');

var isIconSize = 18;
var templateModel = {
  model : {
    rentYRG: 0.02,
    appreciationYRG: 0.015,
    units: {
      1: {
        name: 'Unit 1',
        rentPerMonth: 2200.00,
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
    title: 'template model #1',
    isSaved: false
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
    cashFlow: "Cashflow (M)",
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
}

class ModelList extends React.Component{
  constructor(props){
    super(props);
    var summaryDataTemplate = {
      grm: '...',
      capRate: '...',
      cashOnCashReturn: '...',
      fyCashflow: '...'
    }

    this.initialState = {
      userModels: {},
      selectedModel: null,
      summaryData: summaryDataTemplate
    }
    this.state = this.initialState;
  }

  componentDidMount = function(){
    this.syncDown();
  }
  getSummaryDataCallback = function(summaryData){
    this.setState((workingState) => {
      workingState.summaryData = summaryData;
      return(workingState);
    });
  }.bind(this);

  getUserIDHash = function(){
    var cookies = document.cookie.split(';');
    var userIDHash = null;
    _.each(cookies, function(cookie, key){
      const cookieNoSpaces = cookie.replace(/\s+/g, '');
      if(cookieNoSpaces.substr(0,11) === 'rem_user_id'){
        userIDHash = cookieNoSpaces.substr(cookieNoSpaces.indexOf('=')+1);
      }
    });
    return(userIDHash)
  }

  getIdentificationCookieAndData = function(callback){
    var userIDHash = this.getUserIDHash();

    if(userIDHash !== null){
      const toSend = {
        userIDHash: userIDHash,
      }
      fetch('/get-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(toSend),
      })
      .then(response => response.json())
      .then((userModels) => {
        callback(false, userModels)
      })
    }else{
      console.log('getting new cookie');
      var toSend = {
        userIDHash: null
      }
      // get a userIDHash
      fetch('/get-identifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(toSend),
      })
      .then(response => response.json())
      .then((data) => {
        const cookie = 'rem_user_id='+data.userIDHash;
        document.cookie = cookie;
        callback(true);
      })
    }
  }

  syncDown = function(){
    this.getIdentificationCookieAndData(function(isNewUser, retrievedUserData){
      if(!isNewUser){
        this.setState({
          userModels: retrievedUserData,
        });
      }
    }.bind(this));

  }.bind(this)

  deleteModel = function(modelID){
    const toSend = {
      id: modelID,
      userIDHash: this.getUserIDHash()
    }

    fetch('/delete-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toSend),
    })
    .then(function(response){
      return response.json()
    })
    .then((response) => {
      if(response !== 1){
        //error
      }

      this.setState((workingState) => {
        delete workingState.userModels[modelID];
        return(workingState);
      })
      // put the new model in state
    }).catch((error) => {
      alert('Could not delete model, check your internet connection.');
    })
  }

  addModel = function(){
    // TODO: Make not template
    console.log('addModel');

    const toSend = {
      modelJSON: templateModel,
      userIDHash: this.getUserIDHash()
    };

    fetch('/create-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toSend),
    })
    .then(function(response){
      return response.json()
    })
    .then((response) => {
      var iterator = parseInt(response.iterator);
      this.setState((workingState) => {
        workingState.userModels[iterator] = toSend.modelJSON;
        workingState.selectedModel = iterator;
        return(workingState);
      })
      // put the new model in state
    }).catch((error) => {
      alert('Could not create a new model, check your internet connection.');
    })
  }.bind(this)

  handleSelectionChange = function(id){
    this.setState({
      selectedModel: null
    }, () => {
      this.setState({
        selectedModel: parseInt(id)
      });
    })
  }

  ModelItem = function(props){
    var style = {
    }

    if(this.state.selectedModel === parseInt(props.id)){
      style={
        'backgroundColor': 'lightgray',
      }
    }

    return(
      <React.Fragment>

              <div style={style} className="model-item" onClick={()=> {this.handleSelectionChange(props.id)}}>
                <table id="model-and-delete">
                  <tbody>
                  <tr>
                  <td className={'pointer'}>
                    <b>{props.title}</b>
                    <br />
                    <p>Just another real estate model</p>
                    <br />
                    <p>{props.datetime}</p>
                    <br />
                    <p><b>Cap Rate: </b>{(this.state.summaryData.capRate)}</p>

                    <br />
                    <p><b>GRM: </b>{(this.state.summaryData.grm)}</p>

                  </td>


                  <td>
                    <Icon className={'hyperlink'} icon={'small-cross'} intent="danger" onClick={() => {this.deleteModel(props.id)}} />
                  </td>

                </tr>
                </tbody>
                </table>
              </div>

      </React.Fragment>
    )
  }.bind(this)

  GenerateModelItems = function(){
    var visualModels = [];
    _.each(this.state.userModels, (model, key) => {
      visualModels.push(
          <this.ModelItem
            key={key}
            id={key}
            title={model.metadata.title}
            datetime={model.metadata.createdDateTime}
          />
      )
    });
    return(visualModels);
  }.bind(this);

  SideBar = function(){
    var tableStyle = {
      width: '100%'
    }
    var titleStyle = {
      'marginLeft': '4%'
    }
    var iconStyle = {
      'verticalAlign': 'text-bottom'
    }

    return(
      <div className="sidebar container">
        <img style={iconStyle} src={reIcon} alt="skyscrapers icon" width="36px" />
        <h3 style={titleStyle}>Real Estate Model</h3>
        <hr />
        <table style={tableStyle}>
          <tbody>
          <tr>
            <td>
              <h4 style={titleStyle}>Saved Models</h4>
            </td>
            <td>
              <Icon className={'hyper-tooltip'} icon={'add'} intent="success" iconSize={isIconSize} onClick={() => {this.addModel()}} />
            </td>
          </tr>
          </tbody>
        </table>
        <this.GenerateModelItems />
      </div>
    )
  }.bind(this)

  RenderApp = function(){
    if(this.state.selectedModel === null || ((Object.keys(this.state.userModels)).length === 0)){
      return(
        <React.Fragment>
          <div className="welcome-text">
            <h3>Welcome to Real Estate Model! <br /> Select a model, or <a href="#" onClick={this.addModel}>Create One</a></h3>
          </div>

        </React.Fragment>
      )
    }else {
      return(
        <App
          modelID={this.state.selectedModel}
          userHash={this.getUserIDHash()}
          getSummaryDataCallback={this.getSummaryDataCallback}
        />
      )
    }
  }.bind(this);

  render(){
    return(
      <React.Fragment>
        <this.SideBar />
        <this.RenderApp />
      </React.Fragment>
    )
  }
}

export default ModelList;
