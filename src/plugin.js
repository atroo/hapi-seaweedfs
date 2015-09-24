var weedClient = require("node-seaweedfs");
var stream = require("stream");
var joi = require("joi");

var weedfs;

exports.register = function (server, options, next) {
    var initErr;
    
    var spec = joi.object().keys({
        host: joi.string().required(),
        port: joi.number().integer().min(1).max(70000),
        usePublicUrl: joi.boolean().optional().description("wether to use the url or publicUrl to read and write data from seaweedFS"),
        status: joi.object().optional().keys({
            enable: joi.boolean().description("enables fetching of status information from master server and triggers an intercom event"),
            fetchInterval: joi.number().integer().min(1000).max(1000 * 60 * 60 * 24).description("the interval between status fetches, minimum is 1 second, maximum 1 day"),
            goodLogTags: joi.array().items(joi.string()).description("specify tags to enable logging to server.log")
        })
    });
    
    spec.validate(options, function(err, value) { 
        if(err) {
            initErr = err;
        }
    });
    
    weedfs = new weedClient({
        server:     options.host,
        port:       options.port,
        usePublicUrl: options.usePublicUrl || true
    });    
    
    server.dependency("hapi-intercom", function (server, next) {
        var chan = server.methods.intercom.getChannel("seaweedfs");
        
        chan.reply("file", function(fid) {
            return weedfs.read(fid);
        });
        
        chan.reply("systemStatus", function(fid) {
            return weedfs.systemStatus();
        });
        
        chan.reply("masterStatus", function(fid) {
            return weedfs.masterStatus();
        });
        
        chan.reply("connection", function(files, opts) {
            //intercom will wrap this into a promise for us
            return weedfs;
        });
        
        if(options.status && options.status.enable) {
            var interval = options.status.fetchInterval || (1000 * 15);
            var t = setInterval(function() {
                weedfs.systemStatus().then(function(res) {
                    chan.emit("systemStatus", res);
                    if(options.status.goodLogTags) {
                        server.log(["seaweedfs"].concat(options.status.goodLogTags), res);
                    }
                });
            }, interval);
            t.unref();
            server.on("stop", function() {
                clearInterval(t);
            });
        }
        
        next();
    });
    
    next(initErr);
};

exports.register.attributes = {
    pkg: require('../package.json')
};