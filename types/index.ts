/**
 * @author Tanmay
 * @recoded Nerox Studios  
 * @version v2-alpha-1
 * @description TypeScript type definitions for Friday Discord Bot
 */

import { Message } from 'discord.js';

export interface BotConfig {
    TOKEN: string;
    MONGO_DB?: string;
    RATELIMIT_WEBHOOK_URL?: string;
    ERROR_WEBHOOK_URL?: string;
    WEBHOOK_URL?: string;
    owner: string[];
    [key: string]: any;
}

export interface CommandOptions {
    name: string;
    aliases?: string[];
    category?: string;
    description?: string;
    usage?: string;
    examples?: string[];
    cooldown?: number;
    premium?: boolean;
    ownerOnly?: boolean;
    guildOnly?: boolean;
    userPermissions?: string[];
    botPermissions?: string[];
    subcommand?: string[];
    run: (client: any, message: Message, args: string[]) => Promise<any>;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'ready' | 'event' | 'cmd' | 'debug' | 'shard' | 'log';
