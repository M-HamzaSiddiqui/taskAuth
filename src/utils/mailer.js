import nodemailer from "nodemailer";

export const sendEmail = async ({ hashedToken, email, newPassword }) => {

    try {
        console.log("email", email);
        const resetHTML = `<p>Click <a href="${process.env.DOMAIN}/resetPassword?token=${hashedToken}&email=${email}&newPassword=${newPassword}">here</a>
        to reset your password.
        </p>`;

        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "ef5b7a0dd8993c",
                pass: "0938eab2204e60",
            },
        });

        const mailOptions = {
            from: "hamza@ai.com", // sender address
            to: email, // list of receivers
            subject: "Reset your password",
            html: resetHTML,
        };

        const mailResponse = await transport.sendMail(mailOptions);
        return mailResponse;
    } catch (error) {
        throw new Error(error.message);
    }
};