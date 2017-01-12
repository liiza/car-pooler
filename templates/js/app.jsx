'use strict';

// https://docs.djangoproject.com/en/dev/ref/csrf/

// using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

var Tasks = React.createClass({
   getInitialState: function() {
      return {"tasks": this.props.tasks}
   },
  
   componentWillReceiveProps(nextProps) {
      this.setState({ "tasks": nextProps.tasks });
   },
 
   render: function() {
      var tasks = this.state.tasks.map(function(task) {
          return (<li key={task.pk}>{task.fields.content}</li>);
      })
      return (<ul>{tasks}</ul>)
   }   
  
});


var DateField = React.createClass({
   getInitialState: function() {
      return {"datetime": new Date(), "valid": true};
   },
 
   isPositiveInt: function(n) {
      return !isNaN(parseInt(n)) && isFinite(n) && parseInt(n) > 0;
   },   

   isLeapYear: function(year) {
       return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
   }, 

   isValidDayOfMonth: function(day, month, year) {
       if ([1, 3, 5, 7, 8, 10, 12].indexOf(month)) {
          return day <= 31;
       } 
       else if ([2, 4, 6, 9, 11].indexOf(month)) {
          return day <= 30;
       }
       else if (month === 2) {
         if (this.isLeapYear(year)) {
            return day <= 29;
         } else {
            return day <= 28;
         }
       }
   },

   isValidDate: function(parts) {
      if (parts.length !== 3) {
          return false;
      }
      if (!this.isPositiveInt(parts[0]) || !this.isPositiveInt(parts[1]) || !this.isPositiveInt(parts[2])) {
          return false;
      }
      var month = parseInt(parts[0])
      var date = parseInt(parts[1])
      var year = parseInt(parts[2])
      if (month > 12 || !this.isValidDayOfMonth(date, month, year)) {
          return false;
      }
      return true;
   },

   handleChange: function(event) {
      var parts = event.target.value.split("/");
      if (!this.isValidDate(parts)) {
         this.setState({"valid": false});
         this.setState({"datetime": event.target.value});
      } else {
         this.setState({"valid":true})
         this.setState({"datetime": new Date(parts.join("/"))})
      }
      this.props.updateDate(this.state)
   },

   render: function() {
      var placeHolder = this.state.datetime;
      if (this.state.valid) {
          placeHolder = this.state.datetime.getMonth() + 1 + "/" + this.state.datetime.getDate() + "/"  + this.state.datetime.getFullYear();
      } 
      var className = this.state.valid ? "" : "invalid";
      return (<input type="text" className={className} onChange={this.handleChange} value={placeHolder} ></input>)
   }
 
});

var TestApp = React.createClass({  

  getInitialState: function() {
   return {
       "text" : "foo",
       "tasks" : [],
       "valid" : false   
    };
  },

  componentDidMount: function() {
    $.ajax({
      type: "GET",
      url: "hours/tasks",
      dataType: 'json',
      success: function(data) {
         this.setState({"tasks" : JSON.parse(data),
                        "text" : this.state.text});
      }.bind(this)
    });
  },

  handleChange: function(event) {
    this.setState({text: event.target.value});
  },

  updateStartDate: function(dateObj) {
    this.setState({"valid" : dateObj.valid && this.state.valid})
    this.setState({"startDate" : dateObj.date})
  },

  submit: function() {
    $.ajax({
      type: "POST",
      url: "hours/task",
      data: this.state.text,
      success: function(data) {
         this.state.tasks.push(JSON.parse(data)[0])
         this.setState({"tasks": this.state.tasks})
      }.bind(this)
    })
  },
  
  render: function() {
    return (
      <div className="page">
        <input type="text"
               value={this.state.text} 
               onChange={this.handleChange} />
        <DateField updateDate={this.updateStartDate} />
        <button onClick={this.submit}>Tallenna</button>
        <Tasks tasks={this.state.tasks}></Tasks>
      </div>
    );
  }
});

ReactDOM.render(  
  React.createElement(TestApp, null),
  document.getElementById('content')
);
