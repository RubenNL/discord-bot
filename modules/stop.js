class Restart {
	static CLIENT
	static ONMESSAGE({message,parts}) {
		process.exit(1)
	}
}
module.exports=client=>{
	Restart.CLIENT=client;
	return Restart
}
