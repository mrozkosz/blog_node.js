const HttpStatuses = require('http-status-codes');
const app = require('../app');
const request = require('supertest')(app);
const { sequelize, Contract } = require('../models');
const truncateDatabase = require('./helpers/truncate');

const loginAsAdmin = require('./helpers/loginAsAdmin');
const loginAsEmployee = require('./helpers/loginAsEmployee');
const runSeeders = require('./helpers/runSeeders');
const ContractFactory = require('./factories/contract');
const UserFactory = require('./factories/user');

let loggedAsAdmin;
let loggedAsEmployee;
const contracts = [];

afterAll(async () => {
    await truncateDatabase();
    await sequelize.close();
});

describe('ContractController', () => {
    beforeAll(async () => {
        await runSeeders();

        loggedAsEmployee = await loginAsEmployee(request);
        loggedAsAdmin = await loginAsAdmin(request);
        const employee = await UserFactory.create();

        const { user } = loggedAsEmployee.body;
        const { user: admin } = loggedAsAdmin.body;

        contracts.push(await ContractFactory.create({ userId: user.id }));
        contracts.push(await ContractFactory.create({ userId: admin.id }));
        contracts.push(await ContractFactory.create({ userId: employee.id }));
    });

    describe('GET /contracts', () => {
        it('returns OK requesting existing entities as EMPLOYEE', async () => {
            const { token, user } = loggedAsEmployee.body;

            const { status, body } = await request
                .get(`/contracts`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.OK);

            let countContractsBelongsToUser = 0;

            body.data.forEach((contract) => {
                if (contract.userId === user.id) {
                    countContractsBelongsToUser += 1;
                }
            });

            expect(countContractsBelongsToUser).toBe(1);
            expect(body.data.length).toBe(1);
        });

        it('returns OK requesting existing entities as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const { status, body } = await request
                .get(`/contracts`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.OK);
            expect(body.data.length).toBe(3);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const { status } = await request.get(`/contracts`);

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('GET /contracts/{id}', () => {
        it('returns OK requesting as ADMIN', async () => {
            const { token, user } = loggedAsAdmin.body;

            const contractParams = await ContractFactory.create({
                userId: user.id
            });

            const { status, body } = await request
                .get(`/contracts/${contractParams.id}`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.OK);
        });

        it('returns OK requesting as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const { status } = await request
                .get(`/contracts/${contracts[0].id}`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.OK);
        });

        it('returns NOT_FOUND requesting not existing contract as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const { status, body } = await request
                .get(`/contracts/99999999999999`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.NOT_FOUND);
        });

        it('returns NOT_FOUND requesting not existing contract as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const { status } = await request
                .get(`/contracts/99999999999999`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.NOT_FOUND);
        });

        it('returns FORBIDDEN requesting existing entity as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const { status } = await request
                .get(`/contracts/${contracts[2].id}`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.FORBIDDEN);
        });
    });

    describe('POST /contracts', () => {
        it('returns CREATED when sending valid data as ADMIN', async () => {
            const { token, user } = loggedAsAdmin.body;
            const contractParams = await ContractFactory.generate({
                userId: user.id
            });

            const { status } = await request
                .post(`/contracts`)
                .send(contractParams)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.CREATED);
        });

        it('returns BAD_REQUEST sending invalid data (blank) as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;
            const contractParams = await ContractFactory.generate({
                userId: null,
                startDay: null,
                stopDay: null,
                duration: null,
                freeDays: null
            });

            const { status, body } = await request
                .post(`/contracts`)
                .send(contractParams)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
        });

        it('return FORBIDDEN creating contract as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const contractParams = await ContractFactory.generate();

            const { status, body } = await request
                .post(`/contracts`)
                .send(contractParams)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.FORBIDDEN);
            expect(body.message).toEqual(
                "you don't have access for this resource"
            );
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const { user } = loggedAsAdmin.body;
            const contractParams = await ContractFactory.generate({
                userId: user.id
            });

            const { status } = await request
                .post(`/contracts`)
                .send(contractParams);

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('PUT /contracts/{id}', () => {
        it('returns OK sending valid data as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const contractParams = await ContractFactory.generate({
                userId: contracts[0].userId
            });

            const { status } = await request
                .put(`/contracts/${contracts[0].id}`)
                .set('Authorization', token)
                .send(contractParams);

            expect(status).toEqual(HttpStatuses.OK);
        });

        it('returns NOT_FOUND requesting not existing entities as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const contractParams = await ContractFactory.generate({
                userId: contracts[0].userId
            });

            const { status } = await request
                .put(`/contracts/999999999`)
                .set('Authorization', token)
                .send(contractParams);

            expect(status).toEqual(HttpStatuses.NOT_FOUND);
        });

        it('returns FORBIDDEN sending valid data as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const contractParams = await ContractFactory.generate({
                userId: contracts[0].userId
            });

            const { status } = await request
                .put(`/contracts/34`)
                .set('Authorization', token)
                .send(contractParams);

            expect(status).toEqual(HttpStatuses.FORBIDDEN);
        });

        it('returns NOT_FOUND requesting not existing entities as EMPLOYEE', async () => {
            const { token } = loggedAsAdmin.body;

            const contractParams = await ContractFactory.generate({
                userId: contracts[0].userId
            });

            const { status } = await request
                .put(`/contracts/999999999`)
                .set('Authorization', token)
                .send(contractParams);

            expect(status).toEqual(HttpStatuses.NOT_FOUND);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const contractParams = await ContractFactory.generate({
                userId: contracts[0].userId
            });

            const { status } = await request
                .put(`/contracts/34`)
                .send(contractParams);

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('DELETE /contracts/{id}', () => {
        it('returns NO_CONTENT requesting not existing entity as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const { status } = await request
                .delete(`/contracts/9999999999999`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.NO_CONTENT);
        });

        it('returns NO_CONTENT requesting existing entity as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const contract = await Contract.findById(contracts[0].id);
            expect(contract).not.toBeNull();

            const { status } = await request
                .delete(`/contracts/${contracts[0].id}`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.NO_CONTENT);

            const deletedContract = await Contract.findById(contracts[0].id);

            expect(deletedContract).toBeNull();
        });

        it('returns FORBIDDEN requesting existing entities as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const { status } = await request
                .delete(`/contracts/${contracts[0].id}`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.FORBIDDEN);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const { status } = await request.delete(
                `/contracts/${contracts[0].id}`
            );

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });
});
