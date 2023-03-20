const fs = require("fs");
const config = require("../../config");
const timeConverter = require('../../helpers/timeConverter');

class SendEmailToRecoverPasswordHandler {
    constructor(transporter, config) {
        this.transporter = transporter;
        this.config = config;
    }

    async handle(user, hash, callback) {
        const { email, app } = this.config;
        const recoverPasswordLink = `${callback}/${hash}`;
        const { expiresIn } = config.password;
        const { hours } = timeConverter(expiresIn);

        const mailLayout = fs.readFileSync(
            require.resolve("./templates/default.html"),
            "utf-8"
        );

        const html = mailLayout
            .replaceAll("{hash}", hash)
            .replaceAll("{name}", email)
            .replaceAll("{url}", recoverPasswordLink)
            .replaceAll("{expireIn}", hours)
            .replaceAll("{callback}", callback);

        await this.transporter.sendMail({
            from: email.auth.user,
            to: user.email,
            subject: 'Recover password',
            text: '',
            html
        });
    }
}

module.exports = SendEmailToRecoverPasswordHandler;
