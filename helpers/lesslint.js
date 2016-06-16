module.exports = function(gulp, plugins, config, name, locale, file) {
    return () => {
        // local vars
        var theme      = config.themes[name],
            src        = theme.default ? config.projectPath + theme.dest + '/' + locale : config.projectPath + theme.src,
            dest       = config.projectPath + theme.dest + '/' + locale + '/css',
            maps       = plugins.util.env.maps || false,
            production = plugins.util.env.prod || false,
            lessFiles  = file || [],
            postcss    = [],
            parentPath = require('./parent-theme-dir')(name, config),
            srcUnix = plugins.slash(src),
            reporter = function () {
                return plugins.through2.obj(function (file, enc, cb) {
                    var out = [];

                    if (file.lesshint && !file.lesshint.success) {
                        file.lesshint.results.forEach(function (result) {
                            var output = '';

                            if (result.severity === 'error') {
                                output += plugins.util.colors.red('Error: ');
                            } else {
                                output += plugins.util.colors.yellow('Warning: ');
                            }

                            output += plugins.util.colors.cyan(plugins.slash(file.path).replace(srcUnix, '')) + ': ';

                            if (result.line) {
                                output += plugins.util.colors.magenta('line ' + result.line) + ', ';
                            }

                            if (result.column) {
                                output += plugins.util.colors.magenta('col ' + result.column) + ', ';
                            }

                            output += plugins.util.colors.green(result.linter) + ': ';
                            output += result.message;
                            output += ': '+ result.source;

                            out.push(output);
                        });

                        if (out.length) {
                            plugins.util.log(out.join('\n'));
                        }
                    }

                    return cb(null, file);
                });
            };


        // less compiler is dumb as f*ck
        // can't figure out what files to process when path is like "theme/**/*.less"
        if (!lessFiles.length) {
            var files = plugins.globby.sync([
                src + '/**/*.less',
                '!' + src + '/node_modules/**/*.less'
            ]);

            files.forEach(file => lessFiles.push(file));
        }

        return gulp.src(lessFiles)
            .pipe(plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") }))
            .pipe(plugins.lesshint({
                "configPath": './config/.lesshintrc'
            }))
            .pipe(reporter());
    }
}
