const HttpStatuses = require("http-status-codes");
const { Op } = require("sequelize");
const slugify = require('../helpers/slugGenerator');
const {now} = require("moment");
const htmlToString = require('../helpers/htmlToText');

class PostController {
    constructor(postRepository) {
        this.postRepository = postRepository;
    }

    async index(req, res) {
        const {
            perPage = '5',
            page = '1',
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;
        const pageNumber = parseInt(page);
        const limit = parseInt(perPage);
        const offset = (pageNumber - 1) * limit;
        const where = {};

        const posts = await this.postRepository.findAndCountAll({
            where,
            offset,
            limit,
            order: [[sortBy, order]],
            attributes: {
                exclude: ["author"],
            },
            include: [
                {
                    association: "user",
                    attributes: {
                        exclude: ['password', 'dayOfBirth', 'availableDays'],
                    },
                },
            ],
        });

        const totalPages = Math.ceil(posts.count / limit);
        const previousPage = () => {
         if(parseInt(page) === 1 || parseInt(page) < 0) {
             return;
         }

         return parseInt(page) - 1;
        }

        const nextPage = () => {
            if(parseInt(page) >= totalPages) {
                return;
            }

            return parseInt(page) + 1;
        }

        return res.send({ totalPages, previousPage:previousPage(), nextPage:nextPage(), data: posts.rows });
    }

    async show(req, res) {
        const { id } = req.params;

        const post = await this.postRepository.findOne({
            where: { id },
            attributes: {
                exclude: ["author"],
            },
            include: [
                {
                    association: "user",
                    attributes: {
                        exclude: ['password', 'dayOfBirth', 'availableDays'],
                    },
                },
            ],
        });

        if(!post){
            return res.sendStatus(HttpStatuses.NOT_FOUND);
        }

        return res.send(post);
    }

    async update(req, res){
        const { params, title, blogPost, image } = req;
        const { id } = params;

        const slug = slugify(title);

        const existingPost = await this.postRepository.findOne({
            where: { id }
        });

        if(!existingPost){
            return res.status(HttpStatuses.NOT_FOUND).send('Post not exist!');
        }

        const excerpt = await htmlToString(blogPost, 150);

        const x = await existingPost.update({title, blogPost, image, slug, excerpt});

        return res.send(x);
    }

    async create(req, res) {
        const { loggedUser, body } = req;
        const { title, blogPost, image } = body;
        const slug = slugify(title);
        const array = [{ title }, { blogPost }, { slug }]

        if(image !== ''){
            array.push({ image });
        }

        const existingPosts = await this.postRepository.findOne({
            where: {
                [Op.or]: array
            }
        });

        if(existingPosts){
            return res.status(HttpStatuses.BAD_REQUEST).send('Post already exist');
        }

        const excerpt = await htmlToString(blogPost, 150);

        const post = await this.postRepository.create({
            title, blogPost, excerpt, image, author: parseInt(loggedUser.id), slug, updatedAt: now()
        });
        if(!post){
            return res.status(HttpStatuses.BAD_REQUEST).send('Something went wrong..., post not created! :(');
        }

        return res.send(post);
    }

    async delete(req, res) {
        const { loggedUser, params } = req;
        const { id } = params;

        await this.postRepository.delete({
            where: { [Op.and]: [
                    { id },
                    { author: loggedUser.id }
                ] }
        });

        return res.sendStatus(HttpStatuses.NO_CONTENT);
    }
};

module.exports = PostController;
