const AbstractRepository = require('./AbstractRepository');
const { UserRole } = require('../models');

class UserRoleRepository extends AbstractRepository {
    get model() {
        return UserRole;
    }
}

module.exports = UserRoleRepository;
