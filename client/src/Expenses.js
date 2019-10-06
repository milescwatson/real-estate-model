import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/units.css';
import ReactNumeric from 'react-numeric';
import { predefinedOptions } from 'react-numeric';

// style
var addUnitButtonStyle = {
  float: 'right'
}

class Expenses extends React.Component{
  constructor(props){
    super(props);
    this.initialState = {
      model: {
        expenses: {
        }
      }
    }
    this.initialState.model.expenses = this.props.initialExpenses;
    this.state = this.initialState;
  }

  GenerateInputTable = function(props){
    return(
    <React.Fragment>
      <div className="units-container">
      <table>
        <tbody>
          <tr>
            <th><h4>{this.props.name}</h4></th>
            <td></td>
            <td><button className='btn btn-outline-primary' style={addUnitButtonStyle} onClick={this.handleAddExpense}>Add Expense</button></td>
          </tr>
          <tr>
            <th>Title</th>
            <th>Monthly</th>
            <th>Annual</th>
            <th>Growth Per Year</th>
          </tr>
          <this.GenerateExpenseRows />
          <this.GenerateBottomLine />

        </tbody>
      </table>
      </div>
    </React.Fragment>
    );
  }.bind(this);

  GenerateBottomLine = function(){
    var sum = 0;

    Object.keys(this.state.model.expenses).forEach((id) => {
      sum += this.state.model.expenses[id].amount;
    });

    return(
      //TODO: Add vaccaancy loss
      <tr className = "bottomLine">
        <td><b>Net Operating Expenses</b></td>
        <td>${sum.toLocaleString('en-us')}</td>
        <td>${(sum*12).toLocaleString('en-us')}</td>
      </tr>

    )

  }.bind(this);

  handleEditExpense = function(event, value){
    var input = event.target.name.split('_'),
        name = input[0],
        id = input[1],
        workingModel = this.state.model;

    switch (name) {
      case 'amountMonthly':
        workingModel.expenses[id].amount = value;
        workingModel.expenses[id].amountYearly = value * 12;
        break;
      case 'amountYearly':
        workingModel.expenses[id].amountYearly =  value;
        workingModel.expenses[id].amount = value / 12;
        break;
      case 'yrg':
        workingModel.expenses[id].yrg = value;
        break;
    }

    this.setState({
      model: workingModel
    });

  }.bind(this);

  handleAddExpense = function(){
    var workingModel = this.state.model,
        numUnits = Object.keys(this.state.model.expenses).length;

    var counter = 0;
    for (var key in this.state.model.expenses){
      if (parseInt(key) > counter){
        counter = key;
      }
    }
    workingModel.expenses[key+1] = {};
    workingModel.expenses[key+1].name = 'Expense ' + Object.keys(this.state.model.expenses).length.toString();
    workingModel.expenses[key+1].amount = 0;

    this.setState({
      model: workingModel
    });
  }.bind(this);

  GenerateExpenseRows = function(props){
    var unitRowsVisual = [],
        count = Object.keys(this.state.model.expenses).length;

    Object.keys(this.state.model.expenses).forEach((id) => {
      if(typeof(this.state.model.expenses[id].amount) !== 'undefined'){
        unitRowsVisual.push(
          <tr key={count}>
            <td><input type="text" value={this.state.model.expenses[id].name} name={'name_' + id} onChange ={this.handleEditExpense} /> </td>

            <td>
              <ReactNumeric
                name={'amountMonthly_' + id}
                value={this.state.model.expenses[id].amount}
                currencySymbol="$"
                minimumValue="0"
                maximumValue="10000000"
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={this.handleEditExpense}
              />
            </td>

            <td>
              <ReactNumeric
                name={'amountYearly_' + id}
                value={this.state.model.expenses[id].amountYearly}
                currencySymbol="$"
                minimumValue="0"
                maximumValue="10000000"
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={this.handleEditExpense}
              />
            </td>

            <td>
              <ReactNumeric
                name={'yrg_'+id}
                value={this.state.model.expenses[id].yrg * .01}
                preDefined={predefinedOptions.percentageUS2dec}
                onChange={this.handleEditExpense}
              />
            </td>

          </tr>);
          count++;
        }
    });
    return(unitRowsVisual);
  }.bind(this);

  render(){
    return(
      <this.GenerateInputTable />
    )
  }
}

export default Expenses;
