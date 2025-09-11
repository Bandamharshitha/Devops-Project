const { sendEmail } = require('./emailService');

// Send notification
exports.sendNotification = async (options) => {
  const { to, subject, template, context } = options;
  
  // For now, we'll just send email notifications
  // In a real implementation, you might also send SMS or push notifications
  
  return await sendEmail({ to, subject, template, context });
};

// Send emergency alert
exports.sendEmergencyAlert = async (bloodType, location, unitsNeeded) => {
  // This would find all eligible donors in the area and notify them
  // Implementation would be similar to the notifyPotentialDonors function
  
  console.log(`Emergency alert: ${unitsNeeded} units of ${bloodType} needed in ${location}`);
  return true;
};

// Send donation reminder
exports.sendDonationReminder = async (donor) => {
  const { userId } = donor;
  const user = await User.findById(userId);
  
  if (user && donor.eligibility.nextDonationDate) {
    const nextDate = new Date(donor.eligibility.nextDonationDate);
    const today = new Date();
    
    // Send reminder 3 days before eligibility
    if (nextDate - today <= 3 * 24 * 60 * 60 * 1000) {
      await sendEmail({
        to: user.email,
        subject: 'Blood Donation Reminder',
        template: 'donation-reminder',
        context: {
          name: user.name,
          nextDonationDate: nextDate.toLocaleDateString(),
          bloodType: user.bloodType
        }
      });
    }
  }
};