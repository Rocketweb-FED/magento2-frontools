'use strict'
module.exports = function(gulp, fs, plugins, config, name, file) {
    return () => {
        // local vars
        var theme      = config.themes[name],
            src        = config.projectPath + theme.src,
            nocache   = plugins.util.env.nocache || theme.nocache || false;

        config.eslint = require('../helpers/config-loader')('eslint.json', plugins);
    if(!nocache) {
        let eslintResults = {};
        let cacheFilePath = config.projectPath + theme.src  + 'jslintCache.json';
        try {
            eslintResults = JSON.parse(fs.readFileSync(cacheFilePath));
        } catch (e) {
        }
        return gulp.src(src + '/**/*.js', {read: false})
            .pipe(plugins.if(
                function(file) {
                    return eslintResults[file.path] && eslintResults[file.path].mtime == file.stat.mtime.toJSON();
                },
                plugins.through2.obj(function(file, enc, callback) {
                    file.eslint = eslintResults[file.path].eslint;
                    callback(null, file);
                }),
                plugins.combine.obj(
                    plugins.through2.obj(function(file, enc, callback) {
                        file.contents = fs.readFileSync(file.path);
                        callback(null, file);
                    }),
                    plugins.eslint(config.eslint),
                    plugins.through2.obj(function(file, enc, callback) {
                        eslintResults[file.path] = {
                            eslint: file.eslint,
                            mtime: file.stat.mtime
                        };
                        callback(null, file);
                    }),
                    plugins.eslint.format()
                )
            ))
            .on('end', function() {
                fs.writeFileSync(cacheFilePath, JSON.stringify((eslintResults)));
            })
            .pipe(plugins.eslint.failAfterError());
        } else {
            return gulp.src(src + '/**/*.js')
                .pipe(plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") }))
                .pipe(plugins.eslint(config.eslint))
                .pipe(plugins.eslint.format())
                .pipe(plugins.eslint.failAfterError());
        }
    }
}