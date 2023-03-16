const AbstractRepository = require('./AbstractRepository');
const { Image } = require('../models');

class ImageRepository extends AbstractRepository {
    get model() {
        return Image;
    }
}

module.exports = ImageRepository;

