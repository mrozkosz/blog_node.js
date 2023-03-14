const { body } = require('express-validator');

const update = [
    body('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('should be not empty')
        .bail()
        .isLength({ min: 6, max: 32 })
        .withMessage('Password must be 6-32 characters in length'),

    body('passwordRepeat')
        .trim()
        .not()
        .isEmpty()
        .withMessage('should be not empty')
        .bail()
        .custom(async (passwordRepeat, { req }) => {
            const { password } = req.body;

            if (password !== passwordRepeat) {
                return Promise.reject('Passwords does not match');
            }
        })
];

const create = [
    body(['email'])
        .trim()
        .not()
        .isEmpty()
        .withMessage('should be not empty')
        .bail()
        .isEmail()
        .withMessage('Email address is not valid!')
];

module.exports = {
    update,
    create
};
