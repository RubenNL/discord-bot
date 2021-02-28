module.exports=client=>{
	const modules={}
	require('fs').readdirSync(__dirname+'/modules').forEach(filename=>{
		modules[filename.split('.')[0]]=require('./modules/'+filename)(client)
	})
	modules.help=require('./modules/help.js')(modules);
	return module=>modules[module]
}
