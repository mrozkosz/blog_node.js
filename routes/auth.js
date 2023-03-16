/**
 * @openapi
 * /login:
 *  post:
 *   tags:
 *    - auth
 *   summary: Retrieve a single user and Auth token
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

module.exports = (di) => {
    const authController = di.get('controller.auth');

    router.get('/me', [isLoggedIn], (...args) => authController.me(...args));
    router.post('/login', [emailValidator, passwordValidator, validate], (...args) =>
        authController.login(...args)
    );

    return router;
};
