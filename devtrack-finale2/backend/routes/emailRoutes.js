const express = require("express");
const { sendEmail } = require("../services/emailService");

const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    await sendEmail({
      to: email,
      subject: "DevTrack Email Notification Test",
      text: "This is a test email from DevTrack.",
      html: `
        <h2>DevTrack</h2>
        <p>This is a test email notification from your DevTrack application.</p>
      `,
    });

    res.json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Test email error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
});

module.exports = router;