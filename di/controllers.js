const { Reference } = require('node-dependency-injection');
const AuthController = require('../controllers/AuthController');
const PostController = require('../controllers/PostController');
const ImageController = require('../controllers/ImageController');

module.exports = (container) => {
    container
        .register('controller.auth', AuthController)
        .addArgument(new Reference('services.loginHandler'))
        .addArgument(
            new Reference('services.sendEmailToRecoverPasswordHandler')
        )
        .addArgument(new Reference('repositories.recoverPassword'))
        .addArgument(new Reference('repositories.user'));

    container.register('controller.post', PostController)
        .addArgument(new Reference('repositories.post'));

    container.register('controller.image', ImageController)
        .addArgument(new Reference('repositories.image'));

};
