module.exports = function() {
    // global vars
    var gulp    = this.gulp,
        plugins = this.opts.plugins,
        config  = this.opts.configs;

    // local vars
    var themeName = plugins.util.env.theme || false,
        themes    = themeName ? [themeName] : Object.keys(config.themes);

    themes.forEach(name => {
        var theme = config.themes[name],
            nolanglint = plugins.util.env.nolanglint ||  theme.nolanglint || false;
            nojslint = plugins.util.env.nojslint ||  theme.nojslint || false;

        theme.locale.forEach(locale => {
            var themePath = theme.default ? theme.dest + '/' + locale : theme.src;
            if (theme.lang === 'less') {
                var files = plugins.globby.sync(
                    [
                            config.projectPath + themePath + '/**/*.' + theme.lang,
                        '!' + config.projectPath + themePath + '/**/_*.' + theme.lang,
                        '!' + config.projectPath + themePath + '/**/node_modules/**/*.' + theme.lang,
                    ]
                ),
                dependencyTreeBuilder = require('../helpers/dependency-tree-builder');

                files.forEach(file => {
                    gulp.watch(dependencyTreeBuilder(theme, file), () => {
                        if(nolanglint) {
                            plugins.runSequence(config.themes[name].lang + ':' + name + ':' + locale);
                        } else {
                            plugins.runSequence('lint:'+config.themes[name].lang + ':' + name + ':' + locale, config.themes[name].lang + ':' + name + ':' + locale);
                        }
                    });
                });
            } else {
                var files = plugins.globby.sync(
                    [
                        config.projectPath + themePath + '/**/*.' + theme.lang,
                        '!' + config.projectPath + themePath + '/**/node_modules/**/*.' + theme.lang,
                    ]
                );

                gulp.watch(files, () => {
                    if(nolanglint) {
                        plugins.runSequence(config.themes[name].lang + ':' + name + ':' + locale);
                    } else {
                        plugins.runSequence('lint:'+config.themes[name].lang + ':' + name + ':' + locale, config.themes[name].lang + ':' + name + ':' + locale);
                    }
                });
            }


        });
        //  add watcher for js files
        if(!nojslint) {
            gulp.watch([config.projectPath + theme.src+'/**/*.js', '!' + config.projectPath + theme.src + '/**/node_modules/**/*.js'], () => {
                plugins.runSequence('jslint:' + name);
            });
        }
    });
};
