import {
  ActivityType,
  Events,
  // OAuth2Scopes,
  // PermissionFlagsBits,
} from 'discord.js';
import { loadScheduledMessages } from '../utils/scheduledMessages.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    // const inviteLink = await client
    //   .generateInvite({
    //     permissions: [
    //       PermissionFlagsBits.AttachFiles,
    //       PermissionFlagsBits.EmbedLinks,
    //       PermissionFlagsBits.ReadMessageHistory,
    //       PermissionFlagsBits.SendMessages,
    //     ],
    //     scopes: [OAuth2Scopes.Bot],
    //   });
    // console.log(`Invite link: ${inviteLink}`);

    client.cronJobs = await loadScheduledMessages(client);

    console.log(`Bot ready!`);
    client.user.setActivity('Stations', { type: ActivityType.Watching });
  },
};
