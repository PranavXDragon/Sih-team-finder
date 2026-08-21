const fs = require('fs');
const html = fs.readFileSync('sih_2026_scet_email_templates_themed.html', 'utf-8');

const styleMatch = html.match(/<style type="text\/css">([\s\S]*?)<\/style>/);
const css = styleMatch ? styleMatch[1] : '';

function extractTemplate(id) {
  const regex = new RegExp('<section id="' + id + '"[\\s\\S]*?<table class="email-container"[\\s\\S]*?>([\\s\\S]*?)<\\/table>\\s*<\\/section>', 'i');
  const match = html.match(regex);
  if (match) {
    return '<table class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a1d28; border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 14px; overflow: hidden; width: 100%;">' + match[1] + '</table>';
  }
  return '';
}

const template1 = extractTemplate('template-1');
const template4 = extractTemplate('template-4');
const template5 = extractTemplate('template-5');
const template6 = extractTemplate('template-6');

const code = `
export const generateEmailHTML = (type: string, payload: any) => {
  const head = \`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">${css}</style>
</head>
<body style="margin: 0; padding: 0; width: 100% !important; background-color: #0e0f14; font-family: 'Space Grotesk', Arial, sans-serif; color: #f7f3ea; line-height: 1.6;">
  <div style="max-width: 680px; margin: 0 auto; padding: 32px 16px;">
  \`;
  
  const foot = \`
  </div>
</body>
</html>\`;

  let body = '';

  if (type === 'REGISTERED') {
    body = \`${template1}\`
      .replace(/{{student_name}}/g, payload.student_name || 'Student')
      .replace(/{{platform_link}}/g, 'https://sih2026.tech/');
  } else if (type === 'TEAM_CREATED') {
    body = \`${template1}\`
      .replace(/Template 1 • Registration Confirmation/g, 'Template • Team Created')
      .replace(/You’re Registered on the SIH 2026 SCET Platform 🎉/g, 'Your Team has been Created 🎉')
      .replace(/Your registration has been successfully completed./g, 'You have successfully created your team on the platform!')
      .replace(/{{student_name}}/g, payload.student_name || 'Team Leader')
      .replace(/{{platform_link}}/g, 'https://sih2026.tech/#board');
  } else if (type === 'ACCEPTED') {
    body = \`${template4}\`
      .replace(/{{student_name}}/g, payload.student_name || 'Student')
      .replace(/{{team_name}}/g, payload.team_name || 'the team')
      .replace(/{{team_leader}}/g, payload.team_leader || 'Team Leader')
      .replace(/{{member_count}}/g, payload.member_count || 'Several')
      .replace(/{{team_link}}/g, 'https://sih2026.tech/#board');
  } else if (type === 'REJECTED') {
    body = \`${template5}\`
      .replace(/{{student_name}}/g, payload.student_name || 'Student')
      .replace(/{{team_name}}/g, payload.team_name || 'the team')
      .replace(/{{team_leader}}/g, payload.team_leader || 'Team Leader')
      .replace(/{{removal_reason}}/g, payload.removal_reason || 'Team requirements were updated.')
      .replace(/{{platform_link}}/g, 'https://sih2026.tech/');
  } else if (type === 'JOIN_REQUEST') {
    body = \`${template6}\`
      .replace(/{{team_leader_name}}/g, payload.team_leader_name || 'Team Leader')
      .replace(/{{requester_name}}/g, payload.requester_name || 'A student')
      .replace(/{{branch}}/g, payload.branch || 'N/A')
      .replace(/{{year}}/g, payload.year || 'N/A')
      .replace(/{{skills}}/g, payload.skills || 'N/A')
      .replace(/{{email}}/g, payload.email || 'N/A')
      .replace(/{{request_message}}/g, payload.request_message || 'I would love to join your team!')
      .replace(/{{request_link}}/g, 'https://sih2026.tech/#board');
  } else {
    body = '<p>Notification from SIH SCET Platform.</p>';
  }

  return head + body + foot;
};
`;

fs.writeFileSync('supabase/functions/send-email/templates.ts', code);
console.log('Successfully wrote templates.ts');
