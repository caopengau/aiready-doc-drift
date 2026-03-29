/**
 * Post Initial Content to Discord
 *
 * Posts rules and welcome messages to the Discord server.
 *
 * Usage:
 *   cd discord && npx tsx src/post-initial-content.ts
 */

import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  ChannelType,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import {
  createRulesEmbed,
  createWelcomeEmbed,
  createWelcomeButtons,
} from './embeds';

const token = process.env.DISCORD_BOT_TOKEN;
const serverId = process.env.DISCORD_SERVER_ID;

if (!token || !serverId) {
  console.error('❌ DISCORD_BOT_TOKEN and DISCORD_SERVER_ID are required');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function postContent() {
  try {
    console.log('🚀 Connecting to Discord...');
    await client.login(token);

    const guild = await client.guilds.fetch(serverId);
    console.log(`✅ Connected to server: ${guild.name}`);

    // Fetch all channels
    await guild.channels.fetch();
    console.log(`   Found ${guild.channels.cache.size} channels`);

    // Post rules
    console.log('\n📋 Posting rules...');
    const rulesChannel = guild.channels.cache.find(
      (c) => c?.name === 'rules' && c.type === ChannelType.GuildText
    );

    if (rulesChannel && 'send' in rulesChannel) {
      const rulesEmbed = createRulesEmbed();

      await rulesChannel.send({ embeds: [rulesEmbed] });
      console.log('   ✅ Rules posted');
    } else {
      console.log('   ⚠️  Rules channel not found');
    }

    // Post welcome message
    console.log('\n👋 Posting welcome message...');
    const welcomeChannel = guild.channels.cache.find(
      (c) => c?.name === 'welcome' && c.type === ChannelType.GuildText
    );

    if (welcomeChannel && 'send' in welcomeChannel) {
      const welcomeEmbed = createWelcomeEmbed();
      const row = createWelcomeButtons();

      await welcomeChannel.send({
        embeds: [welcomeEmbed],
        components: [row],
      });
      console.log('   ✅ Welcome message posted');
    } else {
      console.log('   ⚠️  Welcome channel not found');
    }

    // Post first announcement
    console.log('\n📢 Posting launch announcement...');
    const announcementsChannel = guild.channels.cache.find(
      (c) => c?.name === 'announcements' && c.type === ChannelType.GuildText
    );

    if (announcementsChannel && 'send' in announcementsChannel) {
      const announcementEmbed = new EmbedBuilder()
        .setTitle('🚀 AIReady Community Launch!')
        .setDescription(
          "We're excited to launch the AIReady community! Join us in building the future of AI-ready codebases."
        )
        .setColor(Colors.Gold)
        .addFields(
          {
            name: 'What is AIReady?',
            value:
              'AIReady helps developers make their codebases AI-ready. We analyze your code and show you exactly where AI tools struggle - and how to fix it.',
          },
          {
            name: 'What can you do here?',
            value:
              '• Get help with AIReady tools\n• Share your wins and improvements\n• Contribute to the project\n• Learn about AI code quality',
          },
          {
            name: 'Quick Start',
            value:
              '```bash\nnpx @aiready/cli scan .\n```\nRun this command to analyze your codebase!',
          }
        )
        .setFooter({ text: 'AIReady - Making codebases AI-ready' })
        .setTimestamp();

      await announcementsChannel.send({
        content: '@everyone',
        embeds: [announcementEmbed],
      });
      console.log('   ✅ Launch announcement posted');
    } else {
      console.log('   ⚠️  Announcements channel not found');
    }

    console.log('\n✅ All initial content posted!');
    console.log('\n📝 Next steps:');
    console.log('   1. Assign Admin role to yourself');
    console.log('   2. Invite community members');
    console.log('   3. Start engaging in channels');
  } catch (error) {
    console.error('❌ Failed to post content:', error);
    process.exit(1);
  } finally {
    client.destroy();
  }
}

postContent();
