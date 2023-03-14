module.exports = async (request) => {
    const credentials = {
        email: 'user@erpsystem.test',
        password: 'password'
    };

    return await request.post('/login').send(credentials);
};
