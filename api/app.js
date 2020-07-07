const express = require('express');

const config = require('./config');
const UserController = require('./usercontroller');

const app = express();

app.use(express.static(__dirname + '/public'));
app.use('/', UserController);

app.listen(config.PORT, function () {
    console.log(`listening on port ${config.PORT}!`);
})

