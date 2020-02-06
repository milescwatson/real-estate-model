import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/table.css';
import './include/css/universal.css';

import { Tab, Tabs } from "@blueprintjs/core";

class Table extends React.Component {
  constructor(props){
    super(props);
    this.initialState = {
      computedArrays: props.computedArrays,
      selectedView: 'advanced-table'
    };
    this.state = this.initialState;
  }

  financialNum = (x) => {
    return Number.parseFloat(x).toFixed(2);
  }
  generateFinancialString = (x) => {
    // return x;
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  TableHead = function(props){
    var returnJSX = [];

    this.props.userViews[this.props.userViews.selectedView].forEach((item) => {
        returnJSX.push(<th key={item} >{item}</th>)
    });

    var toReturn =<tr>{returnJSX}</tr>;

    return(toReturn);

  }.bind(this);

  TableBody = function(props){
    var returnJSX = [];

    for (var year = 0; year <= this.props.yearsOutComputation; year++) {

        var GenerateRow = function(props){
          var rowTDs = [];

          this.props.userViews[this.props.userViews.selectedView].forEach((item) => {
            if(item === 'year'){
              rowTDs.push(<td key={item}>{props.year}</td>);
            }else{
              if(typeof(this.state.computedArrays[item][props.year]) === 'undefined'){
                rowTDs.push(<td key={item}>$0.00</td>);
              }else{
                rowTDs.push( <td key={item}>${this.generateFinancialString(this.financialNum(this.state.computedArrays[item][props.year]))} </td>);
              }
            }
          });
          return(rowTDs);
        }.bind(this);

        returnJSX.push(
          <tr key={year}>
            <GenerateRow year={year} key={year} />
          </tr>
        );
    }
    return(returnJSX);
  }.bind(this);

  CombinedTable = function(props){
    return(
      <React.Fragment>
        <br />
        <table className="table table-hover table-sm table-responsive">
          <thead>
          <this.TableHead />
          </thead>
          <tbody>
            <this.TableBody />
          </tbody>
        </table>
      </React.Fragment>
    )
  }.bind(this);

  SimpleTable = function(props){
    return(
      <h4>Simple Table</h4>
    )
  }

  render(){
    return(
      <React.Fragment>
        <div className = "table-container">
          <Tabs animate="true" large={true} id="TabsExample" onChange={this.handleTabChange} selectedTabId={this.state.currentView}>
            <Tab id="advanced-table" title="Advanced Table" panel={<this.CombinedTable />} />
            <Tab id="simple-table" title="Simple Table" panel={<this.SimpleTable />} />
          </Tabs>
        </div>
      </React.Fragment>
    )
  }

}

export default Table
