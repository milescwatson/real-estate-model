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

  // handleTabChange = function(event){
  //   switch (event.target.name) {
  //     case 'amortization':
  //       this.setState({
  //         currentView: 'amortization'
  //       });
  //       break;
  //     case 'value':
  //       this.setState({
  //         currentView: 'value'
  //       });
  //       break;
  //     default:
  //       alert('error, case statement default.');
  //   }
  // }.bind(this);

  // visual
  // Tabs = function(){
  //   var className = '';
  //   if(this.state.currentView === 'value'){
  //     className='tab-underlined-value'
  //   }else{
  //     className='tab-underlined-amortization'
  //   }
  //
  //   return(
  //     <React.Fragment>
  //       <div className="header-tabs">
  //         <button className= {(this.state.currentView === 'value') ? 'tab-item tab-underlined' : 'tab-item'} name="value" onClick={this.handleTabChange} > Value </button>
  //         <button className= {(this.state.currentView === 'amortization') ? 'tab-item tab-underlined' : 'tab-item'} name="amortization" onClick={this.handleTabChange} > Amortization </button>
  //       </div>
  //     </React.Fragment>
  //   );
  // }.bind(this);

  ValueChart = function(){
    return(
      <React.Fragment>
        <PropertyValueChart
          data={this.props.data}
          valueOfStockMarketInvestment = {this.props.valueOfStockMarketInvestment}
          width={1000}
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

  render() {
    return(
      <React.Fragment>
            <div className="col-9">
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
