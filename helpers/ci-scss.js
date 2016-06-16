module.exports = function(gulp, plugins, config, name, locale, file) {
  return () => {
    // local vars
    var theme      = config.themes[name],
        src        = file || config.projectPath + theme.src + '/**/*.scss',
        dest       = config.projectPath + theme.src + '/web/',
        parentPath = require('./parent-theme-dir')(name, config);

    return gulp.src([
        src, '!' + config.projectPath + theme.src + '/node_modules/**/*.scss'
      ], { base: config.projectPath + theme.src + '/web' })
      .pipe(plugins.plumber({ errorHandler: plugins.notify.onError("Error: <%= error.message %>") }))
      .pipe(plugins.sass({ includePaths: parentPath,  outputStyle   : 'expanded',
            sourceComments: true }))
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
