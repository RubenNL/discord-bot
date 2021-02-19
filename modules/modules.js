module.exports=client=>{
	const yt = require('./yt')(client);
	return module=>{
		if(module=="yt") return yt
		return false
	}
}
