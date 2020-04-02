import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/universal.css';
import './include/css/ChartContainer.css';
import PropertyValueChart from './include/PropertyValueChart';
import { Tab, Tabs } from "@blueprintjs/core";
import * as d3 from "d3";


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

  AmortizationChart = function(){
    return(
      <React.Fragment>
        <h6>Amortization Chart coming soon</h6>
      </React.Fragment>
    );
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

  render() {
    return(
      <React.Fragment>
            <div className="chartc container-padding-margin-chart">
              <Tabs animate="true" large={true} id="TabsExample" onChange={this.handleTabChange} selectedTabId={this.state.currentView}>
                <Tab id="value" title="Value" panel={<this.ValueChart />} />
                <Tab id="amortization" title="Amortization" panel={<this.AmortizationChart />} />
              </Tabs>
            </div>

      </React.Fragment>
    )
  }
}

export default ChartContainer;
