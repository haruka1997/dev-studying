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
/******/ 	return __webpack_require__(__webpack_require__.s = 57);
/******/ })
/************************************************************************/
/******/ ({

/***/ 4:
/***/ (function(module, exports) {

/*配列並べ替え*/

module.exports.order = function(array, order){
    var orderArray = JSON.parse(array);
    if(order == '新しい順'){
        orderArray.sort(function(a,b){
                if( a.insertTime < b.insertTime ) return 1;
                if( a.insertTime > b.insertTime ) return -1;
                return 0;
        });
    }else if(order == '古い順'){
        orderArray.sort(function(a,b){
                if( a.insertTime < b.insertTime ) return -1;
                if( a.insertTime > b.insertTime ) return 1;
                return 0;
        });
    }else if(order == '難易度が低い順' || order == '理解度が低い順'){
        orderArray.sort(function(a,b){
                if( a.evalute < b.evalute ) return -1;
                if( a.evalute > b.evalute ) return 1;
                return 0;
        });
    }else if(order == '難易度が高い順' || order == '理解度が高い順'){
        orderArray.sort(function(a,b){
                if( a.evalute < b.evalute ) return 1;
                if( a.evalute > b.evalute ) return -1;
                return 0;
        });
    }
    return JSON.stringify(orderArray);
};


/***/ }),

/***/ 57:
/***/ (function(module, exports, __webpack_require__) {

/**
 * myPageController as userPageCtrl
 * マイページ
 */

(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('userPageController', userPageController)

    userPageController.$inject = ['$scope','$sce','ApiService','$interval','$routeParams'];

    function userPageController($scope, $sce,ApiService,$interval,$routeParams) {
        var userPageCtrl = this;

        userPageCtrl.method = {
            init: init, //初期化
            styleChange: styleChange, //タブスタイルの変更
            clickExplain: clickExplain, //解説のクリック
            clickProblem: clickProblem, //問題のクリック
            clickMore: clickMore, //もっと見るクリック
            clickOrder: clickOrder, //並び替えクリック
        }

        userPageCtrl.value = {
            style: {
                report: "", //レポートスタイル
                studyRecord: "", //学習記録スタイル
            },
            flag: {
                reportFlag: true, //レポートフラグ
                studyRecordFlag: false, //学習記録フラグ
                loading: true, //読み込み中フラグ
                studying: false,
            },
            explainOrder: [], //解説の並び替え
            problemOrder: [], //問題の並び替え
            userInfo: {}, //ユーザ情報
            userReport: [], //ユーザレポート
            userExplain: [], //作成した解説
            userProblem: [], //作成した問題
            viewExplain: 5, //一度に表示する解説数
            viewProblem: 5, //一度に表示する問題数
            number: 0,
         }

        init();

        /**
         * 初期化メソッド
         */
        function init(){
            $scope.indexCtrl.method.check();
            $scope.indexCtrl.method.clickNav(4);
            userPageCtrl.value.userId = JSON.parse(base64url.decode($routeParams.userId));
            userPageCtrl.value.style.report = {background: '#fff',color: '#4790BB'};
            userPageCtrl.value.style.studyRecord = {background:'#4790BB',color: '#fff'};
            userPageCtrl.value.flag.loading = true;
            userPageCtrl.value.explainOrder = [
                '新しい順', '古い順', '理解度が低い順', '理解度が高い順'
            ];
            userPageCtrl.value.problemOrder = [
                '新しい順', '古い順', '難易度が高い順', '難易度が低い順'
            ];

            //ユーザ情報取得
           ApiService.getUserInfo(userPageCtrl.value.userId).success(
               function(data) {
                   // 通信成功時の処理
                   userPageCtrl.value.flag.loading = true;
                   userPageCtrl.value.userInfo = data.data.user;
                   userPageCtrl.value.userReport = data.data.report;
                   userPageCtrl.value.userExplain = data.data.explain;
                   userPageCtrl.value.userProblem = data.data.problem;
                   chart();
               },
               function(data) {
                  console.log("取得失敗")
               }
            );
       }

       /*グラフ・表のセット*/
       function chart(){
           //今週の月曜日の月日
           var day = __webpack_require__(9);
           var count = day.calcDate(userPageCtrl.value.userExplain,userPageCtrl.value.userProblem);
           //解説・問題数の棒グラフ

            var line = document.getElementById("countChart");
            var countChart = new Chart(line, {
              //グラフの種類
              type: 'line',
              //データの設定
              data: {
                  //データ項目のラベル
                  labels: ["月", "火", "水", "木", "金", "土", "日"],
                  //データセット
                  datasets: [
                      {
                          //凡例
                          label: "解説",
                          //面の表示
                          fill: false,
                          //線のカーブ
                          lineTension: 0,
                          //背景色
                          backgroundColor: "#8bbdbe",
                          //枠線の色
                          borderColor: "#8bbdbe",
                          //結合点の枠線の色
                          pointBorderColor: "#8bbdbe",
                          //結合点の背景色
                          pointBackgroundColor: "#fff",
                          //結合点のサイズ
                          pointRadius: 5,
                          //結合点のサイズ（ホバーしたとき）
                          pointHoverRadius: 8,
                          //結合点の背景色（ホバーしたとき）
                          pointHoverBackgroundColor: "#8bbdbe",
                          //結合点の枠線の色（ホバーしたとき）
                          pointHoverBorderColor: "#8bbdbe",
                          //結合点より外でマウスホバーを認識する範囲（ピクセル単位）
                          pointHitRadius: 15,
                          //グラフのデータ
                          data: [count.explain.monday, count.explain.tuesday, count.explain.wednesday, count.explain.thursday, count.explain.friday, count.explain.saturday, count.explain.sunday]
                      },
                      {
                          //凡例
                          label: "問題",
                          //面の表示
                          fill: false,
                          //線のカーブ
                          lineTension: 0,
                          //背景色
                          backgroundColor: "#8bbe96",
                          //枠線の色
                          borderColor: "#8bbe96",
                          //結合点の枠線の色
                          pointBorderColor: "#8bbe96",
                          //結合点の背景色
                          pointBackgroundColor: "#fff",
                          //結合点のサイズ
                          pointRadius: 5,
                          //結合点のサイズ（ホバーしたとき）
                          pointHoverRadius: 8,
                          //結合点の背景色（ホバーしたとき）
                          pointHoverBackgroundColor: "#8bbe96",
                          //結合点の枠線の色（ホバーしたとき）
                          pointHoverBorderColor: "#8bbe96",
                          //結合点より外でマウスホバーを認識する範囲（ピクセル単位）
                          pointHitRadius: 10,
                          //グラフのデータ
                          data: [count.problem.monday, count.problem.tuesday, count.problem.wednesday, count.problem.thursday, count.problem.friday, count.problem.saturday, count.problem.sunday]
                      }
                  ]
              },
              //オプションの設定
              options: {
                  //グラフの見出し
                  title: {
                      display: true,
                      text: '作成した解説・問題数',
                      padding:3
                  },
                  //軸の設定
                  scales: {
                      //縦軸の設定
                      yAxes: [{
                          //目盛りの設定
                          ticks: {
                              //最小値を0にする
                              beginAtZero: true
                          }
                      }]
                  },
                  //ホバーの設定
                  hover: {
                      //ホバー時の動作（single, label, dataset）
                      mode: 'single'
                  }
              }
            });

            /*勉強時間の日別集計*/
            //メニュー名の抽出
            var menus = [];
            if(userPageCtrl.value.userReport[0] !== undefined){
                menus.push(userPageCtrl.value.userReport[0].studyTime.menu); //最初のメニュー名を入れる
                for(var key in userPageCtrl.value.userReport){
                    if(menus.indexOf(userPageCtrl.value.userReport[key].studyTime.menu) == -1){
                        menus.push(userPageCtrl.value.userReport[key].studyTime.menu);
                    }
                }
                //オブジェクト整形
                var sumTime = {};
                for(var i=0; i<menus.length; i++){
                    //勉強時間の初期化
                    sumTime[menus[i]] = {
                        0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0
                    };
                }
                //勉強時間の曜日別集計
                for(var i=0; i<userPageCtrl.value.userReport.length; i++){
                    for(var key in sumTime){
                        if(key === userPageCtrl.value.userReport[i].studyTime.menu){ //メニュー名が一致したら
                            sumTime[key][userPageCtrl.value.userReport[i].studyTime.week] += userPageCtrl.value.userReport[i].studyTime.time;
                        }
                    }
                }
            }

            //図のデータセット作成
            var studyTimeData = [];
            var dataColor = ["#8bbdbe","#8bbe96","#8b93be","#be8bad","#be8b8b","#beaf8b","#bcbe8b"];
            for(var key in sumTime){
                var colorIndex = Math.floor(Math.random() * dataColor.length);
                var color = dataColor[colorIndex];
                dataColor.splice(colorIndex,1);
                studyTimeData.push({
                    label: key,
                    borderWidth: 1,
                    backgroundColor:　color,
                    borderColor: color,
                    data: [sumTime[key][1],sumTime[key][2],sumTime[key][3],sumTime[key][4],sumTime[key][5],sumTime[key][6],sumTime[key][0]]
                });
            }

            //作図
            　var time = document.getElementById("studyTimeChart");
              var studyTimeChart = new Chart(time, {
                  type: 'bar',
                  data: {
                      labels: ["月", "火", "水", "木", "金", "土", "日"],
                      datasets: studyTimeData

                  },
                  options: {
                      title: {
                          display: true,
                          text: '分野別学習時間(分)', //グラフの見出し
                          padding:3
                      },
                      scales: {
                          xAxes: [{
                                stacked: true, //積み上げ棒グラフにする設定
                                categoryPercentage:0.4 //棒グラフの太さ
                          }],
                          yAxes: [{
                                stacked: true //積み上げ棒グラフにする設定
                          }]
                      },
                      legend: {
                          labels: {
                                boxWidth:30,
                                padding:20 //凡例の各要素間の距離
                          },
                          display: true
                      },
                      tooltips:{
                        mode:'label' //マウスオーバー時に表示されるtooltip
                      }
                  }
              });
            userPageCtrl.value.flag.loading = false;
       }

       /**
        * タブスタイルの変更
        * @param  {[Number]} style [0:新着情報,1:学習記録]
        */
        function styleChange(style){
            if(style == 1){ //レコード
                userPageCtrl.value.flag.reportFlag = true;
                userPageCtrl.value.flag.studyRecordFlag = false;
                userPageCtrl.value.style.report = {background: '#fff',color: '#4790BB'};
                userPageCtrl.value.style.studyRecord = {background:'#4790BB',color: '#fff'};
            }else if(style == 2){　//学習履歴
                userPageCtrl.value.flag.reportFlag = false;
                userPageCtrl.value.flag.studyRecordFlag = true;
                userPageCtrl.value.style.report = {background: '#4790BB',color: '#fff'};
                userPageCtrl.value.style.studyRecord = {background:'#fff',color: '#4790BB'};
            }
        }

        /**
         * 並び替えクリックメソッド
         * @param  {[String]} choiceOrder [クリックした並び替え]
         * @param  {[Array]} choiceItems [並び替え対象のアイテム]
         * @param  {[String]} choiceName  [並び替えの種類名]
         */
        function clickOrder(choiceOrder,choiceItems,choiceName){
            var order = __webpack_require__(4);
            var orderItems = JSON.stringify(choiceItems); //並び替え前のアイテム
            var orderedItems = JSON.parse(order.order(orderItems,choiceOrder)); //並び替え後のアイテム
            switch(choiceName){
                case 'makeExplain':
                userPageCtrl.value.userExplain = orderedItems;
                break;
                case 'makeProblem':
                userPageCtrl.value.userProblem = orderedItems;
                break;
            }
        }

        /**
         * 解説ページの遷移メソッド
         * @param  {[Array]} explain [遷移対象の解説]
         */
        function clickExplain(explain){
            $scope.indexCtrl.method.directory(explain.menu,0,explain.field);
            window.location.href = './#/explain/';
            $scope.indexCtrl.value.titleUrl[2] = './#/explain/';
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }

        /**
         * 問題ページの遷移メソッド
         * @param  {[Array]} problem [遷移対象の問題]
         */
        function clickProblem(problem){
            $scope.indexCtrl.method.directory(problem.menu,1,problem.field);
            window.location.href = './#/problem/' + 'null';
            $scope.indexCtrl.value.titleUrl[2] = './#/problem/' + 'null';
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }

        /**
         * もっと見るをクリックメソッド
         * @param  {[String]} view [クリックした種類]
         */
        function clickMore(view){
            switch(view){
                case 'explain':
                userPageCtrl.value.viewExplain = userPageCtrl.value.viewExplain + 5;
                break;
                case 'problem':
                userPageCtrl.value.viewProblem = userPageCtrl.value.viewProblem + 5;
                break;
            }
        };
    }
}());


/***/ }),

/***/ 9:
/***/ (function(module, exports) {

module.exports.calcDate = function(userExplain,userProblem){
    var day = new Date().getDay();
    var date = new Date();
    switch(day){
        case 2:
        date.setDate(date.getDate() - 1);
        break;
        case 3:
        date.setDate(date.getDate() - 2);
        break;
        case 4:
        date.setDate(date.getDate() - 3);
        break;
        case 5:
        date.setDate(date.getDate() - 4);
        break;
        case 6:
        date.setDate(date.getDate() - 5);
        break;
        case 0:
        date.setDate(date.getDate() - 6);
        break;
    }

    var monday_month = date.getMonth() + 1;
    var monday_date = date.getDate();
    var explainCount = {
        "monday": 0,
        "tuesday": 0,
        "wednesday": 0,
        "thursday": 0,
        "friday": 0,
        "saturday": 0,
        "sunday": 0
    };
    var problemCount = {
        "monday": 0,
        "tuesday": 0,
        "wednesday": 0,
        "thursday": 0,
        "friday": 0,
        "saturday": 0,
        "sunday": 0
    };
    for(var i=0; i<userExplain.length; i++){
        var month = new Date(userExplain[i].insertTime).getMonth() + 1;
        if(month == monday_month){
            var explain_date = new Date(userExplain[i].insertTime).getDate();
            if(explain_date - monday_date == 0){
                explainCount.monday++;
            }else if(explain_date - monday_date == 1){
                explainCount.tuesday++;
            }else if(explain_date - monday_date == 2){
                explainCount.wednesday++;
            }else if(explain_date - monday_date == 3){
                explainCount.thursday++;
            }else if(explain_date - monday_date == 4){
                explainCount.friday++;
            }else if(explain_date - monday_date == 5){
                explainCount.saturday++;
            }else if(explain_date - monday_date == 6){
                explainCount.sunday++;
            }
        }
    }

    for(var i=0; i<userProblem.length; i++){
        var month = new Date(userProblem[i].insertTime).getMonth() + 1;
        if(month == monday_month){
            var date = new Date(userProblem[i].insertTime).getDate();
            if(date - monday_date == 0){
                problemCount.monday++;
            }else if(date - monday_date == 1){
                problemCount.tuesday++;
            }else if(date - monday_date == 2){
                problemCount.wednesday++;
            }else if(date - monday_date == 3){
                problemCount.thursday++;
            }else if(date - monday_date == 4){
                problemCount.friday++;
            }else if(date - monday_date == 5){
                problemCount.saturday++;
            }else if(date - monday_date == 6){
                problemCount.sunday++;
            }
        }
    }
    var count = [];
    count.explain = explainCount;
    count.problem = problemCount;
    return count;

}


/***/ })

/******/ });