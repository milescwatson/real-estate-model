import React from 'react';
import './css/universal.css';
import * as d3 from "d3";

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
        data = this.props.data;

        var xScale = d3.scaleLinear()
                    .domain([0, data.length])
                    .range([margin.left, width-margin.right]);

        var yScale = d3.scaleLinear()
                     .domain([0, (data[data.length-1] + (data[data.length-1]*.10) ) ])
                     .range([height-margin.bottom, margin.top]);

        var xAxis = d3.axisBottom(xScale)
                      .tickSizeOuter(0);

        var yAxis = d3.axisLeft(yScale);

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

        var propertyValue = d3.line()
                  .x(function(d){
                    var index = arguments[1];
                    // console.log('x = ', index);
                    // return index;
                    return(xScale(index));
                  })
                  .y(function(d){
                    return(yScale(d));
                    // var index = arguments[1];
                    // console.log('y = ', d);
                    // return d;
                  });

        var marketValueLine = d3.line()
          .x(function(d){
            var index = arguments[1];
            // console.log('x = ', index);
            // return index;
            return(xScale(index));
          })
          .y(function(d){
            return(yScale(d));
            // var index = arguments[1];
            // console.log('y = ', d);
            // return d;
        });

        d3.select(node)
          .append('path')
          .datum(this.props.valueOfStockMarketInvestment)
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("stroke-width", 1.5)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("d", marketValueLine);


        d3.select(node)
              .append('path')
              .datum(data)
              .attr("fill", "none")
              .attr("stroke", "steelblue")
              .attr("stroke-width", 1.5)
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("d", propertyValue);
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