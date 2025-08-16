import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  const systemNotice = `<br /><br /><p><em>This is a system generated mail. Please do not reply.</em></p>`;
  const finalHtml = `${html}${systemNotice}`;
  await resend.emails.send({
    from: "resqmeal@resend.dev",
    to,
    subject,
    html: finalHtml,
  });
}
