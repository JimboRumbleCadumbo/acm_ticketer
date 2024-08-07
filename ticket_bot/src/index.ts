import 'reflect-metadata';
import 'dotenv/config';
import {
  ChannelType,
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';
import { handleChatInputCommand } from "./handlers/chatInputCommand";
import { AppDataSource } from './typeorm';
import { handleButtonInteraction } from './handlers/buttonInteraction';

const CLIENT_ID = '1255631714294960190';
const GUILD_ID = '1023816546759475230';
const TOKEN = process.env.BOT_TOKEN!;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: "10" }).setToken(TOKEN);

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription(
      "Initializes the Ticket Bot & sends a message to chanel for ACM people to create tickets"
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription("The channel to send the message to")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .toJSON(),
];

client.on('ready', () => console.log(`${client.user?.tag} logged in`));

client.on('interactionCreate', (interaction) => {
  if (interaction.isChatInputCommand())
    client.emit('chatInputCommand', client, interaction);
  else if (interaction.isButton())
    client.emit('buttonInteraction', client, interaction);
});

client.on('chatInputCommand', handleChatInputCommand);
client.on('buttonInteraction', handleButtonInteraction);

async function main() {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    await AppDataSource.initialize();
    client.login(TOKEN);
  } catch (err) {
    console.log(err);
  }
}

main();
