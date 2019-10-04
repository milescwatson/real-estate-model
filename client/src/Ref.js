import React from 'react';
import './include/css/bootstrap.min.css';
// import styled from 'styled-components';

class Ref extends React.Component{
  constructor(props){
    super(props);
  }

  handleRefChange = function(){
    console.log(this.refs.testref.value);
  };

  render(){
    return(
      <input type="text" ref="testref" onChange={this.handleRefChange.bind(this)} />
    )
  }
}

export default Ref
