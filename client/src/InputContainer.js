import React, {useState} from 'react';
import './include/css/InputContainer.css';
import './include/css/universal.css';
import { Tab, Tabs, NumericInput } from "@blueprintjs/core";
import NumberFormat from 'react-number-format';
import _ from 'lodash';

// rentYRG
// appreciationYRG
// stockYRG
// vaccancyPct
// downPaymentPct
// interestRatePct

// valueOfLand
// propertyManagerPercentageOfGrossRent
// incomeTaxRate
// yearsOutComputation
// loanLengthYears
// closingCostsPct
// depreciateOver
// maxWriteoffPerYear

// loanStartingDate
class InputContainer extends React.Component{
  constructor(props){
    super(props);

    // NOTE: This may or may not be a deep copy, watch for issues

    var workingModel = Object.assign({}, props.appModel);

    workingModel.rentYRG *= 100;
    workingModel.appreciationYRG *= 100;
    workingModel.stockYRG *= 100;
    workingModel.vaccancyPct *= 100;
    workingModel.downPaymentPct *= 100;
    workingModel.interestRatePct *= 100;
    workingModel.propertyManagerPercentageOfGrossRent *= 100;
    workingModel.incomeTaxRate *= 100;
    workingModel.closingCostsPct *=100;

    workingModel.purchasePrice = props.purchasePrice

    this.initialState = {
      selectedView: 'main',
      model: workingModel
    }

    this.state = this.initialState;
  }

  handleTabChange = function(newView){
    this.setState({
      selectedView: newView
    })
  }.bind(this)

  updateValues = function(value, parameter, useParentState){
    // set specific, non-percent parameter
    var floatValue = value.floatValue;

    if(useParentState){
      this.props.updateParameterCallback(parameter, value)
    }else{
      this.setState((previousState) => {
        previousState.model[parameter] = floatValue;
        return({
          model: previousState.model
        });
      });
      this.props.updateParametersCallback(floatValue, parameter);
    }
  }.bind(this);

  // converts the selected value being changed to a decimal percentage format
  updateValuesPercent = function(event, parameter){
    const value = parseFloat(event.target.value);
    // console.log('updateValuesPercent, parameter: ', parameter, value)

    this.setState((previousState) => {
      previousState.model[parameter] = value;
      return({
        model: previousState.model
      });
    }, () => {
      const valueDecimalPercent = value / 100;
      this.props.updateParameterCallback(parameter, valueDecimalPercent);
    });

  }.bind(this);

  MainInputs = function(){

    return(
      <React.Fragment>
        <h5>Main Inputs</h5>
        Purchase Price:
        <br />
        <NumberFormat
 	 			 className={"bp3-input"}
          value = {this.state.model.purchasePrice}
          onValueChange = {(value) => {
            this.updateValues(value, 'purchasePrice');
          }}
          name = {'propertyValue'}
          thousandSeparator={true}
          prefix={'$'}
          defaultValue = {0}
          fixedDecimalScale = {true}
          decimalScale = {0}
        />
        <br />
        Rent Yearly Rate of Growth:
        <NumberFormat
 	 			 className={"bp3-input"}
          value = {this.state.model.rentYRG}
          onBlur = {(event) => {
            this.updateValuesPercent(event, 'rentYRG')
          }}
          format = {(input) => {
            return input + '%';
          }}
          isNumericString={true}
          thousandSeparator={true}
          suffix={'%'}
          defaultValue = {0}
          fixedDecimalScale = {true}
          decimalScale = {2}
        />
      <br />
      Appreciation YRG
        <NumberFormat
 	 			 className={"bp3-input"}
          value = {this.state.model.appreciationYRG}
          onBlur = {(event) => {
            this.updateValuesPercent(event, 'appreciationYRG')
          }}
          thousandSeparator={true}
          suffix={'%'}
          defaultValue = {0}
          fixedDecimalScale = {true}
          decimalScale = {2}
        />
      <br />
      Stock YRG
      <br />
        <NumberFormat
 	 			 className={"bp3-input"}
 	 			 className={"bp3-input"}
          value = {this.state.model.stockYRG}
          onBlur = {(event) => {
            this.updateValuesPercent(event, 'stockYRG')
          }}
          thousandSeparator={true}
          suffix={'%'}
          defaultValue = {0}
          fixedDecimalScale = {true}
          decimalScale = {2}
        />
      <br />
      Vaccancy %
      <br />
        <NumberFormat
 	 			 className={"bp3-input"}
          value = {this.state.model.vaccancyPct}
          onBlur = {(event) => {
            this.updateValuesPercent(event, 'vaccancyPct');
          }}
          thousandSeparator={true}
          suffix={'%'}
          defaultValue = {0}
          fixedDecimalScale = {true}
          decimalScale = {2}
        />
      <br />
      Down Payment %
        <NumberFormat
 	 			 className={"bp3-input"}
          value = {this.state.model.downPaymentPct}
          onBlur = {(event) => {
            this.updateValuesPercent(event, 'downPaymentPct');
          }}
          thousandSeparator={true}
          suffix={'%'}
          defaultValue = {0}
          fixedDecimalScale = {true}
          decimalScale = {2}
        />
      <br />
      Interest Rate %
      <br />
        <NumberFormat
 	 			 className={"bp3-input"}
          value = {this.state.model.interestRatePct}
          onBlur = {(event) => {
            this.updateValuesPercent(event, 'interestRatePct');
          }}
          thousandSeparator={true}
          suffix={'%'}
          defaultValue = {0}
          fixedDecimalScale = {true}
          decimalScale = {2}
        />
        <br />
        Loan Length Years
        <NumberFormat
 	 			 className={"bp3-input"}
          value = {this.props.loanLengthYears}
          onValueChange = {(value) => {
            this.updateValues(value, 'loanLengthYears');
          }}
          thousandSeparator={true}
          suffix={' years'}
          defaultValue = {0}
          fixedDecimalScale = {true}
          decimalScale = {0}
        />
      </React.Fragment>
    )
  }.bind(this);

