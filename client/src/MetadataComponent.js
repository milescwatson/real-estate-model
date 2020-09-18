import React, { useState, useEffect } from 'react';
import './include/css/MetadataComponent.css'
import './include/css/bootstrap.min.css';
import './include/css/universal.css';
// import { Icon } from "@blueprintjs/core";
// import {Form} from 'react-bootstrap';

function MetadataComponent(props) {
  const [state, setState] = useState({
    title: props.title
  });

  var updateTitle = function(newTitle){
    setState({title: newTitle})
    props.updateParentParameter('title', newTitle)
  }

  // var initTitle = function(){
  //   setState({title: props.title, shouldUpdateTitle: true})
  // }

  return(
    <React.Fragment>
      <div className="container-padding-margin">
        <div className="form-group">
          <h4 style={{display:'inline'}}>Model Title:  </h4>
          <input style={{display:'inline', width: '60%'}} value={state.title} className="form-control" id="titlebar" placeholder = "Enter a title..." onChange={(event) => {updateTitle(event.target.value)}}/>
        </div>
      </div>
    </React.Fragment>
  )
}

export default MetadataComponent;
// <div class="form-group">
//   <label for="model-description">Description</label>
//   <textarea class="form-control" id="model-description" rows="3"></textarea>
// </div>
