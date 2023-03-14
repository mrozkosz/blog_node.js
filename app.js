const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const di = require('./di');
app.set('di', di);

require('./plugins/cors')(app);

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(bodyParser.json());

const routes = require('./routes')(di);

app.use(routes);

module.exports = app;
