const fs = require("fs");

class SendEmailToNewUsersHandler {
    constructor(transporter, config) {
        this.transporter = transporter;
        this.config = config;
    }

    async handle(user) {
        const { email, app } = this.config;

        const mailLayout = fs.readFileSync(
            require.resolve("./templates/confirmAccount.html"),
            "utf-8"
        );

        const html = mailLayout
            .replaceAll("{email}", user.email);

        await this.transporter.sendMail({
            from: email.auth.user,
            to: user.email,
            subject: 'Your Account',
            text: '',
            html
        });
    }
}

module.exports = SendEmailToNewUsersHandler;
