// plugins / functions / modules
var gulp    = require('gulp'),
    fs      = require('fs'),
    plugins = require('gulp-load-plugins')({
      pattern: ['*', '!gulp', '!gulp-load-plugins'],
      rename: {
        'browser-sync'   : 'browserSync',
        'marked-terminal': 'markedTerminal',
        'run-sequence'   : 'runSequence',
        'postcss-reporter': 'postcssReporter'
      }
    });

// global configuration
var config = {
      'themes'     : require('./helpers/config-loader')('themes.json', plugins),
      'projectPath': fs.realpathSync('../../../') + '/'
    };

// tasks loading / creating
require('gulp-task-loader')({
  dir    : 'tasks',
  plugins: plugins,
  configs: config
});

// define task for each theme, locale, lang, processing type etc.
// gulp can't run same task in parallel, so we need different names
Object.keys(config.themes).forEach(name => {
  var theme = config.themes[name];
  theme.locale.forEach(locale => {
    gulp.task(
      theme.lang + ':' + name + ':' + locale,
      require('./helpers/' + theme.lang)(gulp, plugins, config, name, locale)
    );
//*** create sass(less)-lint tasks  for each theme**//
    gulp.task(
        'lint:' + theme.lang + ':' + name + ':' + locale,
        require('./helpers/'+theme.lang+'lint')(gulp, plugins, config, name, locale)
    );
/** create postcss css-lint tasks foreach theme**/
    gulp.task(
        'ci-' +theme.lang + ':' + name + ':' + locale,
        require('./helpers/ci-' + theme.lang)(gulp, plugins, config, name, locale)
    );
  });
});
