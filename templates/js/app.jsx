'use strict';

var TestApp = React.createClass({  
  render: function() {
    return (
      <div className="page">
        <h1>Oh shit! React works!</h1>
      </div>
    );
  }
});

ReactDOM.render(  
  React.createElement(TestApp, null),
  document.getElementById('content')
);
