/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 58);
/******/ })
/************************************************************************/
/******/ ({

/***/ 58:
/***/ (function(module, exports) {

/**
 * groupStudyController as groupStudyCtrl
 * グループ学習
 */
(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('groupStudyController', groupStudyController);

    groupStudyController.$inject = ['$scope', '$sce','ApiService'];
    function groupStudyController($scope,$sce,ApiService) {
        var groupStudyCtrl = this;

        groupStudyCtrl.method = {
            init:init, //初期化
            clickCreateGroup: clickCreateGroup, //グループ作成
            styleChange: styleChange, //タブスタイル変更
            clickGroup: clickGroup, //グループクリック
            clickEnroll:clickEnroll, //グループ入会
            clickWithdraw:clickWithdraw, //グループ退会
            clickCreateQuestion:clickCreateQuestion, //質問作成クリック
            clickQuestion: clickQuestion, //質問クリック
            clickAnswer: clickAnswer, //回答クリック
            getQuestion: getQuestion, //質問取得
            clickEvalute:clickEvalute, //回答評価クリック
            clickUser: clickUser //ユーザクリック
        }

        groupStudyCtrl.value = {
            style: {
                baseInfo: "", //基本情報スタイル
                question: "", //質問スタイル
                clickGood: "",　//いいねスタイル
                clickBad: "", //わるいねスタイル
            },
            flag: {
                baseInfo: true, //基本情報フラグ
                question: false, //質問フラグ
                top: true, //グループ学習トップフラグ
                topLoading: false, //トップ読み込み中フラグ
                answerLoading: false, //回答読み込み中フラグ
                questionLoading: false, //質問読み込み中フラグ
                groupLoading: false, //グループ読み込み中フラグ
                compliteLoading: false, //完了中フラグ
                showQuestion: false, //質問表示フラグ
                inputAnswer: false, //回答入力表示フラグ
                questionEmpty: false, //質問なしフラグ
                answerEmpty: false, //回答なしフラグ
                clickGood: false, //いいねクリックフラグ
                clickBad: false, //わるいねクリックフラグ
                belong: false //グループに所属しているかフラグ
            },
            createGroupItems: [], //新規グループ
            myGroup: [], //マイグループ
            groups: [], //グループ
            selectGroup: [], //選択したグループ
            createQuestion: [], //新規質問
            inputAnswer: [], //入力回答
            questions: [], //質問
            selectQuestion: [], //選択した質問
            answers: [], //回答
            complite : "" //完了文
        }

        init();

        /**
         * 初期化メソッド
         */
        function init(){
            $scope.indexCtrl.method.clickNav(4); //グループ学習用レイアウト
            groupStudyCtrl.value.flag.top = true;
            //メニュータブスタイル
            groupStudyCtrl.value.style.baseInfo = {background: '#fff',color: '#4790BB'};
            groupStudyCtrl.value.style.question = {background:'#4790BB',color: '#fff'};
            groupStudyCtrl.value.myGroup = [];
            groupStudyCtrl.value.groups = [];
            groupStudyCtrl.value.selectGroup = [];
            groupStudyCtrl.value.questions = [];
            groupStudyCtrl.value.selectQuestion = [];
            groupStudyCtrl.value.answers = [];
            groupStudyCtrl.value.flag.topLoading = true;
            //マイグループの取得
            ApiService.getmyGroup($scope.indexCtrl.value.userId).success(
               function(data) {
                   // 通信成功時の処理
                   if(data !== null){
                       groupStudyCtrl.value.myGroup = data.data;
                   }
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
           //新着グループの取得
           ApiService.getGroups().success(
              function(data) {
                  // 通信成功時の処理
                 groupStudyCtrl.value.groups = data.data;
                 groupStudyCtrl.value.flag.topLoading = false;
              },
              function(data) {
                 console.log("取得失敗")
              }
          );
        }

        /**
         * グループ作成メソッド
         */
        function clickCreateGroup(){
            groupStudyCtrl.value.flag.compliteLoading = true;
            //グループ登録
            ApiService.postGroup(groupStudyCtrl.value.createGroupItems).success(
               function(data) {
                   // 通信成功時の処理
                   // ユーザのグループ登録
                  ApiService.postUserGroup(data.data.id,$scope.indexCtrl.value.userId).success(
                     function(data) {
                         // 通信成功時の処理
                        groupStudyCtrl.value.complite = "新規グループを作成しました。";
                        groupStudyCtrl.value.flag.compliteLoading = false;
                     },
                     function(data) {
                        console.log("取得失敗")
                     }
                 );
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * グループクリックメソッド
         * @param  {[Array]} group [クリックしたグループ]
         */
        function clickGroup(group){
            groupStudyCtrl.value.flag.top = false; //グループ学習トップfalse
            groupStudyCtrl.value.selectGroup = group;
            groupStudyCtrl.value.questions = [];
            groupStudyCtrl.value.selectQuestion = [];
            groupStudyCtrl.value.answers = [];
            groupStudyCtrl.value.flag.groupLoading = true;

            //グループのユーザ情報の取得
            ApiService.getUserGroup(group.id).success(
               function(data) {
                   // 通信成功時の処理
                 var user = [];
                 for(var i=0; i<data.data.length; i++){
                     data.data[i].userInfo.id = data.data[i].id;
                     user.push(data.data[i].userInfo);
                 }
                 groupStudyCtrl.value.selectGroup.user = user;

                 //クリックしたグループに所属しているか
                 for(var key in groupStudyCtrl.value.selectGroup.user){
                     if(-1 !== groupStudyCtrl.value.selectGroup.user[key].userId.indexOf($scope.indexCtrl.value.userId)){
                         groupStudyCtrl.value.flag.belong = true;
                         break;
                     }else{
                         groupStudyCtrl.value.flag.belong = false;
                     }
                 }
                 styleChange(0); //タブスタイル変更
                 groupStudyCtrl.value.flag.groupLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * グループ入会メソッド
         */
        function clickEnroll(){
            groupStudyCtrl.value.flag.compliteLoading = true;
            //プループ入会
           ApiService.postUserGroup(groupStudyCtrl.value.selectGroup.id,$scope.indexCtrl.value.userId).success(
              function(data) {
                  // 通信成功時の処理
                  groupStudyCtrl.value.complite = "グループに入会しました。";
                  groupStudyCtrl.value.flag.compliteLoading = false;
              },
              function(data) {
                 console.log("取得失敗")
              }
          );
        }

        /**
         * グループ退会メソッド
         */
        function clickWithdraw(){
            groupStudyCtrl.value.flag.compliteLoading = true;
            var userGroupId;
            for(var key in groupStudyCtrl.value.selectGroup.user){
                if(groupStudyCtrl.value.selectGroup.user[key].userId === $scope.indexCtrl.value.userId){
                    userGroupId = groupStudyCtrl.value.selectGroup.user[key].id;
                }
            }
            //グループ退会
            ApiService.withdrawGroup(userGroupId).success(
               function(data) {
                   // 通信成功時の処理
                  groupStudyCtrl.value.complite = "グループを退会しました";
                  groupStudyCtrl.value.flag.compliteLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * 質問作成メソッド
         */
        function clickCreateQuestion(){
            groupStudyCtrl.value.flag.compliteLoading = true;
            groupStudyCtrl.value.createQuestion.userId = $scope.indexCtrl.value.userId;
            groupStudyCtrl.value.createQuestion.groupId = groupStudyCtrl.value.selectGroup.id;
            //質問の投稿
            ApiService.postQuestion(groupStudyCtrl.value.createQuestion).success(
               function(data) {
                   // 通信成功時の処理
                  groupStudyCtrl.value.complite = "質問を投稿しました";
                  groupStudyCtrl.value.flag.compliteLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * 質問クリックメソッド
         * @param  {[Array]} question [クリックした質問]
         */
        function clickQuestion(question){
            groupStudyCtrl.value.flag.inputAnswer = false;
            groupStudyCtrl.value.inputAnswer = [];
            groupStudyCtrl.value.answers = [];
            groupStudyCtrl.value.flag.showQuestion = true;
            groupStudyCtrl.value.selectQuestion = question;
            groupStudyCtrl.value.flag.answerLoading = true;
            //回答の取得
            ApiService.getAnswer(groupStudyCtrl.value.selectQuestion.id).success(
               function(data) {
                   if(data !== null){
                      groupStudyCtrl.value.answers = data.data;
                      console.log(groupStudyCtrl.value.answers)
                      groupStudyCtrl.value.flag.answerEmpty = false;
                    }else{
                      groupStudyCtrl.value.flag.answerEmpty = true;
                    }
                  groupStudyCtrl.value.flag.answerLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * 回答クリックメソッド
         */
        function clickAnswer(){
            groupStudyCtrl.value.flag.compliteLoading = true;
            groupStudyCtrl.value.inputAnswer.userId = $scope.indexCtrl.value.userId;
            groupStudyCtrl.value.inputAnswer.questionId = groupStudyCtrl.value.selectQuestion.id;
            groupStudyCtrl.value.inputAnswer.good = 0;
            groupStudyCtrl.value.inputAnswer.bad = 0;
            //回答を投稿する
            ApiService.postAnswer(groupStudyCtrl.value.inputAnswer).success(
               function(data) {
                   // 通信成功時の処理
                  groupStudyCtrl.value.complite = "回答を投稿しました";
                  groupStudyCtrl.value.flag.compliteLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * タブスタイル変更メソッド
         * @param  {[Number]} styleNum [0: 基本情報, 1:質問コーナ]
         */
        function styleChange(styleNum){
            if(styleNum == 0){
                groupStudyCtrl.value.flag.baseInfo = true;
                groupStudyCtrl.value.flag.question = false;
                groupStudyCtrl.value.style.baseInfo = {background: '#fff',color: '#4790BB'};
                groupStudyCtrl.value.style.question = {background:'#4790BB',color: '#fff'};
            }else if(styleNum == 1){
                getQuestion();
                groupStudyCtrl.value.flag.baseInfo = false;
                groupStudyCtrl.value.flag.question = true;
                groupStudyCtrl.value.style.baseInfo = {background: '#4790BB',color: '#fff'};
                groupStudyCtrl.value.style.question = {background:'#fff',color: '#4790BB'};
            }
        }

        /**
         * 質問取得メソッド
         */
        function getQuestion(){
            groupStudyCtrl.value.flag.showQuestion = false;
            groupStudyCtrl.value.questions = [];
            groupStudyCtrl.value.flag.questionLoading = true;
            //質問の投稿
            ApiService.getQuestion(groupStudyCtrl.value.selectGroup.id).success(
               function(data) {
                   // 通信成功時の処理
                  if(data.data.length !== 0){
                      groupStudyCtrl.value.questions = data.data;
                      groupStudyCtrl.value.flag.questionEmpty = false;
                  }else{
                      groupStudyCtrl.value.flag.questionEmpty = true;
                  }
                  groupStudyCtrl.value.flag.questionLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * 回答評価のクリックメソッド
         * @param  {[Array]} answer [評価した回答]
         * @param  {[String]} value  [クリックした評価]
         */
        function clickEvalute(answer, value){
            if(value == 'good'){
                answer.good = Number(answer.good) + 1;
                //評価情報を登録する
                ApiService.postAnswer(answer);

            }else{
                answer.bad = Number(answer.bad) + 1;
                //評価情報を登録する
                ApiService.postAnswer(answer);
            }
        }

        function clickUser(userId){
            var userIdString = JSON.stringify(userId);
            var userIdString = base64url.encode(userIdString);
            var url = './#/userPage/' + userIdString;
            window.open(url);
        }
    }
}());


/***/ })

/******/ });