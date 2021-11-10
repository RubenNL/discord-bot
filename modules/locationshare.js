var CronJob = require('cron').CronJob;
var crypto = require("crypto");
var fs=require('fs')
const WebSocket = require('ws');
const urlParse = require('url')
function makeShortCode(lat, lon, zoom) {
	function interlace(x, y) {
		x = (x | (x << 8)) & 0x00ff00ff;
		x = (x | (x << 4)) & 0x0f0f0f0f;
		x = (x | (x << 2)) & 0x33333333;
		x = (x | (x << 1)) & 0x55555555;

		y = (y | (y << 8)) & 0x00ff00ff;
		y = (y | (y << 4)) & 0x0f0f0f0f;
		y = (y | (y << 2)) & 0x33333333;
		y = (y | (y << 1)) & 0x55555555;

		return (x << 1) | y;
	}
	char_array = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_~";
	var x = Math.round((lon + 180.0) * ((1 << 30) / 90.0));
	var y = Math.round((lat +  90.0) * ((1 << 30) / 45.0));
	// JavaScript only has to keep 32 bits of bitwise operators, so this has to be
	// done in two parts. each of the parts c1/c2 has 30 bits of the total in it
	// and drops the last 4 bits of the full 64 bit Morton code.
	var str = "";
	var c1 = interlace(x >>> 17, y >>> 17), c2 = interlace((x >>> 2) & 0x7fff, (y >>> 2) & 0x7fff);
	for (var i = 0; i < Math.ceil((zoom + 8) / 3.0) && i < 5; ++i) {
		digit = (c1 >> (24 - 6 * i)) & 0x3f;
		str += char_array.charAt(digit);
	}
	for (var i = 5; i < Math.ceil((zoom + 8) / 3.0); ++i) {
		digit = (c2 >> (24 - 6 * (i - 5))) & 0x3f;
		str += char_array.charAt(digit);
	}
	for (var i = 0; i < ((zoom + 8) % 3); ++i) str += "-";
	return str;
}

class LocationShare {
	static client;
	static moduleStorage;
	static shares={}
	constructor(id,user,channel,message) {
		this.id=id;
		this.user=user;
		this.channel=channel;
		this.message=message;
		LocationShare.client.channels.fetch(this.channel).then(channel=>channel.messages.fetch(this.message)).then((this.setMessage).bind(this))
	}
	setMessage(message) {
		this.messageObject=message;
		this.messageObject.awaitReactions((reaction,user)=>{
			if(user==this.client.user) return
			reaction=reaction.emoji.name
			const item=res.items[parseInt(reaction)]
			this.play(item.url)
			message.reactions.removeAll()
			return true;
		},{time:30*1000,maxEmojis:1,maxUsers:1})
	}
	static ONMESSAGE({message,parts}) {
		const id=crypto.randomBytes(4).toString('hex').toUpperCase()
		message.author.send('https://rubend.nl/locationshare.html#'+id);
		message.channel.send('This message will be updated.').then(updateMessage=>{
			const shareObject={
				id,
				user: message.author.id,
				channel: message.channel.id,
				message: updateMessage.id,
				messageObject: updateMessage,
			};
			shareObject.object=this.loadShare(shareObject);
			this.shares[id]=shareObject
			this.save();
		})
	}
	static save() {
		fs.writeFileSync(this.moduleStorage+'shares.json',JSON.stringify(Object.values(this.shares).map(share=>{
			return {...share,object:undefined,messageObject:undefined}
		}),null,'\t'),'utf8')
	}
	static load() {
		let json;
		try {
			json=fs.readFileSync(this.moduleStorage+'shares.json','utf8')
		} catch(e) {
			json='[]'
		}
		JSON.parse(json).forEach(share=>{
			share.object=this.loadShare(share)
			this.shares[share.id]=share;
		})
	}
	static loadShare({id,user,channel,message}) {
		return new LocationShare(id,user,channel,message);
	}
}
module.exports=(client,moduleStorage)=>{
	LocationShare.client=client;
	LocationShare.moduleStorage=moduleStorage;
	LocationShare.load();
	return LocationShare
}
const wss = new WebSocket.Server({port: 34655});
wss.on('connection', (ws,req)=>{
	const part=urlParse.parse(req.url).path.split('/')[1]
	const share=LocationShare.shares[part]
	if(!share) {
		ws.send('key not found!')
		console.log(part,'NOT FOUND!')
		ws.close('KEY NOT FOUND!')
		return
	}
	ws.on('message', message=>{
		message=JSON.parse(message);
		url=`https://www.openstreetmap.org/?mlat=${message.coords.latitude}&mlon=${message.coords.longitude}#map=19/${message.coords.latitude}/${message.coords.longitude}`
		//url='https://osm.org/go/'+makeShortCode(message.coords.latitude,message.coords.longitude,9)+'?m';
		if(share.object.messageObject.content.split('\n')[0]==url) return;
/*		const coords=message.coords;
		req=`https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude}%2C${coords.latitude}.json?access_token=pk.eyJ1IjoicnViZW5ubCIsImEiOiJja2x0czUxa2EwbXl0Mm5vMzdrcm8yZ3Q5In0.kBk6NECkpwqCFw7zGDLmoA&autocomplete=true&types=place%2Caddress`;
		console.log(req)
		require('https').get(req,res=>{
			data='';
			res.on('data',chunk=>data+=chunk)
			res.on('end',()=>{
				data=JSON.parse(data)
				place=data.features[0].properties.place_name
*/				share.object.messageObject.edit(`${url}`);
//			})
///		})
	})
});
