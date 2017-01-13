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
      return {"valid": false};
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
      if (month > 12 || !this.isValidDayOfMonth(date, month, year) || year.toString().length != 4) {
          return false;
      }
      return true;
   },

   handleChange: function(event) {
      var parts = event.target.value.split("/");
      var valid = this.isValidDate(parts);
      this.setState({"valid" : valid});
      this.props.updateDate({"datetime" : valid ? new Date(parts.join("/")) : event.target.value,
                             "valid"    : valid})
   },

   render: function() {
      var date = new Date();
      var placeHolder = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
      var className = this.state.valid ? "" : "invalid";
      return (<input type="text" className={className} onChange={this.handleChange} placeholder={placeHolder} ></input>)
   }
});

var TestApp = React.createClass({  

  getInitialState: function() {
   return {
       "content" : "foo",
       "tasks" : [],
       "startDate" : {"valid" : false, "value" : null},
       "endDate"   : {"valid" : false, "value" : null}
    };
  },

  componentDidMount: function() {
    $.ajax({
      type: "GET",
      url: "hours/tasks",
      dataType: 'json',
      success: function(data) {
         this.setState({"tasks" : JSON.parse(data)});
      }.bind(this)
    });
  },

  handleChange: function(event) {
    this.setState({"content": event.target.value});
  },

  updateStartDate: function(dateObj) {
    this.setState({"startDate" : {
                          "valid" : dateObj.valid,
                          "value" : dateObj.datetime}})
  },

  updateEndDate: function(dateObj) {
    this.setState({"endDate" : {
                          "valid" : dateObj.valid,
                          "value" : dateObj.datetime}})
  },
 
  submit: function() {
    $.ajax({
      type: "POST",
      url: "hours/task",
      data: JSON.stringify({"content" : this.state.content,
                            "startDate" : this.state.startDate.value,
                            "endDate" : this.state.endDate.value}),
      success: function(data) {
         this.state.tasks.push(JSON.parse(data)[0])
         this.setState({"tasks": this.state.tasks})
      }.bind(this)
    })
  },
  
  render: function() {
    var valid = this.state.startDate.valid &&  this.state.endDate.valid && this.state.content && this.state.content.length; 
    return (
      <div className="page">
        <input type="text"
               value={this.state.content} 
               onChange={this.handleChange} />
        <DateField updateDate={this.updateStartDate} />
        <DateField updateDate={this.updateEndDate} />
        <button disabled={!valid} onClick={this.submit}>Tallenna</button>
        <Tasks tasks={this.state.tasks}></Tasks>
      </div>
    );
  }
});

ReactDOM.render(  
  React.createElement(TestApp, null),
  document.getElementById('content')
);
