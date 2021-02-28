class Help {
	static MODULES
	static ONMESSAGE({message,parts}) {
		if(!parts[0]) {
			message.channel.send(`available modules: ${Object.keys(this.MODULES).join('/')}
For more info use \`help <module>\``)
			return
		}
		const module=this.MODULES[parts[0]];
		if(!module) message.channel.send(`module not found!`)
		else if(!module.help) message.channel.send(`no help available for module ${parts[0]}`)
		else message.channel.send(`help for ${parts[0]}: ${module.help}`)
	}
	static help=`no arguments for list of modules
\`<module>\` for help with that module`
}
module.exports=modules=>{
	Help.MODULES=modules;
	return Help
}
