const escapeHtml = (unsafe: string) => {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const generateEmailHTML = (type: string, rawPayload: any) => {
  // Sanitize all payload strings to prevent XSS injections in emails
  const payload = { ...rawPayload };
  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      payload[key] = escapeHtml(payload[key]);
    }
  }
  const head = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    /* ==========================================================================
       SHARED EMAIL & PREVIEW STYLES
       Visual Identity: SIH 2026 SCET Team Finder Design System
       ========================================================================== */

    /* Reset & Base Styles */
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #0e0f14;
      font-family: "Space Grotesk", Arial, Helvetica, sans-serif;
      color: #f7f3ea;
      line-height: 1.6;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    table {
      border-collapse: collapse !important;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    td {
      font-family: "Space Grotesk", Arial, Helvetica, sans-serif;
    }

    /* Links */
    a {
      color: #c8f24d;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Local Preview Navigation Bar (Only for viewing file in browser) */
    .preview-nav-container {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #151721;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding: 12px 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .preview-nav-inner {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .preview-nav-title {
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #c8f24d;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview-nav-badge {
      background: #ff7a1a;
      color: #ffffff;
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    .preview-nav-links {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .preview-nav-btn {
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      color: #9ba2b4;
      background: #1a1d28;
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 6px 12px;
      border-radius: 100px;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .preview-nav-btn:hover {
      color: #ffffff;
      background: #212533;
      border-color: #c8f24d;
      text-decoration: none;
    }

    /* Template Wrapper & Separation */
    .preview-wrapper {
      max-width: 680px;
      margin: 0 auto;
      padding: 32px 16px 64px;
    }

    .template-section {
      margin-bottom: 48px;
      position: relative;
    }

    .template-label-tag {
      display: inline-block;
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #ff7a1a;
      background: rgba(255, 122, 26, 0.12);
      border: 1px solid rgba(255, 122, 26, 0.3);
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    /* Shared Email Component Styles (Inline-Ready) */
    .email-container {
      background-color: #1a1d28;
      border: 1px solid rgba(255, 255, 255, 0.13);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
    }

    .email-header {
      background-color: #151721;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      padding: 24px 32px;
    }

    .email-header-title {
      font-family: "Archivo Black", Arial, sans-serif;
      font-size: 22px;
      color: #f7f3ea;
      margin: 0;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    .email-header-subtitle {
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      color: #9ba2b4;
      margin-top: 6px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    .email-body {
      padding: 32px;
      color: #f7f3ea;
      font-size: 15px;
      line-height: 1.65;
    }

    .email-heading {
      font-family: "Archivo Black", Arial, sans-serif;
      font-size: 20px;
      color: #f7f3ea;
      margin-top: 0;
      margin-bottom: 18px;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }

    .details-card {
      background-color: #212533;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 20px;
      margin: 22px 0;
    }

    .details-label {
      font-family: "JetBrains Mono", monospace;
      font-size: 10.5px;
      font-weight: 700;
      color: #c8f24d;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      display: inline-block;
      margin-bottom: 10px;
      background: rgba(200, 242, 77, 0.12);
      border: 1px solid rgba(200, 242, 77, 0.25);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .quote-box {
      background-color: rgba(255, 122, 26, 0.08);
      border-left: 3px solid #ff7a1a;
      border-radius: 0 8px 8px 0;
      padding: 14px 18px;
      margin: 18px 0;
      color: #f4efe2;
      font-style: italic;
    }

    .btn-primary {
      display: inline-block;
      background-color: #c8f24d;
      color: #101a05 !important;
      font-family: "Space Grotesk", Arial, sans-serif;
      font-weight: 700;
      font-size: 14.5px;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 100px;
      margin: 12px 0 20px;
      text-align: center;
      box-shadow: 0 6px 20px rgba(200, 242, 77, 0.25);
    }

    .email-footer {
      background-color: #12141c;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding: 22px 32px;
      font-size: 12.5px;
      color: #9ba2b4;
    }

    .dev-credits {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      font-size: 11px;
      color: #9ba2b4;
    }

    .dev-name {
      color: #c8f24d;
      font-weight: 600;
    }

    /* Mobile Responsiveness */
    @media only screen and (max-width: 600px) {
      .preview-wrapper {
        padding: 16px 8px 40px !important;
      }
      .email-header {
        padding: 20px 20px !important;
      }
      .email-body {
        padding: 22px 20px !important;
        font-size: 14.5px !important;
      }
      .email-footer {
        padding: 18px 20px !important;
      }
      .email-header-title {
        font-size: 19px !important;
      }
      .email-heading {
        font-size: 18px !important;
      }
      .btn-primary {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        text-align: center !important;
      }
      .preview-nav-inner {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100% !important; background-color: #0e0f14; font-family: 'Space Grotesk', Arial, sans-serif; color: #f7f3ea; line-height: 1.6;">
  <div style="max-width: 680px; margin: 0 auto; padding: 32px 16px;">
  `;
  
  const foot = `
  </div>
</body>
</html>`;

  let body = '';

  if (type === 'REGISTERED') {
    body = `<table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a1d28; border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 14px; overflow: hidden; width: 100%;">
        <!-- Header -->
        <tr>
          <td class="email-header" style="background-color: #151721; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding: 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <!-- Brand Kicker Tag -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                    <tr>
                      <td style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #c8f24d; background-color: rgba(200, 242, 77, 0.12); border: 1px solid rgba(200, 242, 77, 0.25); padding: 3px 8px; border-radius: 4px; letter-spacing: 0.16em; text-transform: uppercase;">
                        SIH 2026 • SCET
                      </td>
                    </tr>
                  </table>
                  <h1 class="email-header-title" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 22px; color: #f7f3ea; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">SIH 2026 SCET</h1>
                  <div class="email-header-subtitle" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #9ba2b4; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.12em;">Student Collaboration Platform</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="email-body" style="padding: 32px; color: #f7f3ea; font-size: 15px; line-height: 1.65;">
            <h2 class="email-heading" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 20px; color: #f7f3ea; margin-top: 0; margin-bottom: 18px; line-height: 1.25;">
              You’re Registered on the SIH 2026 SCET Platform 🎉
            </h2>

            <p style="margin: 0 0 16px; color: #f7f3ea;">Hello {{student_name}},</p>

            <p style="margin: 0 0 16px; color: #f7f3ea;">Welcome to the <strong style="color: #c8f24d;">SIH 2026 SCET College Platform!</strong></p>

            <p style="margin: 0 0 16px; color: #f7f3ea;">Your registration has been successfully completed.</p>

            <p style="margin: 0 0 16px; color: #9ba2b4;">This platform is designed to help students participating in <strong style="color: #f7f3ea;">Smart India Hackathon 2026</strong> find teammates, create or join teams, and connect with other students who are looking for team members.</p>

            <!-- Feature Card -->
            <div class="details-card" style="background-color: #212533; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; padding: 20px; margin: 22px 0;">
              <span class="details-label" style="font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700; color: #c8f24d; text-transform: uppercase; letter-spacing: 0.18em; display: inline-block; margin-bottom: 12px; background: rgba(200, 242, 77, 0.12); border: 1px solid rgba(200, 242, 77, 0.25); padding: 3px 8px; border-radius: 4px;">What you can do now</span>
              <ul style="margin: 0; padding-left: 20px; color: #f7f3ea; line-height: 1.8;">
                <li>Find students looking for teammates</li>
                <li>Create your own SIH 2026 team</li>
                <li>Send team requests</li>
                <li>Accept or manage team invitations</li>
                <li>Explore available team opportunities</li>
              </ul>
            </div>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0 20px;">
              <tr>
                <td style="border-radius: 100px; background-color: #c8f24d;">
                  <a class="btn-primary" href="{{platform_link}}" style="display: inline-block; background-color: #c8f24d; color: #101a05 !important; font-family: 'Space Grotesk', Arial, sans-serif; font-weight: 700; font-size: 14.5px; text-decoration: none; padding: 12px 26px; border-radius: 100px; text-align: center;">Get Started →</a>
                </td>
              </tr>
            </table>

            <p style="margin: 0; color: #9ba2b4;">Your profile is now ready to connect with other SIH participants.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="email-footer" style="background-color: #12141c; border-top: 1px solid rgba(255, 255, 255, 0.12); padding: 22px 32px; font-size: 12.5px; color: #9ba2b4;">
            Best regards,<br>
            <strong style="color: #f7f3ea; font-size: 13.5px;">SIH 2026 SCET Team</strong><br>
            Suryodaya College of Engineering & Technology
            
            <div class="dev-credits" style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(255, 255, 255, 0.1); font-size: 11px; color: #9ba2b4;">
              Designed & Developed by <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Pranav Navgahre</span>, <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Piyush Chafle</span> and <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Kunal Panche</span>
            </div>
          </td>
        </tr>
      </table>`
      .replace(/{{student_name}}/g, payload.student_name || 'Student')
      .replace(/{{platform_link}}/g, 'https://sih.scetngp.com/');
  } else if (type === 'TEAM_CREATED') {
    body = `<table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a1d28; border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 14px; overflow: hidden; width: 100%;">
        <!-- Header -->
        <tr>
          <td class="email-header" style="background-color: #151721; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding: 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <!-- Brand Kicker Tag -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                    <tr>
                      <td style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #c8f24d; background-color: rgba(200, 242, 77, 0.12); border: 1px solid rgba(200, 242, 77, 0.25); padding: 3px 8px; border-radius: 4px; letter-spacing: 0.16em; text-transform: uppercase;">
                        SIH 2026 • SCET
                      </td>
                    </tr>
                  </table>
                  <h1 class="email-header-title" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 22px; color: #f7f3ea; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">SIH 2026 SCET</h1>
                  <div class="email-header-subtitle" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #9ba2b4; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.12em;">Student Collaboration Platform</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="email-body" style="padding: 32px; color: #f7f3ea; font-size: 15px; line-height: 1.65;">
            <h2 class="email-heading" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 20px; color: #f7f3ea; margin-top: 0; margin-bottom: 18px; line-height: 1.25;">
              You’re Registered on the SIH 2026 SCET Platform 🎉
            </h2>

            <p style="margin: 0 0 16px; color: #f7f3ea;">Hello {{student_name}},</p>

            <p style="margin: 0 0 16px; color: #f7f3ea;">Welcome to the <strong style="color: #c8f24d;">SIH 2026 SCET College Platform!</strong></p>

            <p style="margin: 0 0 16px; color: #f7f3ea;">Your registration has been successfully completed.</p>

            <p style="margin: 0 0 16px; color: #9ba2b4;">This platform is designed to help students participating in <strong style="color: #f7f3ea;">Smart India Hackathon 2026</strong> find teammates, create or join teams, and connect with other students who are looking for team members.</p>

            <!-- Feature Card -->
            <div class="details-card" style="background-color: #212533; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; padding: 20px; margin: 22px 0;">
              <span class="details-label" style="font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700; color: #c8f24d; text-transform: uppercase; letter-spacing: 0.18em; display: inline-block; margin-bottom: 12px; background: rgba(200, 242, 77, 0.12); border: 1px solid rgba(200, 242, 77, 0.25); padding: 3px 8px; border-radius: 4px;">What you can do now</span>
              <ul style="margin: 0; padding-left: 20px; color: #f7f3ea; line-height: 1.8;">
                <li>Find students looking for teammates</li>
                <li>Create your own SIH 2026 team</li>
                <li>Send team requests</li>
                <li>Accept or manage team invitations</li>
                <li>Explore available team opportunities</li>
              </ul>
            </div>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0 20px;">
              <tr>
                <td style="border-radius: 100px; background-color: #c8f24d;">
                  <a class="btn-primary" href="{{platform_link}}" style="display: inline-block; background-color: #c8f24d; color: #101a05 !important; font-family: 'Space Grotesk', Arial, sans-serif; font-weight: 700; font-size: 14.5px; text-decoration: none; padding: 12px 26px; border-radius: 100px; text-align: center;">Get Started →</a>
                </td>
              </tr>
            </table>

            <p style="margin: 0; color: #9ba2b4;">Your profile is now ready to connect with other SIH participants.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="email-footer" style="background-color: #12141c; border-top: 1px solid rgba(255, 255, 255, 0.12); padding: 22px 32px; font-size: 12.5px; color: #9ba2b4;">
            Best regards,<br>
            <strong style="color: #f7f3ea; font-size: 13.5px;">SIH 2026 SCET Team</strong><br>
            Suryodaya College of Engineering & Technology
            
            <div class="dev-credits" style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(255, 255, 255, 0.1); font-size: 11px; color: #9ba2b4;">
              Designed & Developed by <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Pranav Navgahre</span>, <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Piyush Chafle</span> and <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Kunal Panche</span>
            </div>
          </td>
        </tr>
      </table>`
      .replace(/Template 1 • Registration Confirmation/g, 'Template • Team Created')
      .replace(/You’re Registered on the SIH 2026 SCET Platform 🎉/g, 'Your Team has been Created 🎉')
      .replace(/Your registration has been successfully completed./g, 'You have successfully created your team on the platform!')
      .replace(/{{student_name}}/g, payload.student_name || 'Team Leader')
      .replace(/{{platform_link}}/g, 'https://sih.scetngp.com/#board');
  } else if (type === 'ACCEPTED') {
    body = `<table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a1d28; border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 14px; overflow: hidden; width: 100%;">
        <!-- Header -->
        <tr>
          <td class="email-header" style="background-color: #151721; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding: 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                    <tr>
                      <td style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #c8f24d; background-color: rgba(200, 242, 77, 0.12); border: 1px solid rgba(200, 242, 77, 0.25); padding: 3px 8px; border-radius: 4px; letter-spacing: 0.16em; text-transform: uppercase;">
                        SIH 2026 • CONGRATULATIONS
                      </td>
                    </tr>
                  </table>
                  <h1 class="email-header-title" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 22px; color: #f7f3ea; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">SIH 2026 SCET</h1>
                  <div class="email-header-subtitle" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #9ba2b4; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.12em;">Team Membership Update</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="email-body" style="padding: 32px; color: #f7f3ea; font-size: 15px; line-height: 1.65;">
            <h2 class="email-heading" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 20px; color: #f7f3ea; margin-top: 0; margin-bottom: 18px; line-height: 1.25;">
              Welcome to Your SIH 2026 Team 🎉
            </h2>

            <p style="margin: 0 0 16px; color: #f7f3ea;">Hello {{student_name}},</p>

            <p style="margin: 0 0 16px; color: #c8f24d; font-weight: 600; font-size: 16px;">Great news! 🎉</p>

            <p style="margin: 0 0 16px; color: #f7f3ea;">Your request to join <strong style="color: #c8f24d;">{{team_name}}</strong> has been <strong style="color: #c8f24d;">approved</strong>.</p>

            <p style="margin: 0 0 16px; color: #9ba2b4;">You are now officially a member of the team on the SIH 2026 SCET Platform.</p>

            <!-- Team Card -->
            <div class="details-card" style="background-color: #212533; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; padding: 20px; margin: 22px 0;">
              <span class="details-label" style="font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700; color: #c8f24d; text-transform: uppercase; letter-spacing: 0.18em; display: inline-block; margin-bottom: 10px; background: rgba(200, 242, 77, 0.12); border: 1px solid rgba(200, 242, 77, 0.25); padding: 3px 8px; border-radius: 4px;">Your Team</span>
              <p style="margin: 6px 0; color: #f7f3ea;"><strong style="color: #9ba2b4;">Team Name:</strong> {{team_name}}</p>
              <p style="margin: 6px 0; color: #f7f3ea;"><strong style="color: #9ba2b4;">Team Leader:</strong> {{team_leader}}</p>
              <p style="margin: 6px 0; color: #f7f3ea;"><strong style="color: #9ba2b4;">Team Members:</strong> {{member_count}}</p>
            </div>

            <p style="margin: 0 0 16px; color: #9ba2b4;">You can now coordinate with your teammates, discuss your problem statement, and start preparing for <strong style="color: #f7f3ea;">Smart India Hackathon 2026</strong>.</p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0 20px;">
              <tr>
                <td style="border-radius: 100px; background-color: #c8f24d;">
                  <a class="btn-primary" href="{{team_link}}" style="display: inline-block; background-color: #c8f24d; color: #101a05 !important; font-family: 'Space Grotesk', Arial, sans-serif; font-weight: 700; font-size: 14.5px; text-decoration: none; padding: 12px 26px; border-radius: 100px; text-align: center;">Open Team Dashboard →</a>
                </td>
              </tr>
            </table>

            <p style="margin: 16px 0 4px; color: #c8f24d; font-weight: 700;">All the best for SIH 2026! 🚀</p>
            <p style="margin: 0; color: #9ba2b4; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.05em;">Build. Collaborate. Innovate.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="email-footer" style="background-color: #12141c; border-top: 1px solid rgba(255, 255, 255, 0.12); padding: 22px 32px; font-size: 12.5px; color: #9ba2b4;">
            Best regards,<br>
            <strong style="color: #f7f3ea; font-size: 13.5px;">SIH 2026 SCET Team</strong>
            
            <div class="dev-credits" style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(255, 255, 255, 0.1); font-size: 11px; color: #9ba2b4;">
              Designed & Developed by <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Pranav Navgahre</span>, <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Piyush Chafle</span> and <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Kunal Panche</span>
            </div>
          </td>
        </tr>
      </table>`
      .replace(/{{student_name}}/g, payload.student_name || 'Student')
      .replace(/{{team_name}}/g, payload.team_name || 'the team')
      .replace(/{{team_leader}}/g, payload.team_leader || 'Team Leader')
      .replace(/{{member_count}}/g, payload.member_count || 'Several')
      .replace(/{{team_link}}/g, 'https://sih.scetngp.com/#board');
  } else if (type === 'REJECTED') {
    body = `<table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a1d28; border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 14px; overflow: hidden; width: 100%;">
        <!-- Header -->
        <tr>
          <td class="email-header" style="background-color: #151721; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding: 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                    <tr>
                      <td style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #ff456b; background-color: rgba(255, 69, 107, 0.12); border: 1px solid rgba(255, 69, 107, 0.25); padding: 3px 8px; border-radius: 4px; letter-spacing: 0.16em; text-transform: uppercase;">
                        SIH 2026 • STATUS UPDATE
                      </td>
                    </tr>
                  </table>
                  <h1 class="email-header-title" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 22px; color: #f7f3ea; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">SIH 2026 SCET</h1>
                  <div class="email-header-subtitle" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #9ba2b4; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.12em;">Application Status Update</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="email-body" style="padding: 32px; color: #f7f3ea; font-size: 15px; line-height: 1.65;">
            <h2 class="email-heading" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 20px; color: #f7f3ea; margin-top: 0; margin-bottom: 18px; line-height: 1.25;">
              Application Status Update
            </h2>

            <p style="margin: 0 0 16px; color: #f7f3ea;">Hello {{student_name}},</p>

            <p style="margin: 0 0 16px; color: #f7f3ea;">This is to inform you that your request to join <strong style="color: #ff456b;">{{team_name}}</strong> has been declined.</p>

            <!-- Removal Details Card -->
            <div class="details-card" style="background-color: #212533; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; padding: 20px; margin: 22px 0;">
              <span class="details-label" style="font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700; color: #ff456b; text-transform: uppercase; letter-spacing: 0.18em; display: inline-block; margin-bottom: 10px; background: rgba(255, 69, 107, 0.12); border: 1px solid rgba(255, 69, 107, 0.25); padding: 3px 8px; border-radius: 4px;">Update Details</span>
              <p style="margin: 6px 0; color: #f7f3ea;"><strong style="color: #9ba2b4;">Team:</strong> {{team_name}}</p>
              <p style="margin: 6px 0; color: #f7f3ea;"><strong style="color: #9ba2b4;">Reviewed By:</strong> {{team_leader}}</p>
              <p style="margin: 6px 0; color: #f7f3ea;"><strong style="color: #9ba2b4;">Reason:</strong> {{removal_reason}}</p>
            </div>

            <p style="margin: 0 0 16px; color: #9ba2b4;">If you are still looking for a team, you can explore other available teams and connect with students looking for teammates through the platform.</p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0 20px;">
              <tr>
                <td style="border-radius: 100px; background-color: #c8f24d;">
                  <a class="btn-primary" href="{{platform_link}}" style="display: inline-block; background-color: #c8f24d; color: #101a05 !important; font-family: 'Space Grotesk', Arial, sans-serif; font-weight: 700; font-size: 14.5px; text-decoration: none; padding: 12px 26px; border-radius: 100px; text-align: center;">Find a Team →</a>
                </td>
              </tr>
            </table>

            <p style="margin: 0; color: #9ba2b4; font-size: 13.5px;">If you believe this action was taken incorrectly, please contact the SIH 2026 SCET coordinators.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="email-footer" style="background-color: #12141c; border-top: 1px solid rgba(255, 255, 255, 0.12); padding: 22px 32px; font-size: 12.5px; color: #9ba2b4;">
            Best regards,<br>
            <strong style="color: #f7f3ea; font-size: 13.5px;">SIH 2026 SCET Team</strong>
            
            <div class="dev-credits" style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(255, 255, 255, 0.1); font-size: 11px; color: #9ba2b4;">
              Designed & Developed by <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Pranav Navgahre</span>, <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Piyush Chafle</span> and <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Kunal Panche</span>
            </div>
          </td>
        </tr>
      </table>`
      .replace(/{{student_name}}/g, payload.student_name || 'Student')
      .replace(/{{team_name}}/g, payload.team_name || 'the team')
      .replace(/{{team_leader}}/g, payload.team_leader || 'Team Leader')
      .replace(/{{removal_reason}}/g, payload.removal_reason || 'Team requirements were updated.')
      .replace(/{{platform_link}}/g, 'https://sih.scetngp.com/');
  } else if (type === 'JOIN_REQUEST') {
    body = `<table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a1d28; border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 14px; overflow: hidden; width: 100%;">
        <!-- Header -->
        <tr>
          <td class="email-header" style="background-color: #151721; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding: 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                    <tr>
                      <td style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #c8f24d; background-color: rgba(200, 242, 77, 0.12); border: 1px solid rgba(200, 242, 77, 0.25); padding: 3px 8px; border-radius: 4px; letter-spacing: 0.16em; text-transform: uppercase;">
                        SIH 2026 • MEMBER INQUIRY
                      </td>
                    </tr>
                  </table>
                  <h1 class="email-header-title" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 22px; color: #f7f3ea; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">SIH 2026 SCET</h1>
                  <div class="email-header-subtitle" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #9ba2b4; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.12em;">New Team Member Request</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="email-body" style="padding: 32px; color: #f7f3ea; font-size: 15px; line-height: 1.65;">
            <h2 class="email-heading" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 20px; color: #f7f3ea; margin-top: 0; margin-bottom: 18px; line-height: 1.25;">
              {{requester_name}} Wants to Join Your Team
            </h2>

            <p style="margin: 0 0 16px; color: #f7f3ea;">Hello {{team_leader_name}},</p>

            <p style="margin: 0 0 16px; color: #f7f3ea;">A student is interested in joining your team for <strong style="color: #c8f24d;">Smart India Hackathon 2026</strong>.</p>

            <!-- Student Profile Card -->
            <div class="details-card" style="background-color: #212533; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; padding: 20px; margin: 22px 0;">
              <span class="details-label" style="font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700; color: #c8f24d; text-transform: uppercase; letter-spacing: 0.18em; display: inline-block; margin-bottom: 10px; background: rgba(200, 242, 77, 0.12); border: 1px solid rgba(200, 242, 77, 0.25); padding: 3px 8px; border-radius: 4px;">Student Details</span>
              <p style="margin: 6px 0; color: #f7f3ea;"><strong style="color: #9ba2b4;">Name:</strong> {{requester_name}}</p>
              <p style="margin: 6px 0; color: #f7f3ea;"><strong style="color: #9ba2b4;">Branch:</strong> {{branch}}</p>
              <p style="margin: 6px 0; color: #f7f3ea;"><strong style="color: #9ba2b4;">Year:</strong> {{year}}</p>
              <p style="margin: 6px 0; color: #f7f3ea;"><strong style="color: #9ba2b4;">Skills:</strong> {{skills}}</p>
              <p style="margin: 6px 0; color: #f7f3ea;"><strong style="color: #9ba2b4;">Email:</strong> {{email}}</p>
            </div>

            <p style="margin: 18px 0 8px; color: #f7f3ea; font-weight: 600;">Message from Student:</p>

            <!-- Quote Block -->
            <div class="quote-box" style="background-color: rgba(255, 122, 26, 0.08); border-left: 3px solid #ff7a1a; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 12px 0 20px; color: #f4efe2; font-style: italic;">
              {{request_message}}
            </div>

            <p style="margin: 0 0 16px; color: #9ba2b4;">Please review the student's profile and choose whether to accept or reject the request.</p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0 20px;">
              <tr>
                <td style="border-radius: 100px; background-color: #c8f24d;">
                  <a class="btn-primary" href="{{request_link}}" style="display: inline-block; background-color: #c8f24d; color: #101a05 !important; font-family: 'Space Grotesk', Arial, sans-serif; font-weight: 700; font-size: 14.5px; text-decoration: none; padding: 12px 26px; border-radius: 100px; text-align: center;">Review Request →</a>
                </td>
              </tr>
            </table>

            <p style="margin: 0; color: #9ba2b4;">Once you take action, the student will be notified automatically.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="email-footer" style="background-color: #12141c; border-top: 1px solid rgba(255, 255, 255, 0.12); padding: 22px 32px; font-size: 12.5px; color: #9ba2b4;">
            Best regards,<br>
            <strong style="color: #f7f3ea; font-size: 13.5px;">SIH 2026 SCET Team</strong>
            
            <div class="dev-credits" style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(255, 255, 255, 0.1); font-size: 11px; color: #9ba2b4;">
              Designed & Developed by <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Pranav Navgahre</span>, <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Piyush Chafle</span> and <span class="dev-name" style="color: #c8f24d; font-weight: 600;">Kunal Panche</span>
            </div>
          </td>
        </tr>
      </table>`
      .replace(/{{team_leader_name}}/g, payload.team_leader_name || 'Team Leader')
      .replace(/{{requester_name}}/g, payload.requester_name || 'A student')
      .replace(/{{branch}}/g, payload.branch || 'N/A')
      .replace(/{{year}}/g, payload.year || 'N/A')
      .replace(/{{skills}}/g, payload.skills || 'N/A')
      .replace(/{{email}}/g, payload.email || 'N/A')
      .replace(/{{request_message}}/g, payload.request_message || 'I would love to join your team!')
      .replace(/{{request_link}}/g, 'https://sih.scetngp.com/#requests');
  } else if (type === 'TEAM_INVITE') {
    body = `<table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a1d28; border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 14px; overflow: hidden; width: 100%;">
        <!-- Header -->
        <tr>
          <td class="email-header" style="background-color: #151721; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding: 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                    <tr>
                      <td style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #00d2ff; background-color: rgba(0, 210, 255, 0.12); border: 1px solid rgba(0, 210, 255, 0.25); padding: 3px 8px; border-radius: 4px; letter-spacing: 0.16em; text-transform: uppercase;">
                        SIH 2026 • TEAM INVITATION
                      </td>
                    </tr>
                  </table>
                  <h1 class="email-header-title" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 22px; color: #f7f3ea; margin: 0; line-height: 1.1; letter-spacing: -0.02em;">SIH 2026 SCET</h1>
                  <div class="email-header-subtitle" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #9ba2b4; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.12em;">You're Invited!</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="email-body" style="padding: 32px; color: #f7f3ea; font-size: 15px; line-height: 1.65;">
            <h2 class="email-heading" style="font-family: 'Archivo Black', Arial, sans-serif; font-size: 20px; color: #f7f3ea; margin-top: 0; margin-bottom: 18px; line-height: 1.25;">
              You have been invited to join {{team_name}}
            </h2>

            <p style="margin: 0 0 16px; color: #f7f3ea;">Hello {{seeker_name}},</p>

            <p style="margin: 0 0 16px; color: #f7f3ea;">The team leader <strong>{{team_leader_name}}</strong> has found your profile and thinks you'd be a great fit for their team!</p>

            <p style="margin: 18px 0 8px; color: #f7f3ea; font-weight: 600;">Message from the Team Leader:</p>

            <!-- Quote Block -->
            <div class="quote-box" style="background-color: rgba(0, 210, 255, 0.08); border-left: 3px solid #00d2ff; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 12px 0 20px; color: #f4efe2; font-style: italic;">
              {{invite_message}}
            </div>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0 20px;">
              <tr>
                <td style="border-radius: 100px; background-color: #c8f24d;">
                  <a class="btn-primary" href="{{platform_link}}" style="display: inline-block; background-color: #c8f24d; color: #101a05 !important; font-family: 'Space Grotesk', Arial, sans-serif; font-weight: 700; font-size: 14.5px; text-decoration: none; padding: 12px 26px; border-radius: 100px; text-align: center;">View Team Details →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="email-footer" style="background-color: #12141c; border-top: 1px solid rgba(255, 255, 255, 0.12); padding: 22px 32px; font-size: 12.5px; color: #9ba2b4;">
            Best regards,<br>
            <strong style="color: #f7f3ea; font-size: 13.5px;">SIH 2026 SCET Team</strong>
          </td>
        </tr>
      </table>`
      .replace(/{{seeker_name}}/g, payload.seeker_name || 'Student')
      .replace(/{{team_name}}/g, payload.team_name || 'the team')
      .replace(/{{team_leader_name}}/g, payload.team_leader_name || 'The Team Leader')
      .replace(/{{invite_message}}/g, payload.invite_message || 'We would love to have you on our team!')
      .replace(/{{platform_link}}/g, 'https://sih.scetngp.com/#board');
  } else {
    body = '<p>Notification from SIH SCET Platform.</p>';
  }

  return head + body + foot;
};
