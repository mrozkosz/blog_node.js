/**
 * @openapi
 * /post:
 *   post:
 *     summary: Create blog post
 *     description: #
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostSchema'
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 *
 * /post/{id}:
 *   put:
 *     summary: Update blog post
 *     description: #
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostSchema'
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 *
 * /posts:
 *   get:
 *     summary: Retrieve posts
 *     description: #
 *     parameters:
 *       - name: perPage
 *         in: query
 *         required: false
 *         description: Default '5'
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         required: false
 *         description: Default '1'
 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         required: false
 *         description: Default 'createdAt'
 *         schema:
 *           type: string
 *       - name: order
 *         in: query
 *         required: false
 *         description: Default 'desc'
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 * /post/{_id}:
 *   get:
 *     summary: Retrieve a single post
 *     description: #
 *     parameters:
 *       - name: _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 *
 * /post/{__id}:
 *   delete:
 *     summary: Retrieve no content
 *     description: #
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: __id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 * @swagger
 * components:
 *   schemas:
 *     PostSchema:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Post title - required
 *           example: To pierwszy wpis na blogu
 *         blogPost:
 *           type: string
 *           description: Post content - required
 *           example: Tekst zamieszczony na blogu
 *         image:
 *           type: string
 *           description: Image is not required
 *           example: https://picsum.photos/id/989/4896/3264.jpg
 */

const express = require('express');
const {isLoggedIn} = require("../middleware");
const router = express.Router();
const { validate } = require('../middleware');
const postValidator = require('../validators/postValidator');

module.exports = (di) => {
    const postController = di.get('controller.post');

    router.post('/post', isLoggedIn, [postValidator.create, validate], (...args) => postController.create(...args));
    router.put('/post/:id', isLoggedIn, [postValidator.update, validate], (...args) => postController.update(...args));
    router.get('/post/:id', (...args) => postController.show(...args));
    router.get('/posts', (...args) => postController.index(...args))
    router.delete('/post/:id', isLoggedIn, (...args) => postController.delete(...args));


    return router;
};
