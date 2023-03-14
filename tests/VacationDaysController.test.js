const HttpStatuses = require('http-status-codes');
const app = require('../app');
const request = require('supertest')(app);
const { sequelize, VacationDay } = require('../models');
const truncateDatabase = require('./helpers/truncate');

const loginAsAdmin = require('./helpers/loginAsAdmin');
const loginAsEmployee = require('./helpers/loginAsEmployee');
const runSeeders = require('./helpers/runSeeders');
const UserFactory = require('./factories/user');
const ContractFactory = require('./factories/contract');
const VacationDaysFactory = require('./factories/vacationDays');

let loggedAsAdmin;
let loggedAsEmployee;
let employee;
let contract;

afterAll(async () => {
    await truncateDatabase();
    await sequelize.close();
});

describe('VacationDaysController', () => {
    beforeAll(async () => {
        await runSeeders();

        loggedAsAdmin = await loginAsAdmin(request);
        loggedAsEmployee = await loginAsEmployee(request);

        employee = await UserFactory.create();
        contract = await ContractFactory.create({
            userId: employee.id
        });
        const loggedEmployeeContract = await ContractFactory.create({
            userId: user.id
        });

        await VacationDaysFactory.create({
            contractId: loggedEmployeeContract.id,
            userId: user.id
        });

        await VacationDaysFactory.create({
            contractId: loggedEmployeeContract.id,
            userId: user.id
        });

        await VacationDaysFactory.create({
            contractId: loggedEmployeeContract.id,
            userId: user.id
        });

        await VacationDaysFactory.create({
            contractId: contract.id,
            userId: employee.id
        });

        await VacationDaysFactory.create({
            contractId: contract.id,
            userId: employee.id
        });
    });

    describe('GET /vacations', () => {
        it('returns OK as EMPLOYEE', async () => {
            const { token, user } = loggedAsEmployee.body;

            const { body, status } = await request
                .get(`/vacations`)
                .set('Authorization', token);

            let countVacationDaysBelongsToUser = 0;

            body.data.forEach((vacationDay) => {
                if (vacationDay.userId === user.id) {
                    countVacationDaysBelongsToUser += 1;
                }
            });

            expect(status).toEqual(HttpStatuses.OK);
            expect(countVacationDaysBelongsToUser).toBe(3);
            expect(body.data.length).toBe(3);
        });

        it('returns OK as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const { body, status } = await request
                .get(`/vacations`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.OK);
            expect(body.data.length).toBe(5);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const { status } = await request.get(`/vacations`);

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('GET /vacations/{id}', () => {
        it('returns OK requesting as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const VacationDaysData = await VacationDaysFactory.generate({
                userId: employee.id
            });

            const { statusCode } = await request
                .get(`/vacations/${VacationDaysData.id}`)
                .set('Authorization', token);

            expect(statusCode).toEqual(HttpStatuses.NOT_FOUND);
        });

        it('returns NOT_FOUND requesting not existing entities as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const { statusCode } = await request
                .get(`/vacations/99999999`)
                .set('Authorization', token);

            expect(statusCode).toEqual(HttpStatuses.NOT_FOUND);
        });

        it('returns FORBIDDEN requesting entity not belong to EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const { statusCode } = await request
                .get(`/vacations/99999999`)
                .set('Authorization', token);

            expect(statusCode).toEqual(HttpStatuses.FORBIDDEN);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const VacationDaysData = await VacationDaysFactory.generate({
                userId: employee.id
            });

            const { statusCode } = await request.get(
                `/vacations/${VacationDaysData.id}`
            );

            expect(statusCode).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('POST /vacations', () => {
        it('returns CREATED sending valid data as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            await ContractFactory.create({
                userId: employee.id
            });

            const VacationDaysData = await VacationDaysFactory.generate({
                userId: employee.id
            });

            const { status } = await request
                .post(`/vacations`)
                .send(VacationDaysData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.CREATED);
        });

        it('returns CREATED sending valid data as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const VacationDaysData = await VacationDaysFactory.generate({
                userId: employee.id,
                contractId: contract.id
            });

            const { status } = await request
                .post(`/vacations`)
                .send(VacationDaysData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.CREATED);
        });

        it('returns BAD_REQUEST sending invalid data (blank) as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const VacationDaysData = await VacationDaysFactory.generate({
                userId: null,
                startDay: null,
                stopDay: null
            });

            const { status } = await request
                .post(`/vacations`)
                .send(VacationDaysData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
        });

        it('returns BAD_REQUEST sending invalid data (blank) as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const VacationDaysData = await VacationDaysFactory.generate({
                userId: null,
                startDay: null,
                stopDay: null
            });

            const { status } = await request
                .post(`/vacations`)
                .send(VacationDaysData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const VacationDaysData = await VacationDaysFactory.generate({
                userId: employee.id
            });

            const { status } = await request
                .post(`/vacations`)
                .send(VacationDaysData);

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('PUT /vacations/{id}', () => {
        it('returns OK updateing approved vacations as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;
            const vacationDays = await VacationDaysFactory.create({
                isApproved: true,
                userId: employee.id,
                contractId: contract.id
            });
            const VacationDaysData = await VacationDaysFactory.generate({
                userId: employee.id
            });

            const { status } = await request
                .put(`/vacations/${vacationDays.id}`)
                .send(VacationDaysData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.OK);
        });

        it('returns OK updateing not approved vacations as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;
            const vacationDays = await VacationDaysFactory.create({
                userId: employee.id,
                isApproved: false,
                contractId: contract.id
            });
            const vacationDaysData = await VacationDaysFactory.generate({
                userId: employee.id
            });

            const { status } = await request
                .put(`/vacations/${vacationDays.id}`)
                .send(vacationDaysData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.OK);
        });

        it('returns NOT_FOUND updating not existing entities as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const vacationDaysData = await VacationDaysFactory.generate({
                userId: employee.id
            });

            const { status } = await request
                .put(`/vacations/999999999999`)
                .send(vacationDaysData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.NOT_FOUND);
        });

        it('returns BAD_REQUEST sending invalid data (blank) as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const vacationDaysData = await VacationDaysFactory.generate({
                userId: null,
                startDay: null,
                stopDay: null,
                isApproved: null
            });

            const { status } = await request
                .put(`/vacations/${vacationDaysData.id}`)
                .send(vacationDaysData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
        });

        it('returns BAD_REQUEST sending invalid data (blank) as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const vacationDaysData = await VacationDaysFactory.generate({
                userId: null,
                startDay: null,
                stopDay: null,
                isApproved: null
            });

            const { status } = await request
                .put(`/vacations/${vacationDaysData.id}`)
                .send(vacationDaysData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
        });

        it('returns UNPROCESSABLE_ENTITY updateing approved vacations as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;
            const vacationDays = await VacationDaysFactory.create({
                isApproved: true,
                userId: employee.id,
                contractId: contract.id
            });
            const VacationDaysData = await VacationDaysFactory.generate({
                userId: employee.id
            });

            const { status } = await request
                .put(`/vacations/${vacationDays.id}`)
                .send(VacationDaysData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.UNPROCESSABLE_ENTITY);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const vacationDays = await VacationDaysFactory.create({
                isApproved: true,
                userId: employee.id,
                contractId: contract.id
            });
            const VacationDaysData = await VacationDaysFactory.generate({
                userId: employee.id
            });

            const { status } = await request
                .put(`/vacations/${vacationDays.id}`)
                .send(VacationDaysData);

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('DELETE /vacations/{id}', () => {
        it('returns NO_CONTENT  deleting approved vacations as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;
            const vacationDays = await VacationDaysFactory.create({
                userId: employee.id,
                isApproved: true,
                contractId: contract.id
            });

            const { status } = await request
                .delete(`/vacations/${vacationDays.id}`)
                .set('Authorization', token);

            const deletedVacationDay = await VacationDay.findByPk(
                vacationDays.id
            );

            expect(status).toEqual(HttpStatuses.NO_CONTENT);
            expect(deletedVacationDay).toBeNull();
        });

        it('returns FORBIDDEN  deleting approved vacations as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;
            const vacationDays = await VacationDaysFactory.create({
                userId: employee.id,
                isApproved: true,
                contractId: contract.id
            });

            const { status } = await request
                .delete(`/vacations/${vacationDays.id}`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.FORBIDDEN);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const vacationDays = await VacationDaysFactory.create({
                userId: employee.id,
                isApproved: true,
                contractId: contract.id
            });

            const { status } = await request.delete(
                `/vacations/${vacationDays.id}`
            );

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });
});
