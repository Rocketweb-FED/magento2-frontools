
## New Tasks list
* `langlint` - sass(less) linting
    * by default langlint use/create/modify cachefile which located in path: `<theme.src>/<theme.locale>_<theme.lang>lintCache.json`.
    * First run task:  lint all files, create cachefile  and write in cachefile lint errors and mtime for all files. Also all errros show in console.
    * Subsequent runs: compare current modification time of file and mtime in cachefile => only for recent files(have been modified) do: lint, rewrite record in cachefile and show errors in console.
    **
    * `--theme name` - Process single theme
    * `--nocache` - do not use cachefile, lint all files and show errors in console
    * Example: gulp langlint --theme demo
* `csslint` - create css files to <theme.src>/web folder and add source  information to the output css file for outputting user-understandable content, then execute csslint for generated css files
    * `--theme name` - Process single theme
    * Example: gulp csslint --theme demo
* `jslint` - js linting for all *.js files inside  `<theme.src>` folder (no separation by locale)
    * by default jslint use/create/modify cachefile which located in path: `<theme.src>/jslintCache.json`.
    * `--theme name` - Process single theme
    * `--nocache` - do not use/create/modify cache file, lint all files and show errors in console
    * Example: gulp jslint --theme demo
* `imagemin` - optimize all images. By default (without any flags) will proceed for all `theme.src` folders from `config/themes.json` file
     * ATTENTION: all images would be overwritten. Old versions will be lost
     * `--folders '<folder-name-1>,<folder-name-2>'` - process in folders which are specified in folders variable in comma-separated format.
                                                      Folders path should be relative to `config.projectPath` variable(<your_magento_project> root folder)
     * Example: gulp imagemin --folders 'pub/media/catalog,pub/media/wysiwyg'
     *          minimize files in <your_magento_project>/pub/media/catalog/**/* and <your_magento_project>/pub/media/wysiwyg/**/* (all subdirectories will be included).
     * `--theme name` - Process single theme. NOTE: if `--folders` set, `--theme` will be ignored
* `watch` - Watch for styles changes and run lang-linting task, then processing task; watch for js changes and run js-linting task
  * `--theme name` - Process single theme
  * `--maps` - Toggles source maps generation
  * `--prod` - Production output - minifies styles
  * `--nolanglint` - cancel execute lang-linting task
  * `--nojslint` - cancel watch and lint js files
  * `--nocache` - cancel using cachefiles for langlint and jslint tasks

## New env variable for `dev`, `styles` and `watch` tasks (for SASS themes ONLY)
   * `--nolanglint` - if true then execute langlint task before compile to css.
   * Example: gulp styles --theme demo --nolanglint

* You can also add
 * `nolanglint`:true
 * inside theme declaration in `config/themes.json` instead of --nolanglint flag in CLI
 * Example:
 * ....
 * "demo": {
 *       "src": "vendor/snowdog/theme-blank-sass",
 *        "dest": "pub/static/frontend/snowdog/blank",
 *        "locale": ["en_US"],
 *        "lang": "scss",
 *        "nolanglint": true,
 *        "nojslint": true,
 *        "postcss": ["plugins.autoprefixer()"]
 *    }
 * ....

## for `dev` and `watch` tasks you can use
* `--nojslint` flag to cancel linting for js files in theme


 * NOTES about less linting:
     * NOTE 1:
     * Less linting before compiling less files unable in `dev`, `styles` and `watch` tasks, because only main .less files are in pipeline
     * (which defined in "files" property inside theme declaration)
     * Example:
     * "blank": {
     *     .......
     *     "files"[
     *        "css/styles-m",
     *        "css/styles-l"
     *      ])
     *....
     * }
     * only styles-m.less and styles-l.less will be in pipeline (files, which was included by @import will not be lint)
     * to lint less, please use `langlint` task (in future (see NOTE 2))

     * NOTE 2:
     *      gulp-lesshint plugin is used for Less lint. It dependent from lesshint [https://github.com/lesshint/lesshint]
     *     this plugin in latest stable version throw an error for less statement:
     *
     *     `& when (@common-media = true)`
     *
     *     and exit (don’t analyze file after this error)
     *     Example error in CLI:
     *          Error: /Magento_Theme/css/source/_module.less: line 47, col 1, parse error: Please check validity of the block starting from line #47
     *
     *     2 solutions have been tried:
     *     Solution 1: update lesshint  to 2.0 version
     *
     *     `npm install gulp-lesshint@next --save-dev`
     *
     *     The result is strange enough: the comments is linting as a code
     *
     *         Warning: /Magento_Theme/css/source/_module.less: line 1, col 1, idSelector: Selectors should not use IDs.: // /**
     *         Warning: /Magento_Theme/css/source/_module.less: line 1, col 1, idSelector: Selectors should not use IDs.: // /**
     *         Warning: /Magento_Theme/css/source/_module.less: line 1, col 2, qualifyingElement: Class selectors should not include a qualifying element.: // /**
     *         Warning: /Magento_Theme/css/source/_module.less: line 1, col 2, qualifyingElement: Class selectors should not include a qualifying element.: // /**
     *
     *     Solution2: leave gulp-lesshint in stable version but update lesshint inside /node-modules/gulp-lesshint
     *
     *     `cd /node-modules/gulp-lesshint`
     *     `npm install lesshint@next --save-dev`
     *
     *     The result is the same.
     *
     *     Resolution:   1. due to lesshint 2.0 in development now, hope bugs will be fixed and we could use just added `langlint` task for less themes in future
     *                   2. any other good less-lint plugin has not been found
