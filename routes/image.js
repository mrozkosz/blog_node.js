/**
 * @openapi
 * /image/{image_name}:
 *  get:
 *   tags:
 *       - image
 *   summary: Retrieve a single image
 *   description: #
 *   parameters:
 *     - name: image_name
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *   responses:
 *    default:
 *      description: successful operation
 * /image-uploader:
 *   post:
 *     tags:
 *       - image
 *     summary: Retrieve no content
 *     description: #
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *           encoding:
 *             files:
 *               style:
 *                 form
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 * /image/{name}:
 *   delete:
 *     tags:
 *       - image
 *     summary: #
 *     description: #
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */

const express = require('express');
const router = express.Router();
const { isLoggedIn, validate} = require('../middleware');
const imageValidator = require("../validators/imageValidator");

module.exports = (di) => {
    const imageController = di.get('controller.image');

    router.get('/image/:name', (...args) => imageController.show(...args));
    router.post('/image-uploader', isLoggedIn, [imageValidator, validate], (...args) => imageController.upload(...args));
    router.delete('/image/:name', isLoggedIn, (...args) => imageController.delete(...args));

    return router;
};