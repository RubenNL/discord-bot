class Restart {
	static CLIENT
	static ONMESSAGE({message,parts}) {
		process.exit(1)
	}
	static help=`stops bot.`
}
module.exports=client=>{
	Restart.CLIENT=client;
	return Restart
}
