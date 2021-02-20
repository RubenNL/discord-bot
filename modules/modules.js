module.exports=client=>{
	const yt = require('./yt')(client);
	const remind = require('./remind')(client);
	return module=>{
		if(module=="yt") return yt
		if(module=="remind") return remind
		return false
	}
}
