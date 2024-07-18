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

import { AppDataSource } from '../typeorm';
import { TicketConfig } from '../typeorm/entities/TicketConfig';

const ticketConfigRepository = AppDataSource.getRepository(TicketConfig);


export async function handleChatInputCommand(
  client: Client,
  interaction: ChatInputCommandInteraction<CacheType>
) {

  console.log("HandleChatInputCommand");
  switch (interaction.commandName) {
    case "setup": {
      const guildId = interaction.guildId || '';
      const channel = interaction.options.getChannel(
        "channel"
      ) as GuildTextBasedChannel;
      const ticketConfig = await ticketConfigRepository.findOneBy({ guildId });

      const messageOptions = {
        content: "Click button to make a media team photoshoot request ⬇️",
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId("createTicket")
              .setEmoji("🎟️")
              .setLabel("Create Ticket")
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      }

      try {
        if (!ticketConfig) {
          const msg = await channel.send(messageOptions);
          const newTicketConfig = ticketConfigRepository.create({
            guildId,
            messageId: msg.id,
            channelId: channel.id,
          });
          await ticketConfigRepository.save(newTicketConfig);
          console.log('Saved new CONFIG to Database');
          await interaction.reply({
            content: 'Ticket Bot is Initialized👍',
            ephemeral: true,
          });
        } else {
          console.log('Config Already EXISTS...... Updating values');
          const msg = await channel.send(messageOptions);
          ticketConfig.channelId = channel.id;
          ticketConfig.messageId = msg.id;
          await ticketConfigRepository.save(ticketConfig);
          await interaction.reply({
            content: `New message sent in ${channel}. Updated Database record.`,
            ephemeral: true,
          });
        }
      } catch (err) {
        console.log(err);
        await interaction.reply({
          content: `Something went wrong dude...`,
          ephemeral: true,
        });
      }

    }

  }
}
