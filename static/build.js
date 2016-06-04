({
	baseUrl: 'js/',
    out: 'main.built.js',
    include: ['../main'],
    mainConfigFile: 'main.js',
    findNestedDependencies: true,
    optimize: "uglify2",
	uglify2: {
	    mangle: {
	        except: ['$super']
	    }
	}    
})