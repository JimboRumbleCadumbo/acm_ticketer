import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CacheType,
    ChannelType,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    Client,
    GuildTextBasedChannel,
    Interaction,
    InteractionType,
} from 'discord.js';
import { AppDataSource } from "../typeorm";
import { Ticket } from '../typeorm/entities/Tickets';
import { TicketConfig } from "../typeorm/entities/TicketConfig";

const ticketConfigRepository = AppDataSource.getRepository(TicketConfig);
const ticketRepository = AppDataSource.getRepository(Ticket);

export async function handleButtonInteraction(
    client: Client,
    interaction: ButtonInteraction<CacheType>
) {
    console.log('Button Interaction');
    const { guild, guildId, channelId } = interaction;
    switch (interaction.customId) {
        case 'createTicket': {
            try {
                console.log('Creating Ticket Channel');
                const ticketConfig = await ticketConfigRepository.findOneBy({
                    guildId: guildId || '',
                });
                if (!ticketConfig) {
                    console.log('No ticket config exists');
                    return;
                }
                if (!guild) {
                    console.log('Guild is Null');
                    return;
                }

                // // Check if user has an existing ticket. (optional)
                // const ticket = await ticketRepository.findOneBy({
                //     createdBy: interaction.user.id,
                //     status: 'opened',
                // });
                // if (ticket) {
                //     await interaction.reply({
                //         content: 'You already have an existing ticket!',
                //         ephemeral: true,
                //     });
                //     return;
                // }

                /**  Stuffs that need to be added / changed:
                *       1. Ticket name can be entered as desired.
                *       2. Unlimited Ticket if possible
                *       3. Setup different ticket button for different occations, like media ticket / report ticket
                **/
                if (ticketConfig.messageId === interaction.message.id) {
                    console.log('user clicked on the right button w/ msg');

                    const newTicket = ticketRepository.create({
                        createdBy: interaction.user.id,
                    });

                    const savedTicket = await ticketRepository.save(newTicket);

                    const newTicketChannel = await guild.channels.create({
                        name: `ticket-${savedTicket.id.toString().padStart(6, '0')}`,
                        type: ChannelType.GuildText,
                        parent: '1262245035215425587',
                        permissionOverwrites: [
                            {
                                allow: ['ViewChannel', 'SendMessages'],
                                id: interaction.user.id,
                            },
                            {
                                allow: ['ViewChannel', 'SendMessages'],
                                id: client.user!.id,
                            },
                            {
                                deny: ['ViewChannel', 'SendMessages'],
                                id: guildId!,
                            },
                        ],
                    });
                    const newTicketMessage = await newTicketChannel.send({
                        content: 'Ticket Menu',
                        components: [
                            new ActionRowBuilder<ButtonBuilder>().setComponents(
                                new ButtonBuilder()
                                    .setCustomId('closeTicket')
                                    .setStyle(ButtonStyle.Danger)
                                    .setLabel('Close Ticket')
                            ),
                        ],
                    });
                    await ticketRepository.update(
                        { id: savedTicket.id },
                        {
                            messageId: newTicketMessage.id,
                            channelId: newTicketChannel.id,
                            status: 'opened',
                        }
                    );
                    console.log('Updated Ticket Values');
                }
            } catch (err) {
                console.log(err);
            }
            break;
        }

        /**  Stuffs that need to be added / changed:
        *       1. Ticket closing reaction after modifacation to threads.
        *       2. Decide if we want to automatically or manualy delete the channel / threads.
        *           (Giving media team / admin roles to move / delete / or some other stuffs.)
        *           (A good idea would be, put all previous events in a archive channel folder.)
        **/
        case 'closeTicket': {
            console.log('Closing Ticket');
            const user = interaction.user;
            const channel = interaction.channel as GuildTextBasedChannel;
            const ticket = await ticketRepository.findOneBy({ channelId });
            if (!ticket) return console.log('Ticket Not Found');
            if (user.id === ticket.createdBy) {
                console.log('User who created ticket is now trying to close it...');
                await ticketRepository.update({ id: ticket.id }, { status: 'closed' });
                await channel.edit({
                    permissionOverwrites: [
                        {
                            deny: ['ViewChannel', 'SendMessages'],
                            id: interaction.user.id,
                        },
                        {
                            allow: ['ViewChannel', 'SendMessages'],
                            id: client.user!.id,
                        },
                        {
                            deny: ['ViewChannel', 'SendMessages'],
                            id: guildId!,
                        },
                    ],
                });
                await interaction.update({
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().setComponents(
                            // // Button that creates transcript (optional)
                            // new ButtonBuilder()
                            //     .setCustomId('createTranscript')
                            //     .setStyle(ButtonStyle.Secondary)
                            //     .setLabel('Create Transcript'),
                            new ButtonBuilder()
                                .setCustomId('closeTicketChannel')
                                .setStyle(ButtonStyle.Secondary)
                                .setLabel('Close Channel')
                        ),
                    ],
                });
                await interaction.followUp({ content: 'Ticket Closed' });
            }
            break;
        }

    }
}