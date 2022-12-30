var Busboy = require('busboy');
var path = require('path');
var os = require('os');
var fs = require('fs');
var uuid = require('uuid');
var image = require('../../image');
var s3 = require('../../s3');

exports.uploadImage = (req) => {
    var busboy = new Busboy({ headers: req.headers });
        
    var paths = [];
    
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        
        var name = uuid.v4();
        
        var saveTo = path.join(os.tmpDir(), path.basename(name));
        
        file.pipe(fs.createWriteStream(saveTo));
        
        paths.push(saveTo);
    });
    
    busboy.on('finish', function() {
        
        console.log(paths);
        
        image.normalize(paths[0]).then(function(name) {
            
            console.log('Normalized to ' + name);
            
            image.resize(name, 728).then(function(name) {
                
                console.log('Resized to ' + name);
                
                var to = '/images/' + path.basename(name);
                
                s3.upload(name, to).then(function(url) {
                    
                    console.log('Uploaded to ' + url);
                });
            });
        });
        
        res.writeHead(200, { 'Connection': 'close' });
        res.end("That's all folks!");
    });
    
    return req.pipe(busboy);
} 