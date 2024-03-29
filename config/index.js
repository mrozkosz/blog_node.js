require('dotenv').config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const env = (key, defaultValue = null) => process.env[key] || defaultValue;
const isEnabled = (key) => env(key) && env(key) === 'true';

const config = {
    db: {
        url: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        name: env('DATABASE_NAME'),
        username: env('DATABASE_USERNAME'),
        password: env('DATABASE_PASSWORD'),
        port: parseInt(env('DATABASE_PORT'), 27017),
        logging: isEnabled('SEQUELIZE_LOGGING') ? console.log : true,
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: false
        },
        dialect: 'postgres'
    },
    auth: {
        expiresIn: env('JWT_EXPIRES_IN'),
        secretKey: env('JWT_SECRET_KEY')
    },
    password: {
        expiresIn: env('JWT_RECOVER_EXPIRES_IN')
    },
    email: {
        host: env('EMAIL_HOST'),
        port: env('EMAIL_PORT'),
        secure: env('EMAIL_SECURE'),
        auth: {
            user: env('EMAIL_AUTH_USER'),
            pass: env('EMAIL_AUTH_PASSWORD')
        }
    },
    app: {
        frontendUrl: env('APP_FRONTEND_URL'),
        appUrl: env('APP_URL'),
        corsSites: env('APP_CORS_SITES', ''),
        routesWithoutBodyParser: env('APP_ROUTES_WITHOUT_BODY_PARSER', '')
    },

    swagger: {
        openapi: "3.0.0",
        info: {
            title: "Blog",
            version: '1.0.0',
            description: "Zadanie rekrutacyjne",
        },
        servers: [
            {
                url: env("APP_URL") + "/",
            },
        ],
    },
};
module.exports = config;
