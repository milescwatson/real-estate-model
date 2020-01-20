import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/universal.css';
import './include/css/Metric.css';
import NumberFormat from 'react-number-format';

class Metric extends React.Component{
  // constructor(props){
  //   super(props);
  // }
  financialNum = function(x){
    return Number.parseFloat(x).toFixed(2);
  };

  generateString = (value) => {
    //If financial, return correct formatting.
    if(this.props.postfix === '%'){
      return(
      <NumberFormat
        value={value*100}
        thousandSeparator={true}
        suffix={'%'}
        defaultValue = {0}
        fixedDecimalScale = {true}
        decimalScale = {2}
        displayType={'text'}
      />
      );
    }else if(this.props.prefix === '$'){
      return(
        <NumberFormat
          value={value}
          prefix={'$'}
          thousandSeparator={true}
          defaultValue = {0}
          fixedDecimalScale = {true}
          decimalScale = {2}
          displayType={'text'}
        />
      );
    }else{
      return(
        <NumberFormat
          value={value}
          thousandSeparator={true}
          defaultValue = {0}
          fixedDecimalScale = {true}
          decimalScale = {2}
          displayType={'text'}
        />
      )
    }

  };

  generateStyle = (x) => {
    const divideBy = (this.props.range[1] - this.props.range[0]) / this.props.colorProgression.length;
    var colorIndex = 0;
    const deltaLow = this.props.value - this.props.range[0];
    const deltaHigh = this.props.range[1] - this.props.value;

    if(this.props.colorProgression === 'default'){
      this.props.colorProgression = [];
    }

    // color progression goes from bad to good

    if(this.props.highPositive){
      colorIndex = parseInt(deltaLow / divideBy);

      if(this.props.value >= this.props.range[1]){
        return(this.props.colorProgression[this.props.colorProgression.length-1]);
      }
      if(this.props.value <= this.props.range[0]){
        return(this.props.colorProgression[0]);
      }

    }else{
      colorIndex = parseInt(deltaHigh / divideBy);
      if(this.props.value >= this.props.range[1]){
        return(this.props.colorProgression[0]);
      }
      if(this.props.value <= this.props.range[0]){
        return(this.props.colorProgression[this.props.colorProgression.length-1]);
      }
    }

    // Return color hex values
    return (this.props.colorProgression[colorIndex]);

  };

  render(){
    var textStyle = {
      'color': this.generateStyle()
    }

    return(
      <React.Fragment>
        <div className="metric-container">
          <span style={textStyle} className="metric">{this.generateString(this.props.value)}</span>
          <br />
          <span className="label">{this.props.label}</span>
        </div>
      </React.Fragment>
    )
  }
}

export default Metric;
