//TO DO  sass-linter
module.exports = function(gulp, plugins, config, name, locale, file) {
    return () => {
        // local vars
        var theme      = config.themes[name],
            src        = file || config.projectPath + theme.src + '/**/*.scss',
            dest       = theme.dest + '/' + locale;
        console.log(src);
        return gulp.src([
            src, '!' + config.projectPath + theme.src + '/node_modules/**/*.scss'
        ], { base: config.projectPath + theme.src + '/web' })
            .pipe(plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") }))
            .pipe(plugins.sassLint())
            .pipe(plugins.sassLint.format())
            .pipe(plugins.sassLint.failOnError());
    }
}