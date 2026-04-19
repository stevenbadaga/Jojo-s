# Email Setup Guide for esoko@gmail.com

## Step-by-Step Instructions to Get Gmail App Password

### 1. Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with `esoko@gmail.com`
3. Under "Signing in to Google", find **2-Step Verification**
4. If not enabled, click **Get Started** and follow the prompts
5. You'll need to verify your phone number

### 2. Generate App Password
1. After enabling 2-Step Verification, go back to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", find **App passwords**
3. Click on **App passwords**
4. You may need to sign in again
5. Select **Mail** as the app
6. Select **Other (Custom name)** as the device
7. Enter a name like "Esoko Backend" or "Spring Boot App"
8. Click **Generate**
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - ⚠️ **IMPORTANT**: This password will only be shown once! Copy it immediately.

### 3. Update Your Configuration

#### Option A: Update application.properties (for local development)
Open `kitenge-backend/src/main/resources/application.properties` and update:

```properties
spring.mail.username=esoko@gmail.com
spring.mail.password=YOUR_16_CHARACTER_APP_PASSWORD_HERE
```

**Important**: Remove any spaces from the app password when pasting it.

#### Option B: Use Environment Variables (Recommended for production)
Set these environment variables:

**Windows (PowerShell):**
```powershell
$env:EMAIL_USER="esoko@gmail.com"
$env:EMAIL_PASS="your-16-character-app-password"
```

**Windows (Command Prompt):**
```cmd
set EMAIL_USER=esoko@gmail.com
set EMAIL_PASS=your-16-character-app-password
```

**Linux/Mac:**
```bash
export EMAIL_USER="esoko@gmail.com"
export EMAIL_PASS="your-16-character-app-password"
```

### 4. Restart Your Backend Server
After updating the configuration, restart your Spring Boot application for changes to take effect.

## What Has Been Changed

✅ **Email Sender**: Changed from `badagaclass@gmail.com` to `esoko@gmail.com`
✅ **Admin Notifications**: Only `esoko@gmail.com` will receive:
   - New order notifications
   - Contact form messages
   - All admin-related email notifications

✅ **Admin Access**: Both `esoko@gmail.com` and `badagaclass@gmail.com` remain as admins (can login to admin panel)

## Testing Email Configuration

After setting up, you can test the email configuration by:
1. Creating a test order
2. Submitting the contact form
3. Checking both email inboxes for notifications

## Troubleshooting

### "Username and Password not accepted" Error
- Make sure you're using the **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that there are no spaces in the app password
- Ensure the email is `esoko@gmail.com` (not `esoko@gmail.com`)

### "Less secure app access" Error
- This shouldn't appear if using App Passwords
- If it does, make sure you're using the App Password, not regular password

### Emails Not Sending
- Check your backend logs for error messages
- Verify the app password is correct
- Ensure the backend server has internet access
- Check that port 587 is not blocked by firewall

## Security Notes

⚠️ **Never commit your app password to Git!**
- Use environment variables for production
- Keep your `application.properties` file out of version control if it contains passwords
- Consider using a secrets management service for production deployments

## Need Help?

If you encounter issues:
1. Check the backend console logs for detailed error messages
2. Verify your Gmail account settings
3. Make sure 2-Step Verification is properly enabled
4. Try generating a new App Password if the first one doesn't work
