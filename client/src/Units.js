import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/units.css';
import ReactNumeric from 'react-numeric';

// style
var addUnitButtonStyle = {
  float: 'right'
}

class UnitsBox extends React.Component{
  constructor(props){
    super(props);
    this.initialState = {
      model: {
        unitsPerMonth: {

        }
      }
    }
    this.initialState.model.unitsPerMonth = this.props.initialUnits;
    this.state = this.initialState;
  }

  GenerateInputTable = function(props){
    return(
    <React.Fragment>
          <tr>
            <th><h4>{this.props.name}</h4></th>
            <td></td>
            <td></td>
            <td><button className='btn btn-outline-primary' style={addUnitButtonStyle} onClick={this.handleAddUnit}>Add Unit</button></td>
          </tr>
          <tr>
            <th>Unit Name</th>
          </tr>
          <this.GenerateUnitRows />
    </React.Fragment>
    );
  }.bind(this);

  handleDeleteRow = function(id){
    var workingModel = this.state.model;
    delete workingModel.unitsPerMonth[id];

    this.setState({
      model: workingModel
    }, () => {
      this.props.updateUnitsInParent(this.state.model.unitsPerMonth);
    });

  }.bind(this);

  handleEditUnit = function(event, value){
    var input = event.target.name.split('_'),
        name = input[0],
        id = input[1],
        workingModel = this.state.model;

    switch (name) {
      case 'amount':
        // if (value < 10000000) {
          workingModel.unitsPerMonth[id].amount = value;
          workingModel.unitsPerMonth[id].amountYearly = value * 12;
        // }else{
          //TODO: Better alert
        // }
        break;
      case 'amountYearly':
        workingModel.unitsPerMonth[id].amountYearly =  value;
        workingModel.unitsPerMonth[id].amount = value / 12;
        break;
      case 'unitName':
        workingModel.unitsPerMonth[id].name =  event.target.value;
        break;
      default:
        alert('unhandled switch statement error for value: ', value);
        break;
    }

    this.setState({
      model: workingModel
    }, () => {
      this.props.updateUnitsInParent(this.state.model.unitsPerMonth);
    });

  }.bind(this);

  handleAddUnit = function(){
    var workingModel = this.state.model,
        counter = 0;

    for (var key in this.state.model.unitsPerMonth){
      if (parseInt(key) > counter){
        counter = parseInt(key);
      }
    }

    key++;
    workingModel.unitsPerMonth[key] = {};
    workingModel.unitsPerMonth[key].name = 'Unit ' + Object.keys(this.state.model.unitsPerMonth).length.toString();
    workingModel.unitsPerMonth[key].amount = 0;
    workingModel.unitsPerMonth[key].amountYearly = 0;

    this.setState({
      model: workingModel
    }, () => {
      this.props.updateUnitsInParent(this.state.model.unitsPerMonth);
    });

  }.bind(this);

  GenerateUnitRows = function(props){
    var unitRowsVisual = [],
        count = Object.keys(this.state.model.unitsPerMonth).length;

    Object.keys(this.state.model.unitsPerMonth).forEach((id) => {
      if(typeof(this.state.model.unitsPerMonth[id].name) !== 'undefined'){
        unitRowsVisual.push(
          <tr key={count}>
            <td><input type="text" value={this.state.model.unitsPerMonth[id].name} name={'unitName_'+id} onBlur={this.handleEditUnit} /> </td>

            <td>
              <ReactNumeric
                name={'amount_'+id}
                value={this.state.model.unitsPerMonth[id].amount}
                currencySymbol="$"
                minimumValue="0"
                maximumValue="100001"
                decimalCharacter="."
                digitGroupSeparator=","
                onBlur={this.handleEditUnit}
              />
            </td>

            <td>
              <ReactNumeric
                name={'amountYearly_'+id}
                value={this.state.model.unitsPerMonth[id].amountYearly}
                currencySymbol="$"
                minimumValue="0"
                maximumValue="1200000"
                decimalCharacter="."
                digitGroupSeparator=","
                onBlur={this.handleEditUnit}
              />
            </td>

            <td></td>

            <td onClick={() => {this.handleDeleteRow(id)}}>
              x
            </td>

          </tr>);
          count++;
        }
    });

    var sum = 0,
        vaccancyLoss = 0;

    var sumRents = function() {
      Object.keys(this.state.model.unitsPerMonth).forEach((id) => {
        sum += parseFloat(this.state.model.unitsPerMonth[id].amount);
      });

      vaccancyLoss = sum * this.props.vaccancyPct;
    }.bind(this);
    sumRents();

    unitRowsVisual.push(
      <React.Fragment key="gri/vaccancyloss">
      <tr>
        <td><b>Less Vaccancy Loss</b></td>
        <td>$({vaccancyLoss.toLocaleString('en-us')})</td>
        <td>$({(vaccancyLoss * 12).toLocaleString('en-us')})</td>
      </tr>

      <tr>
        <td><b>Gross Rental Income</b></td>
        <td>${(sum - vaccancyLoss).toLocaleString('en-us')}</td>
        <td>${((sum - vaccancyLoss) * 12).toLocaleString('en-us')}</td>
      </tr>

      </React.Fragment>

    );

    return(unitRowsVisual);
  }.bind(this);

  render(){
    return(
      <this.GenerateInputTable />
    )
  }
}

export default UnitsBox;
