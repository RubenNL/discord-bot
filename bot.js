const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const storage = '/storage'
if(!fs.existsSync(storage)) fs.mkdirSync(storage);
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	const modules=require('./modules.js')(client,storage)
	client.on('message', message => {
		if(message.mentions.everyone) return
		if(!message.mentions.has(client.user)) return
		if(message.author==client.user) return
		parts=message.content.split(' ')
		parts=parts.filter(item=>item)
		action=parts.shift();
		if(action.includes('@')) action=parts.shift();
		console.log(action,parts)
		module=modules(action)
		if(module) module.ONMESSAGE({message,parts})
		else {
			message.channel.send(`Don't know what to do with this! use \`help\` for available modules.`)
			return
		}
	});
});
const key=process.argv[2]
if(!key) {
	console.warn('Key required!')
	console.warn(`Usage: ${process.argv[0]} ${process.argv[1]} key`)
	process.exit(1);
} else client.login(key);
