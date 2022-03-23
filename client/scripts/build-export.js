var Inliner = require('inliner');
var fs = require('fs');

new Inliner('http://localhost:4200', function (error, html) {
	fs.writeFile("dist/static/export.html", html, ["utf-8"], function (err) {
		if (err) return console.log(err);
		console.log('Export HTML has been successfully written');
	});
});
