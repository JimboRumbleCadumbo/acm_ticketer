import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  GuildTextBasedChannel,
  Interaction,
  InteractionType,
} from 'discord.js';

export async function handleChatInputCommand(
  client: Client,
  interaction: ChatInputCommandInteraction<CacheType>
) {
  console.log("HandleChatInputCommand");
  switch (interaction.commandName) {
    case "setup": {
      const channel = interaction.options.getChannel(
        "channel"
      ) as GuildTextBasedChannel;
      await channel.send({
        content: "Click button to make a media team photoshoot request ⬇️",
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId("New Ticket")
              .setEmoji("🎟️")
              .setLabel("Create Ticket")
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
      await interaction.reply({
        content: `Setting up bot in ${channel}`,
        ephemeral: true,
      });
    }
  }
}
