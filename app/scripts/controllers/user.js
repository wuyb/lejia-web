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
    if (!Auth.isAdmin()) {
      $location.path('/404');
      return;
    }

    // retrieves all the users from backend
    var users = User.query(function() {
      $scope.users = users;
    });

    // retrieves all the roles
    var roles = User.allRoles(function() {
      // remove the normal user role
      for (var i in roles) {
        if (roles[i].value === 'user') {
          roles.splice(i, 1);
        }
      }
      $scope.allRoles = roles;
    });

    $scope.saveUser = function(form) {
      form.username.$dirty = true;
      form.email.$dirty = true;

      if(form.$valid) {
        $scope.user.$save()
        .then(function(user) {
          var users = User.query(function() {
            $scope.users = users;
          });
        })
        .catch(function(err) {
          console.log(err);
          alert("出错了，请联系管理员。");
        });
      }
    }

    $scope.toggleRole = function(role) {
      var index = $scope.user.roles.indexOf(role);
      if (index === -1) {
        $scope.user.roles.push(role);
      } else {
        $scope.user.roles.splice(index, 1);
      }
    }
    $scope.hasRole = function(role) {
      if (!$scope.user) {
        return false;
      }
      for (var i in $scope.user.roles) {
        if ($scope.user.roles[i]._id === role._id) {
          return true;
        }
      }
      return false;
    }
    $scope.editUser = function(user) {
      $scope.user = angular.copy(user);
    }
    $scope.addUser = function() {
      $scope.user = new User({roles: []});
    }
  }
);
