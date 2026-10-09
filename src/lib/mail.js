import nodemailer from "nodemailer";

export async function sendReceipt(to, ride) {
  if (!process.env.SMTP_USER || !to) return;
  try {
    const t = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await t.sendMail({
      from: `RideGo <${process.env.SMTP_USER}>`,
      to,
      subject: `RideGo receipt - Rs ${ride.fare}`,
      html: `<h2>Payment received</h2>
        <p><b>From:</b> ${ride.pickup_address}</p>
        <p><b>To:</b> ${ride.drop_address}</p>
        <p><b>Distance:</b> ${ride.distance_km} km</p>
        <p><b>Total paid:</b> Rs ${ride.fare}</p>
        <p>Receipt: ${process.env.NEXT_PUBLIC_APP_URL}/receipt/${ride.id}</p>`,
    });
  } catch (e) {
    console.error("Mail error:", e.message);
  }
}