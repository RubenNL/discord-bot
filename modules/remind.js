var CronJob = require('cron').CronJob;
var crypto = require("crypto");
class Remind {
	constructor(client) {
		this.client=client;
		this.reminders=[] //TODO uit bestand halen
	}
	onMessage(parts,message) {
		action=parts.shift();
		if(action=="add") {
			parts=parts.join(' ').split('-')
			if(parts.length!=2) {
				message.channel.send("don't know what to do with this reminder!")
				return
			}
			let time=parts[0]
			if(time.split(' ').length==5) {}//date is already usable
			else if(time.split(':').length==2&&time.split(':').filter(item=>parseInt(item)!=null).length==2) {
				time=time.split(':')
				time=`${time[1]} ${time[0]} * * *`
			} else {
				message.channel.send("Reminder date invalid!")
				return;
			}
			var id = crypto.randomBytes(4).toString('hex').toUpperCase()
			const reminder={time,text:parts[1],channel:message.channel,id}
			this.loadReminder(reminder)
			this.reminders.push(reminder)
		} else if(action=="list") {
			const reminders=this.reminders.filter(({channel})=>channel==message.channel)
			const longestText=Math.max(7,...reminders.map(item=>item.text.length))
			const longestTime=Math.max(4,reminders.map(item=>item.time.length))
			console.log(longestText,longestTime)
			let response='```\n';
			response+=`+--------+${'-'.repeat(longestTime)}+${'-'.repeat(longestText)}+\n`
			response+=`|id      |cron${' '.repeat(longestTime-4)}|message${' '.repeat(longestText-7)}|\n`
			response+=`+--------+${'-'.repeat(longestTime)}+${'-'.repeat(longestText)}+\n`
			reminders.forEach(reminder=>{
				response+=`|${reminder.id}|${reminder.time}${' '.repeat(longestTime-reminder.time.length)}|${reminder.text}${' '.repeat(longestText-reminder.text.length)}|\n`
			})
			response+=`+--------+${'-'.repeat(longestTime)}+${'-'.repeat(longestText)}+\n`
			response+='```';
			message.channel.send(response)
		} else if(action=="delete") {
			const id=parts.shift();
			const reminder=this.reminders.find(item=>item.id==id)
			if(!reminder) {
				message.channel.send(`can't find reminder with id ${id}!`)
				return
			}
			this.reminders=this.reminders.filter(item=>item!=reminder)
			message.channel.send(`deleted reminder with id ${id}!`)
		}
	}
	loadReminder({time,text,channel}) {
		action=()=>channel.send(text)
		const job=new CronJob(time, action, null, true);
		console.log(job)
	}
}
module.exports=client=>{
	const remind=new Remind(client);
	return ({message,parts})=>{
		remind.onMessage(parts,message)
	}
}
