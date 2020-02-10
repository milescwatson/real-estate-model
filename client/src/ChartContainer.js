import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/universal.css';
import './include/css/ChartContainer.css';
import PropertyValueChart from './include/PropertyValueChart';
import { Tab, Tabs } from "@blueprintjs/core";

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
          width={800}
          height={600}
        />
      </React.Fragment>
    );
  }.bind(this);

  AmortizationChart = function(){
    return(
      <React.Fragment>
        <h3>amortization chart</h3>
      </React.Fragment>
    );
  }.bind(this);

  handleTabChange = function(selectedTab){
    this.setState({
      currentView: selectedTab
    })
  }.bind(this);

  getWidth = function(){
    var width = document.getElementsByClassName('chartc')[0].offsetWidth;
    return(width);
  }.bind(this);

  render() {
    return(
      <React.Fragment>
            <div className="chartc container-padding">
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
