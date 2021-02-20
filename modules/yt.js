const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 0.1 };
const urlRegex=new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?")
class Player {
	constructor(channel,textChannel) {
		this.channel=channel;
		this.textChannel=textChannel;
		this.readyPromise=this.channel.join().catch(e=>{
			console.log(e)
			this.textChannel.send('failed to join channel!')
			throw new Error()
		}).then((connection=>{
			this.connection=connection
		}).bind(this))
	}
	play(url) {
		if(!url) {
			this.textChannel.send('no url found.')
			return
		}
		if(!ytdl.validateURL(url)) {
			this.textChannel.send(`url ${url} isn't a valid YT url.`)
			return
		}
		const stream = ytdl(url, { filter : 'audioonly' });
		console.log(stream)
		this.dispatcher = this.connection.play(stream, streamOptions);
		this.textChannel.send(`playing ${url}...`)
		this.dispatcher.on("finish", end => {
			console.log("left channel");
			channel.leave();
		});
	}
	playpause() {
		if(this.dispatcher.paused) this.dispatcher.resume()
		else this.dispatcher.pause()
	}
	send(message) {
		this.textChannel.send(message)
	}
	onMessage(parts) {
		action=parts.shift();
		this.readyPromise.then(()=>{
			if(action=="play") this.play(parts.shift())
			else if(action=="pause"||action=="resume") {
				this.playpause();
				this.send('playpause!')
			} else if(action=="volume") {
				this.dispatcher.setVolume(parts.shift());
				this.send('volume changed!')
			}
		})
	}
}
function help() {
return `play <youtube url>
volume <0-1 (default: 0.1)>
pause
resume`
}
module.exports=client=>{
	return ({message,parts})=>{
		const channel=message.member.voice.channel
		if(parts[0]=="help") {
			message.channel.send(`help for \`yt\` module:\n\`\`\`${help()}\`\`\``)
			return
		} else if(!channel) {
			message.channel.send('Not in voice channel.')
			return
		}
		if(!channel.bot) channel.bot=new Player(channel,message.channel)
		channel.bot.onMessage(parts)
	}
}
