/**
 * makeExplainController as makeExplainCtrl
 * 解説を作成する
 */
(function() {

    angular
        .module('learnApp')
        .controller('makeExplainController', makeExplainController)

    makeExplainController.$inject = ['$scope','ApiService'];

    function makeExplainController($scope,ApiService) {
        var makeExplainCtrl = this;

        makeExplainCtrl.value = {
            flag: {
                submiting: false //解説投稿中
            }
        };

        makeExplainCtrl.method = {
            clickMake: clickMake, //解説作成ボタンクリック
            goExplain: goExplain, //解説を見るボタンクリック
        };

        //スタイルロード
        require('./../../../css/explain/makeExplain.css');
        require('./../../../css/commonExplain.css');

        //グローバル変数の読み込み
        makeExplainCtrl.globalParam = require('./explainParam');

        //初期化メソッド
        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            $scope.indexCtrl.method.clickNav(1); //画面スタイル設定
            makeExplainCtrl.globalParam.value.makeExplain = undefined;
            makeExplainCtrl.globalParam.flag.makeExplain = true;
        }

        /**
         * 解説作成ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickMake(){
            var makeExplain = makeExplainCtrl.globalParam.value.explainForm; //作成した解説を退避
            makeExplainCtrl.value.flag.submiting = true; //解説投稿中オン
            /**
             * 解説の登録
             * @type {object} 作成した解説
             * @type {String} ユーザID
             * @type {String} 分野名
             * @type {String} メニュー名
             */
            ApiService.postExplain(makeExplain,$scope.indexCtrl.value.userId,$scope.indexCtrl.value.field,$scope.indexCtrl.value.menu).success(
                function(data) {
                    makeExplainCtrl.value.flag.submiting = false; //解説投稿中オフ
                }
            );
        }

        /**
         * 解説を見るボタンクリックメソッド
         * @return {[type]} [description]
         */
        function goExplain(){
            makeExplainCtrl.globalParam.flag.makeExplain = false;
            makeExplainCtrl.globalParam.value.makeExplain = undefined;
            $scope.indexCtrl.method.directory("",0,""); //ディレクトリセット
            window.location.href = './#/explain/'; //解説画面に移動
            //ディレクトリパスの保存
            $scope.indexCtrl.value.titleUrl[2] = './#/explain/';
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }
    }
}());
