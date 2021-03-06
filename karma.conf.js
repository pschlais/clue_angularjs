//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: './app',

    files: [
      'bower_components/angular/angular.js',
      //'bower_components/angular-resource/angular-resource.js',
      //'bower_components/angular-route/angular-route.js',
      'bower_components/angular-mocks/angular-mocks.js',
      '**/*.module.js',
      '*!(.module|.spec).js',
      '!(bower_components)/**/*!(.module|.spec).js',
      '**/*.spec.js',
    ],

    exclude: [
      'app.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    reporters: ['spec'],

    plugins: [
      'karma-chrome-launcher',
      //'karma-firefox-launcher',
      'karma-jasmine',
      //'karma-junit-reporter',
      //'karma-html-reporter',
      'karma-spec-reporter'
    ],

    /*junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }*/

  });
};
