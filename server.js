var express = require('express');
var URL = require('url');
var app = express();

var PORT = process.env.PORT || 8080;

app.use(function (req, res, next) {
    if (req.url.endsWith('/favicon.ico')) res.end(404);
    next();
});

app.get('*', function (req, res) {
    var urlData = URL.parse(req.url);
    
    if (urlData.path.startsWith('/new/')) {
        var url = urlData.path.slice(5, urlData.path.length);
        generateShortUrl(req.headers.host, url, function (err, result) {
            if (err) throw err;
            res.json(result);
        });
    } else {
        var shortUrl = urlData.path.slice(1, urlData.path.length);
        getOriginalUrl(req.headers.host, shortUrl, function (err, originalUrl) {
            if (err) return res.json({ error: "This url is not on the database." });
            redirectTo(res, originalUrl);
        });
    }
});

app.listen(PORT, function () {
   console.log('Server listening to port: ' + PORT); 
});

var data = [];
function generateShortUrl(host, url, callback) {
    var result = {
        original_url: url,
        short_url: 'https://' + host + '/' + Date.now()
    };
    data.push(result);
    
    callback(null, result);
}

function getOriginalUrl(host, shortUrl, callback) {
    shortUrl = 'https://' + host + '/' + shortUrl;
    for (var i = 0; i < data.length; i++) {
        if (data[i].short_url === shortUrl) {
            return callback(null, data[i].original_url);
        }
    }
    
    callback({ msg: 'Url not found'});
}

function redirectTo(res, url) {
    res.redirect(url);
}