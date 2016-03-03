'use strict';

angular
.module('ndslabs', [ 'navbar', 'footer', 'ndslabs-api', 'ngWizard', 'ngGrid', 
    'ngRoute', 'ngResource', 'ngCookies', 'ngAnimate', 'toggle-switch', 'ui.bootstrap' ])
.constant('DEBUG', false)
.constant('_', window._)
.constant('Google', window.google)
.constant('ApiUri', 'http://141.142.209.154:8083')
.constant('LoginRoute', '/login')
.constant('ExpressRoute', '/express')
.constant('ExpertRoute', '/home')
.constant('ManageRoute', '/deployments')
.factory('NdsLabsApi', [ 'ApiUri', 'ApiServer', function(ApiUri, ApiServer) {
  // TODO: Investigate options / caching
  return new ApiServer(ApiUri);
}])
.provider('AuthInfo', function() {
  this.authInfo = {
    authenticated: false,
    namespace: '',
    password: '',
    saveCookie: false
  };

  this.$get = function() {
      var authInfo = this.authInfo;
      return {
          isAuth: function() { return authInfo.authenticated; },
          get: function() { return authInfo; },
          setAuth: function(authCookie) { authInfo = angular.fromJson(authCookie); }
      }
  };
})
.config([ '$routeProvider', '$httpProvider', 'AuthInfoProvider', 'LoginRoute', 'ExpressRoute', 'ExpertRoute', 'ManageRoute',
    function($routeProvider, $httpProvider, authInfo, LoginRoute, ExpressRoute, ExpertRoute, ManageRoute) {
  // Setup default behaviors for encountering errors
  $httpProvider.interceptors.push(['$rootScope', '$cookies', '$q', '$location', '$log', 'DEBUG', 'ApiUri', 
      function (scope, $cookies, $q, $location, $log, DEBUG, ApiUri) {
    return {
      'request': function(config) {
        if (DEBUG) {
          $log.debug('Request:');
          console.debug(config);
        }
        if (config.url.indexOf(ApiUri) !== -1) {
          // This is a request for our API server
          if (config.url.indexOf('/authenticate') === -1) {
            // We need to attach our token to this request
            config.headers['Authorization'] = 'Bearer ' + $cookies.get('token');
          }
        }
        return config;
      },
      'requestError': function(rejection) {
        if (DEBUG) {
          $log.debug('Request Rejection:');
          console.debug(rejection);
        }
        return $q.reject(rejection);
      },
      'response': function(response) {
        if (DEBUG) {
          $log.debug("Response:")
          console.debug(response);
        }
        if (response.config.url.indexOf(ApiUri) !== -1) {
          // This is a response from our API server
          if ((response.config.url.indexOf('/authenticate') !== -1 && response.config.method === 'POST')
              || (response.config.url.indexOf('/refresh_token') !== -1 && response.config.method === 'GET')) {
            // This response should contain a new token
            $cookies.put('token', response.data.token);
          }
        }
        return response;
      },
      'responseError': function(rejection) {
        if (DEBUG) {
          $log.debug("Response Rejection:");
          console.debug(rejection);
        }
        
        // Ignore local communication errors?
        if (rejection.config.url.indexOf(ApiUri) !== -1) {
          var status = rejection.status;
          if (status == 401) {
            //window.location = "/account/login?redirectUrl=" + Base64.encode(document.URL);
            authInfo.authInfo.token = null;
            $cookies.remove('token')
            if ($location.path() !== LoginRoute) {
              $location.path(LoginRoute);
            }
            return $q.reject(rejection);
          }
        }
        
        // otherwise
        return $q.reject(rejection);
      }
    };
  }]);
      
  // Setup routes to our different pages
  $routeProvider.when(ExpertRoute, {
    controller: 'ExpertSetupController',
    templateUrl: '/app/expert/expertSetup.html'
  })
  .when(LoginRoute, {
    controller: 'LoginController',
    templateUrl: '/app/login/login.html'
  })
  /*.when(ExpressRoute, {
    controller: 'ExpressSetupController',
    templateUrl: '/app/express/expressSetup.html'
  })
  .when(ManageRoute, {
    controller: 'DeploymentsController',
    templateUrl: '/app/deployments/manage.html'
  })*/
  .otherwise({
    redirectTo: function() {
      if (authInfo.authInfo.authenticated === true) {
        return ExpertRoute; //ExpressRoute;
      } else {
        return LoginRoute;
      }
    }
  });
}])
.run([ '$rootScope', '$location', '$log', '$cookies', 'AuthInfo', 'LoginRoute', 'ExpertRoute', 'NdsLabsApi', 
    function($rootScope, $location, $log, $cookies, authInfo, LoginRoute, ExpertRoute, NdsLabsApi) {
  var HomeRoute = ExpertRoute;
  
  // TODO: Investigate performance concerns here...
  $rootScope._ = window._;
  $rootScope.google = window.google;
  
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    authInfo.token = $cookies.get('token');
    if (authInfo.token) {
      NdsLabsApi.getRefresh_token().then(function() {
        $log.debug('Token refreshed');
        $location.path(HomeRoute);
      }, function() {
        $log.debug('Failed to refresh token!');
        // TODO: Allow login page to reroute user to destination?
        //authInfo.returnRoute = next.$$route.originalPath;
  
        // user needs to log in, redirect to /login
        if (next.templateUrl !== "/app/login/login.html") {
          $location.path(LoginRoute);
        }
      });
    } else {
      // user needs to log in, redirect to /login
      if (next.templateUrl !== "/app/login/login.html") {
        $location.path(LoginRoute);
      }
    }
  });
}]);
