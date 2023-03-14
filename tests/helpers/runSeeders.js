const { User, Role } = require('../../models');
const bcrypt = require('bcryptjs');

module.exports = async () => {
    const adminRole = await Role.create({ name: 'admin' });
    const userRole = await Role.create({ name: 'employee' });

    const adminUser = await User.create({
        firstName: 'admin',
        lastName: 'admin',
        dayOfBirth: '1995-03-12',
        email: 'admin@erpsystem.test',
        password: bcrypt.hashSync('password', 12)
    });
    await adminUser.addRole(adminRole);

    const user = await User.create({
        firstName: 'user',
        lastName: 'user',
        dayOfBirth: '1995-03-12',
        email: 'user@erpsystem.test',
        password: bcrypt.hashSync('password', 12)
    });

    await user.addRole(userRole);
};
