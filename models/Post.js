module.exports = (sequelize, Sequelize) => {
    const Post = sequelize.define('Post', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV1,
            allowNull: false,
            autoIncrement: false,
            primaryKey: true
        },
        image:{
            type: Sequelize.STRING,
            allowNull: true,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        slug: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        blogPost:{
            type: Sequelize.TEXT,
            allowNull: true,
        },
        author: {
            foreignKey: true,
            type: Sequelize.INTEGER,
            onDelete: 'CASCADE',
            references: {
                model: 'User',
                key: 'id'
            },
            primaryKey: true,
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
        },
        deletedAt: {
            allowNull: true,
            type: Sequelize.DATE,
        }
    }, {
        timestamps: true,
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] },
        },
    });

    Post.associate = function (db) {
        Post.belongsTo(db.User, {
            as: 'user',
            foreignKey: 'author',
        });
    };

    return Post;
};
