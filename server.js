var express = require('express');
var url = require('url');
var app = express();

var PORT = process.env.PORT || 8080;

app.get('*', function (req, res) {
    var urlData = url.parse(req.url);
    if (urlData.path.startsWith('/new/')) {
        var url = urlData.path.slice(5, urlData.path.length);
        generateShortUrl(url, function (err, result) {
            if (err) throw err;
            res.json(result);
        });
    } else {
        var shortUrl = urlData.path.slice(1, urlData.path.length);
        getOriginalUrl(shortUrl, function (err, originalUrl) {
            if (err) res.json({ error: "This url is not on the database." });
            redirectTo(res, originalUrl);
        });
    }
});

app.listen(PORT, function () {
   console.log('Server listening to port: ' + PORT); 
});

var data = [];
function generateShortUrl(url, callback) {
    var result = {
        original_url: url,
        short_url: Date.now()
    };
    data.push(result);
    
    callback(null, result);
}

function getOriginalUrl(shortUrl, callback) {
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