'use strict';

/**
 * @ngdoc function
 * @name webApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the webApp
 */
angular.module('webApp')
  .controller('VideoCtrl', function ($scope, $location, FileUploader, configuration, Storage, Video, Auth) {
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

    // get the list of videos
    var videos = Video.query(function() {
      $scope.videos = videos;
    });

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
      video.$delete(function() {
        var videos = Video.query(function() {
          $scope.videos = videos;
        });
      });
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
        Storage.finishUpload(response.key, response.hash, fileItem.file.name, fileItem.file.size, function(data) {
          $scope.item = null;
          $scope.uploading = false;
          $scope.loading = false;
          videos = Video.query(function() {
            $scope.videos = videos;
          });
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
