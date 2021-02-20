module.exports=modules=>{
	return ({message,parts})=>{
		message.channel.send(`modules: ${Object.keys(modules).join('/')}`)
	}
} 
