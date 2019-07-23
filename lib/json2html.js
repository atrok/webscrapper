var json2html = require('node-json2html');

//template
var transforms = {

    '<>': 'div',
    'html': [

        {

            '<>': 'div',
            'html': [
                {
                    '<>': 'p',
                    'html': '<p><b>Last execution time</b>: ${last_execution_time}</span><br/><b>Duration:</b>${execution_duration}</p>'
                },
                {
                    '<>': 'h3',
                    'html': 'Errors'
                },
                {
                    '<>': 'table',
                    'html': function () {
                        
                        var header='<tr><th>Solution</th><th>Component</th><th>Release</th><th>Error</th></tr>'
                        var rows = json2html.transform(this.errors, transforms.errors);

                        return header+rows;
                    }
                },

                {
                    '<>': 'h3',
                    'html': 'Found new releases'
                },
                {
                    '<>': 'table',
                    'html': function () {
                        var header='<tr><th>Family</th><th>Solution</th><th>Component</th><th>Release</th><th>Release date</th><th>Release type</th><th>Execution time</th></tr>'
                        var rows = json2html.transform(this.execution_report, transforms.exec_report);

                        return header+rows;
                    }
                },

            ]
        }
    ],




    exec_report: {
        '<>': 'tr',
            'html': '<td>${family}</td><td>${solution_name}</td><td><a href="${component-href}">${component}</a></td><td><a href="${release-link-href}" >${release}</a></td><td>${release_date}</td><td>${release_type}</td><td>${executiontime}</td>'
    },

    errors: {
        '<>': 'tr',
        'html': function () {

            var row = json2html.transform(this.search, transforms.table_err_rows);
            var error = '<td>' + this.error + '</td>'
            return row + error;
        }
    },
    table_err_rows: {
        '<>': 'td',
        'html': '${solution_name}</td><td>${component}</td><td>${release}'
    },

}

var toHtml = function (d) {
    return json2html.transform(d, transforms);
}



module.exports = {
    toHtml: toHtml
}