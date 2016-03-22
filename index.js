var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

'use strict';

var provider = null,
    trackerCache = {},
    config;

function loadProviders() {
    return new Promise(function(resolve,reject){
        fs.readdir(__dirname+'/lib/providers/',function(err,files){
            if( err ) {
                reject();
                return;
            }
            var providers = [];
            files.forEach(function(file){
                var file = path.parse(file);
                providers.push(file.name)
            });
            resolve(providers);
        })
    });
}

function setProvider(options,providers) {
    return new Promise(function(resolve,reject){
        var configPath = path.resolve(options.configPath) || __dirname + '/config.json';
        config = options.config ? options.config : require(configPath); //use config if passed in otherwise fall back to configPath
        getProvider(config,providers)
            .then(resolve);
    })
}

function getProvider(config,providers) {
    return new Promise(function(resolve,reject){
        if( !config || !config.provider || providers.indexOf(config.provider) == -1 ) {
            reject("Invalid provider. Please specify one of `" + providers.join(', ') + "` in config.provider property of your config file.");
        }
        try{
            var provider = require(__dirname+'/lib/providers/'+config.provider+'.js');
            provider.init();
            resolve(provider);
        }
        catch(e) {
            reject("Invalid provider. Please specify one of `" + supportedProviders.join(', ') + "` in config.tracker property of your config file.");
        }
    });
}

function getCustomData(context,user) {
    var data = {};
    if( !config.dataPoints ) {
        return data;
    }
    _.each(config.dataPoints,function(responsePath,eventPath) {
        var parts = path.parse(responsePath);
        parts = parts.base.split('.');

        var prop = responsePath;

        try{
            if( parts[0] === 'context' ) {
                parts.shift();
                if( parts[0] === 'currentUser' ) {
                    parts.shift();
                    prop = parts.join('.');
                    data[eventPath] = user[prop];
                }
            }
        }catch(e){
            console.log(e);
        }
    });
    return data;
}

function getUser(app,req) {
    return new Promise(function(resolve,reject) {
        if( !req.accessToken )
            return reject();
        app.models.User.findById(req.accessToken.userId,function(err,user){
            if( err ) return reject();
            if( !user ) return reject();
            resolve(user);
        });
    });
}

function init(app) {
    var remotes = app.remotes();
    remotes.after('**',function(ctx,next){
        try{
            var model = ctx.method.sharedClass.name;
            var method = ctx.method.name;
            var path = ctx.method.sharedClass.http.path;
            var query = ctx.req._parsedUrl.query;
            var userId = ctx.req.accessToken ? ctx.req.accessToken.userId : null;
            var accessToken = ctx.req.accessToken ? ctx.req.accessToken.id : -1;
            data = {model:model,method:method,path:path,query:query,userId:userId,accessToken:accessToken};
            getUser(app,ctx.req)
                .then
                (
                    function(user)
                    {
                        var customData = getCustomData(ctx,user);
                        data = _.merge(customData,data);
                        provider.track(data);
                    },
                    function(user)
                    {
                        provider.track(data);
                    }
                );
        }
        catch(e) {
            console.log('LoopbackAnalytics:','Error',e);
        }
        next();
    });
}

function track(data) {
    if( !provider ) return;
    provider.track(data);
}

module.exports = function analytics(app,options) {
    this.options = options;
    app.on('started', function() {
        loadProviders()
            .then(function(providers){ return setProvider(options,providers); })
            .then(function(_provider){ provider = _provider; init(app); });
    });
}