import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
});

const fromEmail = process.env.SES_FROM_EMAIL || 'noreply@dev.getaiready.dev';

export async function sendApprovalEmail(to: string, name: string) {
  const subject = 'Your ClawMore Beta Access is Approved! 🚀';
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;

  const htmlBody = `
    <body style="background-color: #0a0a0a; color: #ffffff; font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 40px 20px; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(0, 224, 255, 0.2); border-radius: 8px; padding: 40px; box-shadow: 0 0 40px rgba(0, 224, 255, 0.05);">
        <div style="margin-bottom: 30px;">
          <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -0.05em; margin: 0; text-transform: uppercase;">CLAW<span style="color: #00e0ff;">MORE</span></h1>
          <p style="color: #71717a; font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; margin-top: 8px;">Managed Agentic Platform</p>
        </div>
        
        <div style="margin-bottom: 30px; height: 1px; background: linear-gradient(90deg, transparent, rgba(0, 224, 255, 0.3), transparent);"></div>
        
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Welcome to the Beta, ${name}!</h2>
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 32px;">Your account has been verified and approved for beta access. You can now log in to the console and start provisioning your serverless managed nodes.</p>
        
        <a href="${loginUrl}" style="display: inline-block; padding: 16px 32px; background-color: #00e0ff; color: #000000; text-decoration: none; border-radius: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.2s;">Access Console</a>
        
        <p style="margin-top: 40px; font-size: 12px; color: #52525b; font-family: monospace;">
          Evolution awaits. <br/> The ClawMore Agentic Swarm is ready.
        </p>
      </div>
    </body>
  `;

  const command = new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Source: fromEmail,
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: htmlBody, Charset: 'UTF-8' },
        Text: {
          Data: `Welcome to the ClawMore Beta, ${name}! Your account has been approved. Log in at ${loginUrl}`,
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    console.log(`[Email] Approval email sent to ${to}`);
  } catch (err) {
    console.error(`[Email] Failed to send approval email to ${to}:`, err);
  }
}
