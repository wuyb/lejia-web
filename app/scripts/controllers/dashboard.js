'use strict';

/**
 * @ngdoc function
 * @name webApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the webApp
 */
angular.module('webApp')
  .controller('DashboardCtrl', function ($scope, $rootScope, Auth) {
    $rootScope.user = Auth.getCurrentUser();
  }
);
