const UserRepository = require('../repositories/UserRepository');
const RecoverPasswordRepository = require('../repositories/RecoverPasswordRepository');
const RoleRepository = require('../repositories/RoleRepository');
const PostRepository = require('../repositories/PostRepository');

module.exports = (container) => {
    container.register('repositories.user', UserRepository);

    container.register(
        'repositories.recoverPassword',
        RecoverPasswordRepository
    );

    container.register('repositories.role', RoleRepository);
    container.register('repositories.post', PostRepository);

};
