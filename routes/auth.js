/**
 * @openapi
 * /signup:
 *  post:
 *   tags:
 *    - auth
 *   summary: Register new User
 *   description: #
 *   requestBody:
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/Signup'
 *
 *   responses:
 *    default:
 *      description: successful operation
 * /login:
 *  post:
 *   tags:
 *    - auth
 *   summary: Login
 *   description: #
 *   requestBody:
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/Credentials'
 *
 *   responses:
 *    default:
 *      description: successful operation
 * /recover-password:
 *   post:
 *    tags:
 *      - auth
 *    summary: Reset password
 *    description: #
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RecoverPassword'
 *
 *    responses:
 *     default:
 *       description: successful operation
 *
 * /recover-password/{hash}:
 *   post:
 *    tags:
 *      - auth
 *    summary: Reset password by hash from email
 *    description: #
 *    parameters:
 *       - name: hash
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Password'
 *
 *    responses:
 *     default:
 *       description: successful operation
 *
 * /me:
 *   get:
 *     tags:
 *       - auth
 *     summary: Retrieve a single user
 *     description: #
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 *
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Password:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *           description: New Password
 *           example: LEXaV*6Waic%Z
 *     RecoverPassword:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user email
 *           example: admin@wp.pl
 *         callback:
 *           type: string
 *           description: Url to frontend where user change password
 *           example: https://frontend.cyberlab.pl/recover-password
 *     Signup:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user email
 *           example: admin@wp.pl
 *         password:
 *           type: string
 *           description: The user password
 *           example: qwerty
 *     Credentials:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user email
 *           example: admin@wp.pl
 *         password:
 *           type: string
 *           description: The user password
 *           example: qwerty
 *   security:
 *     - bearerAuth: []
 */


const express = require('express');
const router = express.Router();
const { isLoggedIn, validate } = require('../middleware');
const emailValidator = require('../validators/emailValidator');
const passwordValidator = require('../validators/passwordValidator');
const recoverPassword = require('../validators/recoverPassword');
const isRecoverHash = require('../middleware/isRecoverHash');

module.exports = (di) => {
    const authController = di.get('controller.auth');

    router.get('/me', [isLoggedIn], (...args) => authController.me(...args));
    router.post('/login', [emailValidator.login, passwordValidator, validate], (...args) =>
        authController.login(...args)
    );
    router.post('/signup', [emailValidator.signup, passwordValidator, validate], (...args) =>
        authController.signup(...args)
    );
    router.post(
        '/recover-password',
        [recoverPassword.create, validate],
        (...args) => authController.recoverPasswordSendMail(...args)
    );
    router.post(
        '/recover-password/:hash',
        [recoverPassword.update, validate],
        isRecoverHash,
        (...args) => authController.recoverPassword(...args)
    );

    return router;
};
