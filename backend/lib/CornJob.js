import nodemailer from 'nodemailer'
import User from '../model/User';
import Admin from '../model/Admin';


const executeNotifications = async () => {
    console.log("Running Notification Scheduler...");


    const now = new Date();

    notifications.forEach(async (notification) => {
        const { email, deadline, level } = notification;

        if (level === 0 && now >= new Date(deadline.getTime() - 24 * 60 * 60 * 1000)) {
            // Level 1: Notify 1 day before, on, and after the deadline
            const beforeDeadline = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
            const afterDeadline = new Date(deadline.getTime() + 24 * 60 * 60 * 1000);

            if (now.toDateString() === beforeDeadline.toDateString()) {
                await sendEmail(email, "Reminder: Assessment Due Tomorrow", "Complete your assessment.");
            }

            if (now.toDateString() === deadline.toDateString()) {
                await sendEmail(email, "Deadline Reached", "Please complete your assessment today.");
            }

            if (now.toDateString() === afterDeadline.toDateString()) {
                await sendEmail(email, "Deadline Missed", "Your assessment is overdue.");
                notification.level = 1;
                await notification.save();
            }
        }

        if (level === 1 && now >= new Date(deadline.getTime() + 2 * 24 * 60 * 60 * 1000)) {
            // Level 2: Notify 2 days after Level 1
            await sendEmail(email, "Escalation: Assessment Pending", "Your assessment is still pending.");
            notification.level = 2;
            await notification.save();
        }

        if (level === 2 && now >= new Date(deadline.getTime() + 4 * 24 * 60 * 60 * 1000)) {
            // Level 3: Notify 2 days after Level 2
            await sendEmail(email, "Final Warning: Complete Assessment", "Your assessment is overdue.");
            notification.level = 3;
            await notification.save();
        }

        if (level === 3 && now >= new Date(deadline.getTime() + 6 * 24 * 60 * 60 * 1000)) {
            // Level 4: Notify 2 days after Level 3, include management
            await sendEmail(
                email,
                "Management Alert: Assessment Pending",
                "Management has been notified about the pending assessment."
            );
            notification.level = 4;
            await notification.save();
        }
    });
};



// Email Configuration
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: "your_email@gmail.com",
//         pass: "your_email_password",
//     },
// });

// // Function to send emails
// const sendEmail = async (email, subject, text) => {
//     try {
//         await transporter.sendMail({
//             from: '"Notification System" <your_email@gmail.com>',
//             to: email,
//             subject,
//             text,
//         });
//         console.log(`Email sent to ${email}`);
//     } catch (err) {
//         console.error(`Failed to send email to ${email}:`, err);
//     }
// };



