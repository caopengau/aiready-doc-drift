import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({});

export async function handler(event: any) {
  console.log('Received health alert event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const snsMessage = JSON.parse(record.Sns.Message);
    console.log('Processing health alert:', snsMessage);

    const { site, status, message, timestamp } = snsMessage;

    const subject =
      status === 'unhealthy'
        ? `🚨 ALERT: ${site} is DOWN!`
        : `✅ RECOVERY: ${site} is back UP`;

    const body = `
Health Check Alert
==================

Site: ${site}
Status: ${status === 'unhealthy' ? '❌ UNHEALTHY' : '✅ HEALTHY'}
Message: ${message}
Timestamp: ${timestamp}

---
This is an automated health check notification from AIReady.
    `.trim();

    const command = new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [process.env.SES_TO_EMAIL || ''],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: body,
            Charset: 'UTF-8',
          },
        },
      },
    });

    try {
      await ses.send(command);
      console.log(`Email sent successfully for ${site}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  return { statusCode: 200, body: 'OK' };
}
