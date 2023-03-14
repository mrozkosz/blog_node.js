module.exports = async (request) => {
    const credentials = {
        email: 'admin@erpsystem.test',
        password: 'password'
    };

    return await request.post('/login').send(credentials);
};
