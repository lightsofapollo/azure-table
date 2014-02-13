// Karma configuration
// Generated on Wed Feb 12 2014 17:12:03 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['mocha', 'commonjs', 'azure'],


    // list of files / patterns to load in the browser
    files: [
      '*.js',
      'vendor/*.js',
      'test/config.js',
      'test/chai.js',
      'build/*.js'
    ],


    // list of files to exclude
    exclude: [
      './node_modules/*'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['FirefoxNightly', 'Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    client: {
      mocha: {
        ui: 'tdd'
      }
    },

    preprocessors: {
      '*.js': ['commonjs'],
      'vendor/*.js': ['commonjs'],
      'test/config.js': ['commonjs'],
      'test/chai.js': ['commonjs'],
      'build/*.js': ['commonjs']
    },

    plugins: [
      'karma-mocha',
      'karma-firefox-launcher',
      'karma-chrome-launcher',
      'karma-commonjs',
      { 'framework:azure': ['factory', require('./test/server')] }
    ]
  });
};
