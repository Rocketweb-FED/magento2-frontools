module.exports = function() {
    // global vars
    var gulp    = this.gulp,
        plugins = this.opts.plugins,
        config  = this.opts.configs;

    // local vars
    var themeName = plugins.util.env.theme || false,
        themes = themeName ? [themeName] : Object.keys(config.themes);

    themes.forEach(name => {
        var nolanglint = plugins.util.env.nolanglint ||  config.themes[name].nolanglint || false;
        config.themes[name].locale.forEach(locale => {
            if(nolanglint) {
                plugins.runSequence(config.themes[name].lang + ':' + name + ':' + locale);
            } else {
                plugins.runSequence('lint:'+config.themes[name].lang + ':' + name + ':' + locale, config.themes[name].lang + ':' + name + ':' + locale);
            }
        });
    });
};
