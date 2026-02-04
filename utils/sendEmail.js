const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // ১. ট্রান্সপোর্টার তৈরি (Gmail ব্যবহার করলে)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'uddom.bd.ecommerce@gmail.com', // আপনার জিমেইল
      pass: 'eqha wvqv dcer nziv',    // জিমেইল অ্যাপ পাসওয়ার্ড (নরমাল পাসওয়ার্ড না)
    },
  });

  // ২. ইমেইল অপশন সেট করা
  const mailOptions = {
    from: '"Uddom Support" <uddom.bd.ecommerce@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<b>${options.message}</b>` // আপনি চাইলে সুন্দর HTML টেমপ্লেট দিতে পারেন
  };

  // ৩. ইমেইল পাঠানো
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;