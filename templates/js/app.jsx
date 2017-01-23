'use strict';

// https://docs.djangoproject.com/en/dev/ref/csrf/

// using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) { var cookie = jQuery.trim(cookies[i]);
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

var formatDate = function(date) {
   return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
};

var Hour = React.createClass({
   getInitialState: function() {
      return {"reserved": this.props.reserved}
   },
   render: function() {
      return this.state.reserved ? (<span className="hour reserved"></span>) : (<span className="hour free"></span>);
   }
});

var Day = React.createClass({
   getInitialState: function() {
      return {"date": this.props.date, "startTime":this.props.start, "endTime":this.props.end}
   },

   isReserved: function(hour) {
      var date = new Date(this.state.date.setHours(hour, 0, 0, 0))
      return this.state.startTime <= date && date <= this.state.endTime;
   },
  
   click: function(){
     console.log(this.props.start + " " + this.props.end)
   },

   render: function() {
      var hours = []
      for (var i = 7; i <= 22; i++) {
          var reserved = this.isReserved(i)
          hours.push((<Hour key={i} reserved={reserved}></Hour>))
      }
      return <div onClick={this.click} className="day col-md-3 col-sm-3">{hours}</div>
   }
});

var Tasks = React.createClass({
   getInitialState: function() {
      return {"tasks": this.props.tasks}
   },
  
   componentWillReceiveProps(nextProps) {
      this.setState({"tasks": nextProps.tasks });
   },
 
   render: function() {
      var today = new Date();
      var tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      var dayAfterTmrw = new Date()
      dayAfterTmrw.setDate(today.getDate() + 2);
      var header = (<div className="row">
                        <div className="col-md-2 col-sm-2"></div>
                        <div className="col-md-3 col-sm-3">{formatDate(today)}</div>
                        <div className="col-md-3 col-sm-3">{formatDate(tomorrow)}</div>
                        <div className="col-md-3 col-sm-3">{formatDate(dayAfterTmrw)}</div>
                    </div>);
      var tasks = this.state.tasks
          .filter(function(task) {
              var endOfDayAfterTomorrow = new Date();
              endOfDayAfterTomorrow.setDate(today.getDate() + 2);
              endOfDayAfterTomorrow.setHours(23, 0, 0, 0);
              return new Date(task.fields.end_time) > today && new Date(task.fields.start_time) < endOfDayAfterTomorrow;
          })
          .map(function(task) {
              return (<div className="row" key={task.pk}>
                       <div className="col-md-2 col-sm-2 name">{task.fields.content}</div>
                       <Day date={today} 
                         start={new Date(task.fields.start_time)} 
                         end={new Date(task.fields.end_time)}/> 
                       <Day date={tomorrow} 
                         start={new Date(task.fields.start_time)} 
                         end={new Date(task.fields.end_time)}/> 
                       <Day date={dayAfterTmrw} 
                         start={new Date(task.fields.start_time)} 
                         end={new Date(task.fields.end_time)}/>
                      </div>);
      })
      return (<div>{header}{tasks}</div>)
   }   
});

var Time = React.createClass({
   render: function() {
      var options = []
      options.push((<option disabled selected value>-</option>))
      for (var i = 7; i <= 22; i++) {
         options.push((<option key={i}>{i}</option>))
      }
      return (<div className="col-md-3 form-group">
                  <label>Time</label>
                  <select className="form-control" onChange={this.props.updateHour}>{options}</select>
             </div>);
   }
});

var DateField = React.createClass({
   getInitialState: function() {
      return {"dateValid": false, "datetime": null, "hour": null};
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
      var dateValid = this.isValidDate(parts);
      var date = new Date(parts.join("/"))
      var datetime = dateValid ? new Date(date.setHours((this.state.hour || 0), 0, 0, 0)) : event.target.value
      this.setState({"datetime"  : datetime, 
                     "dateValid" : dateValid})
      this.props.updateDate({"datetime" : datetime,
                             "valid"    : dateValid && this.state.hour})
   },

   updateHour: function(event) {
      this.setState({"hour": event.target.value})
      if (this.state.dateValid) {
         var datetime = new Date(this.state.datetime.setHours(event.target.value, 0, 0, 0))
         this.props.updateDate({"datetime" : datetime,
                                "valid"    : true})
      }
   },

   render: function() {
      var date = new Date();
      var placeHolder = formatDate(date)
      var className = this.state.dateValid || (!this.state.datetime || this.state.datetime.length == 0) ? "" : "invalid";
      className = [className, "form-control", "col-md-3"].join(" ");
      return (<div className="row">
                 <div className="col-md-3 form-group">
                      <label>{this.props.label}</label>
                      <input type="text" className={className} onChange={this.handleChange} placeholder={placeHolder} ></input>
                 </div>
                 <Time updateHour={this.updateHour}/>
              </div>)
   }
});

var TestApp = React.createClass({  

  getInitialState: function() {
   return {
       "content" : "",
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
      data: JSON.stringify({"content"   : this.state.content,
                            "startDate" : this.state.startDate.value,
                            "endDate"   : this.state.endDate.value}),
      success: function(data) {
         this.state.tasks.push(JSON.parse(data)[0])
         this.setState({"tasks": this.state.tasks})
      }.bind(this)
    })
  },
  
  render: function() {
    var valid = this.state.startDate.valid && this.state.endDate.valid && this.state.content && this.state.content.length; 
    return (
      <div className="page">
         <div className="form">
             <div className="row"> 
               <div className="col-md-3 form-group">
                  <label>Name</label>
                  <input type="text"
                     className="form-control"
                     placeholder="Your Name" 
                     onChange={this.handleChange} />
               </div>
             </div>
             <DateField updateDate={this.updateStartDate} label="Start Name" />
             <DateField updateDate={this.updateEndDate} label="End Date"/>
             <button className="btn btn-default" disabled={!valid} onClick={this.submit}>Tallenna</button>
         </div>
         <Tasks tasks={this.state.tasks}></Tasks>
      </div>
    );
  }
});

ReactDOM.render(  
  React.createElement(TestApp, null),
  document.getElementById('content')
);
