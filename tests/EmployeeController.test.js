const HttpStatuses = require('http-status-codes');
const app = require('../app');
const request = require('supertest')(app);
const { sequelize, User } = require('../models');
const truncateDatabase = require('./helpers/truncate');

const loginAsAdmin = require('./helpers/loginAsAdmin');
const loginAsEmployee = require('./helpers/loginAsEmployee');
const runSeeders = require('./helpers/runSeeders');
const UserFactory = require('./factories/user');

let loggedAsEmployee;
let loggedAsAdmin;
const employees = [];

afterAll(async () => {
    await truncateDatabase();
    await sequelize.close();
});

describe('EmployeeController', () => {
    beforeAll(async () => {
        await runSeeders();

        loggedAsAdmin = await loginAsAdmin(request);
        loggedAsEmployee = await loginAsEmployee(request);

        employees.push(await UserFactory.create());
        employees.push(await UserFactory.create());
    });

    describe('GET /employees', () => {
        it('returns OK requesting employees as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const { status } = await request
                .get(`/employees`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.OK);
        });

        it('returns FORBIDDEN requesting employees as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const { status } = await request
                .get(`/employees`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.FORBIDDEN);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const { status } = await request.get(`/employees`);

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('GET /employees/{id}', () => {
        it('returns OK requesting as EMPLOYEE', async () => {
            const { token, user } = loggedAsEmployee.body;

            const { status, body } = await request
                .get(`/employees/${user.id}`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.OK);
            expect(body).toHaveProperty('id');
            expect(body.id).toEqual(user.id);
        });

        it('returns OK requesting employee as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const { body, status } = await request
                .get(`/employees/${employees[0].id}`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.OK);
            expect(body).toHaveProperty('email');
            expect(body.email).toEqual(employees[0].email);
        });

        it('returns NOT_FOUND sending request for not existing entity as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const { status } = await request
                .get(`/employees/99999999999999`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.NOT_FOUND);
        });

        it('returns FORBIDDEN requesting employee as Employee', async () => {
            const { token } = loggedAsEmployee.body;
            const { user } = loggedAsAdmin.body;

            const { status } = await request
                .get(`/employees/${user.id}`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.FORBIDDEN);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const { status } = await request.get(
                `/employees/${employees[0].id}`
            );

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('POST /employees', () => {
        it('returns CREATED sending valid data as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;
            const employeeData = UserFactory.generate();

            const { status, body } = await request
                .post(`/employees`)
                .send(employeeData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.CREATED);
            expect(body.email).toEqual(employeeData.email);
        });

        it('returns BAD_REQUEST sending valid data with already existed email', async () => {
            const { token } = loggedAsAdmin.body;
            const userData = await UserFactory.generate({
                email: 'admin@erpsystem.test'
            });

            const { status, body } = await request
                .post(`/employees`)
                .set('Authorization', token)
                .send(userData);

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
            expect(body).toHaveProperty('errors');
            expect(body.errors).toContainEqual({
                param: 'email',
                message: 'Email address already exists!'
            });
        });

        it('returns BAD_REQUEST sending invalid data (blank) as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;
            const userData = await UserFactory.generate({
                email: null,
                firstName: null,
                lastName: null,
                dayOfBirth: null,
                password: null
            });

            const { status, body } = await request
                .post(`/employees`)
                .set('Authorization', token)
                .send(userData);

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
            expect.arrayContaining([
                {
                    message: 'should be not empty',
                    param: 'email'
                },
                {
                    param: 'firstName',
                    message: 'should be not empty'
                },
                {
                    param: 'lastName',
                    message: 'should be not empty'
                },
                {
                    param: 'dayOfBirth',
                    message: 'should be not empty'
                },
                {
                    param: 'password',
                    message: 'should be not empty'
                }
            ]);
        });

        it('returns FORBIDDEN sending valid data as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;
            const employeeData = UserFactory.generate();

            const { status } = await request
                .post(`/employees`)
                .send(employeeData)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.FORBIDDEN);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const employeeData = UserFactory.generate();

            const { status } = await request
                .post(`/employees`)
                .send(employeeData);

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('PUT /employees/{id}', () => {
        it('returns OK sending valid data as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const userData = await UserFactory.generate();

            const { status } = await request
                .put(`/employees/${employees[0].id}`)
                .set('Authorization', token)
                .send(userData);

            expect(status).toEqual(HttpStatuses.OK);
        });

        it("returns NOT_FOUND when employee doesn't exist as Admin", async () => {
            const { token } = loggedAsAdmin.body;

            const userData = await UserFactory.generate();

            const { status } = await request
                .put(`/employees/999999999`)
                .set('Authorization', token)
                .send(userData);

            expect(status).toEqual(HttpStatuses.NOT_FOUND);
        });

        it('returns BAD_REQUEST uptating email already exists as Admin', async () => {
            const { token } = loggedAsAdmin.body;
            const userData = await UserFactory.generate({
                email: employees[1].email
            });

            const { status, body } = await request
                .put(`/employees/${employees[1].id}`)
                .set('Authorization', token)
                .send(userData);

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
            expect(body).toHaveProperty('errors');
            expect(body.errors).toContainEqual({
                param: 'email',
                message: 'Email address already exists!'
            });
        });

        it('returns BAD_REQUEST sending invalid data (blank) as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;
            const userData = await UserFactory.generate({
                email: null,
                firstName: null,
                lastName: null,
                dayOfBirth: null,
                password: null
            });

            const { status } = await request
                .put(`/employees/${employees[0].id}`)
                .set('Authorization', token)
                .send(userData);

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
        });

        it('returns FORBIDDEN updateing employees as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;
            const userData = await UserFactory.generate({
                email: employees[0].email
            });

            const { status } = await request
                .put(`/employees/${employees[0].id}`)
                .set('Authorization', token)
                .send(userData);

            expect(status).toEqual(HttpStatuses.FORBIDDEN);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const userData = await UserFactory.generate({
                email: employees[0].email
            });

            const { status } = await request
                .put(`/employees/${employees[0].id}`)
                .send(userData);

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('DELETE /employees/{id}', () => {
        it('returns NO_CONTENT requesting not existing entities as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const { status } = await request
                .delete(`/employees/999999999`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.NO_CONTENT);
        });

        it('returns NO_CONTENT requesting existing entity as ADMIN', async () => {
            const { token } = loggedAsAdmin.body;

            const employee = await UserFactory.create();

            const { status } = await request
                .delete(`/employees/${employee.id}`)
                .set('Authorization', token);

            const deletedUser = await User.findByPk(employee.id);

            expect(status).toEqual(HttpStatuses.NO_CONTENT);
            expect(deletedUser).toBeNull();
        });

        it('returns FORBIDDEN when deleting user as EMPLOYEE', async () => {
            const { token } = loggedAsEmployee.body;

            const { status } = await request
                .delete(`/employees/${employees[0].id}`)
                .set('Authorization', token);

            expect(status).toEqual(HttpStatuses.FORBIDDEN);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const { status } = await request.delete(
                `/employees/${employees[0].id}`
            );

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });
});
