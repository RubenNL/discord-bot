var CronJob = require('cron').CronJob;
var crypto = require("crypto");
var fs=require('fs')
class Remind {
	static client;
	static moduleStorage;
	constructor(client,moduleStorage) {
		this.client=client;
		this.moduleStorage=moduleStorage;
		let json;
		try {
			json=fs.readFileSync(this.moduleStorage+'/reminders.json','utf8')
		} catch(e) {
			json='[]'
		}
		this.reminders=JSON.parse(json).map(reminder=>{
			reminder.job=this.loadReminder(reminder)
			return reminder
		})
	}
	onMessage(parts,message) {
		action=parts.shift();
		if(action=="add") {
			parts=parts.join(' ').split(';')
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
			const reminder={time,text:parts[1],channel:message.channel.id,id}
			reminder.job=this.loadReminder(reminder)
			this.reminders.push(reminder)
			message.channel.send(`configured reminder ${id} on ${reminder.time} text: \`${reminder.text}\` next: ${reminder.job.nextDate().fromNow()}`)
			this.save();
		} else if(action=="list") {
			const reminders=this.reminders.filter(({channel})=>channel==message.channel.id).map(reminder=>{
				return {...reminder,next:reminder.job.nextDate().fromNow()}
			})
			const longestText=Math.max(7,...reminders.map(item=>item.text.length))
			const longestTime=Math.max(4,...reminders.map(item=>item.time.length))
			const longestNext=Math.max(4,...reminders.map(item=>item.next.length))
			let response='```\n';
			response+=`+--------+${'-'.repeat(longestTime)}+${'-'.repeat(longestText)}+${'-'.repeat(longestNext)}+\n`
			response+=`|id      |cron${' '.repeat(longestTime-4)}|message${' '.repeat(longestText-7)}|next${' '.repeat(longestNext-4)}|\n`
			response+=`+--------+${'-'.repeat(longestTime)}+${'-'.repeat(longestText)}+${'-'.repeat(longestNext)}+\n`
			reminders.forEach(reminder=>{
				response+=`|${reminder.id}|${reminder.time}${' '.repeat(longestTime-reminder.time.length)}|${reminder.text}${' '.repeat(longestText-reminder.text.length)}|${reminder.next}${' '.repeat(longestNext-reminder.next.length)}|\n`
			})
			response+=`+--------+${'-'.repeat(longestTime)}+${'-'.repeat(longestText)}+${'-'.repeat(longestNext)}+\n`
			response+='```';
			message.channel.send(response)
		} else if(action=="delete") {
			const id=parts.shift();
			if(id=="all") {
				this.reminders.forEach(reminder=>reminder.job.stop())
				this.reminders=[]
				message.channel.send(`deleted all reminders!!`)
				this.save();
				return
			}
			const reminder=this.reminders.find(item=>item.id==id)
			if(!reminder) {
				message.channel.send(`can't find reminder with id ${id}!`)
				return
			}
			reminder.job.stop();
			this.reminders=this.reminders.filter(item=>item!=reminder)
			message.channel.send(`deleted reminder with id ${id}!`)
			this.save();
		}
	}
	loadReminder({time,text,channel}) {
		const action=()=>this.client.channels.fetch(channel).then(channel=>channel.send(text))
		return new CronJob(time, action, null, true);
	}
	save() {
		fs.writeFileSync(this.moduleStorage+'/reminders.json',JSON.stringify(this.reminders.map(reminder=>{
			return {...reminder,job:undefined}
		}),null,'\t'),'utf8')
	}
	static help=`add <time/cron>;<message> (time is in local time)
delete <id>
list

add example:
\`add 12:30;test\` sends 'test' every 12:30.
\`add 30 16 * * 1-5;test\` sends 'test' every monday to friday on 16:30.
`
	static ONMESSAGE({message,parts}) {
		return this.singleton.onMessage(parts,message)
	}
}
module.exports=(client,moduleStorage)=>{
	Remind.client=client;
	Remind.moduleStorage=moduleStorage;
	Remind.singleton=new Remind(client,moduleStorage);
	return Remind
}
