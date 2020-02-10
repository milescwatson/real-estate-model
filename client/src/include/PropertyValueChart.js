import React from 'react';
import './css/universal.css';
import * as d3 from "d3";
var _ = require('lodash');

class PropertyValueChart extends React.Component {
  constructor(props){
    super(props);
    this.createChart = this.createChart.bind(this);
  }

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate() {
    this.createChart();
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

  createChart() {
    const node = this.node;
    // var width = document.getElementsByClassName('chartc')[0].offsetWidth;
    // console.log('parentWidth = ', width);

    // remove stale chart
    d3.select(node)
      .selectAll('g')
      .remove();

    var width = document.getElementsByClassName('chartc')[0].offsetWidth,
        height = this.props.height,
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        data = this.props.data,
        dataAsArray = [];

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

                    //todo: delete this
        // var formatYAxisLabels = function(input){
        //   return(input)
        // };

        // the yScale will be the highest $ value in any array
        var maximumDollarValue = 0;
        _.each(data, (arrayIterator, key) => {
          if(Math.max(...arrayIterator) > maximumDollarValue){
            // console.log('result = ', Math.max(...arrayIterator));
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

        d3.select(node)
          .append('g')
          .call(xAxis)
          .attr('transform', `translate(0, ${height-margin.bottom})`);

        d3.select(node)
          .append('g')
          .call(yAxis)
          .attr('transform', `translate(${margin.left}, 0)`);

        // x-axis label
        d3.select(node)
          .append('text')
          .attr('transform', `translate(${width/2}, ${height})`)
          .text('Time (years)');

        const yAxisLabelTranslate = `translate(${margin.left-40}, ${height/2})` + ' rotate(-90)';

        // y-axis label
        d3.select(node)
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


        // var paths = d3.select(node)
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
          d3.select(node)
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
      var legend = d3.select(node)
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
        //
        // var legend = svg.selectAll('g')
        //   .data(cities)
        //   .enter()
        //   .append('g')
        //   .attr('class', 'legend');
        //
        //   legend.append('rect')
        //     .attr('x', width - 20)
        //     .attr('y', function(d, i) {
        //       return i * 20;
        //     })
        //     .attr('width', 10)
        //     .attr('height', 10)
        //     .style('fill', function(d) {
        //       return color(d.name);
        //     });
        //
        //   legend.append('text')
        //     .attr('x', width - 8)
        //     .attr('y', function(d, i) {
        //       return (i * 20) + 9;
        //     })
        //     .text(function(d) {
        //       return d.name;
        //     });

  }

  deleteChart() {
    d3.select(this.node).remove();
  }

  render(){
    return(
      <React.Fragment>
        <svg className={'chart-svg'} ref={node => this.node = node}
        width={this.props.width}
        height={this.props.height} >
        </svg>
      </React.Fragment>
    )
  }
}

export default PropertyValueChart;
