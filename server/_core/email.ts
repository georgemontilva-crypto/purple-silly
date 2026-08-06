/**
 * Isolated email module. Resend isn't configured yet — sendEmail() just logs
 * to the console — but every call site goes through this one function, so
 * wiring up a real provider later is a one-file change.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  console.log(
    `[Email] No provider configured (Resend pending) — would send:\n` +
      `  To: ${message.to}\n` +
      `  Subject: ${message.subject}\n` +
      `  ${message.text.replace(/\n/g, "\n  ")}`
  );
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Verify your email — Purple Organics",
    text: `Welcome to Purple Organics!\n\nVerify your email by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours. If you didn't create this account, you can ignore this message.`,
  });
}
