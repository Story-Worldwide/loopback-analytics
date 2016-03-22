Loopback Analytics
==================
This is a simple module that tracks all Loopback calls by adding a global remote hook.

Installation
------------
Add this library as a project dependency via npm install `https://github.com/npedrini/loopback-analytics --save`.

Then, run the following to copy the boot and config files to the `/server` sub-directory of your Loopback project:
    
    `cp node_modules/loopback-analytics/boot-analytics.example.js server/boot/boot-analytics.js`
    `cp node_modules/loopback-analytics/config-analytics.example.json server/config-analytics.json`

Providers
---------

###Keen###
To configure, add `KEEN_READ_KEY` and `KEEN_PROJECT_ID` environment variables. This can be accomplished by using a `.env` file or via node environment variables.

Then, set `config.provider` to `keen`. 

By default, `model`, `method`, `path`, `query` and `userId` properties will be added to the event object. To add additional properties to it, you can set `config.dataPoints` to an object of custom data points to collect, where the key is the target property name in the Keen Event object, and the value is the path to the property value in the response. The following config appends the `user_id`, for example:

    {
        "provider": "keen",
        "dataPoints": {
            "user_id": "context.currentUser.id"
        }
    }