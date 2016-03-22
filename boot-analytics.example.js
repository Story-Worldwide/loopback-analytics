module.exports = function(server)
{
    var loopbackAnalytics;

    try {
        loopbackAnalytics = require('loopback-analytics');
    } catch(e) {
        process.exit('Please install loopabck analytics');
    }

    analytics(server,{configPath: __dirname + '/../../server/config-analytics.json'});
}