class Help {
	static MODULES
	static ONMESSAGE({message,parts}) {
		message.channel.send(`modules: ${Object.keys(this.MODULES).join('/')}`)
	}
}
module.exports=modules=>{
	Help.MODULES=modules;
	return Help
}
