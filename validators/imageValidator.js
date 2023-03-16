const { body } = require('express-validator');

module.exports = [
    body(['files'])
        .custom(async (files, { req }) => {
            if(!req.files.files){
                return Promise.reject('File does not exists!');
            }
        })
];
