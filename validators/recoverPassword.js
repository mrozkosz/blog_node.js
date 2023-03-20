const { body } = require('express-validator');

const update = [
    body('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('should be not empty')
        .bail()
        .isLength({ min: 6, max: 32 })
        .withMessage('Password must be 6-32 characters in length')
];

const create = [
    body(['email'])
        .trim()
        .not()
        .isEmpty()
        .withMessage('should be not empty')
        .bail()
        .isEmail()
        .withMessage('Email address is not valid!'),
    body('callback')
        .trim()
        .not()
        .isEmpty()
        .withMessage('should be not empty')
        .bail()
];

module.exports = {
    update,
    create
};
