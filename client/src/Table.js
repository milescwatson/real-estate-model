import React from 'react';

/*
Props:
computedArrays
yearsOutComputation
*/


class Table extends React.Component {
  constructor(props){
    super(props);
    this.initialState = {
      computedArrays: props.computedArrays
    };
    this.state = this.initialState;
  }

  RenderTable = function(props) {
    var returnJSX = [];

    returnJSX.push(
      <tr>
        <th>Year</th>
        <th>Net Expenses</th>
      </tr>
    );

    for (var i = 0; i < this.props.yearsOutComputation; i++) {
      returnJSX.push(
        <tr key={i}>
          <td>{i}</td>
          <td>${parseFloat(this.props.computedArrays.netOperatingExpenses[i]).toLocaleString('en-us')}</td>
        </tr>
      )
    }

    return(returnJSX);
  }.bind(this);

  render(){
    return(
      <this.RenderTable />
    )
  }

}

export default Table
