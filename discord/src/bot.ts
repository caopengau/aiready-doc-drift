import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Events,
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
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Welcome new members
client.on(Events.GuildMemberAdd, async (member) => {
  console.log(`👋 New member joined: ${member.user.tag}`);

  try {
    // Assign Member role
    const memberRole = member.guild.roles.cache.find(
      (r) => r.name === 'Member'
    );
    if (memberRole) {
      await member.roles.add(memberRole);
      console.log(`   ✅ Assigned Member role to ${member.user.tag}`);
    }

    // Send welcome DM
    const welcomeEmbed = new EmbedBuilder()
      .setTitle('👋 Welcome to AIReady!')
      .setDescription(
        'Thanks for joining our community! We help developers make their codebases AI-ready.'
      )
      .setColor(Colors.Blue)
      .addFields(
        {
          name: '🚀 Getting Started',
          value:
            '1. Introduce yourself in #welcome\n2. Check out #general for discussions\n3. Run `npx @aiready/cli scan .` on your codebase',
        },
        {
          name: '📚 Resources',
          value:
            '• [Website](https://getaiready.dev)\n• [GitHub](https://github.com/caopengau/aiready)\n• [Documentation](https://getaiready.dev/docs)',
        },
        {
          name: '💬 Need Help?',
          value: 'Post in #help or one of the support channels!',
        }
      )
      .setFooter({ text: 'AIReady - Making codebases AI-ready' })
      .setTimestamp();

    await member.send({ embeds: [welcomeEmbed] });
    console.log(`   ✅ Sent welcome DM to ${member.user.tag}`);
  } catch (error) {
    console.error(`   ❌ Failed to process new member:`, error);
  }
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('🏓 Pong!');
  }

  if (commandName === 'setup-rules') {
    await setupRules(interaction);
  }

  if (commandName === 'setup-welcome') {
    await setupWelcome(interaction);
  }

  if (commandName === 'announce') {
    await postAnnouncement(interaction);
  }
});

async function setupRules(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply('❌ This command must be used in a server.');
      return;
    }

    const rulesChannel = guild.channels.cache.find(
      (c: any) => c.name === 'rules' && c.type === ChannelType.GuildText
    );

    if (!rulesChannel || !('send' in rulesChannel)) {
      await interaction.editReply('❌ Rules channel not found.');
      return;
    }

    const rulesEmbed = createRulesEmbed();

    await rulesChannel.send({ embeds: [rulesEmbed] });
    await interaction.editReply('✅ Rules posted in #rules channel.');
  } catch (error) {
    console.error('Failed to setup rules:', error);
    await interaction.editReply('❌ Failed to setup rules.');
  }
}

async function setupWelcome(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply('❌ This command must be used in a server.');
      return;
    }

    const welcomeChannel = guild.channels.cache.find(
      (c: any) => c.name === 'welcome' && c.type === ChannelType.GuildText
    );

    if (!welcomeChannel || !('send' in welcomeChannel)) {
      await interaction.editReply('❌ Welcome channel not found.');
      return;
    }

    const welcomeEmbed = createWelcomeEmbed();
    const row = createWelcomeButtons();

    await welcomeChannel.send({
      embeds: [welcomeEmbed],
      components: [row],
    });
    await interaction.editReply(
      '✅ Welcome message posted in #welcome channel.'
    );
  } catch (error) {
    console.error('Failed to setup welcome:', error);
    await interaction.editReply('❌ Failed to setup welcome message.');
  }
}

async function postAnnouncement(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply('❌ This command must be used in a server.');
      return;
    }

    const title = interaction.options.getString('title');
    const message = interaction.options.getString('message');

    if (!title || !message) {
      await interaction.editReply('❌ Title and message are required.');
      return;
    }

    const announcementsChannel = guild.channels.cache.find(
      (c: any) => c.name === 'announcements' && c.type === ChannelType.GuildText
    );

    if (!announcementsChannel || !('send' in announcementsChannel)) {
      await interaction.editReply('❌ Announcements channel not found.');
      return;
    }

    const announcementEmbed = new EmbedBuilder()
      .setTitle(`📢 ${title}`)
      .setDescription(message)
      .setColor(Colors.Gold)
      .setFooter({ text: 'AIReady Announcements' })
      .setTimestamp();

    await announcementsChannel.send({
      content: '@everyone',
      embeds: [announcementEmbed],
    });
    await interaction.editReply('✅ Announcement posted.');
  } catch (error) {
    console.error('Failed to post announcement:', error);
    await interaction.editReply('❌ Failed to post announcement.');
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Bot ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);
