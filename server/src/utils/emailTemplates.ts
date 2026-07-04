// server/src/utils/emailTemplates.ts
export const emailTemplates = {
  // Email verification template
  verifyEmail: (name: string, verificationUrl: string) => ({
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc;">
            <tr>
              <td style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 24px; font-weight: bold;">C</span>
                      </div>
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a202c;">Verify Your Email</h1>
                      <p style="margin: 8px 0 0; color: #718096; font-size: 16px; line-height: 24px;">
                        Hello ${name}! Please verify your email address to get started with Comvia.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center;">
                      <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.25);">
                        Verify Email
                      </a>
                      <p style="margin: 24px 0 0; color: #a0aec0; font-size: 14px;">
                        Or copy and paste this link into your browser:
                        <br>
                        <span style="color: #f97316; word-break: break-all;">${verificationUrl}</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="margin: 0; color: #a0aec0; font-size: 14px;">
                        This link will expire in 24 hours.
                      </p>
                      <p style="margin: 8px 0 0; color: #a0aec0; font-size: 14px;">
                        If you didn't create an account with Comvia, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  // Password reset template
  resetPassword: (name: string, resetUrl: string) => ({
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc;">
            <tr>
              <td style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 24px; font-weight: bold;">C</span>
                      </div>
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a202c;">Reset Your Password</h1>
                      <p style="margin: 8px 0 0; color: #718096; font-size: 16px; line-height: 24px;">
                        Hello ${name}! We received a request to reset your password.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center;">
                      <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.25);">
                        Reset Password
                      </a>
                      <p style="margin: 24px 0 0; color: #a0aec0; font-size: 14px;">
                        Or copy and paste this link into your browser:
                        <br>
                        <span style="color: #f97316; word-break: break-all;">${resetUrl}</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="margin: 0; color: #a0aec0; font-size: 14px;">
                        This link will expire in 1 hour.
                      </p>
                      <p style="margin: 8px 0 0; color: #a0aec0; font-size: 14px;">
                        If you didn't request this, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),

  // Team invitation template
  teamInvitation: (inviterName: string, companyName: string, inviteUrl: string) => ({
    subject: `You've been invited to join ${companyName} on Comvia`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Invitation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc;">
            <tr>
              <td style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 24px; font-weight: bold;">C</span>
                      </div>
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a202c;">Team Invitation</h1>
                      <p style="margin: 8px 0 0; color: #718096; font-size: 16px; line-height: 24px;">
                        <strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> on Comvia.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center;">
                      <a href="${inviteUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.25);">
                        Accept Invitation
                      </a>
                      <p style="margin: 24px 0 0; color: #a0aec0; font-size: 14px;">
                        Or copy and paste this link into your browser:
                        <br>
                        <span style="color: #f97316; word-break: break-all;">${inviteUrl}</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="margin: 0; color: #a0aec0; font-size: 14px;">
                        This invitation will expire in 7 days.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),
};