'use strict';

/**
 * @ngdoc function
 * @name webApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webApp
 */
angular.module('webApp')
  .controller('MainCtrl', function ($scope, $rootScope, Auth, $location) {
    if (Auth.isLoggedIn()) {
      $location.path('/dashboard');
      return;
    }
    $scope.user = {};
    $scope.errors = {};

    $scope.isLoggedIn = function() {
      return Auth.isLoggedIn();
    }
    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function(data) {
          // we define the user session management functions/variables in root scope, after user has logged in
          $rootScope.user = Auth.getCurrentUser();
          $location.path('/dashboard');
        })
        .catch( function(err) {
          $rootScope.user = {};
          $scope.errors.other = err.message;
        });
      }
    };
  }
);
