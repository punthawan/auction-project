const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, verificationLink) => {
    try {
        // สร้าง nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "Gmail", // หรือใช้บริการอื่นที่คุณตั้งค่าไว้ เช่น Outlook, Yahoo
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
        });

        // สร้างเนื้อหาอีเมล
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Email Verification",
            html: `<p>Please verify your email by clicking the link below:</p>
                   <a href="${verificationLink}">Verify Email</a>`,
        };

        // ส่งอีเมล
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send verification email");
    }
};

module.exports = sendVerificationEmail;
