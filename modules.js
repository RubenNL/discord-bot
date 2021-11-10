const fs=require('fs')
module.exports=(client,storage)=>{
	const modules={}
	require('fs').readdirSync(__dirname+'/modules').forEach(filename=>{
		const moduleStorage=storage+'/'+filename;
		if(!fs.existsSync(moduleStorage)) fs.mkdirSync(moduleStorage);
		modules[filename.split('.')[0]]=require('./modules/'+filename)(client,moduleStorage)
	})
	modules.help=require('./modules/help.js')(modules);
	return module=>modules[module]
}
