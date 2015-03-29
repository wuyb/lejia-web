'use strict';

/**
 * @ngdoc function
 * @name webApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the webApp
 */
angular.module('webApp')
  .controller('VideoCtrl', function ($scope, $location, $filter, $window, FileUploader, configuration, Storage, Video, Auth) {
    // user must login and have admin or editor role in order to access this page
    if (!Auth.isLoggedIn()) {
      $location.path('/');
      return;
    }
    if (!Auth.isAdmin() && !Auth.hasRole('editor')) {
      $location.path('/404');
      return;
    }

    // dirty trick : stop video playing after the modal is dismissed
    $('#play-video-modal').on('hidden.bs.modal', function () {
        var video = videojs('video-player');
        video.pause();
    });

    $scope.mineOnly = false;

    $scope.getVideos = function() {
      if ($scope.mineOnly) {
        return $filter('filter')($scope.videos,
          function(video, index) {
            return video.createdBy._id === Auth.getCurrentUser()._id;
          }
        );
      }
      return $scope.videos;
    }

    $scope.categories = Video.getCategories(function() {
      $scope.currentCategory = $scope.categories[0];
      $scope.videos = Video.query({'category':$scope.currentCategory.value});
    });

    $scope.canEdit = function(video) {
      return Auth.isAdmin() || video.createdBy._id === Auth.getCurrentUser()._id;
    }


    $scope.play = function(video) {
      $scope.video = video;
      // get download token
      Storage.getDownloadUrl(video.key, function(err, data) {
        // start playing
        var video = videojs('video-player');
        video.src(data.url);
        video.play();
      });
    }
    $scope.delete = function(video) {
      if (!$window.confirm('确定要删除吗？')) {
        return;
      }

      video.$delete(function() {
        $scope.reloadCategory($scope.currentCategory);
      });
    }

    $scope.reloadCategory = function(category) {
      if ($scope.currentCategory) {
        $scope.videos = Video.query({'category': $scope.currentCategory.value});
      } else {
        $scope.videos = Video.query({'category':'none'});
      }
    }
    $scope.switchCategory = function(category) {
      $scope.currentCategory = category;
      $scope.reloadCategory(category);
    }

    /// edit video metadata ///
    $scope.edit = function(video) {
      $scope.video = angular.copy(video);
    }

    $scope.setVideoCategory = function(category) {
      $scope.video.category = category;
    }

    $scope.saveVideoMetadata = function(form) {
      $scope.loading = true;
      $scope.video.$update().then(function(video) {
        $scope.loading = false;
        $scope.reloadCategory($scope.currentCategory);
        $('#video-metadata-modal').modal('hide');
      }).catch(function(err) {
        console.log('Cannot save video metadata : ' + JSON.stringify(err));
        $scope.loading = false;
        $('#video-metadata-modal').modal('hide');
      })
    }

    //// upload related ////
    $scope.getUpToken = function(callback) {
      Storage.getUpToken(function(err, token) {
        callback(token.uptoken);
      });
    }

    // configure the uploader
    var uploader = $scope.uploader = new FileUploader({
      url: 'http://up.qiniu.com',
      queueLimit: 1,
      removeAfterUpload: true
    });
    uploader.filters.push({
        name: 'videoFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|x-msvideo|x-ms-wmv|quicktime|mp4|avi|mpeg|'.indexOf(type) !== -1;
        }
    });

    $scope.upload = function(item) {
      $scope.getUpToken(function(token) {
        item.formData = [{'token': token}];
        item.upload();
      });
    }

    $scope.resetFileSelector = function() {
      // dirty trick to reset the file input
      var fileSelector = $('#file-selector');
      fileSelector.wrap('<form>').closest('form').get(0).reset();
      fileSelector.unwrap();
    }

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
        $scope.upload(fileItem);
        $scope.item = fileItem;
        $scope.uploading = true;
        $scope.loading = true;
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        // notify the server that the upload is done
        Storage.finishUpload(response.key, response.hash, fileItem.file.name, fileItem.file.size, function(err, data) {
          $scope.item = null;
          $scope.uploading = false;
          $scope.loading = false;
          // when uploading has been done, show the edit modal
          $('#video-metadata-modal').modal('show');
          $scope.edit(new Video(data.video));
        });
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        $scope.item = null;
        $scope.uploading = false;
        $scope.loading = false;
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        $scope.resetFileSelector();
    };

  });
