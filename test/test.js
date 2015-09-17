var Hapi = require('hapi');

var expect = require('chai').expect;

// Declare internals

var server;
var options = {
    host: "127.0.0.1",
    port: 9333,
    status: {
        enable: true,
        fetchInterval: 1000
    }
};


beforeEach(function (done) {
    server = new Hapi.Server();
    server.connection();

    server.register({
        register: require("hapi-intercom"),
        options: {}
    }, function (err) {});

    server.start(function (err) {
        if (err) {
            console.log(err);
        }
        done();
    });


});


describe('hapi seaweedfs integration', function () {

    it('should get a weed connection and write/delete a buffer', function (done) {
        server.route({
            method: 'GET',
            path: '/1',
            config: {
                handler: function (request, reply) {
                    var chan = server.methods.intercom.getChannel("seaweedfs");
                    var conn;
                    chan.request("connection").then(function (c) {
                        conn = c;
                        return conn.write(new Buffer("atroo"));
                    }).then(function (fileInfo) {
                        expect(fileInfo).to.be.an("object");
                        return conn.remove(fileInfo.fid);
                    }).then(function (res) {
                        expect(res).to.be.an("object");
                        reply({
                            success: true,
                            data: res
                        });
                    }).catch(function(err) {
                        console.log(err);
                    });
                }
            }
        });

        server.register({
            register: require('../'),
            options: options
        }, function (err) {
            expect(err).to.not.exist;

            server.start(function (err) {
                server.inject({
                    method: 'GET',
                    url: '/1'
                }, function (res) {
                    expect(res.result.data).to.be.an("object");
                    server.stop();
                    done();
                });
            });
        });
    });
    
    it('should reply to the convenience "file" request', function (done) {
        server.route({
            method: 'GET',
            path: '/1',
            config: {
                handler: function (request, reply) {
                    var chan = server.methods.intercom.getChannel("seaweedfs");
                    var conn;
                    chan.request("connection").then(function (c) {
                        conn = c;
                        return conn.write(new Buffer("atroo"));
                    }).then(function (fileInfo) {
                        expect(fileInfo).to.be.an("object");
                        return chan.request("file",fileInfo.fid);
                    }).then(function (buffer) {
                        expect(buffer).to.be.an.instanceof(Buffer);
                        reply({
                            success: true
                        });
                    }).catch(function(err) {
                        console.log(err);
                    });
                }
            }
        });

        server.register({
            register: require('../'),
            options: options
        }, function (err) {
            expect(err).to.not.exist;

            server.start(function (err) {
                server.inject({
                    method: 'GET',
                    url: '/1'
                }, function (res) {
                    expect(res.result.success).to.equal(true);
                    server.stop();
                    done();
                });
            });
        });
    });

    it('should wait for ops interval and send status information', function (done) {

        server.route({
            method: 'GET',
            path: '/1',
            config: {
                handler: function (request, reply) {
                    var chan = server.methods.intercom.getChannel("seaweedfs");
                    
                    chan.on("systemStatus", function(status) {
                        reply(status);
                    });
                }
            }
        });
        
        server.register({
            register: require('../'),
            options: options
        }, function (err) {

            expect(err).to.not.exist;
            server.start(function (err) {

                server.inject({
                    method: 'GET',
                    url: '/1'
                }, function (res) {
                    expect(res.result.Version).to.be.a("string");
                    expect(res.result.Topology).to.be.an("object");
                    server.stop();
                    done();
                });
            });
        });

    });
});