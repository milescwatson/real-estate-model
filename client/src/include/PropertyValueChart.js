import React from 'react';
import './css/universal.css';
import * as d3 from "d3";
var _ = require('lodash');

class PropertyValueChart extends React.Component {
  constructor(props){
    super(props);
    this.drawChart = this.drawChart.bind(this);
  }

  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate() {
    this.drawChart();
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

  drawChart() {
    // var width = document.getElementsByClassName('chartc')[0].offsetWidth;
    // console.log('parentWidth = ', width);
    var containingElement = document.getElementsByClassName('chartc')[0];

    // remove stale chart
    d3.select('.chartc')
      .selectAll('svg')
      .remove();

    var width = containingElement.offsetWidth,
        height = containingElement.offsetHeight,
        margin = {top: 20, right: 20, bottom: 20, left: 50},
        data = this.props.data,
        dataAsArray = [];

        var svg = d3.select('.chartc').append("svg")
                    .attr("width", width)
                    .attr("height", height + margin.bottom + margin.top)

        // put data into nested array
        _.each(data, (value, key) => {
          dataAsArray.push(value);
        });

        var dataLength = (data[Object.keys(data)[0]]).length;
        // the xscale is going to be number years
        // every array will have the same length, so will just use the first one

        var xScale = d3.scaleLinear()
                    .domain([0, dataLength])
                    .range([margin.left, width-margin.right]);

        // the yScale will be the highest $ value in any array
        var maximumDollarValue = 0;
        _.each(data, (arrayIterator, key) => {
          if(Math.max(...arrayIterator) > maximumDollarValue){
            maximumDollarValue = Math.max(...arrayIterator);
          }
        })

        var yScale = d3.scaleLinear()
                     .domain([0, (maximumDollarValue + (maximumDollarValue*.10) ) ])
                     .range([height-margin.bottom, margin.top]);

        var xAxis = d3.axisBottom(xScale)
                      .tickSizeOuter(0);

        var yAxis = d3.axisLeft(yScale)
                      .tickFormat((input) => {
                        var output = this.bigNumberString(input);
                        return('$' + output[0] + output[1]);
                      });

        d3.select("svg")
          .append('g')
          .call(xAxis)
          .attr('transform', `translate(0, ${height-margin.bottom})`);

        d3.select("svg")
          .append('g')
          .call(yAxis)
          .attr('transform', `translate(${margin.left}, 0)`);

        // x-axis label
        d3.select("svg")
          .append('text')
          .attr('transform', `translate(${width/2}, ${height})`)
          .text('Time (years)');

        const yAxisLabelTranslate = `translate(${margin.left-40}, ${height/2})` + ' rotate(-90)';

        // y-axis label
        d3.select("svg")
          .append('text')
          .attr('transform', yAxisLabelTranslate)
          .text('Value ($)');

        // var propertyValueLine = d3.line()
        //           .x(function(d){
        //             var index = arguments[1];
        //             return(xScale(index));
        //           })
        //           .y(function(d){
        //             return(yScale(d));
        //           });
        //
        // var marketValueLine = d3.line()
        //   .x(function(d){
        //     var index = arguments[1];
        //     return(xScale(index));
        //   })
        //   .y(function(d){
        //     return(yScale(d));
        // });

        var d3Line = d3.line()
            .x(function(d){
              var index = arguments[1];
              return(xScale(index));
            })
            .y(function(d){
              return(yScale(d));
            });


        // var paths = d3.select("svg")
        //   .selectAll('circle')
        //   .data(dataAsArray)
        //   .enter()
        //   .append('circle')
        //   .attr('r', '5.5')
        //   .attr('class', ()=> {
        //     console.log('classArgs = ', arguments);
        //     return('hello');
        //   });

        var colorMapping = {
          'stockMarketValue': 'red',
          'propertyValue': 'steelblue'
        };

        var nameMapping = {
          'stockMarketValue': 'Stock Market Value',
          'propertyValue': 'Property Value'
            },
            mapName = function(key){
              if(Object.keys(nameMapping).includes(key)){
                return(nameMapping[key]);
              }else{
                return(key);
              }
            };

        _.each(this.props.data, (value, key) => {
          d3.select("svg")
            .append('path')
            .datum(value)
            .attr("fill", "none")
            .attr("stroke", colorMapping[key])
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", d3Line);
        });

      // add legend for each dataset
      var legend = d3.select("svg")
        .selectAll('.legend')
        .data(Object.keys(data))
        .enter()
        .append('g')
        .attr('class', 'legend-item');

      legend.append('rect')
            .attr('x', function(key,index){
              return(((index+1) * 150)+60);
            })
            .attr('y', (key,index,selection) => {
              return(10)
            })
            .attr('width', 24)
            .attr('height', 10)
            .style("fill", (key) => {
              return colorMapping[key];
            });

      legend.append('text')
            .text((key) => {
              return(mapName(key));
            })
            .attr('x', (key, index) => {
              return(((index+1) * 150)+90);
            })
            .attr('y', (key, index) => {
              return(19)
            });
  }

  render(){
    return(
      <React.Fragment>
        <svg className={'chart-svg'} ref={node => this.node = node}
        width={this.props.width}
        height={this.props.height} >
        </svg>

        {window.addEventListener("resize", () => {
          var containingElement = document.getElementsByClassName('chartc')[0]

          console.log(containingElement.offsetHeight);
          this.drawChart();
        })}

      </React.Fragment>
    )
  }
}

export default PropertyValueChart;
