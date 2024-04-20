import { ActivityType, Events, OAuth2Scopes, PermissionFlagsBits } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    if (process.env.FIRST_TIME_INVITE) {
      const inviteLink = await client.generateInvite({
        permissions: [
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.SendMessages,
        ],
        scopes: [OAuth2Scopes.Bot],
      });
      console.log(`Invite link: ${inviteLink}`);
    }

    console.log(`Bot ready!`);
    client.user.setActivity('Stations', { type: ActivityType.Watching });
  },
};
