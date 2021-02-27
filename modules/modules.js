module.exports=client=>{
	const yt = require('./yt')(client);
	const remind = require('./remind')(client);
	const stop = require('./stop')(client);
	const modules={
		yt,
		remind,
		stop,
		help:null
	}
	modules.help=require('./help')(modules);
	return module=>{
		return data=>modules[module].ONMESSAGE(data)
	}
}
