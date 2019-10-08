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
        <tr>
          <th><h4>{this.props.name}</h4></th>
          <td></td>
          <td><button className='btn btn-outline-primary' style={addUnitButtonStyle} onClick={this.handleAddExpense}>Add Expense</button></td>
        </tr>
        <tr>
          <th>Expense Label</th>
          <th></th>
          <th></th>
          <th>Expected Annual Growth</th>
        </tr>
        <this.GenerateExpenseRows />
        <this.GenerateBottomLine />
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
      case 'expenseName':
        workingModel.expenses[id].name = event.target.value;
        break;
      default:
        alert('unhandled switch statement error for value: ', value);
        break;
    }

    this.setState({
      model: workingModel
    }, () => {
      this.props.updateExpensesInParent(this.state.model.expenses);
    });

  }.bind(this);

  handleAddExpense = function(){
    var workingModel = this.state.model,
        counter = 0;

    for (var key in this.state.model.expenses){
      if (parseInt(key) > counter){
        counter = parseInt(key);
      }
    }
    key++;

    workingModel.expenses[key] = {};
    workingModel.expenses[key].name = 'Expense ' + Object.keys(this.state.model.expenses).length.toString();
    workingModel.expenses[key].amount = 0;

    workingModel.expenses[key].yrg = .02;
    workingModel.expenses[key].amountYearly = 0;

    this.setState({
      model: workingModel
    }, () => {
      this.props.updateExpensesInParent(this.state.model.expenses);
    });

  }.bind(this);

  handleDeleteRow = function(id){
    var workingModel = this.state.model;
    delete workingModel.expenses[id];

    this.setState({
      model: workingModel
    }, () => {
      this.props.updateExpensesInParent(this.state.model.expenses);
    });

  }.bind(this);

  GenerateExpenseRows = function(props){
    var unitRowsVisual = [],
        count = Object.keys(this.state.model.expenses).length;

    Object.keys(this.state.model.expenses).forEach((id) => {
      if(typeof(this.state.model.expenses[id].amount) !== 'undefined'){
        unitRowsVisual.push(
          <tr key={count}>
            <td><input type="text" value={this.state.model.expenses[id].name} name={'expenseName_' + id} onChange ={this.handleEditExpense} /> </td>

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
                maximumValue="120000000"
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={this.handleEditExpense}
              />
            </td>

            <td>
              <ReactNumeric
                name={'yrg_'+id}
                value={this.state.model.expenses[id].yrg}
                preDefined={predefinedOptions.percentageUS2dec}
                onChange={this.handleEditExpense}
              />
            </td>

            <td onClick={() => {this.handleDeleteRow(id)}}>
              x
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
