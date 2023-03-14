const { body } = require('express-validator');
const { Post } = require('../models');

const isValidUrl = urlString=> {
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
        '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
    return !!urlPattern.test(urlString);
};

const update = [
    body(['title'])
        .custom(async (title, { req }) => {
            if(title){
                req.title = title;

                return;
            }

            const {id} = req.params;
            const post = await Post.findOne({where:{id}});

            req.title = post.title;
        }),

    body(['image'])
        .custom(async (image, { req }) => {
            if(image){
                req.image = image;

                return;
            }

            const {id} = req.params;
            const post = await Post.findOne({where:{id}});

            req.image = post.image;
        }),

    body('blogPost')
        .custom(async (blogPost, { req }) => {
            if(blogPost){
                req.blogPost = blogPost;

                return;
            }

            const {id} = req.params;
            const post = await Post.findOne({where:{id}});

            req.blogPost = post.blogPost;
        }),
];

const create = [
    body(['title'])
        .trim()
        .not()
        .isEmpty()
        .withMessage('should be not empty')
        .bail(),

    body(['image'])
        .custom(async (image, { req }) => {

            if(image === ''){
                return;
            }

            if (!isValidUrl(image)) {

                return Promise.reject(`URL does not match - ${image}`);
            }
        }),

    body('blogPost')
        .trim()
        .not()
        .isEmpty()
        .withMessage('should be not empty')
        .bail(),
];

module.exports = {
    update,
    create
};
