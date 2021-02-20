const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 0.1 };
const urlRegex=new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?")
module.exports=client=>{
		return ({message,parts})=>{
		action=parts.shift();
		const channel=message.member.voice.channel
		if(!channel) {
			message.channel.send('Not in voice channel.')
			return
		}
		if(action=="play") {
			url=parts.shift();
			if(!url) {
				message.channel.send('no urls found.')
				return
			}
			if(!ytdl.validateURL(url)) {
				message.channel.send(`url ${url} isn't a valid YT url.`)
				return
			}
			message.channel.send(`playing ${url}...`)
			channel.join().catch(e=>{
				console.log(e)
				message.channel.send('failed to join channel!')
				throw new Error()
			}).then(connection => {
				const stream = ytdl(url, { filter : 'audioonly' });
				console.log(stream)
				const dispatcher = connection.play(stream, streamOptions);
				channel.bot={dispatcher,channel};
				dispatcher.on("finish", end => {
					console.log("left channel");
					channel.leave();
				});
			}).catch(err => console.log(err));
		} else if(action=="pause") {
			channel.bot.dispatcher.pause();
			message.channel.send('paused!')
		} else if(action=="resume") {
			channel.bot.dispatcher.resume();
			message.channel.send('resumed!')
		} else if(action=="volume") {
			channel.bot.dispatcher.setVolume(parts.shift());
			message.channel.send('volume changed!')
		}
	}
}
