'use strict'
module.exports = function(gulp, fs, plugins, config, name, locale, file) {
    return () => {
        // local vars
        var theme      = config.themes[name],
            src        = file || config.projectPath + theme.src + '/**/*.scss',
            dest       = theme.dest + '/' + locale,
            nocache   = plugins.util.env.nocache || theme.nocache || false;
        if(!nocache){
            let sasslintResults = {};

            let cacheFilePath = config.projectPath + theme.src + '/'+ locale + '_sasslintCache.json';

            try {
                sasslintResults = JSON.parse(fs.readFileSync(cacheFilePath));
            } catch (e) {
            }

            return gulp.src([
                src, '!' + config.projectPath + theme.src + '/node_modules/**/*.scss'
            ], { base: config.projectPath + theme.src + '/web', read: false })
                .pipe(plugins.if(
                    function(file) {
                        return sasslintResults[file.path] && sasslintResults[file.path].mtime == file.stat.mtime.toJSON();
                    },
                    plugins.through2.obj(function(file, enc, callback) {
                        file.sassLint = sasslintResults[file.path].sassLint;
                        callback(null, file);
                    }),
                    plugins.combine.obj(
                        plugins.through2.obj(function(file, enc, callback) {
                            file.contents = fs.readFileSync(file.path);
                            callback(null, file);
                        }),
                        plugins.sassLint(),

                        plugins.through2.obj(function(file, enc, callback) {
                            sasslintResults[file.path] = {
                                sasslint: file.sassLint,
                                mtime: file.stat.mtime
                            };
                            callback(null, file);
                        }),
                        plugins.sassLint.format()
                    )
                ))
                .on('end', function() {
                    fs.writeFileSync(cacheFilePath, JSON.stringify((sasslintResults)));
                })
                .pipe(plugins.sassLint.failOnError());
        } else {
            return gulp.src([
                src, '!' + config.projectPath + theme.src + '/node_modules/**/*.scss'
                ], { base: config.projectPath + theme.src + '/web' })
                .pipe(plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") }))
//            .pipe(plugins.if(!nocache, plugins.cache('linting')))
                .pipe(plugins.sassLint())
                .pipe(plugins.sassLint.format())
                .pipe(plugins.sassLint.failOnError());
        }
    }
}
