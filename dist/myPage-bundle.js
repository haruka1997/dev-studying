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
/******/ 	return __webpack_require__(__webpack_require__.s = 54);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ 1:
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			var styleTarget = fn.call(this, selector);
			// Special case to return head of iframe instead of iframe itself
			if (styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[selector] = styleTarget;
		}
		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(2);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ 2:
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ 54:
/***/ (function(module, exports, __webpack_require__) {

/**
 * myPageController as myPageCtrl
 * マイページ
 */

(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('myPageController', myPageController)
        .directive('fileModel',fileModel);

    myPageController.$inject = ['$scope','$sce','ApiService','$interval','$rootScope'];
    fileModel.$inject = ['$parse'];

    function myPageController($scope, $sce,ApiService,$interval,$rootScope) {
        var myPageCtrl = this;

        myPageCtrl.method = {
            init: init, //初期化
            styleChange: styleChange, //タブスタイルの変更
            clickExplain: clickExplain, //解説のクリック
            clickProblem: clickProblem, //問題のクリック
            clickDetailComp:clickDetailComp, //プロフィール編集完了
            clickCreateBookmark:clickCreateBookmark, //ブックマーク作成クリック
            clickBookmark: clickBookmark, //ブックマーククリック
            clickStudyRecord:clickStudyRecord, //学習記録メニュークリック
            clickPost:clickPost //ポストメニュークリック
        }

        myPageCtrl.value = {
            style: {
                report: "", //レポートスタイル
                studyRecord: "", //学習記録スタイル
                post: "", //ポストスタイル
                bookmark: "" //ブックマークスタイル
            },
            flag: {
                reportFlag: true, //レポートフラグ
                studyRecordFlag: false, //学習記録フラグ
                postFlag: false, //ポストフラグ
                bookmarkFlag: false, //ブックマークフラグ
                loading: true, //読み込み中フラグ
                commentEmpty: false, //コメント空フラグ
                compliting: false, //編集完了中フラグ
                bookmarkList: true, //ブックマークリスト表示フラグ
                bookmarkLoading: false, //ブックマーク読み込み中フラグ
                bookmarkItemEmpty: false, //ブックマークのアイテム空フラグ
                showStudyRecord:false, //学習記録一覧表示フラグ
                showPost: false, //ポスト表示フラグ
                studyRecordLoading: false, //学習記録読み込み中フラグ
                postLoading: false, //ポスト読み込み中フラグ
                showExplainList: false, //解説リスト表示フラグ
                showProblemList: false, //問題リスト表示フラグ
            },
            userInfo: {}, //ユーザ情報
            userReport: [], //ユーザレポート
            userExplain: [], //作成した解説
            userProblem: [], //作成した問題
            explainEvalute: [], //評価した解説
            problemEvalute: [], //評価した問題
            comment: [], //コメント情報
            srcUrl: undefined, //アップロード画像
            detailUserInfo: {}, //編集ユーザ情報
            createBookmark: {}, //新規ブックマーク
            bookmark: [], //ブックマークリスト
            selectBookmark: {}, //選択したブックマーク
            studyRecordList: [], //学習記録リスト,
            postTitle: "" //ポストタブのタイトル
         }

         //スタイルロード
        __webpack_require__(55);

        init();

        /**
         * 初期化メソッド
         */
        function init(){
            $scope.indexCtrl.method.check();　//ユーザログインチェック
            $scope.indexCtrl.method.clickNav(3); //画面デザイン3
            $scope.indexCtrl.value.flag.explainList = false; //解説リスト表示オフ
            //タブスタイルセット
            myPageCtrl.value.style.report = {background: '#fff',color: '#4790BB'};
            myPageCtrl.value.style.studyRecord = {background:'#4790BB',color: '#fff'};
            myPageCtrl.value.style.post = {background:'#4790BB',color: '#fff'};
            myPageCtrl.value.style.bookmark = {background:'#4790BB',color: '#fff'};
            //トップページ読み込み中
            myPageCtrl.value.flag.loading = true;

           /**
            * ユーザ情報取得
            * @type {[String]} ユーザId
            */
           ApiService.getUserInfo($scope.indexCtrl.value.userId).success(
               function(data) {
                   // 通信成功時の処理
                   myPageCtrl.value.userInfo = data.data.user; //ユーザ情報(プロフィール)
                   myPageCtrl.value.userReport = data.data.report; //ユーザレポート(グラフ)
                   myPageCtrl.value.userExplain = data.data.explain; //ユーザが作成した解説
                   myPageCtrl.value.userProblem = data.data.problem; //ユーザが作成した問題
                   chart(); //グラフ描画メソッド呼び出し
               },
               function(data) {
                  console.log("取得失敗")
               }
            );
       }

       /**
        * グラフ描画メソッド
        */
       function chart(){
           //今週の月曜日の月日
           var day = __webpack_require__(9);
           var count = day.calcDate(myPageCtrl.value.userExplain,myPageCtrl.value.userProblem);

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
                      label: "解説", //凡例
                      fill: false,//面の表示
                      lineTension: 0,//線のカーブ
                      backgroundColor: "#8bbdbe",//背景色
                      borderColor: "#8bbdbe",//枠線の色
                      pointBorderColor: "#8bbdbe",//結合点の枠線の色
                      pointBackgroundColor: "#fff",//結合点の背景色
                      pointRadius: 5,//結合点のサイズ
                      pointHoverRadius: 8, //結合点のサイズ（ホバーしたとき）
                      pointHoverBackgroundColor: "#8bbdbe", //結合点の背景色（ホバーしたとき）
                      pointHoverBorderColor: "#8bbdbe",//結合点の枠線の色（ホバーしたとき）
                      pointHitRadius: 15,//結合点より外でマウスホバーを認識する範囲（ピクセル単位）
                      //グラフのデータ
                      data: [count.explain.monday, count.explain.tuesday, count.explain.wednesday, count.explain.thursday, count.explain.friday, count.explain.saturday, count.explain.sunday]
                  },
                  {
                      label: "問題",//凡例
                      fill: false,//面の表示
                      lineTension: 0,//線のカーブ
                      backgroundColor: "#8bbe96",//背景色
                      borderColor: "#8bbe96",//枠線の色
                      pointBorderColor: "#8bbe96",//結合点の枠線の色
                      pointBackgroundColor: "#fff",//結合点の背景色
                      pointRadius: 5,//結合点のサイズ
                      pointHoverRadius: 8,//結合点のサイズ（ホバーしたとき）
                      pointHoverBackgroundColor: "#8bbe96", //結合点の背景色（ホバーしたとき）
                      pointHoverBorderColor: "#8bbe96",//結合点の枠線の色（ホバーしたとき）
                      pointHitRadius: 10,//結合点より外でマウスホバーを認識する範囲（ピクセル単位）
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
        if(myPageCtrl.value.userReport[0] !== undefined){
            //メニュー名の抽出
            var menus = [];
            menus.push(myPageCtrl.value.userReport[0].studyTime.menu); //最初のメニュー名を入れる
            for(var key in myPageCtrl.value.userReport){
                if(menus.indexOf(myPageCtrl.value.userReport[key].studyTime.menu) == -1){
                    menus.push(myPageCtrl.value.userReport[key].studyTime.menu);
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
            for(var i=0; i<myPageCtrl.value.userReport.length; i++){
                for(var key in sumTime){
                    if(key === myPageCtrl.value.userReport[i].studyTime.menu){ //メニュー名が一致したら
                        sumTime[key][myPageCtrl.value.userReport[i].studyTime.week] += myPageCtrl.value.userReport[i].studyTime.time;
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
        //トップ表示
        myPageCtrl.value.flag.loading = false;
       }

       /**
        * ファイルアップロード監視
        */
       $scope.$watch("file",function(file){
           if(!file || !file.type.match("image.*")){
               return;
           }
           var reader = new FileReader();
           reader.onload = function(){
               $scope.$apply(function(){
                   myPageCtrl.value.detailUserInfo.userIcon = reader.result;
               });
           };
           reader.readAsDataURL(file)
       });

       /**
        * タブスタイルの変更
        * @param  {[Number]} style [0:新着情報,1:学習記録]
        */
        function styleChange(style){
            var idx = style - 1;

            var flagAndStyleData = {
                "reportFlag":[true, false, false, false],
                "studyRecordFlag":[false, true, false, false],
                "postFlag":[false,false,true,false],
                "bookmarkFlag":[false,false,false,true],
                "report":[
                    {background: '#fff',color: '#4790BB'},
                    {background: '#4790BB',color: '#fff'},
                    {background: '#4790BB',color: '#fff'},
                    {background: '#4790BB',color: '#fff'}
                ],
                "studyRecord":[
                    {background:'#4790BB',color: '#fff'},
                    {background:'#fff',color: '#4790BB'},
                    {background:'#4790BB',color: '#fff'},
                    {background:'#4790BB',color: '#fff'}
                ],
                "bookmark":[
                    {background:'#4790BB',color: '#fff'},
                    {background:'#4790BB',color: '#fff'},
                    {background:'#4790BB',color: '#fff'},
                    {background:'#fff',color: '#4790BB'},
                ],
                "post":[
                    {background:'#4790BB',color: '#fff'},
                    {background:'#4790BB',color: '#fff'},
                    {background:'#fff',color: '#4790BB'},
                    {background:'#4790BB',color: '#fff'}
                ]
            }

            myPageCtrl.value.flag.reportFlag = flagAndStyleData["reportFlag"][idx];
            myPageCtrl.value.flag.studyRecordFlag = flagAndStyleData["studyRecordFlag"][idx];
            myPageCtrl.value.flag.postFlag = flagAndStyleData["postFlag"][idx];
            myPageCtrl.value.flag.bookmarkFlag = flagAndStyleData["bookmarkFlag"][idx];
            myPageCtrl.value.style.report = flagAndStyleData["report"][idx];
            myPageCtrl.value.style.studyRecord = flagAndStyleData["studyRecord"][idx];
            myPageCtrl.value.style.bookmark = flagAndStyleData["bookmark"][idx];
            myPageCtrl.value.style.post = flagAndStyleData["post"][idx];

            //ブックマークタブ選択
            if(style === 4){
                getBookmark();
            }
        }


        /**
         * 問題ページの遷移メソッド
         * @param  {[Array]} problem [遷移対象の問題]
         * @param  {[boolean]} flag [選択したのは作成した問題か評価した問題か]
         */
        function clickProblem(problem,flag){
            $rootScope.problem = problem;
            if(flag){
                $rootScope.problems = myPageCtrl.value.userProblem; //作成した問題
            }else{
                $rootScope.problems = myPageCtrl.value.problemEvalute; //評価した問題
            }
            $scope.indexCtrl.value.flag.showProblem = true;
        }


        /**
         * プロフィール編集メソッド
         */
        function clickDetailComp(){
            myPageCtrl.value.flag.compliting = true;
            //変更内容の登録
            ApiService.updateUserInfo($scope.indexCtrl.value.userId,myPageCtrl.value.detailUserInfo).success(
               function(data) {
                   // 通信成功時の処理
                   myPageCtrl.value.flag.compliting = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * 新規ブックマーク作成メソッド
         * @param  {[String]} type  [ブックマークの種類]
         * @param  {[String]} range [ブックマークの公開範囲]
         */
        function clickCreateBookmark(type,range){
            myPageCtrl.value.flag.compliting = true;
            myPageCtrl.value.createBookmark.type = type;
            myPageCtrl.value.createBookmark.openRange = range;

            //ブックマークの登録
            ApiService.postBookmark(myPageCtrl.value.createBookmark,$scope.indexCtrl.value.userId).success(
               function(data) {
                   // 通信成功時の処理
                   myPageCtrl.value.flag.compliting = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        };

        /**
         * ブックマークの取得メソッド
         */
        function getBookmark(){
            myPageCtrl.value.flag.bookmarkLoading = true;
            myPageCtrl.value.flag.bookmarkList = true;
            //ブックマークの登録
            ApiService.getBookmark($scope.indexCtrl.value.userId).success(
               function(data) {
                   // 通信成功時の処理
                   myPageCtrl.value.bookmark = data.data;
                   myPageCtrl.value.flag.bookmarkLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
            );
        }

        /**
         * ブックマークアイテム取得メソッド
         * @param  {[Array]} bookmark [選択したブックマーク]
         */
        function clickBookmark(bookmark){
            myPageCtrl.value.selectBookmark = bookmark;
            myPageCtrl.value.flag.bookmarkList = false;
            myPageCtrl.value.flag.bookmarkLoading = true;
            //ブックマークアイテム取得
            ApiService.getBookmarkItem(bookmark.id,bookmark.type).success(
               function(data) {
                   // 通信成功時の処理
                   if(data !== null){
                       if(bookmark.type == '解説'){
                           $rootScope.explainList = data.data;
                       }else{
                           $rootScope.problemList = data.data;
                       }
                       myPageCtrl.value.flag.bookmarkItemEmpty = false;
                   }else{
                       myPageCtrl.value.flag.bookmarkItemEmpty = true;
                   }
                   myPageCtrl.value.flag.bookmarkLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
            );
        }

        /**
         * 解説クリックメソッド
         * @param  {[Array]} explain [クリックした解説]
         */
        function clickExplain(explain,flag) {
            $rootScope.explainModal = explain;
            $scope.indexCtrl.value.flag.showExplain = true;
        }

        /**
         * 学習記録タブクリックメソッド
         * @param  {[String]} type [選択したメニュー種類]
         */
        function clickStudyRecord(type){
            //初期化処理
            $scope.indexCtrl.value.flag.explainList = false;
            myPageCtrl.value.flag.showProblemList = false;
            myPageCtrl.value.flag.showStudyRecord = true;

            if(type == 'makeExplain'){
                $scope.indexCtrl.value.explainList = myPageCtrl.value.userExplain;
                myPageCtrl.value.studyRecordTitle = "作成した解説";
                $scope.indexCtrl.value.flag.explainList = true;
            }else if(type == 'makeProblem'){
                $rootScope.problemList = myPageCtrl.value.userProblem;
                myPageCtrl.value.studyRecordTitle = "作成した問題";
                myPageCtrl.value.flag.showProblemList = true;
            }else if(type == 'evaluteExplain'){
                $scope.indexCtrl.value.flag.explainListLoading = true;
                myPageCtrl.value.studyRecordTitle = "評価した解説";
                getEvalute($scope.indexCtrl.value.userId,type);
            }else{
                $scope.indexCtrl.value.flag.problemListLoading = true;
                myPageCtrl.value.studyRecordTitle = "評価した問題";
                getEvalute($scope.indexCtrl.value.userId,type);
            }
        }

        /**
         * 評価情報の取得メソッド
         * @param  {[String]} userId [ユーザID]
         * @param  {[String]} type   [選択したのは解説か問題か]
         */
        function getEvalute(userId, type){
            //評価情報の取得
            ApiService.getEvalute(userId,type).success(
               function(data) {
                   // 通信成功時の処理
                   if(type == 'evaluteExplain'){
                       $scope.indexCtrl.value.explainList = data.data;
                       $scope.indexCtrl.value.flag.explainListLoading = false;
                       $scope.indexCtrl.value.flag.explainList = true;
                   }else{
                       $rootScope.problemList = data.data;
                       $scope.indexCtrl.value.flag.problemListLoading = false;
                       myPageCtrl.value.flag.showProblemList = true;
                   }
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * ポストタブクリックメソッド
         * @param  {[String]} type [選択したのは解説か問題か]
         */
        function clickPost(type){
            if(type == 'explain'){
                myPageCtrl.value.postTitle = '解説宛てのコメント';
            }else{
                myPageCtrl.value.postTitle = '問題宛てのコメント'
            }
            myPageCtrl.value.flag.showPost = true;
            myPageCtrl.value.flag.postLoading = true;
            //ポスト情報の取得
            ApiService.getPost($scope.indexCtrl.value.userId,type).success(
               function(data) {
                   if(data.status == 0){
                       // 通信成功時の処理
                       var postData = data.data.postData;
                       var itemData = data.data.itemData;

                       for(var i=0; i<postData.length; i++){
                           myPageCtrl.value.comment[i] = {
                               post: postData[i],
                               item: itemData[i]
                           }
                       }
                   }
                myPageCtrl.value.flag.postLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }
    }

    function fileModel($parse){
        return{
            restrict: 'A',
            link: function(scope,element,attrs){
                var model = $parse(attrs.fileModel);
                element.bind('change',function(){
                    scope.$apply(function(){
                        model.assign(scope,element[0].files[0]);
                    });
                });
            }
        };
    }
}());


/***/ }),

/***/ 55:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(56);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./myPage.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./myPage.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 56:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "table.myPage-profileTable {\n    margin: 10px;\n    border-collapse: collapse;\n\tline-height: 1.5;\n\tborder-top: 1px solid #ccc;\n\tborder-left: 3px solid #4790BB;\n    background: #fff;\n    width: 93%;\n}\ntable.myPage-profileTable th {\n\tfont-weight: bold;\n    text-align: center;\n\tcolor: #4790BB;\n\tborder-right: 1px solid #ccc;\n\tborder-bottom: 1px solid #ccc;\n}\ntable.myPage-profileTable td {\n    width: 150px;\n\tpadding: 10px;\n    text-align: left;\n\tvertical-align: center;\n\tborder-right: 1px solid #ccc;\n\tborder-bottom: 1px solid #ccc;\n}\n.myPageBox {\n    position: absolute;\n    top: 150px;\n    width: calc(76% - 25px);\n    margin-left: 26%;\n\n}\n.myPageContent{\n    padding: 0.5em 1em;\n    background-color: #FFFFFF;\n    margin-right: 20px;\n    min-height: 70vh;\n}\n\n.myPageNav{\n    margin-top: 20px;\n}\n.navTitle{\n    background: #f7f7f7;\n    border-left: 7px solid #4790BB;\n    border-bottom: 2px solid #d7d7d7;\n}\n.navTitle h2{\n    padding: 5px 12px;\n    margin: 0;\n    color: #494949;\n    margin-left: 10px;\n}\n\n.myPageNav ul{\n    margin-top: 10px;\n}\n.myPageNav li{\n    font-size: 15px;\n}\n\n.myPage-detailProfile,\n.myPage-bookmarkCreate{\n    padding: 20px;\n}\n\n.myPage-detailProfile input,\n.myPage-detailProfile textarea{\n    width:95%;\n    margin:20px;\n    margin-bottom: 10px;\n}\n\n.myPage-detailProfile label{\n    margin-left: 20px;\n}\n\n.myPage-detailProfile img{\n    margin:20px;\n    margin-top:10px;\n    max-width: 50%;\n    max-height: 40%;\n}\n\n.myPage-profileImg{\n    width: 90%;\n    padding: .5em;\n}\n.chart{\n    padding: 1em;\n}\n.myPage-radioTitle{\n    font-weight: 400;\n    line-height: 1.4;\n    font-size: 14px;\n    color: rgba(0,0,0,.4);\n    margin-bottom: 0;\n}\n\n.myPage-studyRecord-menu{\n    display:flex;\n    margin-top:10px;\n}\n\n.myPage-studyRecord-menu #card{\n    width:50%;\n    float:left;\n    margin:.5em;\n    cursor: pointer;\n    transition: all ease-in-out .2s;\n}\n\n.myPage-studyRecord-menu #card:hover{\n    box-shadow: 0 5px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.24);\n}\n\n.myPage-studyRecord-menu h2{\n    font-size:1.1em;\n}\n\n.myPage-studyRecord-menu span{\n    font-size:1.0em;\n}\n\n.pagination a {\n    cursor: pointer;\n}\n#table-propeller tbody tr{\n    cursor: pointer;\n}\n", ""]);

// exports


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