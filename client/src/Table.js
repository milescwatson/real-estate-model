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

    for (var year = 0; year < this.props.yearsOutComputation; year++) {
        // console.log('year = ', year);
        // var GenerateRow = function(){
        //   var rowTDs = [];
        //   this.props.userViews[this.props.userViews.selectedView].forEach( (item) => {
        //     if(item === 'year'){
        //       rowTDs.push(<td>{year}</td>);
        //     }else{
        //       rowTDs.push(<td>not year</td>);
        //     }
        //
        //   });
        //   return(
        //   <React.Fragment>
        //     {rowTDs}
        //   </React.Fragment>
        // )
        // }.bind(this);

        var GenerateRow = function(props){
          var rowTDs = [];

          this.props.userViews[this.props.userViews.selectedView].forEach((item) => {
            if(item === 'year'){
              rowTDs.push(<td key={item}>{props.year}</td>);
            }else{
              // rowTDs.push(<td>{item} + {props.year}</td>);
              if(typeof(this.state.computedArrays[item][props.year]) === 'undefined'){
                rowTDs.push(<td key={item}>$0.00</td>);
              }else{
                rowTDs.push( <td key={item}>${this.financialNum(this.state.computedArrays[item][props.year])} </td>);
              }
            }

            // rowTDs.push(<td>{props.year}</td>);
            // console.log('<---------------------------------->');
            // Object.keys(this.state.computedArrays).forEach((item) => {
            //   if(typeof(this.state.computedArrays[item][year]) === 'undefined'){
            //     rowTDs.push(<td>'undefined'</td>);
            //   }else{
            //     rowTDs.push(<td>{this.state.computedArrays[item][year]}</td>);
            //   }
            // });
            // console.log('<---------------------------------->');
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

  // RenderTable = function(props) {
  //   var returnJSX = [];
  //   // returnJSX.push(<tr>);
  //   // console.log('target', this.props.userViews[this.props.userViews.selectedView]);
  //
  //   returnJSX.push(
  //                 <thead>
  //                   <th>Year</th>
  //                   <React.Fragment>
  //             );
  //
  //   this.props.userViews[this.props.userViews.selectedView].forEach((item) => {
  //     returnJSX.push(<td>{item}</td>)
  //   });
  //
  //   for (var i = 0; i < this.props.yearsOutComputation; i++) {
  //     returnJSX.push(
  //       <tr key={i}>
  //         <td>{i}</td>
  //         <td>${parseFloat(this.props.computedArrays.netOperatingExpenses[i]).toLocaleString('en-us')}</td>
  //       </tr>
  //     )
  //   }
  //
  //   return(returnJSX);
  // }.bind(this);

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
