const map = require('lodash/map');
const { sequelize } = require('../../models');

module.exports = async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    await Promise.all(
        map(Object.keys(sequelize.models), (key) => {
            if (['sequelize', 'Sequelize'].includes(key)) return null;

            return sequelize.models[key].destroy({ where: {}, force: true });
        })
    );

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
};
