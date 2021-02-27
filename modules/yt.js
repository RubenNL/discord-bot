const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const streamOptions = { seek: 0, volume: 0.1 };
const urlRegex=new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?")
const numbers = ["0⃣","1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"]
class Player {
	static client;
	constructor(channel,textChannel,client) {
		this.client=client
		this.channel=channel;
		this.textChannel=textChannel;
		this.playing=false;
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
		this.send(`playing ${url}...`)
		this.dispatcher.on('start',(()=>this.playing=true).bind(this))
		this.dispatcher.on("finish", end => {
			console.log("left channel");
			this.playing=false;
			this.channel.leave();
		});
	}
	playpause() {
		if(this.dispatcher.paused) this.dispatcher.resume()
		else this.dispatcher.pause()
	}
	send(message) {
		return this.textChannel.send(message)
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
			} else if(action=="search") {
				this.search(parts.join(' '))
				this.send('searching...')
			}
		})
	}
	search(query) {
		ytsr(query,{limit:10}).then(res=>{
			let response=''
			res.items.forEach((item,id)=>{
				response+=`\n${numbers[id]} \`${item.title}(${item.duration} ${item.author?item.author.name:'NO AUTHOR NAME FOUND!'} ${item.id})\``
			})
			this.send(response).then(message=>{
				res.items.forEach((item,id)=>{
					message.react(numbers[id])
				})
				message.awaitReactions((reaction,user)=>{
					if(user==this.client.user) return
					reaction=reaction.emoji.name
					const item=res.items[parseInt(reaction)]
					this.play(item.url)
					message.reactions.removeAll()
					return true;
				},{time:30*1000,maxEmojis:1,maxUsers:1})
				setTimeout(()=>message.reactions.removeAll(),30*1000)
			})
		})
	}
	static help() {
		return `play <youtube url>
volume <0-1 (default: 0.1)>
search <query>
pause
resume`
	}
	static ONMESSAGE({message,parts}) {
		const channel=message.member.voice.channel
		if(parts[0]=="help") {
			message.channel.send(`help for \`yt\` module:\n\`\`\`${this.help()}\`\`\``)
			return
		} else if(!channel) {
			message.channel.send('Not in voice channel.')
			return
		}
		if(!channel.bot) {
			channel.bot=new Player(channel,message.channel,this.client)
		}
		channel.bot.onMessage(parts)
	}
}
module.exports=client=>{
	Player.client=client;
	return Player
}
