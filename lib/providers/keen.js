var _ = require('lodash');

var tracker;

module.exports = {

    init: function()
    {
        if( !process.env.KEEN_PROJECT_ID || !process.env.KEEN_WRITE_KEY ) {
            console.log("Please add KEEN_PROJECT_ID and KEEN_WRITE_KEY key-value pairs to a .env file to property configure Keen.");
            return;
        }

        var keen = require('keen-js');
        this.tracker = new keen({projectId:process.env.KEEN_PROJECT_ID,writeKey:process.env.KEEN_WRITE_KEY})
        return this.tracker;
    },

    track: function(data)
    {
        var event = _.merge( {keen:{timestamp:new Date().toISOString()}}, data );
        this.tracker.addEvent(process.env.KEEN_COLLECTION || "loopback", event, function(err, res) {
            if (err) {
                console.log(err);
            }else{
                if( process.env.DEBUG ) {
                    console.log('Event sent to keen',event);
                }
            }
        });
    }
}