const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, verificationLink) => {
    try {
        // สร้าง nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "Gmail", 
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

// ฟังก์ชันส่งอีเมล
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "khaopun207@gmail.com", // ใส่อีเมลของคุณ
        pass: "xzzhlqrisgyllrrx" // ใส่รหัสผ่านอีเมลของคุณ
      }
    });
  
    const mailOptions = {
      from: "khaopun207@gmail.com",
      to,
      subject,
      text
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${to}`);
    } catch (error) {
      console.error("❌ Error sending email:", error);
    }
  };

module.exports = (sendVerificationEmail , sendEmail);
