# 🤖 Friday - Modern Discord Bot

[![Discord.js](https://img.shields.io/badge/discord.js-v14.25.1-blue.svg)](https://discord.js.org)
[![Node.js](https://img.shields.io/badge/node.js-v20+-green.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-ISC-orange.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-v2--alpha--1-purple.svg)](package.json)

> **Author:** Tanmay  
> **Recoded by:** Nerox Studios  
> **Version:** v2-alpha-1

## 📋 Overview

Friday is a powerful, modern Discord bot built with discord.js v14, featuring advanced server management, security systems, and automation tools. Completely recoded with modern architecture patterns and database migration from MongoDB to JoshDB.

## ✨ Features

- 🛡️ **Advanced Security System** - AntiNuke, raid protection, and whitelist management
- ⚖️ **Comprehensive Moderation** - Ban, kick, mute, warn, and more
- 🤖 **Automated Moderation** - Anti-spam, anti-link, anti-swear with customizable actions
- 📝 **Advanced Logging** - Track all server activities
- 🎤 **Voice Management** - Voice channel controls and join-to-create system
- 🎫 **Ticket System** - Professional support ticket management
- 👋 **Welcome System** - Customizable welcome messages and autoroles
- 🎨 **Custom Roles** - Role management and customization
- 💎 **Premium System** - Built-in premium user management

## 🚀 What's New in v2-alpha-1

### Database Migration
- ✅ Migrated from MongoDB to **@joshdb/core v1.2.7** and **@joshdb/json v1.0.5**
- ✅ All data stored locally in `./data-sets` directory
- ✅ Removed all MongoDB dependencies
- ✅ Better performance and reliability

### Modern Architecture
- ✅ New **BaseCommand** class for standardized command structure
- ✅ New **BaseEvent** class for consistent event handling
- ✅ **ModernEmbedBuilder** for beautiful, consistent embeds
- ✅ Improved error handling and logging

### UI/UX Improvements
- ✅ Minimalistic emoji design
- ✅ Discord Components V2 implementation
- ✅ Interactive buttons and select menus
- ✅ Performance indicators and progress bars
- ✅ Cleaner, more professional embeds

### Code Quality
- ✅ Author credits on every file
- ✅ Comprehensive JSDoc documentation
- ✅ Modern JavaScript patterns
- ✅ Better code organization

### TypeScript Migration
- ✅ **Full TypeScript conversion** - All 207 files converted to TypeScript
- ✅ **Type safety** - Better IDE support and error checking
- ✅ **Modern tooling** - TypeScript 5.3.3 with ES2022 target
- ✅ **Automated setup** - New setup.js script for easy deployment

### Updated Dependencies
- ✅ **discord.js v14.25.1** (latest v14)
- ✅ **@discordjs/voice v0.17.0**
- ✅ **discord-hybrid-sharding v2.2.0**
- ✅ **TypeScript 5.3.3** - Type-safe development

## 📦 Installation

### Prerequisites
- Node.js v14.13.0 or higher (v20+ recommended)
- npm or yarn package manager
- Discord Bot Token

### Quick Setup (Recommended)

**One-command setup that does everything:**

```bash
npm run setup
```

This automated setup script will:
- ✅ Check your environment
- ✅ Install all dependencies
- ✅ Build TypeScript to JavaScript
- ✅ Start the bot automatically

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

### Manual Setup

1. **Clone the repository**
```bash
git clone https://github.com/Tanmayop9/soward-test.git
cd soward-test
```

2. **Configure the bot**

Create `.env` file:
```env
TOKEN=your_discord_bot_token
ERROR_WEBHOOK_URL=your_error_webhook
RATELIMIT_WEBHOOK_URL=your_ratelimit_webhook
LOG_LEVEL=info
```

Edit `config.json`:
```json
{
    "TOKEN": "your-bot-token",
    "WEBHOOK_URL": "your-webhook-url",
    "owner": ["your-user-id"],
    "MONGO_DB": "mongodb-connection-string",
    "ERROR_WEBHOOK_URL": "error-webhook",
    "RATELIMIT_WEBHOOK_URL": "ratelimit-webhook"
}
```

3. **Install and build**
```bash
npm install
npm run build
```

4. **Start the bot**
```bash
npm start
```

## 🏗️ Architecture

### Project Structure
```
friday/
├── commands/           # Command modules
│   ├── antinuke/      # Security commands
│   ├── automod/       # Automod commands
│   ├── information/   # Info commands
│   ├── moderation/    # Mod commands
│   ├── premium/       # Premium commands
│   └── ...
├── events/            # Event handlers
├── models/            # Database models (JoshDB)
├── structures/        # Core classes
│   ├── BaseCommand.js # Command base class
│   ├── BaseEvent.js   # Event base class
│   ├── Bitzxier.js    # Main client (Friday)
│   ├── database.js    # JoshDB wrapper
│   ├── EmbedBuilder.js# Modern embed builder
│   └── util.js        # Utility functions
├── data-sets/         # JoshDB storage
├── Database/          # SQLite databases
├── config.json        # Configuration
├── index.ts           # Entry point (TypeScript)
├── shards.ts          # Cluster manager (TypeScript)
└── dist/              # Compiled JavaScript output
```

### Technology Stack
- **Discord.js v14.25.1** - Discord API wrapper (latest v14)
- **@joshdb/core v1.2.7** - Modern key-value database
- **@joshdb/json v1.0.5** - JSON provider for JoshDB
- **better-sqlite3** - SQLite for specific data
- **discord-hybrid-sharding v2.2.0** - Advanced sharding

## 🎮 Commands

### Information Commands
- `help` - Display all commands with select menu
- `ping` - Check bot latency with performance bars
- `stats` - Detailed bot statistics with interactive buttons
- `userinfo` - User information
- `serverinfo` - Server information

### Premium Commands (Owner Only)
- `addpremium <user> [days] [count]` - Grant premium access
- `removepremium <user>` - Revoke premium access
- `updatepremium <user> [days] [count]` - Update premium settings
- `listpremium` - List all premium users

### Moderation Commands
- `ban <user> [reason]` - Ban a user
- `kick <user> [reason]` - Kick a user
- `mute <user> [duration] [reason]` - Mute a user
- `warn <user> [reason]` - Warn a user
- `purge <amount> [filter]` - Bulk delete messages
- And many more...

### Security Commands (AntiNuke)
- `antinuke enable` - Enable antinuke system
- `whitelist <user>` - Whitelist a user
- `unwhitelist <user>` - Remove from whitelist
- `whitelisted` - View whitelisted users

## 🔧 Configuration

### config.json
```json
{
    "TOKEN": "",              // Bot token
    "WEBHOOK_URL": "",        // Logging webhook
    "cooldown": true,         // Enable cooldowns
    "owner": [],              // Bot owner IDs
    "friday": [],             // Friday team IDs
    "premium": [],            // Premium managers
    "admin": [],              // Admin IDs
    "invite": "",             // Invite link
    "baseText": "```\n<> - Required | () - Optional```"
}
```

### Environment Variables (.env)
```env
TOKEN=your_bot_token_here
```

## 🎨 Command Pattern Example

```javascript
/**
 * @author Tanmay
 * @recoded Nerox Studios
 * @version v2-alpha-1
 * @description Command description here
 */

const BaseCommand = require('../../structures/BaseCommand');

class MyCommand extends BaseCommand {
    constructor() {
        super({
            name: 'mycommand',
            aliases: ['cmd', 'mc'],
            category: 'info',
            description: 'My command description',
            usage: '<required> [optional]',
            examples: ['mycommand test'],
            cooldown: 5,
            premium: false,
            ownerOnly: false,
            userPermissions: ['ManageMessages'],
            botPermissions: ['SendMessages']
        });
    }

    async execute(client, message, args) {
        // Command logic here
        const embed = this.createSuccessEmbed(
            client,
            'Success',
            'Command executed successfully!'
        );
        
        await message.channel.send({ embeds: [embed] });
    }
}

module.exports = new MyCommand();
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Credits

- **Original Author:** Tanmay
- **Recoded by:** Nerox Studios
- **Version:** v2-alpha-1
- **Framework:** Discord.js v14.25.1

## 📞 Support

For support, join our [Discord Server](https://discord.gg/S7Ju9RUpbT)

## 🔗 Links

- [Invite Bot](https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=8&scope=bot)
- [Support Server](https://discord.gg/S7Ju9RUpbT)
- [GitHub Repository](https://github.com/Tanmayop9/soward-test)

## 📝 Changelog

### v2-alpha-1 (Current)
- Complete database migration from MongoDB to JoshDB
- Modernized all command structures with BaseCommand pattern
- Updated to Discord.js v14.25.1
- Implemented Discord Components V2
- Improved UI/UX with minimalistic design
- Added comprehensive error handling
- Enhanced logging system
- Author credits on all files

---

<div align="center">
  <sub>Built with ❤️ by Tanmay | Recoded by Nerox Studios</sub>
</div>
