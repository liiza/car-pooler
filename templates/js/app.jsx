'use strict';


var TestApp = React.createClass({  
  getInitialState: function() {
    return {
       "text" : "foo"    
    };
  },
  handleChange: function(event) {
    this.setState({text: event.target.value});
  },
  render: function() {
    return (
      <div className="page">
        <h1>Hello {this.state.text}</h1>
        <input type="text"
               value={text} 
               onChange={this.handleChange} 
        />
      </div>
    );
  }
});

ReactDOM.render(  
  React.createElement(TestApp, null),
  document.getElementById('content')
);
