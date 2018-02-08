/**
 * indexController as indexCtrl
 * 共通メソッド,　共通フィールドの管理
 */

(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('indexController', indexController);

    indexController.$inject = ['$scope','$interval','ApiService'];
    function indexController($scope,$interval,ApiService) {
        $scope.indexCtrl = this;

        $scope.indexCtrl.method = {
            clickMenu: clickMenu,  //メニュークリック
            clickNav: clickNav, //グローバルナビクリック
            check: check, //ログインチェック
            directory: directory, //ディレクトリ割り当て
            clickUrl: clickUrl, //パンくずリストクリック
            GetCookie: GetCookie, //クッキーの取得
        };

        $scope.indexCtrl.value = {
            course: GetCookie('course'), //コース
            field: GetCookie('field'), //フィールド名
            menu: GetCookie('menu'), //メニュー名
            style: {
                styleCourse: "", //コースのスタイル
                styleMyPage: "", //マイページのスタイル
            },
            flag:{
                isCourse: false, //コース画面かどうか
                isLogin: false //ログインされたか
            },
            userId: GetCookie('userId'), //ユーザID
            userName: GetCookie('userName'), //ユーザ名
            titleString: [], //タイトル名
            titleUrl: [], //タイトルURL
            src: {
                log: "" //ロゴ画像
            }
        };        

        //　imageインポート
        $scope.indexCtrl.value.src.log = require('./../../img/E-learning-log.png');

        init();

        /**
         * 初期化メソッド
         */
        function init(){
            $scope.indexCtrl.value.style.styleCourse = {borderBottom:'solid #4790BB'}; //ナビのスタイル変更(コース)

            //パンくずリストの初期化
            for(var i=0; i<3; i++){
                $scope.indexCtrl.value.titleString[i] = GetCookie('titleString[' + i + ']');
                $scope.indexCtrl.value.titleUrl[i] = GetCookie('titleUrl[' + i + ']');
            }
        }

        /**
         * メニュークリックメソッド
         * @param  {[String]} name [メニュー名]
         */
        function clickMenu(name){
            directory(name,"",""); //選択したメニュー名の保存
            window.location.href = './#/course/'; //コース画面に遷移
        };

        /**
         * グローバルナビクリックメソッド
         * 画面のスタイル設定
         * @param  {[Number]} choiceNavi [1:コース,2:マイページ,3:その他]
         */
        function clickNav(choiceNavi){
            if(choiceNavi == 1){ //コース選択時
                $scope.indexCtrl.value.flag.isCourse = false;
                $scope.indexCtrl.value.style.styleCourse = {borderBottom:'solid #4790BB'};
                $scope.indexCtrl.value.style.styleMyPage = {borderBottom: '#fff'};
            }else if(choiceNavi == 2){
                $scope.indexCtrl.value.flag.isCourse = true;
                $scope.indexCtrl.value.style.styleMyPage = {borderBottom:'solid #4790BB'};
                $scope.indexCtrl.value.style.styleCourse = {borderBottom: '#fff'};
            }else if(choiceNavi == 3){
                $scope.indexCtrl.value.flag.isCourse = true;
                $scope.indexCtrl.value.style.styleMyPage = {borderBottom: '#fff'};
                $scope.indexCtrl.value.style.styleCourse = {borderBottom: '#fff'};
            }
        };

        /**
         * ディレクトリ割り当てメソッド
         * @param  {[String]} menu   [メニュー名]
         * @param  {[String]} course [コース名]
         * @param  {[String]} field  [フィールド名]
         */
        function directory(menu,course,field){
            if(menu !== ""){ //メニュー名が指定されたらメニュー名の保存処理
                $scope.indexCtrl.value.menu = menu;
                document.cookie = 'menu=' + $scope.indexCtrl.value.menu;
                $scope.indexCtrl.value.titleString[0] = GetCookie('menu');
                document.cookie = 'titleString[0]=' + $scope.indexCtrl.value.titleString[0];
                $scope.indexCtrl.value.titleUrl[0] = './#/course/';
                document.cookie = 'titleUrl[0]=' + $scope.indexCtrl.value.titleUrl[0];
            }
            if(course !== ""){ //コースが指定されたらコースの保存処理
                $scope.indexCtrl.value.course = course;
                document.cookie = 'course=' + $scope.indexCtrl.value.course;
                $scope.indexCtrl.value.titleString[1] = ' > ' + courseTitle(GetCookie('course'));
                document.cookie = 'titleString[1]=' + $scope.indexCtrl.value.titleString[1];
                $scope.indexCtrl.value.titleUrl[1] = './#/fieldList/';
                document.cookie = 'titleUrl[1]=' + $scope.indexCtrl.value.titleUrl[1];
            }
            if(field !== ""){ //分野が指定されたら分野の保存処理
                $scope.indexCtrl.value.field = field;
                document.cookie = 'field=' + $scope.indexCtrl.value.field;
                $scope.indexCtrl.value.titleString[2] = ' > ' + GetCookie('field');
                document.cookie = 'titleString[2]=' + $scope.indexCtrl.value.titleString[2];
            }
        }

        /**
         * ログインチェックメソッド
         */
        function check(){
            if($scope.indexCtrl.value.userId == undefined){ //ユーザIDが保存されていなかったら
                $scope.indexCtrl.value.flag.isLogin = false;
                window.location.href = './#/login/'; //ログイン画面に遷移
            }else{
                $scope.indexCtrl.value.flag.isLogin = true;
            }
        }

        /**
         * パンくずリストチェック
         * @param  {[String]} url [1:1番目のURL,2:2番目のURL,3:3番目のURL]
         */
        function clickUrl(url){
            switch(url){
                case 1: //1番目のURL(メニュー名)をクリックした時
                    window.location.href = $scope.indexCtrl.value.titleUrl[0]; //コース画面に遷移
                    break;
                case 2: //2番目のURL(コース一覧)をクリックした時
                    window.location.href = $scope.indexCtrl.value.titleUrl[1]; //分野選択画面に遷移
                    break;
            }
        }

        /**
         * コースタイトルの変換メソッド
         * @param  {[String]} course
         */
        function courseTitle(course){
            switch(course){
                case 'explain':
                    return "解説一覧"
                    break;
                case 'problem':
                    return "問題一覧"
                    break;
                case 'makeExplain':
                    return "解説作成一覧"
                    break;
                case 'makeProblem':
                    return "問題作成一覧"
                    break;
            }
        }

        /**
         * クッキーの取得メソッド
         * @param       {[String]} name [クッキーの値]
         * @constructor
         */
        function GetCookie(name){
            var result = null;
            var cookieName = name + '=';
            var allcookies = document.cookie;
            var position = allcookies.indexOf( cookieName );
            if( position != -1 )
            {
                var startIndex = position + cookieName.length;
                var endIndex = allcookies.indexOf( ';', startIndex );
                if( endIndex == -1 ){
                    endIndex = allcookies.length;
                }

                result = decodeURIComponent(
                    allcookies.substring( startIndex, endIndex ) );
            }
            return result;
        }
    }
}());
