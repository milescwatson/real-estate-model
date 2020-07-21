import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/universal.css';
import './include/css/ChartContainer.css';
import PropertyValueChart from './include/PropertyValueChart';
import AreaChart from './AreaChart';
import AmortizationChart from './AmortizationChart';

import { Tab, Tabs } from "@blueprintjs/core";
import * as d3 from "d3";

/*
Promising: https://www.chartjs.org/samples/latest/charts/area/line-stacked.html
*/

class ChartContainer extends React.Component{
  constructor(props){
    super(props);
    this.initialState = {
      currentView: 'value'
    }
    this.state = this.initialState;
  }

  ValueChart = function(){
    return(
      <React.Fragment>
        <PropertyValueChart
          data={this.props.data}
        />
      </React.Fragment>
    );
  }.bind(this);

  componentDidMount = function(){
  }

  handleChartDrawPostTabChange = function(){
    if(this.state.currentView === 'amortization'){
      d3.select('.chartc')
        .selectAll('svg')
        .remove();
    }else{
      // draw value chart
      // this.forceUpdate();
    }
  }

  handleTabChange = function(selectedTab){
    this.setState({
      currentView: selectedTab
    }, this.handleChartDrawPostTabChange);

  }.bind(this);

  // getWidth = function(){
  //   var width = document.getElementsByClassName('chartc')[0].offsetWidth;
  //   console.log(width);
  //   return(width);
  // }


    // OLD AMORT CHART<Tab id="amortization" title="Amortization" panel={<AmortizationChart props={this.props} />} />

  render() {
    return(
      <React.Fragment>
            <div className="chartc container-padding-margin-chart">
                <h3>Value Projection</h3>
                <AreaChart props={this.props} />
            </div>

      </React.Fragment>
    )
  }
}

export default ChartContainer;
