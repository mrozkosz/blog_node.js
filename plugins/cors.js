const cors = require('cors');
const config = require('../config');

module.exports = (app) => {
    const corsSites = config.app.corsSites
        .split(',')
        .map((site) => site.trim());
    const originsWhitelist = [
        'http://localhost:8081',
        'http://localhost:8083',
        config.app.frontendUrl,
        ...corsSites
    ];
    const corsOptions = {
        origin(origin, callback) {
            // if (originsWhitelist.includes(origin) || !origin) {
            //     callback(null, true);
            // } else {
            //     callback(new Error('Not allowed by CORS'));
            // }
            callback(null, true);
        },
        credentials: true
    };

    app.use(cors(corsOptions));

    app.use(function (err, req, res, next) {
        if (err.message !== 'Not allowed by CORS') return next();
        res.status(200).json({
            code: 200,
            message: 'Request not allowed by CORS'
        });
    });
};
