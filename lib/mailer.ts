import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM = process.env.MAIL_FROM || 'no-reply@example.com';

let resend: Resend | null = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}) {
  if (!resend) {
    console.warn('Resend API key not configured, skipping email send.');
    return { id: undefined } as any;
  }
  const { to, subject, html, text, from } = options;
  const recipients = Array.isArray(to) ? to : [to];
  // Cast to any to support html/text without React email component
  const res = await (resend as any).emails.send({
    from: from || DEFAULT_FROM,
    to: recipients,
    subject,
    html,
    text,
  } as any);
  return res;
}
