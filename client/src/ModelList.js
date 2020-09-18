import React, { useState, useEffect } from 'react';
import moment from 'moment';
import App from './App';
import './include/css/universal.css';
import './include/css/modelList.css';
import { Icon } from "@blueprintjs/core";
import NumberFormat from 'react-number-format';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

var _ = require('lodash');
var reIcon = require('./include/media/real-estate-1.svg');
var now = moment();

var isIconSize = 18;
// new models are generated from this
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
    title: now.format('M/D') + ' untitled model',
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

    this.initialState = {
      syncRequired: false
    }
    this.state = this.initialState;
  }

  componentDidMount = function(){
    this.syncDown();
  }.bind(this);

  componentDidUpdate = function(){
    console.log('componentDidUpdate');

    if(this.state.syncRequired){
      console.log('syncRequired = true');
      this.syncDown();
    }
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
      fetch('/get-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(toSend),
      })
      .then(response => response.json())
      .then((ids) => {
        callback(false, ids)
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
    // TODO: remove callback
    this.getIdentificationCookieAndData(function(isNewUser, retrievedUserIDs){
      if(!isNewUser){
        this.setState({
          userModelIDs: retrievedUserIDs,
          syncRequired: false
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
      this.setState({
        syncRequired: true
      });
      // put the new model in state
    }).catch((error) => {
      alert('Could not delete model, check your internet connection.');
    })
  }

  addModel = function(){
    // TODO: Make not template
    const toSend = {
      modelJSON: templateModel,
      userIDHash: this.getUserIDHash()
    };
    var thisBind = this;
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
    .then(function(response){
      // GenerateModelItems
      thisBind.setState({
        syncRequired: true
      })
    })
    .catch((error) => {
      alert('Could not create a new model, check your internet connection.');
    })
  }.bind(this)

  handleSelectionChange = function(id){
    console.log('handleSelectionChange');
  }

  ModelItem = function(props){
    const [summary, setSummary] = useState({});

    const toSend = {
      userIDHash: this.getUserIDHash(),
      modelID: props.id
    };

    var fetchSummaryData = function(){
      fetch('/get-summary-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(toSend)
      })
      .then(function(response){
        return response.json()
      })
      .then((response) => {
        var responseS = response.summaryData;


        setSummary({
          title: responseS.title,
          capRate: responseS.capRate,
          cashOnCashReturn: responseS.cashOnCashReturn,
          createdDateTime: responseS.createdDateTime,
          fyCashflow: responseS.fyCashflow,
          grm: responseS.grm,
        });

      }).catch((error) => {
        console.log('Unable to get summary data');
      });
    }
    useEffect(fetchSummaryData, [props.id]);

    var style = {
    }
    const selectedModelID = parseInt(document.location.pathname.split('/')[document.location.pathname.split('/').length-1]);

    if(selectedModelID === parseInt(props.id)){
      style={
        'backgroundColor': 'lightgray',
      }
    }
    var blankLink = React.forwardRef((props, ref) => (
      <a className="link-noblue" ref={ref} href={props.href}>{props.children}</a>
    ))

    return(
      <React.Fragment>
        <Router>
          <Link
            to={'/model/'+props.id}
            component={blankLink}
          >
            <div style={style} className="model-item">
              <table id="model-and-delete">
                <tbody>
                <tr>
                <td className={'pointer'} className="linkToApp" onClick={()=> {this.handleSelectionChange(props.id)}}>
                  <b>{summary.title}</b>
                  <br />
                  <p>Created {moment(summary.datetime).format('M/D, h:mma')}</p>
                  <br />
                  <p><b>Cap Rate: </b>{(summary.capRate)}</p>
                  <br />
                  <p><b>GRM: </b>{(summary.grm)}</p>
                </td>
                <td>
                  <Icon className={'hyperlink'} icon={'small-cross'} intent="danger" onClick={() => {this.deleteModel(props.id)}} />
                </td>

              </tr>
              </tbody>
              </table>
            </div>
          </Link>
        </Router>
      </React.Fragment>
    )
  }.bind(this)

  GenerateModelItems = function(){
    var visualModels = [];
    _.each(this.state.userModelIDs, (id, key) => {
      visualModels.push(
          <this.ModelItem
            key={key}
            id={id}
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
      <div className="sidebar containerNB">
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
    var selectedModelID = window.location.pathname.split('/')[2];

    if(!selectedModelID){
      return(
        <React.Fragment>
          <div className="welcome-text">
            <h3>Welcome to Real Estate Model! <br /> Select a model, or <a href="#" onClick={this.addModel}>Create One</a></h3>

            <br />
            <br />
            <br />
            <h5>Tips</h5>
            <ul>
              <li>Your saved models are saved with a cookie in your browser. To permanently save a model, copy it's link.</li>
              <li>To share a model, simple copy the URL. Anyone with the link will be able to edit it.</li>
            </ul>

          </div>

        </React.Fragment>
      )
    }else {
      return(
        <>
          <App
            modelID={window.location.pathname.split('/')[2]}
            userHash={this.getUserIDHash()}
          />
        </>
      )
    }
  }.bind(this);

  render(){
    return(
      <React.Fragment>
        <Router>
          <this.SideBar />
          <this.RenderApp />
        </Router>
      </React.Fragment>
    )
  }
}

export default ModelList;
