exports.xhrRequestJSON = function(url, method="GET", requestObject =  {}, callback){
  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.send(JSON.stringify(requestObject));

  xhr.onload = function(){
    callback(null, xhr.response);
  };

  xhr.onerror = function(){
    callback('error: request failed.')
  };
};
