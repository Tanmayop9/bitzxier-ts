# Configuration Guide (config.json)

This guide explains each configuration field in `config.json` and what it's used for.

## 📋 Table of Contents
- [Required Configuration](#required-configuration)
- [Webhook Configuration](#webhook-configuration)
- [Bot Behavior](#bot-behavior)
- [User Roles & Permissions](#user-roles--permissions)
- [Bot Settings](#bot-settings)

---

## 🔴 Required Configuration

### `TOKEN`
**Type:** `string` (Required)  
**Description:** Your Discord bot token from the Discord Developer Portal.

**Usage:** This is the authentication token that allows your bot to connect to Discord servers.

**How to get:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to the "Bot" section
4. Copy the token

**Example:**
```json
"TOKEN": "YOUR_DISCORD_BOT_TOKEN_HERE"
```

⚠️ **Security Warning:** Never share your bot token publicly. Keep it private!

---

## 🪝 Webhook Configuration

### `WEBHOOK_URL`
**Type:** `string` (Optional but Recommended)  
**Description:** Discord webhook URL for general bot status notifications and cluster management logs.

**What it does:**
- Sends cluster status updates
- Logs shard information
- Reports bot startup/shutdown events

**How to create a webhook:**
1. Go to your Discord server
2. Edit a channel → Integrations → Webhooks
3. Create a webhook and copy the URL

**Example:**
```json
"WEBHOOK_URL": "https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz"
```

### `ERROR_WEBHOOK_URL`
**Type:** `string` (Optional but Recommended)  
**Description:** Webhook specifically for error notifications.

**What it does:**
- Sends detailed error messages when the bot encounters problems
- Helps with debugging and monitoring bot health
- Reports critical failures

**Example:**
```json
"ERROR_WEBHOOK_URL": "https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz"
```

### `RATELIMIT_WEBHOOK_URL`
**Type:** `string` (Optional but Recommended)  
**Description:** Webhook for Discord API rate limit notifications.

**What it does:**
- Alerts you when the bot hits Discord's API rate limits
- Helps identify which routes are being rate limited
- Useful for optimizing bot performance

**Example:**
```json
"RATELIMIT_WEBHOOK_URL": "https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz"
```

---

## ⚙️ Bot Behavior

### `cooldown`
**Type:** `boolean` (Required)  
**Default:** `true`

**What it does:**
- Enables or disables command cooldown system
- When `true`: Users must wait before using the same command again
- When `false`: Commands can be used without any cooldown period

**Use cases:**
- Set to `true` in production to prevent spam
- Set to `false` during development/testing for easier debugging

**Example:**
```json
"cooldown": true
```

---

## 👥 User Roles & Permissions

These arrays store Discord user IDs for different permission levels. All fields are arrays of user IDs.

### `owner`
**Type:** `string[]` (Required)  
**Description:** Bot owner(s) with full access to all commands.

**What they can do:**
- Access all bot commands including dangerous ones
- Execute eval and system commands
- Manage the entire bot
- Override all permission checks

**Example:**
```json
"owner": ["123456789012345678", "987654321098765432"]
```

### `friday`
**Type:** `string[]` (Optional)  
**Description:** Friday bot administrators (secondary admin level).

**What they can do:**
- Access administrative commands
- Manage bot settings across servers
- Limited system access compared to owners

**Example:**
```json
"friday": ["111111111111111111", "222222222222222222"]
```

### `mainmode`
**Type:** `string[]` (Optional)  
**Description:** Users who can access maintenance mode commands.

**What they can do:**
- Enable/disable maintenance mode
- Control when the bot is accessible to regular users
- Perform maintenance tasks

**Example:**
```json
"mainmode": ["333333333333333333"]
```

### `premium`
**Type:** `string[]` (Optional)  
**Description:** Users with premium bot features access.

**What they can do:**
- Access premium-only commands
- Use advanced features not available to regular users
- May have higher command limits

**Example:**
```json
"premium": ["444444444444444444", "555555555555555555"]
```

### `admin`
**Type:** `string[]` (Optional)  
**Description:** Bot administrators with elevated permissions.

**What they can do:**
- Manage server settings
- Access moderation tools
- Configure bot features

**Example:**
```json
"admin": ["666666666666666666"]
```

### `np`
**Type:** `string[]` (Optional)  
**Description:** Users who can use commands without the prefix (no prefix users).

**What they can do:**
- Execute bot commands without typing the prefix
- Faster command access
- Useful for power users

**Example:**
```json
"np": ["777777777777777777"]
```

---

## 🤖 Bot Settings

### `invite`
**Type:** `string` (Optional)  
**Description:** The bot's invite link.

**What it's used for:**
- Displayed in help commands
- Shared when users want to add the bot to other servers
- Marketing and distribution

**How to create:**
1. Go to Discord Developer Portal
2. OAuth2 → URL Generator
3. Select `bot` and `applications.commands` scopes
4. Select required bot permissions
5. Copy the generated URL

**Example:**
```json
"invite": "https://discord.com/api/oauth2/authorize?client_id=123456789&permissions=8&scope=bot%20applications.commands"
```

### `baseText`
**Type:** `string` (Optional)  
**Description:** Base help text format used in command help messages.

**What it's used for:**
- Shows users how to read command syntax
- `<>` indicates required parameters
- `()` indicates optional parameters

**Example:**
```json
"baseText": "```\n<> - Required | () - Optional```"
```

---

## 📝 Complete Example Configuration

```json
{
    "TOKEN": "YOUR_BOT_TOKEN_HERE",
    "WEBHOOK_URL": "https://discord.com/api/webhooks/...",
    "ERROR_WEBHOOK_URL": "https://discord.com/api/webhooks/...",
    "RATELIMIT_WEBHOOK_URL": "https://discord.com/api/webhooks/...",
    "cooldown": true,
    "owner": ["123456789012345678"],
    "friday": [],
    "mainmode": [],
    "premium": [],
    "admin": [],
    "np": [],
    "invite": "https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands",
    "baseText": "```\n<> - Required | () - Optional```"
}
```

---

## 🔍 How to Get User IDs

1. Enable Developer Mode in Discord:
   - User Settings → Advanced → Developer Mode (ON)

2. Right-click on a user and select "Copy ID"

3. Add the ID to the appropriate array in config.json

---

## ⚡ Quick Setup Steps

1. **Copy the example config:**
   ```bash
   cp config.json.example config.json
   ```

2. **Add your bot token** (Required):
   - Get it from Discord Developer Portal
   - Add it to the `TOKEN` field

3. **Add your user ID to owner array** (Required):
   - Enable Developer Mode in Discord
   - Right-click your profile → Copy ID
   - Add to the `owner` array

4. **Configure webhooks** (Optional but Recommended):
   - Create webhooks in your server
   - Add URLs to respective fields
   - Helps with monitoring and debugging

5. **Customize other settings**:
   - Add user IDs to permission arrays as needed
   - Set up invite link
   - Configure cooldown based on your needs

---

## 🚀 Testing Your Configuration

After setting up your config.json, run:

```bash
npm run setup
```

The bot will validate your configuration and show any errors or warnings before starting.

---

## 🛡️ Security Best Practices

1. **Never commit config.json to Git**
   - It's already in .gitignore
   - Use config.json.example for templates

2. **Keep your TOKEN private**
   - Don't share it in screenshots
   - Don't post it in public channels
   - Regenerate if exposed

3. **Use environment variables in production**
   - Consider using .env file (see .env.example)
   - TOKEN can be loaded from environment

4. **Restrict webhook URLs**
   - Only share with trusted team members
   - They can post messages to your server

---

## ❓ Common Issues

**Bot won't start?**
- Check if TOKEN is correct and complete
- Ensure TOKEN field is not empty
- Verify bot token hasn't been regenerated in Developer Portal

**Permission issues?**
- Make sure your user ID is in the `owner` array
- User IDs must be strings in quotes
- Use Discord's Developer Mode to copy correct IDs

**Webhooks not working?**
- Verify webhook URLs are complete and correct
- Check if webhook channel still exists
- Ensure webhook hasn't been deleted

---

## 📚 Additional Resources

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord.js Guide](https://discordjs.guide/)
- [Bot Permissions Calculator](https://discordapi.com/permissions.html)

---

## 🆘 Need Help?

If you need assistance with configuration:
1. Check this documentation first
2. Review the .env.example file for environment variables
3. Join the support server (link in bot's help command)
4. Create an issue on GitHub

---

*Last Updated: December 2024*
