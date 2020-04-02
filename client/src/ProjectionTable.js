import React from 'react';
import './include/css/universal.css';
import './include/css/projectionTable.css';
import './include/css/bootstrap.min.css';
import NumberFormat from 'react-number-format';
import { Form, Card } from 'react-bootstrap';

var _ = require('lodash');

// TODO: Validate year input if higher than
// TODO: Pass preferences back to app with callback
// TODO: Year input use correct input labeling, make less wide

class ProjectionTable extends React.Component{
  constructor(props){
    super(props);
    var defaultView = {
      'years': [1,2,3,4,5,10,20,30],
      'yearsString': "1,2,3,4,5,10,20,30",
      'attributes': ['propertyValue', 'grossRentalIncome', 'netOperatingExpenses', 'netOperatingIncome', 'paymentsAnnualized', 'cashFlow', 'depreciation', 'cashFlowIRS', 'valueOfRealEstateInvestment', 'valueOfStockMarketInvestment', 'remainingBalance',  'totalEquity', 'annualInterest']
    }

    var initialState = {
      selectedViews: [defaultView],
      rowsAsYears: true
    };

    this.state = initialState;
  }

  yearStringtoArray = function(){
    var isValidYears = function(strIn){
      if (strIn !== 'undefined') {
        var years = strIn.split(','),
            isValid = true;

        for (var i = 0; i < years.length; i++) {
          if (isNaN(years[i])) {
            isValid = false;
          }
          if (years[i] > 300) {
            // can't be greater than n years
            isValid = false;
          }
        }
        return isValid
      }
    };

    if (isValidYears(this.state.selectedViews[0].yearsString) && (this.state.selectedViews[0].yearsString.length) > 0) {
      var yearArray = this.state.selectedViews[0].yearsString.split(',');
      this.setState((workingState) => {
        workingState.selectedViews[0].years = yearArray;
        return(workingState);
      });
    }
  }.bind(this);


  attributeExists = (attribute) => {
    //Check if the attribute is currently selected
    var exists = false;
    _.each(this.state.selectedViews[0]['attributes'], (value, key) => {
      if (value === attribute){
        exists = true;
      }
    });
    return exists;
  };

  GenerateTable = function(data){
    var tableVis = []; // a bunch of trs

    //generate table head
    var theadrow = [];

    if(this.state.selectedViews[0]['attributes'].length > 0){
      theadrow.push(
        <th key={1000}>
          Year
        </th>
      );
    }

    for (var header = 0; header < this.state.selectedViews[0].attributes.length ; header++){
      theadrow.push(
        <th key={'header_'+header}>
          {this.props.nameMappings[this.state.selectedViews[0].attributes[header]]}
        </th>
      )
    }
    var tableHeader = <tr>{theadrow}</tr>

    for (var row = 0; row < this.state.selectedViews[0].years.length; row++) {
      var rowItems = [];
      // var yearValue =
      if(this.state.selectedViews[0]['attributes'].length > 0){
        rowItems.push(
          <td key={'row_'+row}>
            {this.state.selectedViews[0]['years'][row]}
          </td>
        );
      }

      for (var col = 0; col < this.state.selectedViews[0].attributes.length; col++) {

        var iAttr = this.state.selectedViews[0].attributes[col];
        // console.log('attr, row', iAttr, row);
        // console.log(this.props.computedArrays[iAttr][row]);
        var tdStyle = {};

        if(iAttr === 'cashFlow'){
          if(this.props.computedArrays[iAttr][(this.state.selectedViews[0]['years'][row])] > 0){
            tdStyle = {
              'backgroundColor': 'lightgreen'
            }
          }else {
            tdStyle = {
              'backgroundColor': 'indianred'
            }
          }
        }

        rowItems.push(
          <td key={col} style ={tdStyle} >
            <NumberFormat
              value = { this.props.computedArrays[iAttr][(this.state.selectedViews[0]['years'][row])] }
              name={iAttr}
              thousandSeparator={true}
              prefix={'$'}
              defaultValue = {0}
              fixedDecimalScale = {true}
              decimalScale = {2}
              displayType = {'text'}
            />
          </td>
        );
      }
      var finalRow = <tr key={col+','+row}>{rowItems}</tr>
      tableVis.push(finalRow);
    }

    return(
      <React.Fragment>
        <div className="projections-table-container">
          <table className="table table-hover table-bordered">
            <tbody>
              {tableHeader}
              {tableVis}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    )
  }.bind(this);

  handleRowYearChange = function(){
    this.setState({
      rowsAsYears: !this.state.rowsAsYears
    })
  }.bind(this);

  handleAttributeSelection = function(attribute) {
    if (this.attributeExists(attribute)){
      this.setState((workingState) => {
        workingState.selectedViews[0]['attributes'] = _.without(workingState.selectedViews[0]['attributes'], attribute);
        return(workingState);
      });
    }else{
      // attribute does not exist
      this.setState((workingState) => {
        workingState.selectedViews[0]['attributes'].push(attribute);
        return(workingState);
      });
    }

  }.bind(this);

  Settings = function(){
    var componentCheckboxesVisual = []; // final collection of rows
    var rowStorage = []; // temp collection of tds
    var counter = 0;
    Object.keys(this.props.computedArrays).forEach((key,index) => {
      rowStorage.push(
        <React.Fragment key={index}>

          <Form.Check
            key={index}
            checked={this.attributeExists(key)}
            type={'checkbox'}
            id={key}
            label={this.props.nameMappings[key]}
            onChange={(synthEvent) => {
              this.handleAttributeSelection(key);
            }}
          />

        </React.Fragment>

      );
      counter++;

      if(counter === 4){
        componentCheckboxesVisual.push(
          <td key={index}>
            {rowStorage}
          </td>
        );
        rowStorage = [];
        counter = 0;
      }
    });
    componentCheckboxesVisual.push(rowStorage);

    return(
      <React.Fragment>
        <Card>
          <Card.Header as="h5">Projection Table Settings</Card.Header>
          <Card.Body>
              <h6>Attributes</h6>
              <table className="settings-table">
                <tbody>
                <tr>
                  {componentCheckboxesVisual}
                </tr>
                </tbody>
              </table>
              <this.Years />
          </Card.Body>
        </Card>
      </React.Fragment>
    )
  }.bind(this);

  Years = function(){
    var validationClassname = "";
    // validationClassname = isValidYears(this.state.selectedViews[0].yearString) ? "" : "bp3-intent-danger"

    return(
      <React.Fragment>
        <div className={"bp3-input-group " + validationClassname + ' years-input'}>
        Years:  <input type="text" className={"bp3-input"} value={this.state.selectedViews[0].yearsString} onChange={(event)=>{
            var val = event.target.value;
            this.setState((workingState) => {
              workingState.selectedViews[0].yearsString = val;
              return(workingState);
            }, ()=> {
              this.yearStringtoArray();
            });
          }} />
        </div>
      </React.Fragment>
    )
  }.bind(this);

  render() {
    return(
      <React.Fragment>
          <h3>Financial Projections</h3>
          <this.Settings />
          <this.GenerateTable />
      </React.Fragment>
    )
  }
}

export default ProjectionTable;
