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
    console.log('propsÚ: ', props);
    for (var i = 0; i < props.yearsOutComputation; i++) {
      console.log('loop: ', i);
      returnJSX.push(
        <tr key={i}>
          <td>{props.computedArrays.netOperatingExpenses[i]}</td>
          <td>hello</td>
        </tr>
      )
    }

    return(returnJSX);
  }.bind(this);

  render(){
    return(
      <this.RenderTable props={this.props} />
    )
  }

}

export default Table
