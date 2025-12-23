# Friday Discord Bot

A modern, feature-rich Discord bot built with TypeScript and Discord.js v14.

## 📖 Documentation

For detailed configuration instructions, see **[CONFIG.md](./CONFIG.md)** - Complete guide explaining what each config field does.

## 🚀 Quick Start

### Prerequisites
- Node.js 16.9.0 or higher
- npm or yarn
- A Discord bot token

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd bitzxier-ts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   
   Edit `config.json` with your settings:
   ```json
   {
       "TOKEN": "your_bot_token_here",
       "owner": ["your_discord_user_id"]
   }
   ```
   
   See [CONFIG.md](./CONFIG.md) for detailed configuration guide.

4. **Build and run**
   ```bash
   npm run setup
   ```
   
   Or manually:
   ```bash
   npm run build
   npm start
   ```

## 📋 Available Scripts

- `npm run setup` - Install dependencies, build, and start the bot
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled bot
- `npm run dev` - Run in development mode with ts-node
- `npm run watch` - Watch for changes and rebuild
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types

## ⚙️ Configuration Files

- **config.json** - Main bot configuration (see [CONFIG.md](./CONFIG.md))
- **.env.example** - Environment variables template
- **tsconfig.json** - TypeScript configuration
- **.eslintrc.json** - ESLint rules
- **.prettierrc.json** - Prettier formatting rules

## 🎯 Features

- **Moderation Commands** - Ban, kick, mute, purge, and more
- **Anti-Nuke Protection** - Protect your server from raids
- **Auto Moderation** - Anti-spam, anti-link, anti-invite
- **Logging System** - Comprehensive server activity logs
- **Welcome System** - Customizable welcome messages
- **Ticket System** - Support ticket management
- **Voice Management** - Voice channel controls
- **Premium Features** - Advanced features for premium users
- **Custom Roles** - Role management system
- **Fun Commands** - Games, reactions, and entertainment
- **Information Commands** - Server info, user info, stats

## 🛠️ Development

### Project Structure
```
bitzxier-ts/
├── src/
│   ├── commands/       # Bot commands
│   ├── events/         # Discord event handlers
│   ├── structures/     # Core classes
│   ├── models/         # Database models
│   ├── types/          # TypeScript types
│   └── logs/           # Logging utilities
├── config.json         # Bot configuration
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

### Adding Commands

Commands are located in `src/commands/` organized by category. See existing commands for examples.

### Code Style

This project uses:
- **ESLint** for code quality
- **Prettier** for code formatting
- **TypeScript** for type safety

Run `npm run lint:fix` and `npm run format` before committing.

## 🔒 Security

- Never commit your `config.json` with real tokens
- Keep your `.env` file private
- Review [CONFIG.md](./CONFIG.md) for security best practices
- Report security issues privately to the maintainers

## 📝 License

ISC License - See LICENSE file for details

## 👥 Authors

- **Tanmay** - Original Author
- **Nerox Studios** - Recoded Version

## 🆘 Support

For configuration help, see [CONFIG.md](./CONFIG.md)

For other issues:
- Check existing GitHub issues
- Join the support Discord server
- Create a new GitHub issue

## 🌟 Acknowledgments

Built with:
- [Discord.js](https://discord.js.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [discord-hybrid-sharding](https://www.npmjs.com/package/discord-hybrid-sharding)

---

**Note:** This bot requires proper configuration before use. Please read [CONFIG.md](./CONFIG.md) carefully.
