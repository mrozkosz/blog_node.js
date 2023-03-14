const AbstractRepository = require('./AbstractRepository');
const { Post } = require('../models');

class PostRepository extends AbstractRepository {
    get model() {
        return Post;
    }
}

module.exports = PostRepository;
