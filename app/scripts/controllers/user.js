'use strict';

/**
 * UserCtrl provides the user management actions.
 */
angular.module('webApp')
  .controller('UserCtrl', function ($scope, $rootScope, $location, $window, Auth, User) {
    // user must login and have admin role in order to access this page
    if (!Auth.isLoggedIn()) {
      $location.path('/');
      return;
    }
    var user = Auth.getCurrentUser();
    if (user.role !== 'admin') {
      $location.path('/404');
      return;
    }

    // retrieves all the users from backend
    var users = User.query(function() {
      $scope.users = users;
      console.log("All users : " + JSON.stringify($scope.users));
    });
  }
);
