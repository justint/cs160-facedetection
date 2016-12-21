module.exports = {

    'facebookAuth' : {
        'clientID'      : '<clientID>',
        'clientSecret'  : '<clientSecret>',
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : '<consumerKey>',
        'consumerSecret'    : '<consumerSecret>',
        'callbackURL'       : 'http://127.0.0.1:3000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '<clientID>',
        'clientSecret'  : '<clientSecret>',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    },

    'database' : {
        'url'     : 'postgres://localhost:5432/faceservice'
    }
};
