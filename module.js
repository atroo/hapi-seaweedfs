var weedClient = require("weed-fs");
var stream = require("stream");

var weedfs;

exports.register = function (plugin, options, next) {
    weedfs = new weedClient({
        server:     options.host,
        port:       options.port
    });
    
    var write = function (file, opts, callback) {
        weedfs.write(file, opts, callback);
    };
    
    var read = function (fileId, callback) {
        weedfs.read(fileId, callback);
    };
    
    var status = function(callback) {
        weedfs.systemStatus(function(err, status) {
            if(err) {
                callback(new Error("Could not retrieve system state"), null);
            }
            else {
                callback(null, status);
            }
        });
    };
    
    plugin.method("weed.write", write);
    plugin.method("weed.read", read);
    plugin.method("weed.systemStatus", status);
    
    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};