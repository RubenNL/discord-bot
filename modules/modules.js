const yt = require('./yt');
module.exports=client=>{
	return module=>{
		if(module=="yt") return yt
		return false
	}
}
