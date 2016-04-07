var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

'use strict';

var provider = null,
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
        this.config = options.config ? options.config : require(configPath); //use config if passed in otherwise fall back to configPath
        getProvider(this.config,providers)
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

function addCustomData(customData) {
    var data = {};
    if( !this.config.dataPoints ) {
        return data;
    }
    _.each(this.config.dataPoints,function(value,key) {
        var path = typeof value === 'object' && value.name ? value.name : value;
        var defaultValue = typeof value === 'object' && value.default ? value.default : undefined;
        try{
            _.set(data,key,_.get(customData,path,defaultValue));
        }catch(e){
            log(e);
        }
    });

    return data;
}

function init(app,getCustomDataCallback) {
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
                .then(function(user){
                    data = _.assign({},{user:user.toJSON()},data);
                    getCustomDataCallback(ctx).then(
                        function(customData) {
                            data = _.assign({},addCustomData(customData),data);
                            this.provider.track(data);
                        },
                        function(customData) {
                            this.provider.track(data);
                        }
                    );
                })
                .catch(function(){
                    getCustomDataCallback(ctx).then (
                        function(customData) {
                            data = _.assign({},addCustomData(customData),data);
                            this.provider.track(data);
                        },
                        function(customData) {
                            this.provider.track(data);
                        }
                    );
                });
        }
        catch(e) {
            log(e);
        }
        next();
    });
}

function log(e) {
    console.log( 'LoopbackAnalytics:','Error', e );
}

module.exports = function analytics(app,options,getCustomDataCallback) {
    options = options || {configPath: __dirname + '/../../server/config-analytics.json'};
    getCustomDataCallback = getCustomDataCallback || function(){ return new Promise(function(resolve,reject){ resolve(); }); };
    this.options = options;
    app.on('started', function() {
        loadProviders()
            .then(function(providers){ return setProvider(options,providers); })
            .then(function(provider){ this.provider = provider; init(app,getCustomDataCallback); });
    });
}