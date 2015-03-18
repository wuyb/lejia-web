'use strict';

/**
 * @ngdoc function
 * @name webApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webApp
 */
angular.module('webApp')
  .controller('MainCtrl', function ($scope, Auth, $location) {
    var currentUser = Auth.getCurrentUser();
    if (Auth.isLoggedIn()) {
      $location.path('/dashboard');
      return;
    }
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function(data) {
          // Logged in, redirect to dashboard

          $location.path('/dashboard/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };
  }
);
