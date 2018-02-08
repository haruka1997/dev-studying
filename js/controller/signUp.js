/**
 * signUpController as signUpCtrl
 * 新規登録
 */
(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('signUpController', signUpController);

    signUpController.$inject = ['$scope','ApiService'];
    function signUpController($scope,ApiService) {
        var signUpCtrl = this;

        signUpCtrl.method = {
            clickSubmit: clickSubmit, //新規登録ボタンクリック
            clickLogin: clickLogin //ログインボタンクリック
        }

        signUpCtrl.value = {
            userName: '', //ユーザ名
            email: '', //メールアドレス
            password: '', //パスワード
            flag: {
                empty: false, //未入力チェック
                email: false, //既メールアドレスチェック
                regist: false //新規登録フォーム
            }
        }
        init();

        /**
         * 初期化メソッド
         */
        function init(){
            $scope.indexCtrl.method.clickNav(3); //画面スタイルの設定
        }

        /**
         * 新規登録ボタンクリックメソッド
         */
        function clickSubmit(){
            //入力チェック
            if(signUpCtrl.value.userName == '' && signUpCtrl.value.email == '' && signUpCtrl.value.password == ''){
                signUpCtrl.value.flag.empty = true;
            }else{
                //新規登録情報のポスト
                ApiService.signUp(signUpCtrl.value.userName,signUpCtrl.value.email,sha256(signUpCtrl.value.password)).success(
                   function(data) {
                       // 通信成功時の処理
                       switch(data.data.status){
                           case 5: //未入力
                               signUpCtrl.value.flag.empty = true;
                               break;
                           case 2: //メールアドレス登録済み
                               signUpCtrl.value.flag.email =  true;
                               break;
                           default :
                               signUpCtrl.value.flag.empty = false;
                               signUpCtrl.value.flag.email = false;
                               signUpCtrl.value.flag.regist = true;
                               break;
                        }
                   },
                   function() {
                      console.log("取得失敗")
                   }
               );
            }
        }

        /**
         * ログインボタンクリックメソッド
         */
        function clickLogin(){
            window.location.href = './#/login'; //ログイン画面に遷移
        }
    }
}());
