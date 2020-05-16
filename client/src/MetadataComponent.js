import React, { useState, useEffect } from 'react';
import './include/css/MetadataComponent.css'
import './include/css/bootstrap.min.css';
import './include/css/universal.css';

import {Form} from 'react-bootstrap';

function MetadataComponent(props) {
  const [state, setState] = useState({
    title:'',
    editMode: ''
  });

  var updateMetadata = function(){
    if(props.isUntitled){
      var workingState = {...state};
      workingState.title = "Untitled Model";
      setState(workingState);
    }else {
      var workingState = {...state};
      workingState.title = props.title;
      setState(workingState);
    }
  }

  useEffect(() => {
    updateMetadata();
  },[])

  return(
    <React.Fragment>
      <div className="container-padding-margin">
          <b>Model Title: </b>
          {(props.isUntitled || state.editMode) ? <input value= {state.title} className="form-control" id="titlebar" placeholder = "Enter a title..." /> : <div id="title-as-heading-container" onClick={() => {setState({editMode: !state.editMode});
        }}><h6 id="title-as-heading">{state.title}</h6></div>}
        <br />
        <label for="notes">Notes</label>
        <input id="notes">
        </input>
      </div>
    </React.Fragment>
  )
}

export default MetadataComponent;
