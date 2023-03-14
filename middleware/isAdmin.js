const HttpStatuses = require('http-status-codes');

module.exports = async (req, res, next) => {
    const loggedUser = req.loggedUser;

    if (!loggedUser) {
        return res.sendStatus(HttpStatuses.UNAUTHORIZED);
    }

    const isAdmin = await req.loggedUser.isAdmin();

    if (!isAdmin) {
        return res.status(HttpStatuses.FORBIDDEN).send({
            message: "you don't have access for this resource"
        });
    }

    req.isAdmin = true;

    return next();
};
