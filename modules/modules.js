module.exports=client=>{
	const yt = require('./yt')(client);
	const remind = require('./remind')(client);
	const modules={
		yt,
		remind,
		help:null
	}
	modules.help=require('./help')(modules);
	return module=>modules[module]
}
