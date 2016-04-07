Loopback Analytics
==================
This is a simple module that tracks all Loopback calls by adding a global remote hook.

Installation
------------
Add this library as a project dependency via npm install `https://github.com/npedrini/loopback-analytics --save`.

Then, run the following to copy the boot and config files to the `/server` sub-directory of your Loopback project:
    
    `cp node_modules/loopback-analytics/boot-analytics.example.js server/boot/boot-analytics.js`
    `cp node_modules/loopback-analytics/config-analytics.example.json server/config-analytics.json`

Note that if you customize the location of the `config-analytics.json` file, be sure to update the second argument passed to `loopbackAnalytics()` in `boot-analytics.js` accordingly.

Providers
---------

###Keen###
To configure, add `KEEN_READ_KEY` and `KEEN_PROJECT_ID` environment variables. This can be accomplished by using a `.env` file or via node environment variables.

Then, set `config.provider` to `keen`. 

By default, `model`, `method`, `path`, `query` and `userId` properties will be added to the event object. The current user will also be added via accessToken lookup. 

To add additional properties to the event object, you can set `config.dataPoints` to an object of custom data points, where the key for each entry is the target property name in the Keen Event object, and the value is the property value in the response. Both the key and the value can be can be simple (property name) or complex (dot-delimited path). 

For example, the following config addss a top-level `user_id` property:

    {
        "provider": "keen",
        "dataPoints": {
            "user_id": "context.accessToken.id"
        }
    }

You can also expose additional data points by passing a callback function to the `loopbackAnalytics()` constructor in `boot-analytics.js`. This callback should be a Promise-returning function that resolves with an object containing the additional data points. 