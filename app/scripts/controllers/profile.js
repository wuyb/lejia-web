'use strict';

/**
 * ProfileCtrl provides the user management actions.
 */
angular.module('webApp')
  .controller('ProfileCtrl', function ($scope, $rootScope, $location, $window, Auth, User) {
    // user must login
    if (!Auth.isLoggedIn()) {
      $location.path('/');
      return;
    }

    $scope.oldPassword = '';
    $scope.password = '';
    $scope.reenterPassword = '';

    $scope.checkPassword = function(form) {
      if ($scope.password !== $scope.reenterPassword) {
        form.reenterPassword.$invalid = true;
        form.reenterPassword.$dirty = true;
      }
    }

    // update password
    $scope.updatePassword = function(form) {
      form.oldPassword.$invalid = false;
      form.oldPassword.$dirty = false;
      form.password.$invalid = false;
      form.password.$dirty = false;
      form.reenterPassword.$invalid = false;
      form.reenterPassword.$dirty = false;

      $scope.error = '';
      if ($scope.oldPassword.trim().length == 0) {
        form.oldPassword.$invalid = true;
        form.oldPassword.$dirty = true;
        $scope.error = $scope.error + '请输入原密码。';
      }
      if ($scope.password.trim().length == 0 || $scope.reenterPassword.trim().length == 0) {
        form.password.$invalid = true;
        form.password.$dirty = true;
        form.reenterPassword.$invalid = true;
        form.reenterPassword.$dirty = true;
        $scope.error = '请输入新密码。';
        return;
      }
      if ($scope.password !== $scope.reenterPassword) {
        form.password.$invalid = true;
        form.password.$dirty = true;
        form.reenterPassword.$invalid = true;
        form.reenterPassword.$dirty = true;
        $scope.error = '密码不匹配，请重新输入。';
        return;
      }

      var currentUser = Auth.getCurrentUser();
      User.changePassword({id: currentUser._id}, {oldPassword: $scope.oldPassword, newPassword: $scope.password}, function() {
        $location.path('/');
      });
    }
  }
);
