const { Client, Intents, MessageEmbed } = require('discord.js');
const config = require('./config.json');

const prefix = '!';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.guilds.cache.forEach((guild) => {
    guild.commands.create({
      name: 'vouch',
      description: 'Make a voucher for a product',
      options: [
        {
          name: 'product',
          type: 'STRING',
          description: 'Product name',
          required: true,
          choices: config.productos.map((producto) => ({
            name: producto,
            value: producto,
          })),
        },
        {
          name: 'message',
          type: 'STRING',
          description: 'Voucher message',
          required: true,
        },
        {
          name: 'stars',
          type: 'INTEGER',
          description: 'Number of stars',
          required: true,
          choices: [
            { name: '⭐️', value: 1 },
            { name: '⭐️⭐️', value: 2 },
            { name: '⭐️⭐️⭐️', value: 3 },
            { name: '⭐️⭐️⭐️⭐️', value: 4 },
            { name: '⭐️⭐️⭐️⭐️⭐️', value: 5 },
          ],
        },
      ],
    });
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options, user, guild } = interaction;

  if (commandName === 'vouch') {
    const productName = options.getString('product');
    const vouchMessage = options.getString('message');
    const stars = options.getInteger('stars');

    const outputChannelId = config.output_channel_id;

    const outputChannel = client.channels.cache.get(outputChannelId);
    if (!outputChannel) return;

    const starEmoji = '⭐️'.repeat(stars);
    const vouchBy = `Vouch by ${user.username}`;

    // Verificar si el usuario tiene el rol requerido para el producto
    const requiredRole = config.roles[productName];
    const member = guild.members.cache.get(user.id);
    if (!requiredRole || !member.roles.cache.some((role) => role.id === requiredRole)) {
      return await interaction.reply({ content: `You need the required role to vouch for ${productName}.`, ephemeral: true });
    }

    const vouchEmbed = new MessageEmbed()
      .setTitle(`${productName} Vouch`)
      .addField('Member', `<@${user.id}>`)
      .addField('Vouch', `\`${vouchMessage}\``)
      .addField('Stars', starEmoji)
      .setFooter(` • ${new Date().toLocaleString()} •`)
      .setColor('#411c00')
      .setAuthor(guild.name, guild.iconURL());

    if (vouchEmbed.fields.length > 0) {
      outputChannel.send({ embeds: [vouchEmbed] });
      await interaction.reply({ content: `Vouched for ${productName} with ${stars} stars.`, ephemeral: true });
    } else {
      await interaction.reply({ content: 'Please provide a valid vouch message and star rating.', ephemeral: true });
    }
  }
});

client.login(config.BOT_TOKEN);
