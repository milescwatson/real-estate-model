import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/universal.css';
import 'chartjs-plugin-colorschemes';

var _ = require('lodash');
var Chart = require('chart.js');

var areaChart;

var createChart = function(update){

  var ctx = document.getElementById('chart-canvas');
  const dcf = [];
  areaChart = new Chart(ctx, {
      type: 'line',
      data: dcf,
      options: {
          tooltips: {
            callbacks: {
              label: function(tooltipItem, data){
                var label = data.datasets[tooltipItem.datasetIndex].label || '';
                if (label) {
                    label += ': ';
                }
                var finFormat = '$' + Number(parseInt(tooltipItem.yLabel)).toLocaleString('en-US', { style: 'decimal', currency: 'USD' });
                // TODO: add a total real estate value field in tooltip
                return (label + finFormat);
              },
              beforeTitle: function(){
                return('Year: ')
              }
            },
            mode: 'x-axis',
            intersect: 'false',
            position: 'average',
            bodyFontSize: 15,
            titleFontSize: 18
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
  areaChart.isInitialized = false;
}

class AreaChart extends React.Component{

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
    this.generateChartData();
  }

  shouldComponentUpdate = function(nextProps, nextState){
    if(JSON.stringify(this.props.props) === JSON.stringify(nextProps.props)) {
      return false;
    }else{
      return true;
    }
  }

  componentDidUpdate = function(nextProps){
    this.generateChartData();
  }

  handleUpdateChartData = function(newChartData){
    _.each(areaChart.data.datasets, (dataset, key) => {
      if(!(JSON.stringify(dataset.data) === newChartData[key].data )) {
        // if current chart data NOT equal to newChartData
        // arrayKeysDescriptive.push(dataset.keyName);
        areaChart.data.datasets[key].data = newChartData[key].data
      }

    });
    areaChart.update();
  }

  generateChartData = function(){
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
    };
    
    var chartDataFinal = [];
    _.each(this.props.props.data, (currentArray, key) => {
      var obj = {}
      obj.label = mapName(key);
      obj.keyName = key;

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

      if(key === 'stockMarketValue'){
        obj.fill = false;
      }

      chartDataFinal.push(obj);
    })

    var xLabels = []
    for (var i = 0; i <= this.props.props.yearsOutComputation; i++) {
      xLabels[i] = i;
    }

    const obj = {
      labels: xLabels,
      datasets: chartDataFinal
    }

    // if the chart is already initialized with first data, we need to update its data, not replace it
    if (!areaChart.isInitialized){
      areaChart.data = obj;
      areaChart.update();
      areaChart.isInitialized = true;
    } else {
      // call a function that compares current chart data with new props, and changes values with precision
      this.handleUpdateChartData(chartDataFinal)
    }

  }

  render(){
    return(
      <React.Fragment>
        <canvas id='chart-canvas' ref={(element) => {this.canvasRef = element}}></canvas>
      </React.Fragment>
    )
  }
}

export default AreaChart;
