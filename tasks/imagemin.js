module.exports = function() {
    // global vars
    var gulp    = this.gulp,
        plugins = this.opts.plugins,
        config  = this.opts.configs;

    // local vars
    var themeName = plugins.util.env.theme || false,
        themes    = themeName ? [themeName] : Object.keys(config.themes),
        folders = plugins.util.env.folders || false;
    if (folders) {
       var src = folders.split(",");
        src = src.map(function(el) {
            el = config.projectPath + el+'/**/*.{jpeg,jpg,png,sgv,gif}';
            return el;
        });

        gulp.src(src)
            .pipe(plugins.imagemin({
                progressive: true,
                use: [plugins.pngquant()]
            }))
            .pipe(gulp.dest(function(file) {
                return file.base;
            }));

} else {
    themes.forEach(name => {
        var theme = config.themes[name],
            src = [config.projectPath + theme.src+'/**/images/*.{jpeg,jpg,png,sgv,gif}'];
        gulp.src(src)
            .pipe(plugins.imagemin({
                progressive: true,
                use: [plugins.pngquant()]
            }))
            .pipe(gulp.dest(function(file) {
                return file.base;
            }));
//});
});
}
};