import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/units.css';
import ReactNumeric from 'react-numeric';

// style
var addUnitButtonStyle = {
  float: 'right'
}

class LineItemGroup extends React.Component{
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

  componentDidUpdate = function(props){
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
            <td><button className='btn btn-outline-primary' style={addUnitButtonStyle} onClick={this.handleAddUnit}>Add Unit</button></td>
          </tr>
          <tr>
            <th>Unit Name</th>
            <th>Monthly Revenue</th>
            <th>Yearly Revenue</th>
          </tr>
          <this.GenerateUnitRows />
        </tbody>
      </table>
      </div>
    </React.Fragment>
    );
  }.bind(this);

  handleEditUnit = (event, value, props) => {
    var id = event.target.name,
        workingModel = this.state.model;

    if (typeof(value) !== 'undefined') {
      id = parseInt((event.target.name).substring(7));

      workingModel.unitsPerMonth[id].amount = value;
      this.setState({
        model: workingModel
      });

    }else{
      workingModel.unitsPerMonth[id].name = event.target.value;
      this.setState({
        model: workingModel
      });
    }
  }

  handleAddUnit = function(){
    var workingModel = this.state.model,
        numUnits = Object.keys(this.state.model.unitsPerMonth).length;

    var counter = 0;
    for (var key in this.state.model.unitsPerMonth){
      if (parseInt(key) > counter){
        console.log('greater');
        counter = key;
      }
    }

    workingModel.unitsPerMonth[key+1] = {};
    workingModel.unitsPerMonth[key+1].name = 'Unit ' + Object.keys(this.state.model.unitsPerMonth).length.toString();
    workingModel.unitsPerMonth[key+1].amount = 0;

    this.setState({
      model: workingModel
    });
  }.bind(this);

  GenerateUnitRows = function(props){
    var unitRowsVisual = [],
        count = Object.keys(this.state.model.unitsPerMonth).length;

    Object.keys(this.state.model.unitsPerMonth).forEach((id) => {
      if(typeof(this.state.model.unitsPerMonth[id].name) !== 'undefined'){
        unitRowsVisual.push(
          <tr key={count}>
            <td><input type="text" value={this.state.model.unitsPerMonth[id].name} name={id} onChange ={this.handleEditUnit} /> </td>

            <td>
              <ReactNumeric
                name={'amount_'+id}
                value={this.state.model.unitsPerMonth[id].amount}
                currencySymbol="$"
                minimumValue="0"
                maximumValue="10000000"
                decimalCharacter="."
                digitGroupSeparator=","
                onChange={this.handleEditUnit}
              />
            </td>

            <td>${(this.state.model.unitsPerMonth[id].amount * 12).toLocaleString('en-us')}</td>
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

export default LineItemGroup
