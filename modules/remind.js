var CronJob = require('cron').CronJob;
class Remind {
	constructor(client) {
		this.client=client;
		this.dates=[] //TODO uit bestand halen
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
			let useCron=false
			if(time.split(' ').length==5) useCron=true;
			if(time.split(':').length==2&&time.split(':').filter(item=>parseInt(item)!=null).length==2) {
				useCron=true;
				time=time.split(':')
				time=`${time[1]} ${time[0]} * * *`
			} else if(parseInt(time)==NaN) useCron=true;
			else useCron=false;
			const reminder={useCron,time,message:parts[1],channel:message.channel}
			this.loadReminder(reminder)
			this.dates.push(reminder)
		}
	}
	loadReminder({useCron,time,message,channel}) {
		action=()=>channel.send(message)
		if(useCron) {
			const job=new CronJob(time, action, null, true);
			console.log(job)
		}
	}
}
module.exports=client=>{
	const remind=new Remind(client);
	return ({message,parts})=>{
		remind.onMessage(parts,message)
	}
}
 
