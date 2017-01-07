var express = require('express');
var URL = require('url');
var app = express();
var mongo = require('mongodb').MongoClient;

var PORT = process.env.PORT || 8080;
var dbUrl = process.env.MONGOLAB_URI;

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

function generateShortUrl(host, url, callback) {
    var result = {
        original_url: url,
        short_url: 'https://' + host + '/' + Date.now()
    };
    
    mongo.connect(dbUrl, function (err, db) {
       if (err) throw err;
       db.collection('urls').insert(result, function (err, doc) {
            if (err) return callback(err);
            
            callback(null, {
                original_url: result.original_url,
                short_url: result.short_url
            });
            db.close();
       });
    });
}

function getOriginalUrl(host, shortUrl, callback) {
    shortUrl = 'https://' + host + '/' + shortUrl;
    
    mongo.connect(dbUrl, function (err, db) {
       if (err) throw err;
       db.collection('urls').find({ short_url: shortUrl })
                            .toArray(function (err, docs) {
                                if (err) return callback(err);
                                
                                if (docs.length == 0) return callback({ msg: 'Url not found'});
                                
                                callback(null, docs[0].original_url);
                                db.close();
                            });
    });
}

function redirectTo(res, url) {
    res.redirect(url);
}