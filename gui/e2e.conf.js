var config = require("./e2e.auth.json");

// e2e.conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  chromeOnly: true,
  params: config,
  
  /*
   * Specify the parameters of the browsers to test
   */
  multiCapabilities:[
    // Working on Windows and OSX
    { 'browserName': 'chrome' },
    
    // Firefox: 46.0.1 and below supposedly work, latest does not
    // See http://stackoverflow.com/questions/38644703/org-openqa-selenium-firefox-notconnectedexception-when-running-selenium-from-com
    // { 'browserName': 'firefox' }, 
    
    // Safari: has not been tested
    // NOTE: OSX Only
    //{ 'browserName': 'safari' },
    
    // IE11: fails to connect to browser
    // NOTE: Windows Only
    // See https://github.com/seleniumhq/selenium-google-code-issue-archive/issues/6511
    // { 'browserName': 'internet explorer', 'version': '11' }, 
  ],
  
  /*
   * Specify which test spec(s) to run
   */
  suites: {
    // mixed-auth views
    landing: 'tests/e2e/landing.e2e.js',
    swagger: 'test/e2e/swagger.e2e.js',
    contact: 'test/e2e/contact.e2e.js',
    reset: 'tests/e2e/reset.e2e.js',
    
    // non-auth views
    signup: 'tests/e2e/signup.e2e.js',
    login: 'tests/e2e/login.e2e.js',
    
    // auth-only views
    dashboard: 'tests/e2e/dashboard.e2e.js',
    catalog: 'tests/e2e/catalog.e2e.js',
    addSpec: 'test/e2e/addSpec.e2e.js',
  }
}
