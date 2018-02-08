/**
 * loginController as loginCtrl
 * ログイン
 */

(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('loginController', loginController);

    loginController.$inject = ['$scope','ApiService'];
    function loginController($scope,ApiService) {
        var loginCtrl = this;

        loginCtrl.method = {
            clickSubmit: clickSubmit //ログインボタンクリック
        }

        loginCtrl.value = {
            flag: {
                error: false //ログインエラーフラグ
            },
            user: {} //ユーザ情報
        }

        init(); //初期化処理

        /**
         * 初期化メソッド
         */
        function init(){
            $scope.indexCtrl.method.clickNav(3); //画面スタイルの設定
        }

        /**
         * ログインボタンクリックメソッド
         */
        function clickSubmit(){
            //ログイン情報のポスト
             ApiService.login(loginCtrl.value.user).success(
                function(data) {
                    //ログイン成功
                    if (data.status == 0) {
                        document.cookie = 'userId=' + data.data.userId; //ユーザIDをCookieに保存
                        $scope.indexCtrl.value.userId = data.data.userId; //ユーザIDの保存
                        window.location.href = './#/myPage/'; //マイページに遷移
                    } else {
                        loginCtrl.value.flag.error = true;
                    }
                },
                function () {
                    loginCtrl.value.flag.error = true;
                }
            )
        }
    }
}());
