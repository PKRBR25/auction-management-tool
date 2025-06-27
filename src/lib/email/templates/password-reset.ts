interface EmailTemplateParams {
  userFullName: string;
  verificationCode: string;
  companyName: string;
  companyAddressLine1: string;
  companyAddressLine2: string;
  currentYear: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

export function getPasswordResetEmailTemplate(params: EmailTemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eaeaea;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 180px;
            height: auto;
        }
        .content {
            padding: 0 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4F46E5;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 25px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
            font-size: 12px;
            color: #666666;
            text-align: center;
        }
        .code {
            font-family: monospace;
            font-size: 24px;
            letter-spacing: 2px;
            background-color: #f5f5f5;
            padding: 10px 20px;
            border-radius: 4px;
            margin: 20px 0;
            display: inline-block;
        }
        .expiry-note {
            color: #666666;
            font-size: 14px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://yourdomain.com/logo.png" alt="Company Logo" class="logo">
    </div>
    
    <div class="content">
        <h2>Reset Your Password</h2>
        
        <p>Hello <strong>${params.userFullName}</strong>,</p>
        
        <p>We received a request to reset the password for your account. Use the following verification code to proceed:</p>
        
        <div class="code">${params.verificationCode}</div>
        
        <p class="expiry-note">This code will expire in 15 minutes.</p>
        
        <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        
        <p>For security reasons, please don't share this code with anyone. Our support team will never ask you for this code.</p>
        
        <p>Need help? Contact our support team at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></p>
        
        <p>Best regards,<br>The ${params.companyName} Team</p>
    </div>
    
    <div class="footer">
        <p>© ${params.currentYear} ${params.companyName}. All rights reserved.</p>
        <p>
            <a href="${params.privacyPolicyUrl}" style="color: #4F46E5; text-decoration: none;">Privacy Policy</a> | 
            <a href="${params.termsUrl}" style="color: #4F46E5; text-decoration: none;">Terms of Service</a>
        </p>
        <p>
            ${params.companyAddressLine1}<br>
            ${params.companyAddressLine2}
        </p>
        <p>
            <a href="${params.unsubscribeUrl}" style="color: #666666; text-decoration: underline;">Unsubscribe</a> | 
            <a href="${params.preferencesUrl}" style="color: #666666; text-decoration: underline;">Email Preferences</a>
        </p>
    </div>
</body>
</html>
`;
}
