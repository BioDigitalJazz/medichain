var express = require('express'),
app = express();

app.use(express.static(__dirname));
app.use(express.static(__dirname + "/dist/"));
app.use(express.static(__dirname + "/src/public/"))
app.get('/', function(req, res) {
    res.sendfile('index.html', {root: __dirname + "/dist/" })
});

app.get('/popup.html', function(req, res) {
	res.sendfile('/src/public/popup.html')
})

app.get('/silent-renew.html', function(req, res) {
	res.sendfile('/src/public/silent-renew.html')
})

app.get('/oidc_callback.html', function(req, res) {
	res.sendfile('/src/public/oidc_callback.html')
})

console.log("------------ : " + __dirname )
var server = app.listen(process.env.PORT || 8000);
