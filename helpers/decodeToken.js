const config = require('../config');
const jwt = require('jsonwebtoken');

module.exports = (bearerToken) => {
    if (bearerToken === undefined) {
        return null;
    }

    let token = bearerToken;
    if(bearerToken.includes("Bearer")){
        token = token.replace('Bearer ', '');
    }

    try {
        const decoded = jwt.verify(token, config.auth.secretKey);

        return decoded;
    } catch (err) {
        console.error(err);

        return null;
    }
};
