const fileUpload = require('express-fileupload');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const di = require('./di');
const path = require('path');
app.set('di', di);

require('./plugins/cors')(app);

app.use(fileUpload({
    createParentPath: true
}));

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(bodyParser.json());

const routes = require('./routes')(di);

app.use(routes);
app.use('/.well-known', express.static(path.join(__dirname, 'public/.well-known')));

module.exports = app;
