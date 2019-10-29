import React from 'react';

class Table extends React.Component {
  constructor(props){
    super(props);
    this.initialState = {
      computedArrays: props.computedArrays
    };
    this.state = this.initialState;
  }

  financialNum = (x) => {
    return Number.parseFloat(x).toFixed(2);
  }
  generateFinancialString = (x) => {
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

  render(){
    return(

      <table>
        <thead>
        <this.TableHead />
        </thead>
        <tbody>
          <this.TableBody />
        </tbody>

      </table>
    )
  }

}

export default Table
