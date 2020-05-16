import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/universal.css';
import 'chartjs-plugin-colorschemes';

var _ = require('lodash');
var Chart = require('chart.js');

var areaChart;

/*
all layers, bottom up:
totalEquity
cashflow
value of mortgage interest
value of tax writeoff

*/

var createChart = function(update){
  var chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(231,233,237)'
  };

  var ctx = document.getElementById('chart-canvas');
  const dcf = [];
  areaChart = new Chart(ctx, {
      type: 'line',
      data: dcf,
      options: {
          tooltips: {
            mode: 'x-axis',
            intersect: 'false',
            position: 'average',
            callbacks: {
              labels: function(){
                return('swagg label')
              }
            }
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
                    }.bind(this)
                  }
              }]
          }
      }
  });
}

class AreaChart extends React.Component{
  constructor(props){
    super(props);
  }

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
    console.log('generateChartData ran');
    var nameMapping = {
      'stockMarketValue': 'Stock Market Value',
      'propertyValue': 'Property Value',
      'valueOfRealEstateInvestment': 'Total Value Of RE Investment',
      'cumEquity': 'Cum. Equity',
      'cashFlow': 'Cum. Cashflow'
    },
      mapName = function(key){
        if(Object.keys(nameMapping).includes(key)){
          return(nameMapping[key]);
        }else{
          return(key);
        }
    },
    colorMapping = {
      'stockMarketValue': {color:'red',borderColor:'black'},
      'totalEquity': {color:'rgb(102, 204, 255)',borderColor:'black'},
      'cashFlow': {color:'green',borderColor:'black'}
    },
    mapColor = function(key){
      if(Object.keys(colorMapping).includes(key)){
        return(colorMapping[key].color);
      }else {
        return('yellow');
      }
    },
    mapBorder = function(key){
      if(Object.keys(colorMapping).includes(key)){
        return(colorMapping[key].borderColor);
      }else {
        return('yellow');
      }
    };

    var generateDataArray = function(){
      var dataRet = [];

      _.each(this.props.props.data, (currentArray, key) => {
        var obj = {}
        obj.label = mapName(key);

        // obj.backgroundColor = mapColor(key);
        // obj.borderColor = mapBorder(key);

        if(key === 'cashFlow'){
          var cumCashflow = 0;
          var cumCashflowArray = [];
          for (var year = 0; year <= this.props.props.yearsOutComputation; year++) {
            cumCashflow += currentArray[year];
            cumCashflowArray[year] = cumCashflow;
          }
          obj.data = cumCashflowArray;
        } else {
          obj.data = currentArray;
        }

        if(key === 'totalEquity'){
          obj.order = 1;
        }

        //
        // if(key === 'cashFlow'){
        //   obj.order = 2;
        // }

        if(key === 'stockMarketValue'){
          // obj.order = 1;
          obj.fill = false;
        }

        dataRet.push(obj);
      })
      return dataRet;

    }.bind(this);

    var xLabels = []
    for (var i = 0; i <= this.props.props.yearsOutComputation; i++) {
      xLabels[i] = i;
    }

    var chartDataFinal = generateDataArray();
    const obj = {
      labels: xLabels,
      datasets: chartDataFinal
    }
    // updateChartData(obj);
    areaChart.data = obj;
    areaChart.update();
  }

  componentDidUpdate = function(){
    this.generateChartData();
  }

  render(){
    return(
      <React.Fragment>
        <canvas id='chart-canvas' ref={(element) => {this.canvasRef = element}}></canvas>
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

      </React.Fragment>
    )
  }
}

export default AreaChart;
