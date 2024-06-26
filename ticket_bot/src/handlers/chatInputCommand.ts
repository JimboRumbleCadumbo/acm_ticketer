import {
  CacheType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  Interaction,
  InteractionType,
} from "discord.js";

export async function handleChatInputCommand(
  client: Client,
  interaction: ChatInputCommandInteraction<CacheType>
) {
  console.log("HandleChatInputCommand");
  switch (interaction.commandName) {
    case "setup": {
        
    }
  }
}
