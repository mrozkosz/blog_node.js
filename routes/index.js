const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require("swagger-jsdoc");
const { swagger } = require("../config");
const fs = require('fs');

const options = {
    definition: swagger,
    apis: [],
};

module.exports = (di) => {
    fs.readdirSync(__dirname).forEach((route) => {
        route = route.split('.')[0];

        if (route === 'index') {
            return;
        }

        options.apis.push(`./routes/${route}.js`);
        router.use(require(`./${route}`)(di));
    });

    const specs = swaggerJsdoc(options);

    router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


    return router;
};
