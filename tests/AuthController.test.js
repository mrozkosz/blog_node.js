const HttpStatuses = require('http-status-codes');
const app = require('../app');
const request = require('supertest')(app);
const { sequelize } = require('../models');
const truncateDatabase = require('./helpers/truncate');

const loginAsEmployee = require('./helpers/loginAsEmployee');
const loginAsAdmin = require('./helpers/loginAsAdmin');
const runSeeders = require('./helpers/runSeeders');
const recoverPasswordFactory = require('./factories/recoverPassword');

let loggedAsEmployee;
let loggedAsAdmin;

afterAll(async () => {
    await truncateDatabase();
    await sequelize.close();
});

describe('AuthController', () => {
    beforeAll(async () => {
        await runSeeders();

        loggedAsEmployee = await loginAsEmployee(request);
        loggedAsAdmin = await loginAsAdmin(request);
    });

    describe('GET /me', () => {
        it('returns OK requesting existing entities as EMPLOYEE', async () => {
            const { token, user } = loggedAsEmployee.body;

            const { body } = await request
                .get(`/me`)
                .set('Authorization', token);

            expect(body).toHaveProperty('email');
            expect(body.email).toEqual(user.email);
        });

        it('returns OK requesting existing entities as ADMIN', async () => {
            const { token, user } = loggedAsAdmin.body;

            const { body } = await request
                .get(`/me`)
                .set('Authorization', token);

            expect(body).toHaveProperty('email');
            expect(body.email).toEqual(user.email);
        });

        it('returns UNAUTHORIZED requesting WITHOUT TOKEN', async () => {
            const { status } = await request.get(`/me`);

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('POST /login', () => {
        it('returns BAD_REQUEST sending invalid data (incorrect credentials)', async () => {
            const { status, body } = await request
                .post(`/login`)
                .send({ email: 'mateusz@poczta.pl', password: 'xxxx' });

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
            expect(body).toHaveProperty('errors');
            expect(body.errors).toContainEqual({
                param: 'email',
                message: 'Email address does not exists!'
            });
        });

        it('returns BAD_REQUEST sending invalid data (email)', async () => {
            const { status, body } = await request
                .post(`/login`)
                .send({ email: '', password: 'xxxx' });

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
            expect(body).toHaveProperty('errors');
            expect(body.errors).toContainEqual({
                param: 'email',
                message: 'should be not empty'
            });
        });

        it('returns BAD_REQUEST sending correct email but incorrect password', async () => {
            const { status } = await request
                .post(`/login`)
                .send({ email: 'admin@erpsystem.test', password: 'xxxx' });

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });

    describe('POST /recover-password', () => {
        it('returns NO_CONTENT sending correct email but not existing', async () => {
            const { status } = await request
                .post(`/recover-password`)
                .send({ email: 'xhFy6vpkWARpcCpAa@erpsystem.test' });

            expect(status).toEqual(HttpStatuses.NO_CONTENT);
        });

        it('returns NO_CONTENT sending correct email', async () => {
            const { status } = await request
                .post(`/recover-password`)
                .send({ email: 'admin@erpsystem.test' });

            expect(status).toEqual(HttpStatuses.NO_CONTENT);
        });

        it('returns BAD_REQUEST sending incorrect email', async () => {
            const { status } = await request
                .post(`/recover-password`)
                .send({ email: 'unknown' });

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
        });
    });

    describe('POST /recover-password/{hash}', () => {
        it('returns BAD_REQUEST when the passwords do not match', async () => {
            const { user } = loggedAsAdmin.body;
            const { hash } = await recoverPasswordFactory.create({
                userId: user.id
            });
            const { status } = await request
                .post(`/recover-password/${hash}`)
                .send({
                    password: 'password',
                    passwordRepeat: 'password1'
                });

            expect(status).toEqual(HttpStatuses.BAD_REQUEST);
        });

        it('returns NO_CONTENT sending recover password as EMPLOYEE', async () => {
            const { user } = loggedAsEmployee.body;
            const { hash } = await recoverPasswordFactory.create({
                userId: user.id
            });
            const { status } = await request
                .post(`/recover-password/${hash}`)
                .send({
                    password: 'password',
                    passwordRepeat: 'password'
                });

            expect(status).toEqual(HttpStatuses.NO_CONTENT);
        });

        it('returns NO_CONTENT sending recover password as ADMIN', async () => {
            const { user } = loggedAsAdmin.body;
            const { hash } = await recoverPasswordFactory.create({
                userId: user.id
            });
            const { status } = await request
                .post(`/recover-password/${hash}`)
                .send({
                    password: 'password',
                    passwordRepeat: 'password'
                });

            expect(status).toEqual(HttpStatuses.NO_CONTENT);
        });

        it('returns UNAUTHORIZED sending incorrect recover hash', async () => {
            const { status } = await request
                .post(`/recover-password/0d392898ecc8558c75e4`)
                .send({
                    password: 'ZAQ!2wsx',
                    passwordRepeat: 'ZAQ!2wsx'
                });

            expect(status).toEqual(HttpStatuses.UNAUTHORIZED);
        });
    });
});
