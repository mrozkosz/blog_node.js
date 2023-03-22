const HttpStatuses = require('http-status-codes');
const config = require('../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const moment = require('moment');
const { Role } = require('../models');

class AuthController {
    constructor(
        loginHandler,
        sendEmailToRecoverPasswordHandler,
        recoverPasswordRepository,
        userRepository,
        roleRepository,
        userRoleRepository,
        sendEmailToNewUsersHandler
    ) {
        this.loginHandler = loginHandler;
        this.sendEmailToRecoverPasswordHandler = sendEmailToRecoverPasswordHandler;
        this.recoverPasswordRepository = recoverPasswordRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.sendEmailToNewUsersHandler = sendEmailToNewUsersHandler;
    }

    async login(req, res) {
        const { email, password } = req.body;

        const user = await this.loginHandler.handle(email, password);

        if (!user) {
            return res.sendStatus(HttpStatuses.UNAUTHORIZED);
        }

        const token = jwt.sign({ user }, config.auth.secretKey, {
            expiresIn: config.auth.expiresIn
        });

        const expiresIn = moment().add(config.auth.expiresIn, 'ms');

        return res.send({
            token,
            expiresIn,
            user
        });
    }

    async signup(req, res){
        const { email, password } = req.body;

        const newUser = {email, password: bcrypt.hashSync(password, 12), dayOfBirth:'1990-01-01', firstName:"", lastName:"", }
        const user = await this.userRepository.create(newUser);

        if(!user){
            return res.status(HttpStatuses.BAD_REQUEST).send("User not created!");
        }

        const role = await this.roleRepository.findOne({where:{name: Role.ROLE_EMPLOYEE}});

        if(!role){
            return res.status(HttpStatuses.BAD_REQUEST).send("Role not exist!");
        }

        const createdUser = await this.userRoleRepository.create({userId: user.id, roleId:role.id});

        if(!createdUser){
            return res.sendStatus(HttpStatuses.BAD_REQUEST);
        }

        // await this.sendEmailToNewUsersHandler.handle(user);

        return res.send(user);

    }

    async me(req, res) {
        return res.send(req.loggedUser);
    }

    async recoverPasswordSendMail(req, res) {
        const hash = crypto.randomBytes(10).toString('hex');
        const { expiresIn } = config.password;
        const { email, callback } = req.body;

        const user = await this.userRepository.findOne({
            where: { email }
        });

        if (!user) {
            return res.sendStatus(HttpStatuses.NO_CONTENT);
        }

        this.recoverPasswordRepository.create({
            userId: user.id,
            hash,
            expireIn: moment().add(expiresIn, 'ms')
        });

        // await this.sendEmailToRecoverPasswordHandler.handle(user, hash, callback);

        return res.status(HttpStatuses.OK).send({message:"This is test api so we not send emails", hash, expireIn: moment().add(expiresIn, 'ms')});
    }

    async recoverPassword(req, res) {
        const { user } = req.recoverPassword;
        const recover = req.recoverPassword;
        const { password } = req.body;

        await user.update({
            password: bcrypt.hashSync(password, 12)
        });

        await recover.destroy();

        return res.status(HttpStatuses.OK).send("OK");
    }
}

module.exports = AuthController;
