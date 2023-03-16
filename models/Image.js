module.exports = (sequelize, Sequelize) => {
  const Image = sequelize.define('Image', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV1,
      allowNull: false,
      autoIncrement: false,
      primaryKey: true
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
    image: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    oldName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    deletedAt: {
      allowNull: true,
      type: Sequelize.DATE,
    },
  }, {
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ["deletedAt", "createdAt", "updatedAt", "oldName"] },
    },
  });

  Image.associate = function (db) {
    Image.belongsTo(db.User, {
      as: 'user',
      foreignKey: 'author',
    });
  };

  return Image;
};
