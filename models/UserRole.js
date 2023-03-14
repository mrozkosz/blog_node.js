module.exports = (sequelize, Sequelize) => {
    const UserRole = sequelize.define('UserRole', {
        roleId: {
            foreignKey: true,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: 'Roles',
                key: 'id'
            },
            primaryKey: true
        },
        userId: {
            foreignKey: true,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: 'Users',
                key: 'id'
            },
            primaryKey: true
        }
    });

    return UserRole;
};
