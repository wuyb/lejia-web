'use strict';

/**
 * NavbarCtrl manages the navbar and provides common functions that is globally accessible through the bar.
 */
angular.module('webApp')
  .controller('NavbarCtrl', function ($scope, $rootScope, $location, $window, Auth) {
    /**
     * Checks whether the given view location is currently active in the bar.
     * @param viewLocation the view location to check
     * @return true if it is the current view, otherwise false
     */
    $scope.isActive = function (viewLocation) {
      return $location.path().indexOf(viewLocation) === 0;
    }

    /**
     * Checks whether there is a user logged in.
     * @return true if there is, otherwise false.
     */
    $scope.isLoggedIn = function() {
      return Auth.isLoggedIn();
    }

    /**
     * Checks whether there is a user logged in AND the user has admin role.
     * @return true if there is, otherwise false.
     */
    $scope.isAdmin = function() {
      return Auth.isAdmin();
    }

    /**
     * Logs out and redirect to login view.
     */
    $scope.logout = function() {
      Auth.logout();
      delete $rootScope.user;
      $window.location.href = '/';
    }
  }
);
