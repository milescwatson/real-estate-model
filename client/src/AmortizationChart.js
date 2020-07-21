import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/universal.css';
import 'chartjs-plugin-colorschemes';
var _ = require('lodash');
var Chart = require('chart.js');
var amortizationChart;

var createChart = function(update){
  var ctx = document.getElementById('chart-canvas-amortization');
  const dcf = [];
  amortizationChart = new Chart(ctx, {
      type: 'line',
      data: dcf,
      options: {
          tooltips: {
            mode: 'x-axis',
            intersect: 'false',
            position: 'average',
          },
          plugins: {
              colorschemes: {
                  scheme: 'brewer.Paired12'
              }
          },
          hover: true,
          showLines: true,
          scales: {
              yAxes: [{
                  stacked: true,
                  ticks: {
                    callback: function(value, index, values){
                      return '$' + value.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                    }
                  }
              }]
          }
      }
  });
}

class AmortizationChart extends React.Component{
  // constructor(props){
  //   super(props);
  // }

  bigNumberString = function(number, maxNumberToDisplay){
    var sign = 0;

    if(number < 0){
      sign = -1;
    }else{
      sign = 1;
    }
    number = Math.abs(number);
    if (number < 1000){
      return [number * sign, '']
    } else if (number >= 1000 && number < 1e6){
      var thousands = number / 1000;
      thousands = thousands.toFixed(1);
      return [thousands*sign, 'K']

    } else if (number >= 1e6 && number < 1e9){
      var millions = number / 1e6;
      millions = millions.toFixed(2);
      return [millions*sign, 'M']
    } else if (number >= 1e9 && number <=1e12){
      //billion and trillion
      var billions = number / 1e9;
      billions = billions.toFixed(2);

      return [billions*sign, 'B']
    } else {
      return ['...', '?']
    }

  };

  componentDidMount = function(){
    createChart();
  }

  shouldComponentUpdate = function(nextProps, nextState){
    if(JSON.stringify(this.props.props) === JSON.stringify(nextProps.props)) {
      return false;
    }else{
      return true;
    }
  }

  generateChartData = function(){
    var nameMapping = {
    },
      mapName = function(key){
        if(Object.keys(nameMapping).includes(key)){
          return(nameMapping[key]);
        }else{
          return(key);
        }
    };

    var generateDataArray = function(callback){
      var data = {
        'cumEquity': this.props.props.amortization.cumEquity,
        'cumInterest': this.props.props.amortization.cumInterest,
        'cumPrincipal': this.props.props.amortization.cumPrincipal
      };

      var xLabels = []
      for (var i = 0; i <= this.props.props.yearsOutComputation; i++) {
        xLabels[i] = i;
      }

      var dataRet = [];
      _.each(data, (value, key)=> {
        var obj = {};
        console.log('data[key] = ', data);
        obj.label = mapName(key);
        obj.data = data[key];
        dataRet.push(obj);
      })
      callback(dataRet, xLabels);
    }.bind(this);

    generateDataArray((data, xLabels)=>{
      const obj = {
        labels: xLabels,
        datasets: data
      }
      console.log('obj = ', obj);
      amortizationChart.data = obj;
    });
    // updateChartData(obj);
    // amortizationChart.update();
  }

  componentDidUpdate = function(){
    this.generateChartData();
  }

  render(){
    return(
      <React.Fragment>
        <canvas id='chart-canvas-amortization'></canvas>
        <button onClick={() => {
          // this.state.acref.update();
          this.generateChartData()
        }}>
        generateChartData
        </button>
        <br />
        <button onClick={() => {
            // this.state.acref.update();
            createChart();
          }}>
          createChart
        </button>

        <button onClick={() => {
            // this.state.acref.update();
            amortizationChart.update();
          }}>
          updateChart
        </button>

      </React.Fragment>
    )
  }
}

export default AmortizationChart;