  AdvancedInputs = function(){
    return(
      <React.Fragment>
      <h5>Advanced Inputs</h5>

      Value of Land
      <NumberFormat
 	 			 className={"bp3-input"}
        value = {this.props.valueOfLand}
        onBlur = {(event) => {
          const val = parseFloat(event.target.value.substr(1).replace(/,/g,''));
          this.updateValues(val, 'valueOfLand', true);
        }}
        thousandSeparator={true}
        prefix={'$'}
        defaultValue = {0}
        fixedDecimalScale = {true}
        decimalScale = {2}
      />

      Property Mangement %
      <NumberFormat
 	 			 className={"bp3-input"}
        value = {this.state.model.propertyManagerPercentageOfGrossRent}
        onBlur = {(event) => {
          this.updateValuesPercent(event, 'propertyManagerPercentageOfGrossRent');
        }}
        thousandSeparator={true}
        suffix={'%'}
        defaultValue = {0}
        fixedDecimalScale = {true}
        decimalScale = {2}
      />
      <br />

      Income Tax Rate %
      <NumberFormat
 	 			 className={"bp3-input"}
        value = {this.state.model.incomeTaxRate}
        onBlur = {(event) => {
          this.updateValuesPercent(event, 'incomeTaxRate');
        }}
        thousandSeparator={true}
        suffix={'%'}
        defaultValue = {0}
        fixedDecimalScale = {true}
        decimalScale = {2}
      />
      <br />

      Years Out Computation
      <NumberFormat
 	 			 className={"bp3-input"}
        value = {this.props.yearsOutComputation}
        onBlur = {(event) => {
          var val = event.target.value;
          const regex = /years/gi;
          val = val.replace(regex,'');
          this.updateValues(val, 'yearsOutComputation', true);
        }}
        thousandSeparator={true}
        suffix={' years'}
        defaultValue = {0}
        fixedDecimalScale = {true}
        decimalScale = {0}
      />
      <br />

      Deppreciate Over
      <NumberFormat
 	 			 className={"bp3-input"}
        value = {this.props.depreciateOver}
        onBlur = {(event) => {
          var val = event.target.value;
          const regex = /years/gi;
          val = val.replace(regex,'');
          this.updateValues(val, 'depreciateOver', true);
        }}
        thousandSeparator={true}
        suffix={' years'}
        defaultValue = {0}
        fixedDecimalScale = {true}
        decimalScale = {0}
      />
      <br />

      Maximum Tax Writeoff / Year
      <NumberFormat
 	 			 className={"bp3-input"}
        value = {this.props.maxWriteoffPerYear}
        onBlur = {(event) => {
          const val = parseFloat(event.target.value.substr(1).replace(/,/g,''));
          this.updateValues(val, 'maxWriteoffPerYear', true);
        }}
        name = {'maxWriteoffPerYear'}
        thousandSeparator={true}
        prefix={'$'}
        defaultValue = {0}
        fixedDecimalScale = {true}
        decimalScale = {0}
      />

      <br />
      </React.Fragment>
    )
  }.bind(this);

  render(){
    return(
      <React.Fragment>
            <Tabs animate="true" large={true} id="inputTabs" onChange={this.handleTabChange} selectedTabId={this.state.selectedView}>
              <Tab id="main" title="Main" panel={<this.MainInputs />} />
              <Tab id="advanced" title="Advanced" panel={<this.AdvancedInputs />} />
            </Tabs>

      </React.Fragment>
    );
  }
}

export default InputContainer;
