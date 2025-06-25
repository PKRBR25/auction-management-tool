interface EmailTemplateParams {
  user_full_name: string;
  verification_code: string;
  company_name: string;
  company_address_line1: string;
  company_address_line2: string;
  current_year: string;
  privacy_policy_url: string;
  terms_url: string;
  unsubscribe_url: string;
  preferences_url: string;
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
        
        <p>Hello <strong>${params.user_full_name}</strong>,</p>
        
        <p>We received a request to reset the password for your account. Use the following verification code to proceed:</p>
        
        <div class="code">${params.verification_code}</div>
        
        <p class="expiry-note">This code will expire in 15 minutes.</p>
        
        <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        
        <p>For security reasons, please don't share this code with anyone. Our support team will never ask you for this code.</p>
        
        <p>Need help? Contact our support team at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></p>
        
        <p>Best regards,<br>The ${params.company_name} Team</p>
    </div>
    
    <div class="footer">
        <p>© ${params.current_year} ${params.company_name}. All rights reserved.</p>
        <p>
            <a href="${params.privacy_policy_url}" style="color: #4F46E5; text-decoration: none;">Privacy Policy</a> | 
            <a href="${params.terms_url}" style="color: #4F46E5; text-decoration: none;">Terms of Service</a>
        </p>
        <p>
            ${params.company_address_line1}<br>
            ${params.company_address_line2}
        </p>
        <p>
            <a href="${params.unsubscribe_url}" style="color: #666666; text-decoration: underline;">Unsubscribe</a> | 
            <a href="${params.preferences_url}" style="color: #666666; text-decoration: underline;">Email Preferences</a>
        </p>
    </div>
</body>
</html>
`;
}
