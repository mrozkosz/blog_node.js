const { body } = require('express-validator');

module.exports = [
    body('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('should be not empty')
        .bail()
        .isLength({ min: 6, max: 32 })
        .withMessage('Password must be 6-32 characters in length')
];
