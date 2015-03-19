var weedClient = require("weed-fs");
var stream = require("stream");
var Promise = require("promise");
var joi = require("joi");

var weedfs;

exports.register = function (plugin, options, next) {
    var initErr;
    
    var spec = joi.object().keys({
        server: joi.string().required(),
        port: joi.number().integer().min(1).max(70000)
    });
    
    spec.validate(options, function(err, value) { 
        if(err) {
            initErr = err;
        }
    });
    
    weedfs = new weedClient({
        server:     options.host,
        port:       options.port
    });
    
    var write = function (file, opts) {
        return new Promise(function(onResolve, onReject) {
            weedfs.write(file, opts, function(err, finfo)  {
                if(err) {
                    return onReject(err);
                }
                
                onResolve(finfo);
            });
            
        });
    };
    
    var read = function (fileId, callback) {
        return new Promise(function(onResolve, onReject) {
            weedfs.read(fileId, function(err, response, body)  {
                if(err) {
                    return onReject(err);
                }
                
                onResolve({
                    response: response,
                    body: body
                });
            });
            
        });
    };
    
    var status = function() {
        return new Promise(function(onResolve, onReject) {
            weedfs.systemStatus(fileId, function(err, status)  {
                if(err) {
                    return onReject(err);
                }
                
                onResolve(status);
            });
            
        });
    };
    
    plugin.method("weed.write", write);
    plugin.method("weed.read", read);
    plugin.method("weed.systemStatus", status);
    
    next(initErr);
};

exports.register.attributes = {
    pkg: require('./package.json')
};