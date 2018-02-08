/**
 * fieldListController as fieldListCtrl
 * 分野一覧
 */
(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('fieldListController', fieldListController);

    fieldListController.$inject = ['$scope','$http','$timeout'];

    function fieldListController($scope,$http,$timeout) {
        var fieldListCtrl = this;

        fieldListCtrl.method = {
            clickField: clickField, //分野クリック
            clickShuffle: clickShuffle //シャッフル問題ボタンクリック
        };

        fieldListCtrl.value = {
            menu: "", //メニュー名
            course: "", //コース値
            items: [], //分野
            key: [] //分野のキー(親)
        };

        init();

        /**
         * 初期化メソッド
         */
        function init(){
            $scope.indexCtrl.method.clickNav(1);
            fieldListCtrl.value.menu = $scope.indexCtrl.value.menu;
            fieldListCtrl.value.course = $scope.indexCtrl.value.course;
            if($scope.indexCtrl.value.titleString[2] != undefined){
                $scope.indexCtrl.value.titleString[2] = undefined;
            }
            var url = '././json/' + $scope.indexCtrl.value.menu + '.json'; //JSONファイルURL指定
            jsonRead(url); //JSONファイル読み込み
        }

        /**
         * JSONファイル読み込みメソッド
         * @param  {[String]} url [JSONファイルのURL]
         */
        function jsonRead(url){
            $timeout(function() {
                $http.get(url)
                  .success(function(data) {
                  fieldListCtrl.value.items = data;
                  //分野のキー(親)抽出
                  for(var key in  fieldListCtrl.value.items){
                      fieldListCtrl.value.key.push(key);
                  }
                 })
                .error(function(err) {
                  alert('読み込み失敗');
                });
            });
        }

        /**
         * 分野クリックメソッド
         * @param  {[String]} name  [分野名]
         */
        function clickField(name){
            $scope.indexCtrl.method.directory("","",name);
            //選択コースしたコースによって画面変更
            console.log($scope.indexCtrl.value.course)
            switch($scope.indexCtrl.value.course){
                case 'explain':
                window.location.href = './#/referExplain/';
                $scope.indexCtrl.value.titleUrl[2] = './#/referExplain/';
                break;
                case 'problem':
                window.location.href = './#/problem/' + 'null';
                $scope.indexCtrl.value.titleUrl[2] = './#/problem/' + 'null';
                break;
                case 'makeExplain':
                window.location.href = './#/makeExplain/';
                $scope.indexCtrl.value.titleUrl[2] = './#/makeExplain/';
                break;
                case 'makeProblem':
                window.location.href = './#/makeProblem/';
                $scope.indexCtrl.value.titleUrl[2] = './#/makeProblem/';
                break;
            }
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }

        /**
         * シャッフル問題ボタンクリックメソッド
         */
        function clickShuffle(){
            $scope.indexCtrl.value.titleUrl[2] = './#/shuffleProblem/';
            window.location.href = './#/shuffleProblem/';
            $scope.indexCtrl.method.directory("","","シャッフル問題");
        }
    }
}());
