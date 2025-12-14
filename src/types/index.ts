/**
 * @author Tanmay
 * @recoded Nerox Studios  
 * @version v2-alpha-1
 * @description TypeScript type definitions for Friday Discord Bot
 */

import type { Message } from 'discord.js';

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

// Database interfaces
export interface Database {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
    connect(): Promise<void>;
}

export interface AfkData {
    Member: string;
    Guild?: string;
    Time: number;
    Reason: string;
    deleteOne?: () => Promise<void>;
}

export interface GuildConfigData {
    guildId: string;
    hubChannelId?: string;
    categoryId?: string;
    interfaceChannelId?: string;
    tempVoiceChannels?: string[];
    save?: () => Promise<GuildConfigData>;
}

export interface BoostData {
    Guild: string;
    Channel?: string;
    Message?: string;
    Role?: string;
    save?: () => Promise<BoostData>;
}

export interface MainRoleData {
    Guild: string;
    RoleID?: string;
    save?: () => Promise<MainRoleData>;
}

export interface TicketData {
    guildId: string;
    channelId?: string;
    messageId?: string;
    categoryId?: string;
    supportRoleId?: string;
    transcriptChannelId?: string;
    save?: () => Promise<TicketData>;
}

export interface AutoroleData {
    Guild: string;
    Roles?: string[];
    save?: () => Promise<AutoroleData>;
}
