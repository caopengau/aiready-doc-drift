import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
} from 'discord.js';

export function createRulesEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('📋 Community Guidelines')
    .setDescription(
      'Please read and follow these rules to keep our community healthy and productive.'
    )
    .setColor(Colors.Blue)
    .addFields(
      {
        name: '1. Be Respectful',
        value:
          'Treat everyone with dignity. No harassment, discrimination, or personal attacks.',
      },
      {
        name: '2. Stay On Topic',
        value:
          'Use appropriate channels for different discussions. Keep conversations relevant.',
      },
      {
        name: '3. No Spam',
        value:
          "Don't post the same message multiple times. No excessive self-promotion.",
      },
      {
        name: '4. Help Others',
        value:
          'If you know the answer, help others. We learn together as a community.',
      },
      {
        name: '5. Share Knowledge',
        value:
          "Share your wins, tutorials, and insights. We celebrate each other's successes.",
      },
      {
        name: '6. English Only',
        value:
          "For now, we're an English-speaking community to ensure everyone can participate.",
      },
      {
        name: '7. No Secrets',
        value:
          "Don't share API keys, passwords, or sensitive information in public channels.",
      },
      {
        name: '8. Have Fun',
        value: "We're here to learn and build together. Enjoy the journey!",
      }
    )
    .setFooter({ text: 'Violations may result in warnings, mutes, or bans.' })
    .setTimestamp();
}

export function createWelcomeEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('👋 Welcome to AIReady!')
    .setDescription(
      'We help developers make their codebases AI-ready. Scan your code, fix issues, and track improvements.'
    )
    .setColor(Colors.Blue)
    .addFields(
      {
        name: '🚀 Getting Started',
        value:
          '1. Run `npx @aiready/cli scan .` to analyze your code\n2. Check your AI readiness score\n3. Fix issues and improve',
      },
      {
        name: '📚 Resources',
        value:
          '• [Website](https://getaiready.dev)\n• [GitHub](https://github.com/caopengau/aiready)\n• [Documentation](https://getaiready.dev/docs)',
      },
      {
        name: '💬 Need Help?',
        value:
          "Post in #help or one of the support channels. We're here to help!",
      },
      {
        name: '🤝 Contributing',
        value:
          'Want to contribute? Check out #contributions and #good-first-issues',
      }
    )
    .setFooter({ text: 'AIReady - Making codebases AI-ready' })
    .setTimestamp();
}

export function createWelcomeButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel('Website')
      .setStyle(ButtonStyle.Link)
      .setURL('https://getaiready.dev'),
    new ButtonBuilder()
      .setLabel('GitHub')
      .setStyle(ButtonStyle.Link)
      .setURL('https://github.com/caopengau/aiready'),
    new ButtonBuilder()
      .setLabel('Documentation')
      .setStyle(ButtonStyle.Link)
      .setURL('https://getaiready.dev/docs')
  );
}
