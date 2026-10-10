export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
  category: 'activation' | 'password_reset' | 'event' | 'challenge' | 'security';
}

export interface EmailDeliveryRecord {
  id: string;
  to: string;
  subject: string;
  category: string;
  status: 'sent' | 'unconfigured' | 'failed';
  provider: string;
  timestamp: string;
  error?: string;
}

export class EmailService {
  private static deliveryLog: EmailDeliveryRecord[] = [];

  public static isConfigured(): boolean {
    return Boolean(
      (process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || process.env.SMTP_HOST) &&
      process.env.EMAIL_FROM
    );
  }

  public static async sendEmail(payload: EmailPayload): Promise<{ success: boolean; status: 'sent' | 'unconfigured' | 'failed'; message: string }> {
    const timestamp = new Date().toISOString();
    const id = `eml-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Check configuration
    if (!this.isConfigured()) {
      const record: EmailDeliveryRecord = {
        id,
        to: payload.to,
        subject: payload.subject,
        category: payload.category,
        status: 'unconfigured',
        provider: 'none',
        timestamp,
      };
      this.deliveryLog.push(record);
      console.warn(`[EmailService] Transactional email provider not configured. Simulated delivery for ${payload.to} (${payload.category}). To deliver real emails, set RESEND_API_KEY and EMAIL_FROM in environment.`);
      return {
        success: false,
        status: 'unconfigured',
        message: 'Email delivery provider is not configured. For development/audit, verification codes are logged to secure server console only.',
      };
    }

    // Provider delivery branch (e.g. Resend / SendGrid / SMTP)
    try {
      if (process.env.RESEND_API_KEY) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Resend API error (${response.status}): ${errText}`);
        }

        this.deliveryLog.push({
          id,
          to: payload.to,
          subject: payload.subject,
          category: payload.category,
          status: 'sent',
          provider: 'resend',
          timestamp,
        });

        return { success: true, status: 'sent', message: 'Email sent successfully via Resend.' };
      }

      // Default fallback if unsupported provider
      return { success: false, status: 'unconfigured', message: 'Provider configured is unsupported.' };
    } catch (err: any) {
      console.error('[EmailService] Delivery failed:', err?.message || err);
      this.deliveryLog.push({
        id,
        to: payload.to,
        subject: payload.subject,
        category: payload.category,
        status: 'failed',
        provider: 'resend',
        timestamp,
        error: err?.message,
      });
      return { success: false, status: 'failed', message: `Delivery failed: ${err?.message || 'Network error'}` };
    }
  }

  public static getDeliveryLog(): EmailDeliveryRecord[] {
    return this.deliveryLog;
  }
}
