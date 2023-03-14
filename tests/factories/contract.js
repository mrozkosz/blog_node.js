const faker = require('faker');
const { Contract } = require('../../models');
const moment = require('moment');

class ContractFactory {
    static generate(props) {
        const userId = faker.random.number({ min: 1, max: 999 });
        const duration = faker.random.number({ min: 1, max: 12 });
        const startDay = faker.date.between('2020-07-05', '2020-12-05');
        const stopDay = moment(startDay).add(duration, 'months');
        const freeDays = faker.random.objectElement([20, 26]);
        const defaultProps = {
            userId,
            startDay,
            stopDay,
            duration,
            freeDays
        };

        return Object.assign({}, defaultProps, props);
    }

    static build(props) {
        return Contract.build(ContractFactory.generate(props));
    }

    static create(props) {
        return Contract.create(ContractFactory.generate(props));
    }
}

module.exports = ContractFactory;
