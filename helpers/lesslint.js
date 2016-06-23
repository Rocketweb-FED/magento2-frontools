'use strict';
module.exports = function(gulp, fs, plugins, config, name, locale, file) {
    return () => {
        // local vars
        var theme      = config.themes[name],
            src        = theme.default ? config.projectPath + theme.dest + '/' + locale : config.projectPath + theme.src,
            lessFiles  = file || [],
            srcUnix = plugins.slash(src),
            nocache   = plugins.util.env.nocache || theme.nocache || false,
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
        var dependencyTreeBuilder = require('../helpers/dependency-tree-builder');
        if (!lessFiles.length) {
            var files = plugins.globby.sync([
                src + '/**/*.less',
                '!' + src + '/node_modules/**/*.less'
            ]);

            files.forEach(file => lessFiles.push(file));
        } else {
            lessFiles = dependencyTreeBuilder(theme, lessFiles);
        }

        if(!nocache) {
            let lesslintResults = {};

            let cacheFilePath = config.projectPath + theme.src + '/'+locale+'_lesslintCache.json';

            try {
                lesslintResults = JSON.parse(fs.readFileSync(cacheFilePath));
            } catch (e) {
            }

            return gulp.src(lessFiles, {read: false})
                  .pipe(plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") }))
                .pipe(plugins.if(
                    function(file) {
                        return lesslintResults[file.path] && lesslintResults[file.path].mtime == file.stat.mtime.toJSON();
                    },
                    plugins.through2.obj(function(file, enc, callback) {
                        file.lesshint = lesslintResults[file.path].lesshint;
                        callback(null, file);
                    }),
                    plugins.combine.obj(
                        plugins.through2.obj(function(file, enc, callback) {
                            file.contents = fs.readFileSync(file.path);
                            callback(null, file);
                        }),
                        plugins.lesshint({
                            "configPath": './config/.lesshintrc'
    //                        "failOnError": true
                        }),

                        plugins.through2.obj(function(file, enc, callback) {
                            lesslintResults[file.path] = {
                                lesshint: file.lesshint,
                                mtime: file.stat.mtime
                            };
                            callback(null, file);
                        }),
                        reporter()
                    )
                ))
                .on('end', function() {
                    fs.writeFileSync(cacheFilePath, JSON.stringify((lesslintResults)));
                });
     } else {
        return gulp.src(lessFiles)
            .pipe(plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") }))
            .pipe(plugins.if(!nocache, plugins.cache('linting')))
            .pipe(plugins.lesshint({
                "configPath": './config/.lesshintrc',
                "failOnError": true
            }))
            .pipe(reporter());
     }
    }
}
