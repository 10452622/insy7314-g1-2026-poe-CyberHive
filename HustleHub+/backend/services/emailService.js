const nodemailer = require("nodemailer");

const createTransporter = () => {
    const {
        EMAIL_HOST,
        EMAIL_PORT,
        EMAIL_USER,
        EMAIL_PASSWORD
    } = process.env;

    if (
        !EMAIL_HOST ||
        !EMAIL_PORT ||
        !EMAIL_USER ||
        !EMAIL_PASSWORD
    ) {
        throw new Error(
            "Email configuration is missing. Please configure your SMTP environment variables."
        );
    }

    return nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT),
        secure: Number(EMAIL_PORT) === 465,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD
        }
    });
};


const sendTwoFactorOTP = async (email, otp) => {
    const transporter = createTransporter();

    const sender =
        process.env.EMAIL_FROM || process.env.EMAIL_USER;

    await transporter.sendMail({
        from: sender,
        to: email,
        subject: "Your HustleHub+ verification code",

        text: `
Your HustleHub+ verification code is:

${otp}

This code expires in 5 minutes.

If you did not attempt to sign in or enable two-factor authentication, please ignore this email.
        `,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 520px;
                margin: auto;
                padding: 30px;
                color: #202433;
                background: #f8f9fc;
                border-radius: 12px;
            ">
                <h2 style="color: #1239c9;">
                    HustleHub+ Verification
                </h2>

                <p>
                    Use the verification code below to continue.
                </p>

                <div style="
                    background: #ffffff;
                    padding: 20px;
                    text-align: center;
                    border-radius: 10px;
                    margin: 25px 0;
                ">
                    <h1 style="
                        letter-spacing: 8px;
                        color: #1239c9;
                        margin: 0;
                    ">
                        ${otp}
                    </h1>
                </div>

                <p>
                    This code expires in <strong>5 minutes</strong>.
                </p>

                <p style="font-size: 13px; color: #687080;">
                    If you did not attempt to sign in or enable
                    two-factor authentication, please ignore this email.
                </p>
            </div>
        `
    });

    return true;
};


module.exports = {
    sendTwoFactorOTP
};