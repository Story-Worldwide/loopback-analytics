var tracker;

module.exports = {

    init: function()
    {
        if( !process.env.GOOGLE_TRACKING_ID ) {
            console.log("Please add a GOOGLE_TRACKING_ID key-value pair to a .env file to property configure Google Analtyics.");
            return;
        }

        var tracker = ua(process.env.GOOGLE_TRACKING_ID, /*userId,*/null, {cookieDomain: 'none', strictCidFormat: false, https: true});
    },

    track: function(data) {
        this.tracker.event( data.model, data.method, data.query, {p:data.path}, function(err){
            if( err ) {
                console.log(err);
            } else {
                if( process.env.DEBUG ) {
                    console.log('Event sent to Google Analytics',{category:data.model, action:data.method, label:data.query});
                }
            }
        } ).send();
    }
}