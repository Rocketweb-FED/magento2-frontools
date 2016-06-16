module.exports = function(gulp, plugins, config, name, locale, file) {
    return () => {
        // local vars
        var theme      = config.themes[name],
            src        = theme.default ? config.projectPath + theme.dest + '/' + locale : config.projectPath + theme.src,
            dest       = config.projectPath + theme.src + '/web/',
            lessFiles  = file || [],
            parentPath = require('./parent-theme-dir')(name, config);

    // less compiler is dumb as f*ck
    // can't figure out what files to process when path is like "theme/**/*.less"
    if (!lessFiles.length) {
        var files = plugins.globby.sync([
            src + '/**/*.less',
            '!' + src + '/**/_*.less',
            '!' + src + '/node_modules/**/*.less'
        ]);

        files.forEach(file => lessFiles.push(file));
    }

    return gulp.src(lessFiles)
        .pipe(plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") }))
        .pipe(plugins.less({ paths: parentPath.concat('.'),  dumpLineNumbers: "comments" }))
        .pipe(gulp.dest(dest))
        .pipe(plugins.postcss([
            plugins.stylelint(),
            plugins.postcssReporter({
                clearMessages: true,
                throwError   : true
            })
        ]))
        .pipe(plugins.logger({
            display: 'name',
            beforeEach: 'Theme: ' + name + ' Locale: ' + locale + ' ',
            afterEach: ' Compiled!'
        }));
}
}
