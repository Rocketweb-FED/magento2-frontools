// plugins / functions / modules
var gulp    = require('gulp'),
    fs      = require('fs'),
    plugins = require('gulp-load-plugins')({
    // Automatically load any gulp plugins in your package.json, you shouldn't define them via var plugin = require('gulp-plugin')
    // now you can use all plugins from     package.json in next way: plugins.sass() or plugins.sasslint()
      pattern: ['*', '!gulp', '!gulp-load-plugins'],
      rename: {
       // if plugin  return function, which have name with dash, we should rename it to name without dash.
       // Example:
       // plugins.browser-sync.stream() - not working
       // plugins.browserSync.stream() - works
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
    //enable to Load gulp tasks from folder. Each task is a separate file
  dir    : 'tasks',
  plugins: plugins,
  configs: config
});
//in tasks dir we have common tasks name. But for different lang we should do different proccesses
//Example: run
//gulp styles --theme blank
// it calls tasks/styles.js. This task just analyzes the input data and calls the  sequence of more specific tasks. These tasks have been defined in gulpfile.js

//!----------------------------------------------------------  begin defining specific tasks for each theme:lang:locale --------------------------------------*/

// define task for each theme, locale, lang, processing type etc.
// gulp can't run same task in parallel, so we need different names

Object.keys(config.themes).forEach(name => {
    var theme = config.themes[name];
theme.locale.forEach(locale => {
    gulp.task(
        theme.lang + ':' + name + ':' + locale,
        require('./helpers/' + theme.lang)(gulp, plugins, config, name, locale)
    );

//....
});
});

/*!---------------------------------------------------------- end defining specific tasks for each theme:lang:locale --------------------------------------*/

/* After that we'll have a bunch of tasks:
 `less:blank:en_US`, `less:blank:pl_PL` -> /helpers/less.js
 `sass:sassdemo:en_US`, `sass:sassdemo:pl_PL` -> /helpers/sass.js
  */

//Lets see tasks/styles.js
//.......
//
/*!----------------------analyse for which themes we should compile css- files ------------------------------------------------------------------------------*/
 //

// analyse tasks flag `--theme`. If defined, then themes = only neccessary theme, if not - theme is all themes from themes.json:

// local vars
    var themeName = plugins.util.env.theme || false,
        themes = themeName ? [themeName] : Object.keys(config.themes);
// run all compilers in parallel
    themes.forEach(name => {
        config.themes[name].locale.forEach(locale => {
// here we are execute task which was defined in gulpfile.js
        plugins.runSequence(config.themes[name].lang + ':' + name + ':' + locale);
});
});
//  for our Example (`gulp styles --theme blank`):
//it will execute  the next tasks: `less:blank:en_US`, `less:blank:pl_PL`
// (you can run from CLI: less:blank:en_US and in will compiled files from pub/static/frontend/Magento/blank/en_US)

//BTW, in `tasks/watch.js` you can notice another way to compile less(sass) files  (without defining any new tasks)(execute `/helpers/less.js` or `/helpers/sass.js`)
//for sass it do exactly the same as in styles. So, we can easy replace this snippet (http://screencast.com/t/0geGohJOFut) to this (http://screencast.com/t/c8oRvaFXW4w)
//I think we can do it for less too. The difference here is:
//Example:
//for origin code (http://screencast.com/t/TzmyBCaA)
// `web\css\source\_reset.less` imported only in `styles-m.less` file. And  when we change `web\css\source\_reset.less` file =>  only styles-m.less would be recompiled
// for new code (http://screencast.com/t/z9MyCWqF)
// when we change `web\css\source\_reset.less` file => both styles-l.less and styles-m.less would be recompiled
// I think it's no so important. I pay attention to this, because I want include sass(less) linting to watch tasks, like here ()

