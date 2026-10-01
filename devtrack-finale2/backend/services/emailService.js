const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DevTrack <onboarding@resend.dev>",
        to,
        subject,
        text,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend error:", data);
      throw new Error(data.message || "Email sending failed");
    }

    console.log("Email sent:", data.id);
    return data;

  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw error;
  }
};

module.exports = { sendEmail };