import React from 'react';
import './include/css/bootstrap.min.css';
import './include/css/universal.css';
import './include/css/UserView.css';

class UserView extends React.Component{
  constructor(props){
    super(props);

    var keys = [];
    Object.keys(this.props.computedArrays).forEach((item) => {
      keys.push(item);
    });

    this.initialState = {
      computedArrays: this.props.computedArrays,
      userViews: this.props.userViews
    };

    this.state = this.initialState;
  }

  GenerateOptions = function(){
    // console.log('this.props: ', this.props)
    var returnJSX = [];
    var counter = 0;

    Object.keys(this.props.computedArrays).forEach((item) => {
      returnJSX.push(
        <option key = {counter} value={item}>{item}</option>
      )
      counter++;
    });
    return(returnJSX);
  }.bind(this);

  handleSelectViewChange = function(event){

    var options = event.target.options;
    var values = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        values.push(options[i].value);
      }
    }
    var workingUserViews = this.state.userViews;
    workingUserViews.operatingView = values;

    this.setState({
      userViews: workingUserViews
    });

  }.bind(this);

  render(){
    return(
      <React.Fragment>
        <div className="user-view-container">
          <select onChange = {this.handleSelectViewChange} className="custom-select" multiple size="10">
            <this.GenerateOptions />
          </select>
        </div>
      </React.Fragment>
    )
  }
}

export default UserView;
