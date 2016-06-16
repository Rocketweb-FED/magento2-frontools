
## New Tasks list
* `langlint` - sass(less) linting
    * `--theme name` - Process single theme
    * Example: gulp langlint --theme demo
* `csslint` - create css files to <theme.src>/web folder and add source  information to the output css file for outputting user-understandable content, then execute csslint for generated css files
    * `--theme name` - Process single theme
    * Example: gulp csslint --theme demo

## New env variable for `dev`, `styles` and `watch` tasks (for SASS themes ONLY)
   * `--langlint` - if true then execute langlint task before compile to css.
   * Example: gulp styles --theme demo --langlint

 * You can also add
 * `langlint`:true
 * inside theme declaration in `config/themes.json` instead of --langlint flag in CLI
 * Example:
 * ....
 * "demo": {
 *       "src": "vendor/snowdog/theme-blank-sass",
 *        "dest": "pub/static/frontend/snowdog/blank",
 *        "locale": ["en_US"],
 *        "lang": "scss",
 *        "langlint": true,
 *        "postcss": ["plugins.autoprefixer()"]
 *    }
 * ....

 * NOTES about less linting:
     * NOTE 1:
     * Less linting before compiling less files unable in `dev`, `styles` and `watch` tasks, because only main .less files are in pipeline
     * (which defined in "files" prorerty inside theme decalration)
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



