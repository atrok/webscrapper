(this["webpackJsonpwebscrapper-client"]=this["webpackJsonpwebscrapper-client"]||[]).push([[0],{149:function(e,t,n){e.exports=n(588)},186:function(e,t){},587:function(e,t,n){},588:function(e,t,n){"use strict";n.r(t);var o=n(0),r=n.n(o),s=n(134),a=n.n(s),i=n(28),c=n(29),l=n(32),u=n(31),b=n(33),p=n(41),m=n.n(p),h=n(30),f=n(137),d=n.n(f),g={connection:"http://192.168.1.21:3030"},v=null,j=function(){return console.log(v),null===v&&(v=d()(g.connection),console.log("Opening socketio socket, connection: ",v.connected)),v},k=function(){function e(){Object(i.a)(this,e),this.id="NotificationsIO_"+Date.now(),this.socket=j(),console.log("Obtained socketio socket, connection: ",this.socket.connected),this.toConsole("Instantiating base class NotificationsIO")}return Object(c.a)(e,[{key:"subscribe",value:function(e){this.toConsole("Subscribing to report ",e.state.id)}},{key:"unsubscribe",value:function(e){this.toConsole("Unsubscribing from getting report "+e.state.id)}},{key:"toConsole",value:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];var o=t.join(" ");console.log("["+this.id+"]",o)}}]),e}(),O=function(e){function t(){var e;Object(i.a)(this,t),e=Object(l.a)(this,Object(u.a)(t).call(this));var n=Object(h.a)(e);return e.toConsole("Instantiating"),n.id="Report_"+Date.now(),n.subscribers=[],n.socket.on("report",(function(t){n.toConsole("report arrived: ",JSON.stringify(t)),t.error||(n.toConsole("Subscribers: ",e.subscribers.length),e.subscribers.length>0&&n.subscribers.forEach((function(e){e.getReport(t)})))})),e}return Object(b.a)(t,e),Object(c.a)(t,[{key:"subscribe",value:function(e){this.toConsole("Subscribing to report ",e.state.id),this.subscribers.push(e),this.socket.emit("getReport",e.props.data.jobid)}},{key:"unsubscribe",value:function(e){this.toConsole("Unsubscribing from getting report "+e.state.id),this.subscribers=this.subscribers.filter((function(t){return t!==e}))}}]),t}(k),_=function(e){function t(){var e;Object(i.a)(this,t),e=Object(l.a)(this,Object(u.a)(t).call(this));var n=Object(h.a)(e);return n.id="Report_"+Date.now(),e.toConsole("Instantiating"),n.subscribers=[],n.socket.on("client data",(function(t){n.toConsole("client data arrived: ",JSON.stringify(t)),t.error||(n.toConsole("Subscribers: ",e.subscribers.length),e.subscribers.length>0&&n.subscribers.forEach((function(e){e.getReport(t)})))})),e}return Object(b.a)(t,e),Object(c.a)(t,[{key:"subscribe",value:function(e){this.toConsole("Subscribing to report ",e.state.id),this.subscribers.push(e)}},{key:"unsubscribe",value:function(e){this.toConsole("Unsubscribing from getting report "+e.state.id),this.subscribers=this.subscribers.filter((function(t){return t!==e}))}},{key:"startJob",value:function(){this.socket.emit("start job",null)}}]),t}(k),E=[{name:"Solution",selector:"search.solution_name",sortable:!1},{name:"Component",selector:'search["component"]',cell:function(e){return r.a.createElement("a",{href:e.search["component-href"]},e.search.component)},sortable:!1},{name:"Release",selector:'search["release-link-href"]',sortable:!1,cell:function(e){return r.a.createElement("a",{href:e.search["release-link-href"]},e.search.release)}},{name:"Error",selector:"error",sortable:!1}],y=[{name:"Family",selector:"family",sortable:!0},{name:"Solution",selector:"solution_name",sortable:!1},{name:"Component",selector:"component",cell:function(e){return r.a.createElement("a",{href:e["component-href"]},e.component)},sortable:!1},{name:"Release",selector:"release-link-href",sortable:!1,cell:function(e){return r.a.createElement("a",{href:e["release-link-href"]},e.release)}},{name:"Date",selector:"release_date",sortable:!1},{name:"Type",selector:"release_type",sortable:!1},{name:"execution time, ms",selector:"executiontime",sortable:!1}],w=function(e){function t(e){var n;Object(i.a)(this,t),n=Object(l.a)(this,Object(u.a)(t).call(this,e)),console.log("init instance of ExpendableComponent",Object(h.a)(n));var o="ExpendableComponent_"+Date.now();return n.state={id:o,data:{report:{invocations:0,execution_duration:0,errors:[],execution_report:[],msg:null}}},n.report=new O,n}return Object(b.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){console.log("Subscribe for report notifications, ",this.state.id),this.report.subscribe(this)}},{key:"getReport",value:function(e){e.jobid===this.props.data.jobid&&this.setState({data:e})}},{key:"componentWillUnmount",value:function(){this.report.unsubscribe(this)}},{key:"renderReport",value:function(){var e=this.state.data;return e.report.msg?r.a.createElement("p",null,e.report.msg):r.a.createElement(r.a.Fragment,null,r.a.createElement("p",null,r.a.createElement("span",null,"Last executed at "),r.a.createElement("span",null,e.report.last_execution_time)),r.a.createElement("p",null,r.a.createElement("span",null,"Duration "),r.a.createElement("span",null,e.report.execution_duration)),r.a.createElement(m.a,{title:"New records",columns:y,data:e.report.execution_report}),r.a.createElement(m.a,{title:"Errors",columns:E,data:e.report.errors}))}},{key:"render",value:function(){var e=this.state.data;return console.log("Data: ",e),r.a.createElement("div",{className:"m-3",name:"report-"+this.props.data.jobid},this.renderReport())}}]),t}(o.Component),C=n(143),R={aws_project_region:"us-east-1",aws_cognito_identity_pool_id:"us-east-1:7c11e036-46e2-4007-abcf-97ca4eb9c242",aws_cognito_region:"us-east-1",aws_user_pools_id:"us-east-1_aPD8oYCWF",aws_user_pools_web_client_id:"7omvkliuesb6bffjcidmrlunqs",oauth:{}};n(144).a.configure(R);var x=[],S=[{name:"JOB ID",selector:"jobid",sortable:!0},{name:"Next Run",selector:"next-run",sortable:!1},{name:"Invocations",selector:"invocations",sortable:!1},{name:"Start url",selector:"url",sortable:!1},{name:"Status",selector:"status",sortable:!1},{name:"Progress",selector:"progress",sortable:!1}],D=function(e){function t(){var e;return Object(i.a)(this,t),(e=Object(l.a)(this,Object(u.a)(t).call(this))).id=Date.now(),e.state={response:0,endpoint:"http://192.168.14.91:3030",columns:S,data:x,id:"Application_"+Date.now()},e.notification=new _,console.log("Instantiating ",e.state.id),e}return Object(b.a)(t,e),Object(c.a)(t,[{key:"componentDidMount",value:function(){console.log("componentDidMount ",this.state.id),this.notification.subscribe(this)}},{key:"getReport",value:function(e){this.setState({data:e})}},{key:"componentWillUnmount",value:function(){this.notification.unsubscribe(this)}},{key:"render",value:function(){var e=this,t=this.state,n=t.columns,o=t.data;return console.log("Rendering "+this.state.id),r.a.createElement("div",{className:"m-2"},r.a.createElement("h1",null,"Genesys Release notes webscrapper service"),r.a.createElement(m.a,{title:"List of available scrapper jobs",columns:n,data:o,expandableRows:!0,expandableRowsComponent:r.a.createElement(w,null)}),r.a.createElement("div",null,r.a.createElement("button",{key:"startJob",onClick:function(){return e.notification.startJob()}},"Start immediate job")))}}]),t}(o.Component),I=Object(C.a)(D,{includeGreetings:!0});n(587);a.a.render(r.a.createElement(I,null),document.getElementById("root"))},63:function(e,t){}},[[149,1,2]]]);
//# sourceMappingURL=main.e4770e27.chunk.js.map