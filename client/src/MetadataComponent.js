import React, { useState } from 'react';
import './include/css/MetadataComponent.css'
import './include/css/bootstrap.min.css';
import './include/css/universal.css';
// import { Icon } from "@blueprintjs/core";
// import {Form} from 'react-bootstrap';

function MetadataComponent(props) {
  const [state, setState] = useState({
    title:'',
  });

  // var updateMetadata = function(){
  //   var workingState = {...state};
  //   workingState.title = props.title;
  //   setState(workingState);
  // }

  var updateTitle = function(newTitle){
    props.updateParentParameter('title', newTitle)
    setState({title: newTitle})
  }

  // var updateParent = function(parameter){
  //   console.log('safd');
  // }

  // useEffect(() => {
  //   updateMetadata();
  // },[])

  return(
    <React.Fragment>
      <div className="container-padding-margin">

        <div class="form-group">
          <label for="titlebar">Model Title:  </label>
          <input value= {state.title} className="form-control" id="titlebar" placeholder = "Enter a title..." onChange={(event) => {updateTitle(event.target.value)}}/>
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
