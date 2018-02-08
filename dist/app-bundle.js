webpackJsonp([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */
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
/* 4 */
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

var	fixUrls = __webpack_require__(183);

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
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */
/***/ (function(module, exports) {

module.exports = {
    value:{
        explainList: undefined,
        explainModal:undefined,
        editExplain:undefined,
        previewExplain:undefined,
        makeExplain:undefined
    },
    flag :{
        explainList: false,
        explainModal: false,
        editExplain: false,
        previewExplain: false,
        makeExplain: false,
        explainListLoading: false
    }
};


/***/ }),
/* 15 */
/***/ (function(module, exports) {

/*文字列変換メソッド*/
module.exports.markupChange = function(explain,imgUrl){
    var changeExplain =  explain;
        /*空白処理*/
        changeExplain = changeExplain.replace(/\r?\n/g, "<br>");
        changeExplain = changeExplain.replace(/\s+$/g,"");

        //マークアップ処理
        changeExplain = changeExplain.split('#title').join("<div style='font-size:20px;font-weight:bold;margin-bottom:-10px;'>");
        changeExplain = changeExplain.split('#').join("</div>");
        changeExplain = changeExplain.split('%red').join("<span style='color:red;'>");
        changeExplain = changeExplain.split('%').join("</span>");
        changeExplain = changeExplain.split('*bold').join("<b>");
        changeExplain = changeExplain.split('*').join("</b>");
        changeExplain = changeExplain.split('_under').join("<u>");
        changeExplain = changeExplain.split('_').join("</u>");
        changeExplain = changeExplain.split('&mark').join("<span style='background: linear-gradient(transparent 10%, #b0d7f4 0%);'>");
        changeExplain = changeExplain.split('&').join("</span>");
        if(imgUrl !== undefined){
            changeExplain = changeExplain.split('[アップロード画像]').join("<img src=" + imgUrl + " style='max-width:80%'><br>");
        }

    　　 return changeExplain;
}


/***/ }),
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */
/***/ (function(module, exports) {

module.exports = {
    value:{
        problemList: undefined,
        showProblem:undefined,
        detailProblem:undefined,
        previewProblem:undefined,
        makeProblem:undefined
    },
    flag :{
        problemList: false,
        showProblem: false,
        detailProblem: false,
        previewProblem: false,
        makeProblem: false,
        problemListLoading: false
    }
};


/***/ }),
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(194);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./list.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./list.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 44 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,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"

/***/ }),
/* 45 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,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"

/***/ }),
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,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"

/***/ }),
/* 84 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,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"

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(204);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./makeExplain.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./makeExplain.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(206);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./commonExplain.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./commonExplain.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

module.exports.calcEvalute = function(data){
    //画像ロード
    var dif_img = __webpack_require__(209);
    var und_img = __webpack_require__(210);
    var dif_sum = 0;
    var und_sum = 0;
    var averageEvalute = {
        difficult: 0,
        understand: 0
    };
    //平均評価値の算出
    for(var i=0; i<data.length;i++){
        if(typeof data[i].evalute !== 'object'){
            data[i].evalute = {};
            data[i].evalute.difficult = 0;
            data[i].evalute.understand = 0;
        }
        dif_sum += data[i].evalute.difficult;
        und_sum += data[i].evalute.understand;
    }
    averageEvalute.difficult = Math.floor(dif_sum / data.length);
    averageEvalute.understand = Math.floor(und_sum / data.length);
    //表示する評価の形式
    for(var i=0; i<data.length; i++){
        data[i].showEvalute = {
            difficult: [],
            understand: []
        };
        //難易度
        if(data[i].evalute.difficult > averageEvalute.difficult){ //難易度!!!
            for(var j=0; j<3; j++){
                data[i].showEvalute.difficult.push(dif_img);
            }
        }else if(data[i].evalute.difficult == averageEvalute.difficult){//難易度!!
            for(var j=0; j<2; j++){
                data[i].showEvalute.difficult.push(dif_img);
            }
        }else if(data[i].evalute.difficult < averageEvalute.difficult){ //難易度!
            data[i].showEvalute.difficult.push(dif_img);
        }
        //理解度
        if(data[i].evalute.understand > averageEvalute.understand){ //理解度・・・
            for(var j=0; j<3; j++){
                data[i].showEvalute.understand.push(und_img);
            }
        }else if(data[i].evalute.understand == averageEvalute.understand){//理解度・・
            for(var j=0; j<2; j++){
                data[i].showEvalute.understand.push(und_img);
            }
        }else if(data[i].evalute.understand < averageEvalute.understand){ //理解度・
            data[i].showEvalute.understand.push(und_img);
        }
    }
    return data;
};


/***/ }),
/* 88 */
/***/ (function(module, exports) {

/*配列並べ替え*/

module.exports.order = function(array, order,mark){
    var orderArray = JSON.parse(array);
    console.log(orderArray);
    if(order == '作成日'){
        if(mark.insertTime == '▲'){ //現在の並びが古い順の場合は,新しい順に並び替え
            mark.insertTime = '▼';
            orderArray.sort(function(a,b){
                    if( a.insertTime < b.insertTime ) return 1;
                    if( a.insertTime > b.insertTime ) return -1;
                    return 0;
            });
        }else{ //現在の並びが新しい順の場合は,古い順に並び替え
            mark.insertTime = '▲';
            orderArray.sort(function(a,b){
                    if( a.insertTime < b.insertTime ) return -1;
                    if( a.insertTime > b.insertTime ) return 1;
                    return 0;
            });
        }
    }else if(order == '難易度'){
        if(mark.difficult == '▲' || mark.difficult == '●'){ //現在が難易度が低い順の場合は,高い順に並び替え
            mark.difficult = '▼';
            orderArray.sort(function(a,b){
                    if( a.evalute.difficult < b.evalute.difficult ) return 1;
                    if( a.evalute.difficult > b.evalute.difficult ) return -1;
                    return 0;
            });
        }else{ //現在が難易度が高い順の場合は,低い順に並び替え
            mark.difficult = '▲';
            orderArray.sort(function(a,b){
                    if( a.evalute.difficult < b.evalute.difficult ) return -1;
                    if( a.evalute.difficult > b.evalute.difficult ) return 1;
                    return 0;
            });
        }
    }else if(order == '理解度'){
        if(mark.understand == '▲' || mark.understand == '●'){ //現在が理解度が低い順の場合は,高い順に並び替え
            mark.understand = '▼';
            orderArray.sort(function(a,b){
                    if( a.evalute.understand < b.evalute.understand ) return 1;
                    if( a.evalute.understand > b.evalute.understand ) return -1;
                    return 0;
            });
        }else{ //現在が理解度が高い順の場合は,低い順に並び替え
            mark.understand = '▲';
            orderArray.sort(function(a,b){
                    if( a.evalute.understand < b.evalute.understand ) return -1;
                    if( a.evalute.understand > b.evalute.understand ) return 1;
                    return 0;
            });
        }
    }
    var returnObject = {
        order: orderArray,
        mark: mark
    };
    return returnObject;
};


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(212);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./print.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./print.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(233);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./commonProblem.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./commonProblem.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(234);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./showProblem.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./showProblem.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */,
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */,
/* 166 */,
/* 167 */,
/* 168 */,
/* 169 */,
/* 170 */,
/* 171 */,
/* 172 */,
/* 173 */,
/* 174 */,
/* 175 */,
/* 176 */,
/* 177 */,
/* 178 */,
/* 179 */,
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

//cssの読み込み
__webpack_require__(181);
__webpack_require__(184);
__webpack_require__(186);
__webpack_require__(188);
__webpack_require__(190);
__webpack_require__(192);
__webpack_require__(43);
__webpack_require__(195);

//jsの読み込み
var apiService = __webpack_require__(197);
var codeExplain = __webpack_require__(198);
var course = __webpack_require__(199);
var explainApp = __webpack_require__(200);
var fieldList = __webpack_require__(219);
var index = __webpack_require__(220);
var login = __webpack_require__(222);
var main = __webpack_require__(223);
var myPage = __webpack_require__(225);
var problemApp = __webpack_require__(231);
var signUp = __webpack_require__(242);



/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(182);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./index.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./index.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, "body{\n    margin:0;\n    color:#494949;\n    font-size: 17px;\n    background-color: #f2f2f2;\n    letter-spacing: 0.7px;\n    line-height: 1.5;\n}\n\n/*ヘッダー*/\n.mdl-layout__header{\n    background-color: #fff;\n    color: #494949;\n}\n\n.mdl-layout-title img{\n    width: 170px;\n}\n\n.mdl-layout__header-row .mdl-navigation__link,\n.mdl-layout__header .mdl-layout__drawer-button{\n    color: #494949;\n}\n\n.mdl-layout__drawer{\n    background-color: #fff;\n    color: #494949;\n}\n\n/*メニュー*/\n.menu{\n    top:50px;\n    width: 20%;\n    margin-left: 15px;\n    background-color: #fff;\n    position: absolute;\n}\n.menu h1{\n    font-size: 14px;\n    color: #fff;\n    font-weight: bold;\n    background-color: #4790BB;\n    padding: 8px 15px;\n    text-align: center;\n    margin: 0;\n}\n\n.menu h1:before{\n    content: \"\\F0C9\";\n    color: #fff;\n    font-family: FontAwesome;\n    padding-right: 10px;\n}\n.menu ul{\n    padding: 10px;\n}\n.menu li{\n    display: inline;\n}\n.menu li a{\n    display: block;\n\tcolor: #494949;\n\tfont-size: 13px;\n\tline-height: 35px;\n\tfont-weight: bold;\n}\n.menu li a:before{\n    content: \"\\F0DA\";\n    color: #4790BB;\n    font-family: FontAwesome;\n    padding-right: 20px;\n    margin-left: 20px;\n\n}\n.menu li a:hover{\n    cursor:pointer;\n    color: #4790BB;\n    transition-property:all;\n    transition: 0.2s linear;\n}\n\n/*メインフレーム*/\n.mainContents {\n    position: absolute;\n    top: 50px;\n    width: calc(76% - 20px);\n    margin-left: 24%;\n}\n.mdl-layout__content{\n    z-index: initial;\n}\n\n.mainSection{\n    padding: 0 0 10px 0;\n    background-color: #FFFFFF;\n    border-radius: 6px;\n    margin-right: 20px;\n    min-height: 100%;\n}\n.mainSectionTitle{\n    font-size: 14px;\n    padding: 4px 0px 0.5px 15px;\n\tborder-left: 7px solid #4790bb;\n\tborder-bottom: 2px solid #eee;\n}\n.mainSectionTitle a{\n    color: #494949;\n    font-size: 23px;\n}\n.mainSectionTitle a:hover{\n    cursor: pointer;\n    color: #4790BB;\n    transition-property:all;\n    transition: 0.2s linear;\n}\n\n.header-login .login{\n    text-decoration:none;\n    color:#1D3557;\n    margin-right: 10px;\n}\n.header-login .login:hover{\n    cursor:pointer;\n    color: #4790BB;\n    transition-property:all;\n    transition: 0.2s linear;\n    border-bottom: 1px;\n}\n\n@media print{\n    body{\n        background-color: #ffffff;\n    }\n    .header{display:none;}\n}\n", ""]);

// exports


/***/ }),
/* 183 */
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
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(185);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./button.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./button.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".btn-primary{\n    background-color:#4790BB;\n}\n.btn-primary:hover,\n.btn-primary:focus{\n    color: #fff;\n    background-color:#426880;\n}\n", ""]);

// exports


/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(187);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./common.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./common.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".loading{\n    text-align:center;\n    padding:1em;\n}\n\n/* アラート */\n.common-inputAlert{\n    text-align:center;\n    padding:1em;\n    height:auto;\n}\n\n.common-tabBtn{\n    display: inline-block;\n    padding: 0.5em 1em;\n    text-decoration: none;\n    cursor:pointer;\n}\n.common-tabBtn:active {/*ボタンを押したとき*/\n    -ms-transform: translateY(4px);\n    -webkit-transform: translateY(4px);\n    transform: translateY(4px);/*下に動く*/\n    border-bottom: none;/*線を消す*/\n}\n\n.common-menu-footerBtn{\n    position: inherit;\n    width: 100%;\n    margin-top: 30px;\n    text-align: center;\n}\n\n.bar1 {\n  display: block;\n  width: 100%;\n  height: 2px;\n  background-color: #f2f2f2;\n  border: 0;\n  margin: 0;\n}\n\n.common-course-menu{\n    display:flex;\n    margin-top:10px;\n}\n\n.common-course-menu #card{\n    width:50%;\n    float:left;\n    margin:.5em;\n    cursor: pointer;\n    transition: all ease-in-out .2s;\n}\n\n.common-course-menu #card:hover{\n    box-shadow: 0 5px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.24);\n}\n\n.common-course-menu h2{\n    font-size:1.1em;\n}\n\n.common-course-menu span{\n    font-size:1.0em;\n}\n\n.common-evalute-content{\n    margin-left: 20px;\n    margin-right: 20px;\n    height: auto;\n}\n\n.common-evalute-content textarea{\n    width:80%;\n    margin-left: 20px;\n}", ""]);

// exports


/***/ }),
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(189);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./sign.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./sign.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".form-wrapper {\n  background: #fff;\n  margin: 3em auto;\n  padding: 0 1em;\n  max-width: 70%;\n  margin-top: 150px;\n  border: solid 1px #e9e9e9;\n}\n\n.sign-title {\n  text-align: center;\n  padding: 1em 0;\n}\n\n.form-wrapper form {\n  padding: 0 1.5em;\n}\n\n.form-item {\n  margin-bottom: 0.75em;\n  width: 100%;\n}\n\n.form-item input {\n  background: #fafafa;\n  border: none;\n  border-bottom: 2px solid #e9e9e9;\n  color: #666;\n  font-family: 'Open Sans', sans-serif;\n  font-size: 1em;\n  height: 50px;\n  transition: border-color 0.3s;\n  width: 100%;\n}\n\n.form-item input:focus {\n  border-bottom: 2px solid #c0c0c0;\n  outline: none;\n}\n\n.button-panel {\n  margin: 2em 0 0;\n  width: 100%;\n}\n\n.button-panel .sign-button {\n  background: #4790BB;\n  border: none;\n  color: #fff;\n  cursor: pointer;\n  height: 50px;\n  font-family: 'Open Sans', sans-serif;\n  font-size: 1.2em;\n  letter-spacing: 0.05em;\n  text-align: center;\n  text-transform: uppercase;\n  transition: background 0.3s ease-in-out;\n  width: 100%;\n}\n\n.sign-button:hover {\n  background: rgb(24, 107, 158);\n}\n\n.form-footer {\n  font-size: 1em;\n  padding: 2em 0;\n  text-align: center;\n}\n\n.form-footer a {\n  color: #8c8c8c;\n  text-decoration: none;\n  transition: border-color 0.3s;\n}\n\n.form-footer a:hover {\n  border-bottom: 1px dotted #8c8c8c;\n}\n", ""]);

// exports


/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(191);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./fieldList.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./fieldList.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".fieldList-menu {\n    width: 500px;\n    padding: 0;\n    margin: 30px;\n}\n.fieldList-menu li {\n    overflow: hidden;\n    border-bottom: 1px solid #fff;\n    cursor: pointer;\n}\n\n.fieldList-menu li a {\n    display: block;\n    position: relative;\n    padding: 0px 10px 0px 50px;\n    background: #f2f2f2;\n    color: #494949;\n    font-size: 14px;\n    line-height: 40px;\n}\n\n.fieldList-menu li a:before {\n    display: block;\n    content: \"\";\n    position: absolute;\n    top: 50%;\n    left: 25px;\n    width: 8px;\n    height: 8px;\n    margin-top: -4px;\n    border-radius: 50%;\n    background: #4790BB;\n    transition-property:all;\n    transition: 0.2s linear;\n    color: #494949;\n}\n.fieldList-menu li a:hover:before {\n    left: -16px;\n    width: 50px;\n    height: 50px;\n    margin-top: -25px;\n    transition-property:all;\n    transition: 0.2s linear;\n    color: #494949;\n}\n\n.collapsed:hover{\n    color:#494949;\n}\n", ""]);

// exports


/***/ }),
/* 192 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(193);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./main.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./main.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".main-menuExplain .main-menuImg{\n    /* padding: 0.5em 1em; */\n    /* margin: 5px; */\n    height: 130px;\n}\n.main-menuExplain{\n    padding: 0.5em 1em;\n    margin: 1em 0;\n    color: #494949;\n    /* border-left: 10px solid #4790BB;\n    border-top: 1px solid #4790BB;\n    border-right: 1px solid #4790BB;\n    border-bottom: 1px solid #4790BB; */\n    width: 95%;\n    margin-left: 30px;\n}\n\n.main-menuExplain-title {\n    margin-left:20px;\n    font-size: 20px\n}\n\n.main-menuExplain-summary{\n    margin-left:20px;\n    color: #9c9a9a;\n}\n", ""]);

// exports


/***/ }),
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".common-menu-header{\n    margin-top:10px;\n    padding:0.5em;\n}\n\n.common-menu-header p{\n    float:left;\n    font-size:14px;\n    color:#a09f9f;\n}\n\n.common-menu-header #right{\n    display: flex;\n    float: right;\n    margin-right:30px;\n    font-size: 13px;\n}\n\n.common-menu-content {\n    counter-reset:list;\n    list-style-type:none;\n    padding:0;\n    margin-top: 30px;\n}\n.common-no-content{\n    text-align:center;\n    padding:1.5em;\n}\n\n.common-no-content p{\n    font-size:18px;\n    font-weight:bold;\n}\n\n.list{\n    margin:20px;\n}\n", ""]);

// exports


/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(196);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
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
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, "table.myPage-profileTable {\n    margin: 10px;\n    border-collapse: collapse;\n\tline-height: 1.5;\n\tborder-top: 1px solid #ccc;\n\tborder-left: 3px solid #4790BB;\n    background: #fff;\n    width: 93%;\n}\ntable.myPage-profileTable th {\n\tfont-weight: bold;\n    text-align: center;\n\tcolor: #4790BB;\n\tborder-right: 1px solid #ccc;\n\tborder-bottom: 1px solid #ccc;\n}\ntable.myPage-profileTable td {\n    width: 150px;\n\tpadding: 10px;\n    text-align: left;\n\tvertical-align: center;\n\tborder-right: 1px solid #ccc;\n\tborder-bottom: 1px solid #ccc;\n}\n.myPageBox {\n    position: absolute;\n    top: 50px;\n    width: calc(76% - 20px);\n    margin-left: 24%;\n\n}\n.myPageContent{\n    padding: 0.5em 1em;\n    background-color: #FFFFFF;\n    margin-right: 20px;\n    min-height: 70vh;\n}\n\n.myPageNav{\n    margin-top: 20px;\n}\n.navTitle{\n    background: #f7f7f7;\n    border-left: 7px solid #4790BB;\n    border-bottom: 2px solid #d7d7d7;\n}\n.navTitle h2{\n    padding: 5px 12px;\n    margin: 0;\n    color: #494949;\n    margin-left: 10px;\n}\n\n.myPageNav ul{\n    margin-top: 10px;\n}\n.myPageNav li{\n    font-size: 15px;\n}\n\n.myPage-detailProfile,\n.myPage-bookmarkCreate{\n    padding: 20px;\n}\n\n.myPage-detailProfile input,\n.myPage-detailProfile textarea{\n    width:95%;\n    margin:20px;\n    margin-bottom: 10px;\n}\n\n.myPage-detailProfile label{\n    margin-left: 20px;\n}\n\n.myPage-detailProfile img{\n    margin:20px;\n    margin-top:10px;\n    max-width: 50%;\n    max-height: 40%;\n}\n\n.myPage-profileImg{\n    width: 90%;\n    padding: .5em;\n}\n.chart{\n    padding: 1em;\n}\n.myPage-radioTitle{\n    font-weight: 400;\n    line-height: 1.4;\n    font-size: 14px;\n    color: rgba(0,0,0,.4);\n    margin-bottom: 0;\n}\n\n.pagination a {\n    cursor: pointer;\n}\n#table-propeller tbody tr{\n    cursor: pointer;\n}\n", ""]);

// exports


/***/ }),
/* 197 */
/***/ (function(module, exports) {

(function() {
    angular
        .module('learnApp')
        .factory('ApiService', ApiService);

    ApiService.$inject = ['$http'];
    function ApiService($http) {
        var service = {
            //解説を見る
            getExplain: getExplain,
            upDateExplain: upDateExplain,
            postEvalute: postEvalute,
            postComment: postComment,
            deleteExplain: deleteExplain,
            getComment: getComment,
            //問題を解く
            getProblem: getProblem,
            updateProblem: updateProblem,
            getShuffleProblem: getShuffleProblem,
            deleteProblem: deleteProblem,
            //解説を作成する
            postExplain: postExplain,
            //問題を作成する
            postProblem: postProblem,
            //マイページ
            getUserInfo: getUserInfo,
            getEvalute: getEvalute,
            updateUserInfo: updateUserInfo,
            postBookmark: postBookmark,
            getBookmark:getBookmark,
            postBookmarkItem:postBookmarkItem,
            getBookmarkItem:getBookmarkItem,
            getPost:getPost,
            //ログイン
            login: login,
            registLoginRecord:registLoginRecord,
            //グループ学習
            postGroup: postGroup,
            postUserGroup: postUserGroup,
            withdrawGroup:withdrawGroup,
            getmyGroup: getmyGroup,
            getUserGroup:getUserGroup,
            upDateGroup:upDateGroup,
            postQuestion:postQuestion,
            getQuestion:getQuestion,
            postAnswer:postAnswer,
            getAnswer:getAnswer,
            getGroups:getGroups,
            //新規登録
            signUp:signUp,
            //勉強記録
            registUserReport:registUserReport
        };

        return service;

        //ヘッダの設定
        var header = {};
        header['Content-Type'] = 'application/json;charset=utf-8';
        var url = 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/';


        /*解説の取得*/
        function getExplain(field, menu, userId) {

            // パラメータの設定
            var param = {};
            param.field = field;
            param.menu = menu;
            param.userId = userId

            // ajax通信
            return $http({
                method: 'GET',
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/explain',
                headers: header,
                params: param
            });
        };

        /*問題の取得*/
        function getProblem(field, menu,userId) {

            // パラメータの設定
            var param = {};
            param.field = field;
            param.menu = menu;
            param.userId = userId;

            // ajax通信
            return $http({
                method: 'GET',
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/problem',
                headers: header,
                params: param
            });
        };

        /*解説の投稿*/
        function postExplain(item,userId,field,menu) {
            var sendData = {};
            sendData.items = {};
            sendData.items.title = item.title;
            sendData.items.content = item.content;
            sendData.items.openRange = item.openRange;
            if(item.imgUrl !== undefined){
                sendData.items.imgUrl = item.imgUrl;
            }
            sendData.items.evalute = 0;
            sendData.items.userId = userId;
            sendData.items.field = field;
            sendData.items.menu = menu;
            sendData.insertTime = new Date().getTime();

            var sendDataJSON = JSON.stringify(sendData);

            return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/explain',
                headers: header,
                data: sendDataJSON
            });
        };


        /*解説の更新*/
        function upDateExplain(item) {
            var sendData = {};
           sendData.id = item.id;
           sendData.title = item.title;
           sendData.content = item.content;
           if(item.imgUrl !== undefined){
               sendData.imgUrl = item.imgUrl;
           }else{
               sendData.imgUrl = "";
           }
           sendData.evalute = item.evalute;

           var sendDataJSON = JSON.stringify(sendData);

            return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/explain/update',
                headers: header,
                data: sendDataJSON
            });
        };

        /**
         * 問題の投稿
         * @param  {[Array]} item [投稿する問題]
         */
        function postProblem(item){
           var sendDataJSON = JSON.stringify(item);

           return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/problem',
                headers: header,
                data: sendDataJSON
            });
        };

        /**
         * 問題の更新
         * @param  {[Array]} item [編集後の問題]
         */
        function updateProblem(item){
            var sendData = {};
            sendData.items = {};
            sendData.id = item.id;
            sendData.items.problem = item.problem;
            sendData.items.choiceNo = item.choiceNo;
            sendData.items.answer = item.answer;
            sendData.items.explain = item.explain;
            sendData.items.openRange = item.openRange;
            sendData.items.evalute = item.evalute;
            sendData.items.format = item.format;
            sendData.items.userId = item.userId;
            sendData.items.field = item.field;
            sendData.items.menu = item.menu;
            sendData.items.insertTime = item.insertTime;

           var sendDataJSON = JSON.stringify(sendData);

            return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/problem',
                headers: header,
                data: sendDataJSON
            });
        }

        /*評価登録*/
        function postEvalute(item,userId,evalute,flag){
            /*評価情報の登録*/
            var sendData = {};
            sendData.items = {};
            sendData.items.evaluteId = item.id;
            sendData.items.evalute = evalute;
            sendData.items.userId = userId;
           if(flag){
               sendData.items.explainFlag = true;
           }else{
               sendData.items.explainFlag = false;
           }
           var sendDataJSON = JSON.stringify(sendData);

            return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/evalute',
                headers: header,
                data: sendDataJSON
            });
        };

        /*コメント投稿*/
        function postComment(item){
            return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/comment',
                headers: header,
                data: item
            });
        };

        /*解説の削除*/
        function deleteExplain(id){
            var sendData = {};
           sendData.id = id;
           var sendDataJSON = JSON.stringify(sendData);

           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/explain/delete',
               headers: header,
               data: sendDataJSON
           });
       };

       /*ユーザ情報の取得*/
       function getUserInfo(userId){
           var param = {};
           param.userId = userId;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/user/info',
               headers: header,
               params: param
           });
       };

       /*評価情報の取得*/
       function getEvalute(userId,type){
           var param = {};
           param.userId = userId;
           param.type = type;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/evalute',
               headers: header,
               params: param
           });
       }

       function updateUserInfo(userId, item){
           var sendData = {};
           sendData.updateItem = {};
           sendData.userId = userId;
           sendData.updateItem.userName = item.userName;
           sendData.updateItem.introduction = item.introduction;
           sendData.updateItem.goal = item.goal;
           sendData.updateItem.userIcon = item.userIcon;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/user/update',
               headers: header,
               data: sendDataJSON
           });
       }

       function postBookmark(item, userId){
           var sendData = {};
           sendData.items = {};
           sendData.items.userId = userId;
           sendData.items.name = item.name;
           sendData.items.explain = item.explain;
           sendData.items.type = item.type;
           sendData.items.openRange = item.openRange;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/bookmark',
               headers: header,
               data: sendDataJSON
           });
       }

       function getBookmark(userId,type){
           var param = {};
           param.userId = userId;
           if(type === undefined){
               param.type = "全て";
           }else{
               param.type = type;
           }

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/bookmark',
               headers: header,
               params: param
           });
       }

       function postBookmarkItem(item){
          var sendData = {};
          sendData.bookmarkId = item.bookmarkId;
          sendData.itemId = item.itemId;

          var sendDataJSON = JSON.stringify(sendData);

           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/bookmark/item',
               headers: header,
               data: sendDataJSON
           });
       }

       function getBookmarkItem(id, type){
           var param = {};
           param.bookmarkId = id;
           param.type = type;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/bookmark/item',
               headers: header,
               params: param
           });
       }

       function getComment(id, type){
           var param = {};
           param.id = id;
           param.type = type;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/comment',
               headers: header,
               params: param
           });
       }

       function getPost(userId,type){
           var param = {};
           param.userId = userId;
           param.type = type;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/comment/post',
               headers: header,
               params: param
           });
       }

       /*ログイン*/
       function login(item){
           var sendData = {};
          sendData.userId = item.email;
          sendData.password = sha256(item.password);

          var sendDataJSON = JSON.stringify(sendData);

           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/login',
               headers: header,
               data: sendDataJSON
           });
       };

       /*ログイン履歴の更新*/
       function registLoginRecord(item,loginRecord){
           var sendData = {};
          sendData.items = {};
          sendData.items.email = item.email;
          sendData.items.userName = item.userName;
          sendData.items.birthday = item.birthday;
          sendData.items.password = item.password;
          sendData.items.srcUrl = item.srcUrl;
          sendData.items.goal = item.goal;
          sendData.items.loginRecord = loginRecord;

          var sendDataJSON = JSON.stringify(sendData);
          console.log(sendDataJSON)

           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/login/record',
               headers: header,
               data: sendDataJSON
           });
       }

       /*シャッフル問題の取得*/
       function getShuffleProblem(fields,menu,num){
           var param = {};
           param.fields = String(fields);
           param.menu = menu;
           param.num = num;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/problem/shuffle',
               headers: header,
               params: param
           });
       };

       /*問題の削除*/
       function deleteProblem(id){
           var sendData = {};
          sendData.id = id;
          var sendDataJSON = JSON.stringify(sendData);

          return $http({
              method: "POST",
              url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/problem/delete',
              headers: header,
              data: sendDataJSON
          });
       }

       /*グループ作成*/
       function postGroup(item){
           var sendData = {};
           sendData.items = {};
           sendData.items.groupName = item.groupName;
           sendData.items.introduction = item.introduction;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group',
               headers: header,
               data: sendDataJSON
           });
       };

       function postUserGroup(groupId,userId){
           var sendData = {};
           sendData.items = {};
           sendData.items.groupId = groupId;
           sendData.items.userId = userId;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group/user',
               headers: header,
               data: sendDataJSON
           });
       }

       function withdrawGroup(id){
           var sendData = {};
           sendData.id = id;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group/user/delete',
               headers: header,
               data: sendDataJSON
           });
       };

       /*マイグループの取得*/
       function getmyGroup(userId){
           var param = {};
           param.userId = userId;
           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group',
               headers: header,
               params: param
           });
       };

       function getUserGroup(groupId){
           var param = {};
           param.groupId = groupId;
           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group/user',
               headers: header,
               params: param
           });
       }

       /*グループ更新*/
       function upDateGroup(item){
           var sendData = {};
           sendData.items = {};
           sendData.insertTime = item.insertTime;
           sendData.id = item.id;
           sendData.items.groupName = item.groupName;
           sendData.items.introduction = item.introduction;
           sendData.items.createUserId = item.createUserId;
           sendData.items.createUserName = item.createUserName;
           sendData.items.joinUserId= item.joinUserId;
           sendData.items.joinUserName = item.joinUserName;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group',
               headers: header,
               data: sendDataJSON
           });
       };

       /*質問投稿*/
       function postQuestion(item){
           var sendData = {};
           sendData.items = {};
           sendData.items.title = item.title;
           sendData.items.content = item.content;
           sendData.items.userId = item.userId;
           sendData.items.groupId = item.groupId;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/question',
               headers: header,
               data: sendDataJSON
           });
       };

       /*質問の取得*/
       function getQuestion(groupId){
           var param = {};
           param.groupId = groupId;
           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/question',
               headers: header,
               params: param
           });
       };

       /*回答投稿*/
       function postAnswer(item){
           var sendData = {};
           sendData.items = {};
           sendData.id = item.id;
           sendData.items.answer = item.answer;
           sendData.items.userId = item.userId;
           sendData.items.questionId = item.questionId;
           sendData.items.good = item.good;
           sendData.items.bad = item.bad;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/question/answer',
               headers: header,
               data: sendDataJSON
           });
       };

       /*回答の取得*/
       function getAnswer(questionId){
           var param = {};
           param.questionId = questionId;
           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/question/answer',
               headers: header,
               params: param
           });
       };

       /*回答の取得*/
       function getGroups(){
           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group/groups',
               headers: header,
           });
       };

       /**
        * 新規登録メソッド
        * @param  {[String]} name     [ユーザ名]
        * @param  {[String]} email    [メールアドレス]
        * @param  {[String]} password [パスワード]
        */
       function signUp(name,email,password){
           var sendData = {};
           sendData.items = {};
           sendData.items.userName = name;
           sendData.items.userId = email;
           sendData.items.password = password;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/user/regist',
               headers: header,
               data: sendDataJSON
           });
       };

       function registUserReport(userId, studyTime, week,menu){
           var sendData = {};
           sendData.items = {};
           sendData.userId = userId;
           sendData.items.time = studyTime;
           sendData.items.week = week;
           sendData.items.menu = menu;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/user/regist/report',
               headers: header,
               data: sendDataJSON
           });
       }
    }
})();


/***/ }),
/* 198 */
/***/ (function(module, exports) {

(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('codeExplainController', codeExplainController);

    codeExplainController.$inject = ['$scope','$sce'];
    function codeExplainController($scope, $sce) {
        var codeExplainCtrl = this;

        init();

        function init(){
            $scope.indexCtrl.value.flag.codeExplain = true;
        };
    };
}());


/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * courseController as courseCtrl
 * コース一覧
 */

(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('courseController', courseController);

    courseController.$inject = ['$scope'];
    function courseController($scope) {
        var courseCtrl = this;

        courseCtrl.value = {
            src: {
                explain: "", //解説を見る画像
                problem: "", //問題を見る画像
                makeExplain: "", //解説を作成する画像
                makeProblem: "" //問題を作成する画像
            }
        }

        courseCtrl.method = {
            clickCourse: clickCourse //コースクリック
        };

        //imageインポート
        courseCtrl.value.src.explain = __webpack_require__(83);
        courseCtrl.value.src.problem =__webpack_require__(84);
        courseCtrl.value.src.makeExplain =__webpack_require__(44);
        courseCtrl.value.src.makeProblem =__webpack_require__(45);
        
        //初期化
        init();

        /**
         * 初期化メソッド
         */
        function init() {
            $scope.indexCtrl.method.check(); //ログインチェック
            $scope.indexCtrl.method.clickNav(1); //画面スタイルの変更
            //パンくずリストの設定
            if($scope.indexCtrl.value.titleString[1] != undefined){
                $scope.indexCtrl.value.titleString[1] = undefined;
                $scope.indexCtrl.value.titleString[2] = undefined;
            }
        }

        /**
         * コースクリックメソッド
         * @param  {[Number]} course [コース]
         */
        function clickCourse(course){
            $scope.indexCtrl.method.directory("",course,""); //コースの保存
            window.location.href = './#/fieldList/'; //分野一覧画面に遷移
        };

    }

}());


/***/ }),
/* 200 */
/***/ (function(module, exports, __webpack_require__) {

var referExplain = __webpack_require__(201);
var explainForm = __webpack_require__(205);
var explainList = __webpack_require__(207);
var explainPrint = __webpack_require__(211);
var makeExplain = __webpack_require__(213);
var explainModal = __webpack_require__(214);
var contentEvalute = __webpack_require__(218);


/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * referExplainController as referExplainCtrl
 * 解説を見る
 */

(function() {

    angular
        .module('learnApp')
        .controller('referExplainController', referExplainController);

    referExplainController.$inject = ['$scope', '$sce','ApiService'];

    function referExplainController($scope,$sce,ApiService) {
        var referExplainCtrl = this;

        referExplainCtrl.method = {
            init:init, //初期化
            clickEditCompleteButton: clickEditCompleteButton, //編集完了ボタンクリック
            clickDeleteButton: clickDeleteButton, //削除ボタンクリック
            clickEditFinishButton:clickEditFinishButton, //編集終了クリック
        };
        //スタイル読み込み
        __webpack_require__(202);
        __webpack_require__(85);

        //グローバル変数の読み込み
        referExplainCtrl.globalParam = __webpack_require__(14);

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            $scope.indexCtrl.method.clickNav(1); //画面スタイル適用
            referExplainCtrl.globalParam.value.explainList = undefined; //リスト内容リセット
            referExplainCtrl.globalParam.flag.explainList = true; //リスト表示
            referExplainCtrl.globalParam.flag.explainListLoading = true; //リスト読み込み中
       }


        /**
         * 編集完了ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickEditCompleteButton(){
            var detailExplain = referExplainCtrl.globalParam.value.detailExplain; //編集した解説の退避
            /**
             * 解説の更新
             * @type {[Object]} 編集した解説
             */
            ApiService.upDateExplain(detailExplain).success(
                function(){
                    referExplainCtrl.globalParam.value.detailExplain = undefined; //編集した解説の初期化
                    init(); //初期化メソッド
                }
            );
        }

        /**
         * 削除ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickDeleteButton(){
            var showExplain = referExplainCtrl.globalParam.value.showExplain; //表示している解説
            /**
             * 解説の削除
             * @type {[Number]} 削除する解説のID
             */
            ApiService.deleteExplain(showExplain.id).success(
                function(){
                    referExplainCtrl.globalParam.value.showExplain = undefined;
                    init(); //初期化メソッド
                }
            )
        }

        /**
         * 解説編集の終了メソッド
         * @return {[type]} [description]
         */
        function clickEditFinishButton(){
            referExplainCtrl.globalParam.value.flag.detailExplain = false; //解説編集画面閉じる
            init(); //初期化メソッド
        }
    }
}());


/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(203);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./explain.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./explain.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 203 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".common-ExplainBox {\n    margin: 1em 0;\n    background: #fff;\n    margin-left: 20px;\n    margin-right: 20px;\n}\n.common-ExplainBox .common-ExplainBox-title {\n    font-size: 1.2em;\n    background: #4790BB;\n    padding: 4px;\n    text-align: center;\n    color: #FFF;\n    font-weight: bold;\n}\n", ""]);

// exports


/***/ }),
/* 205 */
/***/ (function(module, exports, __webpack_require__) {

(function() {

    angular
        .module('learnApp')
        .controller('explainFormController', explainFormController)
        .directive('explainFormDirective',explainFormDirective);

    explainFormController.$inject = ['$scope'];
    explainFormDirective.$inject = ['$parse'];

    function explainFormController($scope) {
        var explainFormCtrl = this;

        explainFormCtrl.value = {
            explain: {}, //入力した解説
            flag: {
                alert: false, //アラートフラグ
            },
            alert: [], //アラート文
        };

        explainFormCtrl.method = {
            clickPreview: clickPreview, //プレビューボタンクリック
            clickCodeExplain: clickCodeExplain, //解説コードボタンクリック
            dataCheck: dataCheck, //入力データのチェック
        };

        //スタイルロード
        __webpack_require__(86);

        //グローバル変数の読み込み
        explainFormCtrl.globalParam = __webpack_require__(14);

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //解説編集の時
            if(explainFormCtrl.globalParam.flag.detailExplain){
                explainFormCtrl.value.explain = explainFormCtrl.globalParam.value.detailExplain; //編集する解説のセット
            }else{
                explainFormCtrl.value.explain = {}; //解説をリセット
            }
        }

        /**
         * プレビューボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickPreview(){
            dataCheck(); //入力データのチェック
            //入力エラーがなかったとき
            if(!explainFormCtrl.value.flag.alert){
                var explain = {};
                //プレビューする解説のセット
                explain.content = explainFormCtrl.value.explain.content;
                explain.title = explainFormCtrl.value.explain.title;
                explain.imgUrl = explainFormCtrl.value.explain.imgUrl;
                explainFormCtrl.globalParam.value.previewExplain = explain;
                explainFormCtrl.globalParam.flag.detailExplain = false; //解説編集画面のオフ
                explainFormCtrl.globalParam.flag.previewExplain = true; //解説プレビュー画面のオン
            }
        }

        /**
         * 画像アップロード検知メソッド
         * @param  {[file]} img [アップロード画像]
         * @return {[type]} [description]
         */
        $scope.$watch("img",function(img){
            if(!img || !img.type.match("image.*")){
                return;
            }
            var reader = new FileReader();
            reader.onload = function(){
                $scope.$apply(function(){
                    explainFormCtrl.value.explain.imgUrl = reader.result; //base64画像データのセット
                    var title = "[アップロード画像]"; //解説内容表示用の文章セット
                    //解説内容がないとき
                    if(explainFormCtrl.value.explain.content == undefined){
                        explainFormCtrl.value.explain.content = title; //文章を解説内容に挿入
                    }else{
                        explainFormCtrl.value.explain.content += title; //文章を解説内容に付け足し
                    }
                });
            };
            reader.readAsDataURL(img)
        });

        /**
         * 入力データのチェックメソッド
         * @param  {[String]} value [公開範囲の値]
         * @return {[type]} [description]
         */
        function dataCheck(value){
            explainFormCtrl.value.alert = []; //アラート文の初期化
            //タイトルがなかった時
            if(explainFormCtrl.value.explain.title == undefined){
                explainFormCtrl.value.alert.push('タイトルを入力してください');
            }
            //解説文がなかった時
            if(explainFormCtrl.value.explain.content == undefined){
                explainFormCtrl.value.alert.push('解説を入力してください');
            }
            //アラートがあったとき
            if(explainFormCtrl.value.alert.length != 0){
                explainFormCtrl.value.flag.alert = true; //アラート画面オン
            }else{
                explainFormCtrl.value.flag.alert = false; //アラート画面オフ
                //解説編集の時
                if(explainFormCtrl.globalParam.flag.detailExplain){
                    explainFormCtrl.globalParam.value.detailExplain = explainFormCtrl.value.explain; //解説編集に編集内容をセット
                //解説作成の時
                }else{
                    explainFormCtrl.globalParam.value.explainForm = explainFormCtrl.value.explain; //解説作成に作成内容をセット
                }
            }
            explainFormCtrl.value.explain.openRange = value; //公開範囲のセット
        }

        /**
         * 解説コードクリックメソッド
         * @return {[type]} [description]
         */
        function clickCodeExplain(){
            window.open('./#/codeExplain/', 'subwin','width=530 height=400' ); //解説コード画面の表示
        }
    }

    /**
     * [explainFormDirective ファイルアップロード]
     * @param  {[type]} $parse [description]
     * @return {[type]}        [descriptions]
     */
    function explainFormDirective($parse){
        return{
            restrict: 'A',
            link: function(scope,element,attrs){
                var model = $parse(attrs.explainFormDirective);
                element.bind('change',function(){
                    scope.$apply(function(){
                        model.assign(scope,element[0].files);
                    });
                });
            }
        };
    }
}());


/***/ }),
/* 206 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, "/*.common-explain-content{\n    margin-left: 20px;\n    margin-right: 20px;\n    height:auto;\n    min-height: 400px;\n    max-height: 400px;\n    overflow: auto;\n}*/\n\n/*.common-ExplainBox {\n    margin: 1em 0;\n    background: #fff;\n    margin-left: 20px;\n    margin-right: 20px;\n}\n.common-ExplainBox .common-ExplainBox-title {\n    font-size: 1.2em;\n    background: #4790BB;\n    padding: 4px;\n    text-align: center;\n    color: #FFF;\n    font-weight: bold;\n}*/\n\n.common-explainMake{\n    position: relative;\n    margin: 2em 0;\n    padding: 25px 10px 7px;\n    border: solid 2px #4790BB;\n    width: 90%;\n    margin-left:30px;\n}\n\n.common-explainMake .common-explainMakeTitle-title{\n    position: absolute;\n    top: -2px;\n    left: -2px;\n    padding: 0 9px;\n    background: #4790BB;\n    color: #ffffff;\n}\n\n.common-explainMake textarea{\n    margin-left: 10px;\n    margin-top: 10px;\n    width: 95%;\n    font-size: 14px;\n}\n\n.common-makeBox-footer{\n    text-align: center;\n    height:auto;\n    padding-bottom: 10px;\n}\n\n.common-comp-content{\n    text-align:center;\n    padding:1.3em;\n}\n.common-comp-content p{\n    font-size:18px;\n    font-weight:bold;\n}\n", ""]);

// exports


/***/ }),
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

(function() {

    angular
        .module('learnApp')
        .controller('explainListController', explainListController);

    explainListController.$inject = ['$scope','ApiService'];
    function explainListController($scope,ApiService) {
        var explainListCtrl = this;

        explainListCtrl.value = {
            listExplains: [], //リストに表示する解説
            orderMark: { //並び替え記号
                insertTime: "▼", //作成日
                difficult: "●", //難易度
                understand: "●" //理解度
            },
            allExplains:[], //すべての解説
            myExplains:[], //自分が作成した解説
            showExplainInPage: [], //1ページに表示する解説
            paginationNumber:[], //ページ数
            currentPage: 1, //現在のページ
            displayRange: { //表示範囲
                all: true, //全部
                my: false //自分
            },
            flag: {
                empty: false, //解説数0
                error: false //取得エラー
            }
        };

        explainListCtrl.method = {
            init: init, //初期化
            getExplainData: getExplainData, //解説の取得
            explainListSet: explainListSet, //解説リストの設定
            calcPagination: calcPagination, //ページネーションの計算
            clickMakeExplainButton:clickMakeExplainButton, //解説作成ボタンクリック
            clickExplain:clickExplain, //解説クリック
            clickOrder:clickOrder, //並び替えクリック
            clickRangeButton:clickRangeButton, //解説表示範囲のボタンクリック
            clickPagination:clickPagination //ページネーションのクリック
        };

        //モジュールの読み込み
        explainListCtrl.module = {
            calcPagination: __webpack_require__(208), //ページネーションの計算モジュール
            calcEvalute: __webpack_require__(87), //評価の計算モジュール
            order: __webpack_require__(88) //並び替えモジュール
        };

        //スタイルロード
        __webpack_require__(43);

        //グローバル変数の読み込み
        explainListCtrl.globalParam = __webpack_require__(14);

        //初期化メソッド
        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            explainListCtrl.value.orderMark = { //並び替え記号の初期化
                insertTime: "▼",
                difficult: "●",
                understand: "●"
            };
            //マイページの解説取得処理
            if($scope.indexCtrl.value.flag.isCourse){
                explainListSet(explainListCtrl.globalParam.value.explainList); //解説リストのセット
            //コースの解説取得処理
            }else{
                getExplainData(); //解説の取得
            }
        };

        /**
         * 解説取得メソッド
         * @return {[type]} [description]
         */
        function getExplainData(){
            /**
             * 解説の取得
             * @type {[String]} 分野
             * @type {[String]} メニュー
             * @type {[String]} ユーザID
             */
            ApiService.getExplain($scope.indexCtrl.value.field, $scope.indexCtrl.value.menu,$scope.indexCtrl.value.userId).success(
               function(data) {
                   //データが正常に取得されたとき
                   if(data.status == 0){
                       explainListSet(data.data); //解説リストのセット
                   }else{
                       explainListCtrl.value.flag.error = true; //「エラー」表示
                   }
                   explainListCtrl.globalParam.flag.explainListLoading = false; //解説読み込み中非表示
               }
           );
        }

        /**
         * 解説リストのセットメソッド
         * @return {[type]} [description]
         */
        function explainListSet(explains){
            //データがあったとき
            if(explains.length > 0){
                //評価値の算出
                explains = explainListCtrl.module.calcEvalute.calcEvalute(explains);
                explainListCtrl.value.allExplains = explains; //すべての解説をセット
                //自分の解説を抽出
                for(var i = 0; i < explains.length; i++){
                    // 自分の解説があればセット
                    if(explains[i].userId == $scope.indexCtrl.value.userId){
                        explainListCtrl.value.myExplains.push(explains[i]);
                    }
                }
                //表示する解説抽出(最初は全ての解説を表示)
                explainListCtrl.value.listExplains = explainListCtrl.value.allExplains;
                //表示する解説を作成日順に並び替え
                explainListCtrl.value.listExplains.sort(function(a,b){
                        if( a.insertTime < b.insertTime ) return 1;
                        if( a.insertTime > b.insertTime ) return -1;
                        return 0;
                });
                calcPagination(explains);
            }else{
                explainListCtrl.value.flag.empty = true; //「解説がない」表示
            }
        }

        /**
         * 1ページに表示する解説の計算
         * @param  {[type]} explains [計算対象の解説]
         * @return {[type]}          [description]
         */
        function calcPagination(explains){
            var returnObject = explainListCtrl.module.calcPagination.calcPagination(explains);
            explainListCtrl.value.showExplainInPage = returnObject.showContentInPage;
            explainListCtrl.value.paginationNumber = returnObject.paginationNumber;
        }

        /**
         * 解説作成ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickMakeExplainButton(){
            $scope.indexCtrl.method.directory("",3,""); //ディレクトリ設定
            window.location.href = './#/makeExplain/'; //解説作成画面に移動
            //ディレクトリの保存
            $scope.indexCtrl.value.titleUrl[2] = './#/makeExplain/';
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }

        /**
         * 解説クリックメソッド
         * @param  {[Array]} explain [クリックした解説]
         * @return {[type]} [description]
         */
        function clickExplain(explain) {
            explainListCtrl.globalParam.value.showExplain = explain; //クリックした解説を表示解説にセット
            explainListCtrl.globalParam.flag.showExplain = true; //解説モーダル表示
        }

        /**
         * 並び替えクリックメソッド
         * @param  {[String]} chooseOrder [選択した並び替え]
         * @return {[type]} [description]
         */
        function clickOrder(chooseOrder){
            var explains = JSON.stringify(explainListCtrl.value.listExplains); //並び替え対象の解説を文字列化
            var orderMark = explainListCtrl.value.orderMark;
            var returnObject = explainListCtrl.module.order.order(explains,chooseOrder,orderMark);
            explainListCtrl.value.listExplains = returnObject.order;
            explainListCtrl.value.orderMark = returnObject.mark;
            //1ページに表示する解説の計算
            calcPagination(explainListCtrl.value.listExplains);
        }

        /**
         * 解説表示範囲ボタンのクリック
         * @param  {[String]} range [選択範囲]
         * @return {[type]} [description]
         */
        function clickRangeButton(range){
            //範囲が「全部」のとき
            if(range == 'all'){
                explainListCtrl.value.listExplains = explainListCtrl.value.allExplains; //全ての解説を表示用の解説にセット
            }else{
                explainListCtrl.value.listExplains = explainListCtrl.value.myExplains; //自分が作成した解説を表示用の解説にセット
            }
            //並び替え記号と並び順の初期化
            explainListCtrl.value.orderMark = {
                insertTime: "▼",
                difficult: "●",
                understand: "●"
            };
            //作成日順に並び替え
            explainListCtrl.value.listExplains.sort(function(a,b){
                    if( a.insertTime < b.insertTime ) return 1;
                    if( a.insertTime > b.insertTime ) return -1;
                    return 0;
            });
            //1ページに表示する解説の計算
            calcPagination(explainListCtrl.value.listExplains);
        }


        /**
         * ページネーションのクリックメソッド
         * @param  {[type]} category [選択したページ]
         * @return {[type]}          [description]
         */
        function clickPagination(category){
            switch(category){
                case 'next':
                if(explainListCtrl.value.currentPage != explainListCtrl.value.paginationNumber.length){
                    explainListCtrl.value.currentPage += 1; //次のページへ
                }
                break;
                case 'back':
                if(explainListCtrl.value.currentPage != 1){
                    explainListCtrl.value.currentPage -= 1; //前のページへ
                }
                break;
                default:
                explainListCtrl.value.currentPage = category; //指定したページへ
                break;
            }
        }
    }
}());


/***/ }),
/* 208 */
/***/ (function(module, exports) {

module.exports.calcPagination = function(contents){
    var showContentInPage = []; //1ページに表示する解説のリセット
    var paginationNumber = []; //ページ数のリセット
    //表示するコンテンツの計算
    for(var i = 0; i < Math.ceil(contents.length / 10); i++) {
      var j = i * 10;
      var p = contents.slice(j, j + 10);
      showContentInPage.push(p);
      paginationNumber.push(i+1);
    }
    var returnObject = {
        'showContentInPage': showContentInPage,
        'paginationNumber': paginationNumber
    };

    return returnObject
}


/***/ }),
/* 209 */
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAD5UlEQVRoQ91aXXLaQAyWTOC1yQnK9gIlJ2h6gpoZvMNb6QlCTpDkBCEnCH3L2JkpOUHICUouENMThL7aA+rIP2AbQ8C7m+lkn3hgV/okrT5JawQNy7ftQ2g0vgFAE4hOALEZ/c6vKRBNAXEMAFMIgnsxGs1UxWPVAyKl6/XvANADxFalc4gmADCEMPxZFczeAPxutwmLxSkQseKHlRQvbiKaAeIQLOta3N5O9zlzLwC+lOdA1NemeDmQgXDdy11B7ATAdxwOkZvKobKrNun/OLRqtfYu3ngVgO84PQC4Mmb1TeA4rADOhOcNt+HfCiBSHvFmXwNq/T/Rj20gNgL4L5RfhdRGEKUAtChPdA9EnPMBEJkbmCdUVlu47qh4wBqA5MI+KMb8pXDdi6ww33EGgHhaGQHfiVrtuHixywD8Vsk2RPTnk+cVWTjS+9lxZoj4QQHERHjecXZ/DoAvJVvtvLIA3kj0KDzvpOwM33HGgPhF6XyAnHeXACKGnc/Z+mrsahpAIZRWAFRjdJUxtnlAKTwznlt6IQKQFGa+svUTCcJ1y7OblKQYPvF29kIYCi4AYwCdTh8s60rL4XxIEBwVq8uk5H7RJiMhuBiA4+hybazfYvFV3N3FHJAsv9M5Act60Aggykio3TKxhmuk40tpA8AvbQAST6MW1l3Xap3IdKTodTltBqDGkGUmJboWntfPhZCUXFVyB6dzXTIAHeSSV6qEC0zJQV9Kv6QBV7XSVLiuKHjAiBwGoCc3FyAXucCUHGMAwLJEWjkmgwD2gPZlDkCGC7RzQMYM5gBkWkHtTJ8F8Ow4U0T8qN23mbJXS5leoiD3HmbSKAsjuheex+zLpcpIQ0u5DoHo0QyRxQCWZbURDojhRERmZnRCNBOed5R44EVXqV5wQ9tUMZfKSacIUShpX0FwFJfTUvKU+LN2AWYPfBKu2zLT0JhVPD4919DY9iHV65xOq488MkoT0V8E6EMYxiFUr9sEMNB6fhg2ly1lctH0ldXmO7J8Ux8B6HabNJ9PlK1keKwSebdWa6V11vsZbKUhrCEjrfUCmbNVe4Io82RzROlwlwDGiqHEz0RnWUG+lDy2ybWZ+ySrYuike02O13mssiIyHrGrrd3G60t3myoxqoDY8krzfp+YMhfPJqKh4p3Y2+5RzCP2yl5ltl7iMklJT8vx/Fb10hNYlq3lmbWQSS6IqG/KG4nVOYPlnqe2ue/Vd+Li5uQhpE8APV1AUsXBsoa7WH3vECoNK/7Y4+CgB5bFD+FVQ+sJiAZc9L3Zxx4bwTQanOdb/LkNATSLg4KoAefPbOLPbSYQBOOqSmd1+AeiAxLFG7vIYwAAAABJRU5ErkJggg=="

/***/ }),
/* 210 */
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADCklEQVRoQ+2ZQU7bUBCG/wlpVdg0PUFhWVWNwy7OBpwLNL1Bc4LCCQInKD0B3IBwgRg2Nrs6qaouCSdouglVSzLVi2uBQqhmnp+jIuH1vPH7Zv6ZN/YjOHy+ho3aNXiLgBaDKgTUjHsGEgKPGOiWQWevgyhx9Vpy4ehLWN9mUAegbZk/PiXw/pvg/FRmf79VLoDPYa2ygtVj+cbnN8LdCa7am0EysgWxBkjlgsNMJrYbMPIqA21bWVkBmMiXsHZBQMV247fXMTCaYrxhkwkrgEGvkYDgudh85sNkwguiTa1PNUA/bOwR0NG+SGLPwL4XRHsS28xGBeBaOndK2kJKKoB+6O8Q6KMmQlpbBu96QXwgXacCKEL7C7KgqgUxwLewvv4bpQtpZPLYPcF041VwPpT4EAOkp20plDjNa0OYBtJTWgwwCOvvgdJh3s3J1k/b1eD8SGIrBiiyfS6oA3E7VQAU34FuQArIwIOvgWV2oQnGL6RzkVhCJr3LOAfA6Feb0exDSPKoAJZRyNp5SAUwm4V4dUhEzyXR0dow848pXa1L5WP8qwDMgiKzoI2+FUBhtcB8Vm3Gwm/qm9yqM2CWmo70iylxJSUjnafENen8c1uaVgDGgctzQTP7zNeVNYCrerDRvZMMZE76Pd90pZfajmPsmfnSa8brNmuzNbkyMCvoXFOqfOa5DzI3QPpza+27TRQ1I0NhAGkWGqwFMJ3Ha8a5/yvlzkB6LvinINpSQVj2faddKHP28AFCvwXQsSoD4HfVIO7q1ty1diIh49YUcxnPRGPwNX4mmoHtX5DOAPJG0na9E4C/X2sdgIWHEg0nGO+6yIITgEHYMFp+q4ziSTWIWso1d8wfAbICLmFtRxPNKcYH/42ENBt3betEQuk44bcIJLq1YUZSbUYnLmCcAPRD/4BAHzQbYvAnL4hVslvk3wnAgx8lzJXrhFl8q2IiuUK0Y3u1ejsTTjKgkY5r20eARRHt9/zR/C8XVx8whXwPzDtd1JVcdZ2lAJiXGAgw0lmH6Eh7gS2tlT/Iy0VAg7eUGwAAAABJRU5ErkJggg=="

/***/ }),
/* 211 */
/***/ (function(module, exports, __webpack_require__) {

(function() {


    angular
        .module('learnApp')
        .controller('explainPrintController', explainPrintController);

    explainPrintController.$inject = ['$scope', '$sce','$routeParams','$http','ApiService'];
    function explainPrintController($scope,$sce, $routeParams, $http,ApiService) {
        var explainPrintCtrl = this;

        explainPrintCtrl.value = {
            flag:{
                nomal: true,
                note: false,
                remember: false
            },
            content: {}
        };

        explainPrintCtrl.method = {
            clickMenu: clickMenu,
            clickPrint: clickPrint
        };

        __webpack_require__(89);
        init();

        function init(){
            $scope.indexCtrl.value.flag.print = true;
            $scope.indexCtrl.method.clickNav(3);
            explainPrintCtrl.value.content = JSON.parse(base64url.decode($routeParams.item));
            var explain = __webpack_require__(15);
            explainPrintCtrl.value.content.sceContent = explain.markupChange(explainPrintCtrl.value.content.content);
            explainPrintCtrl.value.content.sceContent = $sce.trustAsHtml(explainPrintCtrl.value.content.sceContent); //ng-bind-view
        }

        /*メニュークリック*/
        function clickMenu(menu){
            if(menu == 'nomal'){
                explainPrintCtrl.value.flag.nomal = true;
                explainPrintCtrl.value.flag.note = false;
                explainPrintCtrl.value.flag.remember = false;
            }else if(menu == 'note'){
                explainPrintCtrl.value.flag.nomal = false;
                explainPrintCtrl.value.flag.note = true;
                explainPrintCtrl.value.flag.remember = false;
            }else{
                redDelite();
                explainPrintCtrl.value.flag.nomal = false;
                explainPrintCtrl.value.flag.note = false;
                explainPrintCtrl.value.flag.remember = true;
            }
        }

        /*印刷*/
        function clickPrint(){
            window.print();
        }

        /*赤文字の消去*/
        function redDelite(){
            var beforeTextArr = explainPrintCtrl.value.content.content.split('');
            var afterText = '';
            var j;
            for(var i=0; i<beforeTextArr.length; i++){
                if(beforeTextArr[i] == '%' && beforeTextArr[i+1] == 'r' && beforeTextArr[i+2] == 'e' && beforeTextArr[i+3] == 'd'){
                    beforeTextArr[i] = '';
                    beforeTextArr[i+1] = '';
                    beforeTextArr[i+2] = '';
                    beforeTextArr[i+3] = '';
                    for(j=i+4; beforeTextArr[j] != '%'; j++){
                            beforeTextArr[j] = '.....';
                    }
                    beforeTextArr[j] = '';
                }
            }
            for (var i = 0; i < beforeTextArr.length; i++) {
                afterText += beforeTextArr[i];
            }
            var explain = __webpack_require__(15);
            afterText = explain.markupChange(afterText);
            explainPrintCtrl.value.content.sceRememberContent = $sce.trustAsHtml(afterText); //ng-bind-view

        }
    }


}());


/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".print-styleAlert{\n    width: 80%;\n    position: absolute;\n    padding: 1.2em;\n    top: 100px;\n    margin-left: 10%;\n    text-align: center;\n\n}\n.print-noPrintArea{\n    position: absolute;\n    top: 190px;\n    width: 20%;\n    margin-left: 2%;\n    height: 100%;\n    text-align: center;\n}\n.print-menu{\n    float:left;\n    width: 100%;\n    text-align: center;\n    padding: 1.2em;\n    top:0px;\n    background-color: #fff;\n}\n\n.print-btn{\n    position: absolute;\n    top: 200px;\n    width: 100%;\n}\n\n.print-menu button{\n    padding: 1.0em;\n    width: 100%;\n}\n.print-menu ul{\n    margin: 0;\n    padding: 5px;\n    list-style: none;\n}\n.print-menu li{\n    display: list-item;  /* 縦に並べる */\n    list-style-type: none;\n}\n\n.print-printArea{\n    position: absolute;\n    top: 190px;\n    left: auto;\n    width: 72%;\n    margin-left: 25%;\n    height: 100%;\n}\n\n\n#note{\n    padding-bottom: 0.1em;\n    background-size: 2px 2.2em;\n    line-height: 2.24;\n    padding-left:25px;\n    border-collapse: collapse;\n    background-image: linear-gradient(to right, #fff 1.1px, transparent 1px), linear-gradient(to bottom, #ccc 1.1px, transparent 1px);\n    border-spacing: 0;\n}\n\n#test{\n    padding-bottom: 0.1em;\n    background-size: 2px 2.2em;\n    line-height: 2.15;\n    padding-left:25px;\n}\n\n@media print{\n    body{\n        background-color: #ffffff;\n        height: 100%;\n    }\n  .print-noPrintArea{\n      display:none;\n      margin-left: 0px;\n   }\n  .print-printArea{\n     top:0px;\n     margin-left:0;\n     width:100%;\n     height: 100%;\n     font-size: 0.9em;\n  }\n  #note{\n      line-height: 2.21;\n  }\n}\n\n.print-formatChoose,\n.print-formatWrite{\n    margin-left:30px;\n    margin-top: 5px;\n}\n\n.print-answerBox {\n    width: 90%;\n    background: white;\n    border: 0.5px solid black;\n    margin: 15px;\n    margin-bottom: 0px;\n    height:100px;\n}\n.explainPrint-styleAlert{\n    position: absolute;\n    width: 90%;\n    text-align: center;\n    margin: 5%;\n    top: 60px;\n}\n", ""]);

// exports


/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

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
        __webpack_require__(85);
        __webpack_require__(86);

        //グローバル変数の読み込み
        makeExplainCtrl.globalParam = __webpack_require__(14);

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


/***/ }),
/* 214 */
/***/ (function(module, exports, __webpack_require__) {

(function() {

    angular
        .module('learnApp')
        .controller('explainModalController', explainModalController);

    explainModalController.$inject = ['$scope','$sce','ApiService'];
    function explainModalController($scope,$sce,ApiService) {
        var explainModalCtrl = this;

        explainModalCtrl.value = {
            showExplain: {}, //表示する解説
            flag: {
                sameUser: false, //自分が作成した解説
                previewUser: false, //解説プレビュー
                showComment: false, //コメント表示
                commentLoading: false //コメント読み込み中
            },
            explainContent: "", //解説内容
            comments: [] //解説宛のコメント
        };

        explainModalCtrl.method = {
            init: init, //初期化
            clickPrintButton: clickPrintButton, //印刷ボタンクリック
            clickEditButton:clickEditButton, //編集ボタンクリック
            clickFinishButton: clickFinishButton, //終了ボタンクリック
            clickPreviewCompleteButton:clickPreviewCompleteButton, //プレビュー完了クリック
            clickDeleteButton:clickDeleteButton, //削除クリック
            clickCommentButton: clickCommentButton //コメント表示クリック
        };

        //スタイルロード
        __webpack_require__(215);

        //グローバル変数の読み込み
        explainModalCtrl.globalParam = __webpack_require__(14);

        //jquery読み込み
        const jquery = __webpack_require__(217);

        //初期化メソッド
        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //解説モーダル表示の時
            if(explainModalCtrl.globalParam.flag.showExplain){
                explainModalCtrl.value.showExplain = explainModalCtrl.globalParam.value.showExplain; //表示する解説のセット
            //解説プレビュー表示の時
            }else{
                explainModalCtrl.value.showExplain = explainModalCtrl.globalParam.value.previewExplain; //プレビューする解説のセット
            }
            //表示する解説はユーザが作成したものか
            if(explainModalCtrl.value.showExplain.userId == $scope.indexCtrl.value.userId){
                explainModalCtrl.value.flag.sameUser = true;
            }else{
                //作成した解説のユーザIDが未定義の時(まだ解説を作成していない時)
                if(explainModalCtrl.value.showExplain.userId===undefined){
                    explainModalCtrl.value.flag.previewUser = true;
                }else{
                    explainModalCtrl.value.flag.sameUser = false;
                }
            }
            //解説のマークアップ
            var explain = __webpack_require__(15); //マークチェンジモジュールの呼び出し
            explainModalCtrl.value.explainContent = explain.markupChange(explainModalCtrl.value.showExplain.content,explainModalCtrl.value.showExplain.imgUrl);
            explainModalCtrl.value.explainContent = $sce.trustAsHtml(explainModalCtrl.value.explainContent); //ng-bind-view
        }


        /**
         * 印刷ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickPrintButton(){
           var itemsString = JSON.stringify(explainModalCtrl.value.showExplain); //印刷する解説の文字列化
           var itemsStringBase64 = base64url.encode(itemsString); //印刷する解説のbase64化
           var url = './#/explainPrint/' + itemsStringBase64; //画面遷移先のURL設定
           window.open(url); //印刷画面の表示
        }

        /**
         * 編集ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickEditButton(){
            explainModalCtrl.globalParam.flag.showExplain = false; //解説モーダル非表示
            explainModalCtrl.globalParam.flag.detailExplain = true; //解説編集画面の表示
            explainModalCtrl.globalParam.value.detailExplain = explainModalCtrl.value.showExplain; //表示中の解説を解説編集にセット
        }

        /**
         * 終了ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickFinishButton(){
            //解説モーダル表示の時
            if(explainModalCtrl.globalParam.flag.showExplain){
                explainModalCtrl.globalParam.flag.showExplain = false; //解説モーダル非表示
            //解説プレビュー表示の時
            }else{
                explainModalCtrl.globalParam.flag.previewExplain = false; //解説プレビュー非表示
            }
        }

        /**
         * プレビュー完了メソッド
         * @return {[type]} [description]
         */
        function clickPreviewCompleteButton(){
            explainModalCtrl.globalParam.flag.previewExplain = false; //解説プレビュー非表示
            explainModalCtrl.globalParam.flag.detailExplain = true; //解説編集画面の表示
        }

        /**
         * 削除クリックメソッド
         * @return {[type]} [description]
         */
        function clickDeleteButton(){
            explainModalCtrl.globalParam.value.showExplain = explainModalCtrl.value.showExplain; //表示中の解説を表示解説にセット
            explainModalCtrl.globalParam.flag.showExplain = false; //解説モーダル非表示
        }

        /**
         * コメント表示クリックメソッド
         * @return {[type]} [description]
         */
        function clickCommentButton(){
            if(!explainModalCtrl.value.flag.showComment){
                jquery('#comment').css(
                    {
                        'display': 'block'
                    }
                );
                jquery('#comment').animate(
                    {
                        'width':'30%'
                    },
                    {
                        'duration': 300
                    }
                );
                jquery('#content').animate(
                    {
                        'width':'60%'
                    },
                    {
                        'duration': 300
                    }
                );
                explainModalCtrl.value.flag.showComment = true;
                if(explainModalCtrl.value.comments.length === 0){
                    explainModalCtrl.value.flag.commentLoading = true;
                    //コメントの取得
                    ApiService.getComment(explainModalCtrl.globalParam.value.showExplain.id, 'explain').success(
                       function(data) {
                           if(data.data.length !== 0){
                               explainModalCtrl.value.comments = data.data;
                           }
                           explainModalCtrl.value.flag.commentLoading = false;
                       }
                    );
                }
           }else{
               jquery('#comment').animate(
                   {
                       'width':'20%'
                   },
                   {
                       'duration': 300
                   }
               );
               jquery('#content').animate(
                   {
                       'width':'75%'
                   },
                   {
                       'duration': 300
                   }
               );
              jquery('#comment').css(
                  {
                      'display': 'none'
                  }
              );

              explainModalCtrl.value.flag.showComment = false;
           }
        }
    }
}());


/***/ }),
/* 215 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(216);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./explainModal.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./explainModal.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 216 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".explain-modal-header-icon{\n    float:right;\n    margin-right:25px;\n    margin-top:-3px;\n}\n\n.explain-modal-header-icon i{\n    padding-left: .3em;\n    cursor: pointer;\n}\n\n.common-explain-content{\n    margin-left: 20px;\n    margin-right: 20px;\n    height:auto;\n    min-height: 400px;\n    max-height: 400px;\n    overflow: auto;\n}\n\n.explainModal-comment{\n    float:right;\n    display:none;\n    min-height:400px;\n    max-height:400px;\n    overflow:auto;\n    border-left:1px solid #e5e5e5;\n}\n", ""]);

// exports


/***/ }),
/* 217 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! jQuery v3.2.1 | (c) JS Foundation and other contributors | jquery.org/license */
!function(a,b){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){"use strict";var c=[],d=a.document,e=Object.getPrototypeOf,f=c.slice,g=c.concat,h=c.push,i=c.indexOf,j={},k=j.toString,l=j.hasOwnProperty,m=l.toString,n=m.call(Object),o={};function p(a,b){b=b||d;var c=b.createElement("script");c.text=a,b.head.appendChild(c).parentNode.removeChild(c)}var q="3.2.1",r=function(a,b){return new r.fn.init(a,b)},s=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,t=/^-ms-/,u=/-([a-z])/g,v=function(a,b){return b.toUpperCase()};r.fn=r.prototype={jquery:q,constructor:r,length:0,toArray:function(){return f.call(this)},get:function(a){return null==a?f.call(this):a<0?this[a+this.length]:this[a]},pushStack:function(a){var b=r.merge(this.constructor(),a);return b.prevObject=this,b},each:function(a){return r.each(this,a)},map:function(a){return this.pushStack(r.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(f.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(a<0?b:0);return this.pushStack(c>=0&&c<b?[this[c]]:[])},end:function(){return this.prevObject||this.constructor()},push:h,sort:c.sort,splice:c.splice},r.extend=r.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||r.isFunction(g)||(g={}),h===i&&(g=this,h--);h<i;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(r.isPlainObject(d)||(e=Array.isArray(d)))?(e?(e=!1,f=c&&Array.isArray(c)?c:[]):f=c&&r.isPlainObject(c)?c:{},g[b]=r.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},r.extend({expando:"jQuery"+(q+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===r.type(a)},isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){var b=r.type(a);return("number"===b||"string"===b)&&!isNaN(a-parseFloat(a))},isPlainObject:function(a){var b,c;return!(!a||"[object Object]"!==k.call(a))&&(!(b=e(a))||(c=l.call(b,"constructor")&&b.constructor,"function"==typeof c&&m.call(c)===n))},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?j[k.call(a)]||"object":typeof a},globalEval:function(a){p(a)},camelCase:function(a){return a.replace(t,"ms-").replace(u,v)},each:function(a,b){var c,d=0;if(w(a)){for(c=a.length;d<c;d++)if(b.call(a[d],d,a[d])===!1)break}else for(d in a)if(b.call(a[d],d,a[d])===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(s,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(w(Object(a))?r.merge(c,"string"==typeof a?[a]:a):h.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:i.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;d<c;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;f<g;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,e,f=0,h=[];if(w(a))for(d=a.length;f<d;f++)e=b(a[f],f,c),null!=e&&h.push(e);else for(f in a)e=b(a[f],f,c),null!=e&&h.push(e);return g.apply([],h)},guid:1,proxy:function(a,b){var c,d,e;if("string"==typeof b&&(c=a[b],b=a,a=c),r.isFunction(a))return d=f.call(arguments,2),e=function(){return a.apply(b||this,d.concat(f.call(arguments)))},e.guid=a.guid=a.guid||r.guid++,e},now:Date.now,support:o}),"function"==typeof Symbol&&(r.fn[Symbol.iterator]=c[Symbol.iterator]),r.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(a,b){j["[object "+b+"]"]=b.toLowerCase()});function w(a){var b=!!a&&"length"in a&&a.length,c=r.type(a);return"function"!==c&&!r.isWindow(a)&&("array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a)}var x=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ha(),z=ha(),A=ha(),B=function(a,b){return a===b&&(l=!0),0},C={}.hasOwnProperty,D=[],E=D.pop,F=D.push,G=D.push,H=D.slice,I=function(a,b){for(var c=0,d=a.length;c<d;c++)if(a[c]===b)return c;return-1},J="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",K="[\\x20\\t\\r\\n\\f]",L="(?:\\\\.|[\\w-]|[^\0-\\xa0])+",M="\\["+K+"*("+L+")(?:"+K+"*([*^$|!~]?=)"+K+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+L+"))|)"+K+"*\\]",N=":("+L+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+M+")*)|.*)\\)|)",O=new RegExp(K+"+","g"),P=new RegExp("^"+K+"+|((?:^|[^\\\\])(?:\\\\.)*)"+K+"+$","g"),Q=new RegExp("^"+K+"*,"+K+"*"),R=new RegExp("^"+K+"*([>+~]|"+K+")"+K+"*"),S=new RegExp("="+K+"*([^\\]'\"]*?)"+K+"*\\]","g"),T=new RegExp(N),U=new RegExp("^"+L+"$"),V={ID:new RegExp("^#("+L+")"),CLASS:new RegExp("^\\.("+L+")"),TAG:new RegExp("^("+L+"|[*])"),ATTR:new RegExp("^"+M),PSEUDO:new RegExp("^"+N),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+K+"*(even|odd|(([+-]|)(\\d*)n|)"+K+"*(?:([+-]|)"+K+"*(\\d+)|))"+K+"*\\)|)","i"),bool:new RegExp("^(?:"+J+")$","i"),needsContext:new RegExp("^"+K+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+K+"*((?:-\\d)?\\d*)"+K+"*\\)|)(?=[^-]|$)","i")},W=/^(?:input|select|textarea|button)$/i,X=/^h\d$/i,Y=/^[^{]+\{\s*\[native \w/,Z=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,$=/[+~]/,_=new RegExp("\\\\([\\da-f]{1,6}"+K+"?|("+K+")|.)","ig"),aa=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:d<0?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},ba=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ca=function(a,b){return b?"\0"===a?"\ufffd":a.slice(0,-1)+"\\"+a.charCodeAt(a.length-1).toString(16)+" ":"\\"+a},da=function(){m()},ea=ta(function(a){return a.disabled===!0&&("form"in a||"label"in a)},{dir:"parentNode",next:"legend"});try{G.apply(D=H.call(v.childNodes),v.childNodes),D[v.childNodes.length].nodeType}catch(fa){G={apply:D.length?function(a,b){F.apply(a,H.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function ga(a,b,d,e){var f,h,j,k,l,o,r,s=b&&b.ownerDocument,w=b?b.nodeType:9;if(d=d||[],"string"!=typeof a||!a||1!==w&&9!==w&&11!==w)return d;if(!e&&((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,p)){if(11!==w&&(l=Z.exec(a)))if(f=l[1]){if(9===w){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(s&&(j=s.getElementById(f))&&t(b,j)&&j.id===f)return d.push(j),d}else{if(l[2])return G.apply(d,b.getElementsByTagName(a)),d;if((f=l[3])&&c.getElementsByClassName&&b.getElementsByClassName)return G.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&&!A[a+" "]&&(!q||!q.test(a))){if(1!==w)s=b,r=a;else if("object"!==b.nodeName.toLowerCase()){(k=b.getAttribute("id"))?k=k.replace(ba,ca):b.setAttribute("id",k=u),o=g(a),h=o.length;while(h--)o[h]="#"+k+" "+sa(o[h]);r=o.join(","),s=$.test(a)&&qa(b.parentNode)||b}if(r)try{return G.apply(d,s.querySelectorAll(r)),d}catch(x){}finally{k===u&&b.removeAttribute("id")}}}return i(a.replace(P,"$1"),b,d,e)}function ha(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ia(a){return a[u]=!0,a}function ja(a){var b=n.createElement("fieldset");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ka(a,b){var c=a.split("|"),e=c.length;while(e--)d.attrHandle[c[e]]=b}function la(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&a.sourceIndex-b.sourceIndex;if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function na(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function oa(a){return function(b){return"form"in b?b.parentNode&&b.disabled===!1?"label"in b?"label"in b.parentNode?b.parentNode.disabled===a:b.disabled===a:b.isDisabled===a||b.isDisabled!==!a&&ea(b)===a:b.disabled===a:"label"in b&&b.disabled===a}}function pa(a){return ia(function(b){return b=+b,ia(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function qa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=ga.support={},f=ga.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return!!b&&"HTML"!==b.nodeName},m=ga.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=n.documentElement,p=!f(n),v!==n&&(e=n.defaultView)&&e.top!==e&&(e.addEventListener?e.addEventListener("unload",da,!1):e.attachEvent&&e.attachEvent("onunload",da)),c.attributes=ja(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ja(function(a){return a.appendChild(n.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Y.test(n.getElementsByClassName),c.getById=ja(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.filter.ID=function(a){var b=a.replace(_,aa);return function(a){return a.getAttribute("id")===b}},d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c?[c]:[]}}):(d.filter.ID=function(a){var b=a.replace(_,aa);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}},d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c,d,e,f=b.getElementById(a);if(f){if(c=f.getAttributeNode("id"),c&&c.value===a)return[f];e=b.getElementsByName(a),d=0;while(f=e[d++])if(c=f.getAttributeNode("id"),c&&c.value===a)return[f]}return[]}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){if("undefined"!=typeof b.getElementsByClassName&&p)return b.getElementsByClassName(a)},r=[],q=[],(c.qsa=Y.test(n.querySelectorAll))&&(ja(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+K+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+K+"*(?:value|"+J+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ja(function(a){a.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var b=n.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+K+"*[*^$|!~]?="),2!==a.querySelectorAll(":enabled").length&&q.push(":enabled",":disabled"),o.appendChild(a).disabled=!0,2!==a.querySelectorAll(":disabled").length&&q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Y.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ja(function(a){c.disconnectedMatch=s.call(a,"*"),s.call(a,"[s!='']:x"),r.push("!=",N)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Y.test(o.compareDocumentPosition),t=b||Y.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&&t(v,a)?-1:b===n||b.ownerDocument===v&&t(v,b)?1:k?I(k,a)-I(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?I(k,a)-I(k,b):0;if(e===f)return la(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?la(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},ga.matches=function(a,b){return ga(a,null,null,b)},ga.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(S,"='$1']"),c.matchesSelector&&p&&!A[b+" "]&&(!r||!r.test(b))&&(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return ga(b,n,null,[a]).length>0},ga.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},ga.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&C.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},ga.escape=function(a){return(a+"").replace(ba,ca)},ga.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},ga.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=ga.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=ga.selectors={cacheLength:50,createPseudo:ia,match:V,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(_,aa),a[3]=(a[3]||a[4]||a[5]||"").replace(_,aa),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||ga.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&ga.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return V.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&T.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(_,aa).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+K+")"+a+"("+K+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=ga.attr(d,a);return null==e?"!="===b:!b||(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(O," ")+" ").indexOf(c)>-1:"|="===b&&(e===c||e.slice(0,c.length+1)===c+"-"))}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n&&j[2],m=n&&q.childNodes[n];while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if(1===m.nodeType&&++t&&m===b){k[a]=[w,n,t];break}}else if(s&&(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n),t===!1)while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&&++t&&(s&&(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&&t/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||ga.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ia(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=I(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ia(function(a){var b=[],c=[],d=h(a.replace(P,"$1"));return d[u]?ia(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ia(function(a){return function(b){return ga(a,b).length>0}}),contains:ia(function(a){return a=a.replace(_,aa),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ia(function(a){return U.test(a||"")||ga.error("unsupported lang: "+a),a=a.replace(_,aa).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:oa(!1),disabled:oa(!0),checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return X.test(a.nodeName)},input:function(a){return W.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:pa(function(){return[0]}),last:pa(function(a,b){return[b-1]}),eq:pa(function(a,b,c){return[c<0?c+b:c]}),even:pa(function(a,b){for(var c=0;c<b;c+=2)a.push(c);return a}),odd:pa(function(a,b){for(var c=1;c<b;c+=2)a.push(c);return a}),lt:pa(function(a,b,c){for(var d=c<0?c+b:c;--d>=0;)a.push(d);return a}),gt:pa(function(a,b,c){for(var d=c<0?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=ma(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=na(b);function ra(){}ra.prototype=d.filters=d.pseudos,d.setFilters=new ra,g=ga.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){c&&!(e=Q.exec(h))||(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=R.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(P," ")}),h=h.slice(c.length));for(g in d.filter)!(e=V[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?ga.error(a):z(a,i).slice(0)};function sa(a){for(var b=0,c=a.length,d="";b<c;b++)d+=a[b].value;return d}function ta(a,b,c){var d=b.dir,e=b.next,f=e||d,g=c&&"parentNode"===f,h=x++;return b.first?function(b,c,e){while(b=b[d])if(1===b.nodeType||g)return a(b,c,e);return!1}:function(b,c,i){var j,k,l,m=[w,h];if(i){while(b=b[d])if((1===b.nodeType||g)&&a(b,c,i))return!0}else while(b=b[d])if(1===b.nodeType||g)if(l=b[u]||(b[u]={}),k=l[b.uniqueID]||(l[b.uniqueID]={}),e&&e===b.nodeName.toLowerCase())b=b[d]||b;else{if((j=k[f])&&j[0]===w&&j[1]===h)return m[2]=j[2];if(k[f]=m,m[2]=a(b,c,i))return!0}return!1}}function ua(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function va(a,b,c){for(var d=0,e=b.length;d<e;d++)ga(a,b[d],c);return c}function wa(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;h<i;h++)(f=a[h])&&(c&&!c(f,d,e)||(g.push(f),j&&b.push(h)));return g}function xa(a,b,c,d,e,f){return d&&!d[u]&&(d=xa(d)),e&&!e[u]&&(e=xa(e,f)),ia(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||va(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:wa(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=wa(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?I(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=wa(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):G.apply(g,r)})}function ya(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=ta(function(a){return a===b},h,!0),l=ta(function(a){return I(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];i<f;i++)if(c=d.relative[a[i].type])m=[ta(ua(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;e<f;e++)if(d.relative[a[e].type])break;return xa(i>1&&ua(m),i>1&&sa(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(P,"$1"),c,i<e&&ya(a.slice(i,e)),e<f&&ya(a=a.slice(e)),e<f&&sa(a))}m.push(c)}return ua(m)}function za(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,o,q,r=0,s="0",t=f&&[],u=[],v=j,x=f||e&&d.find.TAG("*",k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&&(j=g===n||g||k);s!==z&&null!=(l=x[s]);s++){if(e&&l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&&(w=y)}c&&((l=!q&&l)&&r--,f&&t.push(l))}if(r+=s,c&&s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r>0)while(s--)t[s]||u[s]||(u[s]=E.call(i));u=wa(u)}G.apply(i,u),k&&!f&&u.length>0&&r+b.length>1&&ga.uniqueSort(i)}return k&&(w=y,j=v),t};return c?ia(f):f}return h=ga.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=ya(b[c]),f[u]?d.push(f):e.push(f);f=A(a,za(e,d)),f.selector=a}return f},i=ga.select=function(a,b,c,e){var f,i,j,k,l,m="function"==typeof a&&a,n=!e&&g(a=m.selector||a);if(c=c||[],1===n.length){if(i=n[0]=n[0].slice(0),i.length>2&&"ID"===(j=i[0]).type&&9===b.nodeType&&p&&d.relative[i[1].type]){if(b=(d.find.ID(j.matches[0].replace(_,aa),b)||[])[0],!b)return c;m&&(b=b.parentNode),a=a.slice(i.shift().value.length)}f=V.needsContext.test(a)?0:i.length;while(f--){if(j=i[f],d.relative[k=j.type])break;if((l=d.find[k])&&(e=l(j.matches[0].replace(_,aa),$.test(i[0].type)&&qa(b.parentNode)||b))){if(i.splice(f,1),a=e.length&&sa(i),!a)return G.apply(c,e),c;break}}}return(m||h(a,n))(e,b,!p,c,!b||$.test(a)&&qa(b.parentNode)||b),c},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ja(function(a){return 1&a.compareDocumentPosition(n.createElement("fieldset"))}),ja(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ka("type|href|height|width",function(a,b,c){if(!c)return a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ja(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ka("value",function(a,b,c){if(!c&&"input"===a.nodeName.toLowerCase())return a.defaultValue}),ja(function(a){return null==a.getAttribute("disabled")})||ka(J,function(a,b,c){var d;if(!c)return a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),ga}(a);r.find=x,r.expr=x.selectors,r.expr[":"]=r.expr.pseudos,r.uniqueSort=r.unique=x.uniqueSort,r.text=x.getText,r.isXMLDoc=x.isXML,r.contains=x.contains,r.escapeSelector=x.escape;var y=function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&r(a).is(c))break;d.push(a)}return d},z=function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c},A=r.expr.match.needsContext;function B(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()}var C=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i,D=/^.[^:#\[\.,]*$/;function E(a,b,c){return r.isFunction(b)?r.grep(a,function(a,d){return!!b.call(a,d,a)!==c}):b.nodeType?r.grep(a,function(a){return a===b!==c}):"string"!=typeof b?r.grep(a,function(a){return i.call(b,a)>-1!==c}):D.test(b)?r.filter(b,a,c):(b=r.filter(b,a),r.grep(a,function(a){return i.call(b,a)>-1!==c&&1===a.nodeType}))}r.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?r.find.matchesSelector(d,a)?[d]:[]:r.find.matches(a,r.grep(b,function(a){return 1===a.nodeType}))},r.fn.extend({find:function(a){var b,c,d=this.length,e=this;if("string"!=typeof a)return this.pushStack(r(a).filter(function(){for(b=0;b<d;b++)if(r.contains(e[b],this))return!0}));for(c=this.pushStack([]),b=0;b<d;b++)r.find(a,e[b],c);return d>1?r.uniqueSort(c):c},filter:function(a){return this.pushStack(E(this,a||[],!1))},not:function(a){return this.pushStack(E(this,a||[],!0))},is:function(a){return!!E(this,"string"==typeof a&&A.test(a)?r(a):a||[],!1).length}});var F,G=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,H=r.fn.init=function(a,b,c){var e,f;if(!a)return this;if(c=c||F,"string"==typeof a){if(e="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:G.exec(a),!e||!e[1]&&b)return!b||b.jquery?(b||c).find(a):this.constructor(b).find(a);if(e[1]){if(b=b instanceof r?b[0]:b,r.merge(this,r.parseHTML(e[1],b&&b.nodeType?b.ownerDocument||b:d,!0)),C.test(e[1])&&r.isPlainObject(b))for(e in b)r.isFunction(this[e])?this[e](b[e]):this.attr(e,b[e]);return this}return f=d.getElementById(e[2]),f&&(this[0]=f,this.length=1),this}return a.nodeType?(this[0]=a,this.length=1,this):r.isFunction(a)?void 0!==c.ready?c.ready(a):a(r):r.makeArray(a,this)};H.prototype=r.fn,F=r(d);var I=/^(?:parents|prev(?:Until|All))/,J={children:!0,contents:!0,next:!0,prev:!0};r.fn.extend({has:function(a){var b=r(a,this),c=b.length;return this.filter(function(){for(var a=0;a<c;a++)if(r.contains(this,b[a]))return!0})},closest:function(a,b){var c,d=0,e=this.length,f=[],g="string"!=typeof a&&r(a);if(!A.test(a))for(;d<e;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&r.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?r.uniqueSort(f):f)},index:function(a){return a?"string"==typeof a?i.call(r(a),this[0]):i.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(r.uniqueSort(r.merge(this.get(),r(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function K(a,b){while((a=a[b])&&1!==a.nodeType);return a}r.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return y(a,"parentNode")},parentsUntil:function(a,b,c){return y(a,"parentNode",c)},next:function(a){return K(a,"nextSibling")},prev:function(a){return K(a,"previousSibling")},nextAll:function(a){return y(a,"nextSibling")},prevAll:function(a){return y(a,"previousSibling")},nextUntil:function(a,b,c){return y(a,"nextSibling",c)},prevUntil:function(a,b,c){return y(a,"previousSibling",c)},siblings:function(a){return z((a.parentNode||{}).firstChild,a)},children:function(a){return z(a.firstChild)},contents:function(a){return B(a,"iframe")?a.contentDocument:(B(a,"template")&&(a=a.content||a),r.merge([],a.childNodes))}},function(a,b){r.fn[a]=function(c,d){var e=r.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=r.filter(d,e)),this.length>1&&(J[a]||r.uniqueSort(e),I.test(a)&&e.reverse()),this.pushStack(e)}});var L=/[^\x20\t\r\n\f]+/g;function M(a){var b={};return r.each(a.match(L)||[],function(a,c){b[c]=!0}),b}r.Callbacks=function(a){a="string"==typeof a?M(a):r.extend({},a);var b,c,d,e,f=[],g=[],h=-1,i=function(){for(e=e||a.once,d=b=!0;g.length;h=-1){c=g.shift();while(++h<f.length)f[h].apply(c[0],c[1])===!1&&a.stopOnFalse&&(h=f.length,c=!1)}a.memory||(c=!1),b=!1,e&&(f=c?[]:"")},j={add:function(){return f&&(c&&!b&&(h=f.length-1,g.push(c)),function d(b){r.each(b,function(b,c){r.isFunction(c)?a.unique&&j.has(c)||f.push(c):c&&c.length&&"string"!==r.type(c)&&d(c)})}(arguments),c&&!b&&i()),this},remove:function(){return r.each(arguments,function(a,b){var c;while((c=r.inArray(b,f,c))>-1)f.splice(c,1),c<=h&&h--}),this},has:function(a){return a?r.inArray(a,f)>-1:f.length>0},empty:function(){return f&&(f=[]),this},disable:function(){return e=g=[],f=c="",this},disabled:function(){return!f},lock:function(){return e=g=[],c||b||(f=c=""),this},locked:function(){return!!e},fireWith:function(a,c){return e||(c=c||[],c=[a,c.slice?c.slice():c],g.push(c),b||i()),this},fire:function(){return j.fireWith(this,arguments),this},fired:function(){return!!d}};return j};function N(a){return a}function O(a){throw a}function P(a,b,c,d){var e;try{a&&r.isFunction(e=a.promise)?e.call(a).done(b).fail(c):a&&r.isFunction(e=a.then)?e.call(a,b,c):b.apply(void 0,[a].slice(d))}catch(a){c.apply(void 0,[a])}}r.extend({Deferred:function(b){var c=[["notify","progress",r.Callbacks("memory"),r.Callbacks("memory"),2],["resolve","done",r.Callbacks("once memory"),r.Callbacks("once memory"),0,"resolved"],["reject","fail",r.Callbacks("once memory"),r.Callbacks("once memory"),1,"rejected"]],d="pending",e={state:function(){return d},always:function(){return f.done(arguments).fail(arguments),this},"catch":function(a){return e.then(null,a)},pipe:function(){var a=arguments;return r.Deferred(function(b){r.each(c,function(c,d){var e=r.isFunction(a[d[4]])&&a[d[4]];f[d[1]](function(){var a=e&&e.apply(this,arguments);a&&r.isFunction(a.promise)?a.promise().progress(b.notify).done(b.resolve).fail(b.reject):b[d[0]+"With"](this,e?[a]:arguments)})}),a=null}).promise()},then:function(b,d,e){var f=0;function g(b,c,d,e){return function(){var h=this,i=arguments,j=function(){var a,j;if(!(b<f)){if(a=d.apply(h,i),a===c.promise())throw new TypeError("Thenable self-resolution");j=a&&("object"==typeof a||"function"==typeof a)&&a.then,r.isFunction(j)?e?j.call(a,g(f,c,N,e),g(f,c,O,e)):(f++,j.call(a,g(f,c,N,e),g(f,c,O,e),g(f,c,N,c.notifyWith))):(d!==N&&(h=void 0,i=[a]),(e||c.resolveWith)(h,i))}},k=e?j:function(){try{j()}catch(a){r.Deferred.exceptionHook&&r.Deferred.exceptionHook(a,k.stackTrace),b+1>=f&&(d!==O&&(h=void 0,i=[a]),c.rejectWith(h,i))}};b?k():(r.Deferred.getStackHook&&(k.stackTrace=r.Deferred.getStackHook()),a.setTimeout(k))}}return r.Deferred(function(a){c[0][3].add(g(0,a,r.isFunction(e)?e:N,a.notifyWith)),c[1][3].add(g(0,a,r.isFunction(b)?b:N)),c[2][3].add(g(0,a,r.isFunction(d)?d:O))}).promise()},promise:function(a){return null!=a?r.extend(a,e):e}},f={};return r.each(c,function(a,b){var g=b[2],h=b[5];e[b[1]]=g.add,h&&g.add(function(){d=h},c[3-a][2].disable,c[0][2].lock),g.add(b[3].fire),f[b[0]]=function(){return f[b[0]+"With"](this===f?void 0:this,arguments),this},f[b[0]+"With"]=g.fireWith}),e.promise(f),b&&b.call(f,f),f},when:function(a){var b=arguments.length,c=b,d=Array(c),e=f.call(arguments),g=r.Deferred(),h=function(a){return function(c){d[a]=this,e[a]=arguments.length>1?f.call(arguments):c,--b||g.resolveWith(d,e)}};if(b<=1&&(P(a,g.done(h(c)).resolve,g.reject,!b),"pending"===g.state()||r.isFunction(e[c]&&e[c].then)))return g.then();while(c--)P(e[c],h(c),g.reject);return g.promise()}});var Q=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;r.Deferred.exceptionHook=function(b,c){a.console&&a.console.warn&&b&&Q.test(b.name)&&a.console.warn("jQuery.Deferred exception: "+b.message,b.stack,c)},r.readyException=function(b){a.setTimeout(function(){throw b})};var R=r.Deferred();r.fn.ready=function(a){return R.then(a)["catch"](function(a){r.readyException(a)}),this},r.extend({isReady:!1,readyWait:1,ready:function(a){(a===!0?--r.readyWait:r.isReady)||(r.isReady=!0,a!==!0&&--r.readyWait>0||R.resolveWith(d,[r]))}}),r.ready.then=R.then;function S(){d.removeEventListener("DOMContentLoaded",S),
a.removeEventListener("load",S),r.ready()}"complete"===d.readyState||"loading"!==d.readyState&&!d.documentElement.doScroll?a.setTimeout(r.ready):(d.addEventListener("DOMContentLoaded",S),a.addEventListener("load",S));var T=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===r.type(c)){e=!0;for(h in c)T(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,r.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(r(a),c)})),b))for(;h<i;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},U=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function V(){this.expando=r.expando+V.uid++}V.uid=1,V.prototype={cache:function(a){var b=a[this.expando];return b||(b={},U(a)&&(a.nodeType?a[this.expando]=b:Object.defineProperty(a,this.expando,{value:b,configurable:!0}))),b},set:function(a,b,c){var d,e=this.cache(a);if("string"==typeof b)e[r.camelCase(b)]=c;else for(d in b)e[r.camelCase(d)]=b[d];return e},get:function(a,b){return void 0===b?this.cache(a):a[this.expando]&&a[this.expando][r.camelCase(b)]},access:function(a,b,c){return void 0===b||b&&"string"==typeof b&&void 0===c?this.get(a,b):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d=a[this.expando];if(void 0!==d){if(void 0!==b){Array.isArray(b)?b=b.map(r.camelCase):(b=r.camelCase(b),b=b in d?[b]:b.match(L)||[]),c=b.length;while(c--)delete d[b[c]]}(void 0===b||r.isEmptyObject(d))&&(a.nodeType?a[this.expando]=void 0:delete a[this.expando])}},hasData:function(a){var b=a[this.expando];return void 0!==b&&!r.isEmptyObject(b)}};var W=new V,X=new V,Y=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,Z=/[A-Z]/g;function $(a){return"true"===a||"false"!==a&&("null"===a?null:a===+a+""?+a:Y.test(a)?JSON.parse(a):a)}function _(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(Z,"-$&").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c=$(c)}catch(e){}X.set(a,b,c)}else c=void 0;return c}r.extend({hasData:function(a){return X.hasData(a)||W.hasData(a)},data:function(a,b,c){return X.access(a,b,c)},removeData:function(a,b){X.remove(a,b)},_data:function(a,b,c){return W.access(a,b,c)},_removeData:function(a,b){W.remove(a,b)}}),r.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=X.get(f),1===f.nodeType&&!W.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=r.camelCase(d.slice(5)),_(f,d,e[d])));W.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){X.set(this,a)}):T(this,function(b){var c;if(f&&void 0===b){if(c=X.get(f,a),void 0!==c)return c;if(c=_(f,a),void 0!==c)return c}else this.each(function(){X.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){X.remove(this,a)})}}),r.extend({queue:function(a,b,c){var d;if(a)return b=(b||"fx")+"queue",d=W.get(a,b),c&&(!d||Array.isArray(c)?d=W.access(a,b,r.makeArray(c)):d.push(c)),d||[]},dequeue:function(a,b){b=b||"fx";var c=r.queue(a,b),d=c.length,e=c.shift(),f=r._queueHooks(a,b),g=function(){r.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return W.get(a,c)||W.access(a,c,{empty:r.Callbacks("once memory").add(function(){W.remove(a,[b+"queue",c])})})}}),r.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?r.queue(this[0],a):void 0===b?this:this.each(function(){var c=r.queue(this,a,b);r._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&r.dequeue(this,a)})},dequeue:function(a){return this.each(function(){r.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=r.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=W.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var aa=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,ba=new RegExp("^(?:([+-])=|)("+aa+")([a-z%]*)$","i"),ca=["Top","Right","Bottom","Left"],da=function(a,b){return a=b||a,"none"===a.style.display||""===a.style.display&&r.contains(a.ownerDocument,a)&&"none"===r.css(a,"display")},ea=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};function fa(a,b,c,d){var e,f=1,g=20,h=d?function(){return d.cur()}:function(){return r.css(a,b,"")},i=h(),j=c&&c[3]||(r.cssNumber[b]?"":"px"),k=(r.cssNumber[b]||"px"!==j&&+i)&&ba.exec(r.css(a,b));if(k&&k[3]!==j){j=j||k[3],c=c||[],k=+i||1;do f=f||".5",k/=f,r.style(a,b,k+j);while(f!==(f=h()/i)&&1!==f&&--g)}return c&&(k=+k||+i||0,e=c[1]?k+(c[1]+1)*c[2]:+c[2],d&&(d.unit=j,d.start=k,d.end=e)),e}var ga={};function ha(a){var b,c=a.ownerDocument,d=a.nodeName,e=ga[d];return e?e:(b=c.body.appendChild(c.createElement(d)),e=r.css(b,"display"),b.parentNode.removeChild(b),"none"===e&&(e="block"),ga[d]=e,e)}function ia(a,b){for(var c,d,e=[],f=0,g=a.length;f<g;f++)d=a[f],d.style&&(c=d.style.display,b?("none"===c&&(e[f]=W.get(d,"display")||null,e[f]||(d.style.display="")),""===d.style.display&&da(d)&&(e[f]=ha(d))):"none"!==c&&(e[f]="none",W.set(d,"display",c)));for(f=0;f<g;f++)null!=e[f]&&(a[f].style.display=e[f]);return a}r.fn.extend({show:function(){return ia(this,!0)},hide:function(){return ia(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){da(this)?r(this).show():r(this).hide()})}});var ja=/^(?:checkbox|radio)$/i,ka=/<([a-z][^\/\0>\x20\t\r\n\f]+)/i,la=/^$|\/(?:java|ecma)script/i,ma={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ma.optgroup=ma.option,ma.tbody=ma.tfoot=ma.colgroup=ma.caption=ma.thead,ma.th=ma.td;function na(a,b){var c;return c="undefined"!=typeof a.getElementsByTagName?a.getElementsByTagName(b||"*"):"undefined"!=typeof a.querySelectorAll?a.querySelectorAll(b||"*"):[],void 0===b||b&&B(a,b)?r.merge([a],c):c}function oa(a,b){for(var c=0,d=a.length;c<d;c++)W.set(a[c],"globalEval",!b||W.get(b[c],"globalEval"))}var pa=/<|&#?\w+;/;function qa(a,b,c,d,e){for(var f,g,h,i,j,k,l=b.createDocumentFragment(),m=[],n=0,o=a.length;n<o;n++)if(f=a[n],f||0===f)if("object"===r.type(f))r.merge(m,f.nodeType?[f]:f);else if(pa.test(f)){g=g||l.appendChild(b.createElement("div")),h=(ka.exec(f)||["",""])[1].toLowerCase(),i=ma[h]||ma._default,g.innerHTML=i[1]+r.htmlPrefilter(f)+i[2],k=i[0];while(k--)g=g.lastChild;r.merge(m,g.childNodes),g=l.firstChild,g.textContent=""}else m.push(b.createTextNode(f));l.textContent="",n=0;while(f=m[n++])if(d&&r.inArray(f,d)>-1)e&&e.push(f);else if(j=r.contains(f.ownerDocument,f),g=na(l.appendChild(f),"script"),j&&oa(g),c){k=0;while(f=g[k++])la.test(f.type||"")&&c.push(f)}return l}!function(){var a=d.createDocumentFragment(),b=a.appendChild(d.createElement("div")),c=d.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),o.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",o.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var ra=d.documentElement,sa=/^key/,ta=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,ua=/^([^.]*)(?:\.(.+)|)/;function va(){return!0}function wa(){return!1}function xa(){try{return d.activeElement}catch(a){}}function ya(a,b,c,d,e,f){var g,h;if("object"==typeof b){"string"!=typeof c&&(d=d||c,c=void 0);for(h in b)ya(a,h,c,d,b[h],f);return a}if(null==d&&null==e?(e=c,d=c=void 0):null==e&&("string"==typeof c?(e=d,d=void 0):(e=d,d=c,c=void 0)),e===!1)e=wa;else if(!e)return a;return 1===f&&(g=e,e=function(a){return r().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=r.guid++)),a.each(function(){r.event.add(this,b,e,d,c)})}r.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q=W.get(a);if(q){c.handler&&(f=c,c=f.handler,e=f.selector),e&&r.find.matchesSelector(ra,e),c.guid||(c.guid=r.guid++),(i=q.events)||(i=q.events={}),(g=q.handle)||(g=q.handle=function(b){return"undefined"!=typeof r&&r.event.triggered!==b.type?r.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(L)||[""],j=b.length;while(j--)h=ua.exec(b[j])||[],n=p=h[1],o=(h[2]||"").split(".").sort(),n&&(l=r.event.special[n]||{},n=(e?l.delegateType:l.bindType)||n,l=r.event.special[n]||{},k=r.extend({type:n,origType:p,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&r.expr.match.needsContext.test(e),namespace:o.join(".")},f),(m=i[n])||(m=i[n]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,o,g)!==!1||a.addEventListener&&a.addEventListener(n,g)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),r.event.global[n]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q=W.hasData(a)&&W.get(a);if(q&&(i=q.events)){b=(b||"").match(L)||[""],j=b.length;while(j--)if(h=ua.exec(b[j])||[],n=p=h[1],o=(h[2]||"").split(".").sort(),n){l=r.event.special[n]||{},n=(d?l.delegateType:l.bindType)||n,m=i[n]||[],h=h[2]&&new RegExp("(^|\\.)"+o.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&p!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,o,q.handle)!==!1||r.removeEvent(a,n,q.handle),delete i[n])}else for(n in i)r.event.remove(a,n+b[j],c,d,!0);r.isEmptyObject(i)&&W.remove(a,"handle events")}},dispatch:function(a){var b=r.event.fix(a),c,d,e,f,g,h,i=new Array(arguments.length),j=(W.get(this,"events")||{})[b.type]||[],k=r.event.special[b.type]||{};for(i[0]=b,c=1;c<arguments.length;c++)i[c]=arguments[c];if(b.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,b)!==!1){h=r.event.handlers.call(this,b,j),c=0;while((f=h[c++])&&!b.isPropagationStopped()){b.currentTarget=f.elem,d=0;while((g=f.handlers[d++])&&!b.isImmediatePropagationStopped())b.rnamespace&&!b.rnamespace.test(g.namespace)||(b.handleObj=g,b.data=g.data,e=((r.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(b.result=e)===!1&&(b.preventDefault(),b.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,b),b.result}},handlers:function(a,b){var c,d,e,f,g,h=[],i=b.delegateCount,j=a.target;if(i&&j.nodeType&&!("click"===a.type&&a.button>=1))for(;j!==this;j=j.parentNode||this)if(1===j.nodeType&&("click"!==a.type||j.disabled!==!0)){for(f=[],g={},c=0;c<i;c++)d=b[c],e=d.selector+" ",void 0===g[e]&&(g[e]=d.needsContext?r(e,this).index(j)>-1:r.find(e,this,null,[j]).length),g[e]&&f.push(d);f.length&&h.push({elem:j,handlers:f})}return j=this,i<b.length&&h.push({elem:j,handlers:b.slice(i)}),h},addProp:function(a,b){Object.defineProperty(r.Event.prototype,a,{enumerable:!0,configurable:!0,get:r.isFunction(b)?function(){if(this.originalEvent)return b(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[a]},set:function(b){Object.defineProperty(this,a,{enumerable:!0,configurable:!0,writable:!0,value:b})}})},fix:function(a){return a[r.expando]?a:new r.Event(a)},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==xa()&&this.focus)return this.focus(),!1},delegateType:"focusin"},blur:{trigger:function(){if(this===xa()&&this.blur)return this.blur(),!1},delegateType:"focusout"},click:{trigger:function(){if("checkbox"===this.type&&this.click&&B(this,"input"))return this.click(),!1},_default:function(a){return B(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}}},r.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c)},r.Event=function(a,b){return this instanceof r.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?va:wa,this.target=a.target&&3===a.target.nodeType?a.target.parentNode:a.target,this.currentTarget=a.currentTarget,this.relatedTarget=a.relatedTarget):this.type=a,b&&r.extend(this,b),this.timeStamp=a&&a.timeStamp||r.now(),void(this[r.expando]=!0)):new r.Event(a,b)},r.Event.prototype={constructor:r.Event,isDefaultPrevented:wa,isPropagationStopped:wa,isImmediatePropagationStopped:wa,isSimulated:!1,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=va,a&&!this.isSimulated&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=va,a&&!this.isSimulated&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=va,a&&!this.isSimulated&&a.stopImmediatePropagation(),this.stopPropagation()}},r.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,"char":!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:function(a){var b=a.button;return null==a.which&&sa.test(a.type)?null!=a.charCode?a.charCode:a.keyCode:!a.which&&void 0!==b&&ta.test(a.type)?1&b?1:2&b?3:4&b?2:0:a.which}},r.event.addProp),r.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){r.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&&(e===d||r.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),r.fn.extend({on:function(a,b,c,d){return ya(this,a,b,c,d)},one:function(a,b,c,d){return ya(this,a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,r(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return b!==!1&&"function"!=typeof b||(c=b,b=void 0),c===!1&&(c=wa),this.each(function(){r.event.remove(this,a,c,b)})}});var za=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,Aa=/<script|<style|<link/i,Ba=/checked\s*(?:[^=]|=\s*.checked.)/i,Ca=/^true\/(.*)/,Da=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function Ea(a,b){return B(a,"table")&&B(11!==b.nodeType?b:b.firstChild,"tr")?r(">tbody",a)[0]||a:a}function Fa(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function Ga(a){var b=Ca.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function Ha(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(W.hasData(a)&&(f=W.access(a),g=W.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;c<d;c++)r.event.add(b,e,j[e][c])}X.hasData(a)&&(h=X.access(a),i=r.extend({},h),X.set(b,i))}}function Ia(a,b){var c=b.nodeName.toLowerCase();"input"===c&&ja.test(a.type)?b.checked=a.checked:"input"!==c&&"textarea"!==c||(b.defaultValue=a.defaultValue)}function Ja(a,b,c,d){b=g.apply([],b);var e,f,h,i,j,k,l=0,m=a.length,n=m-1,q=b[0],s=r.isFunction(q);if(s||m>1&&"string"==typeof q&&!o.checkClone&&Ba.test(q))return a.each(function(e){var f=a.eq(e);s&&(b[0]=q.call(this,e,f.html())),Ja(f,b,c,d)});if(m&&(e=qa(b,a[0].ownerDocument,!1,a,d),f=e.firstChild,1===e.childNodes.length&&(e=f),f||d)){for(h=r.map(na(e,"script"),Fa),i=h.length;l<m;l++)j=e,l!==n&&(j=r.clone(j,!0,!0),i&&r.merge(h,na(j,"script"))),c.call(a[l],j,l);if(i)for(k=h[h.length-1].ownerDocument,r.map(h,Ga),l=0;l<i;l++)j=h[l],la.test(j.type||"")&&!W.access(j,"globalEval")&&r.contains(k,j)&&(j.src?r._evalUrl&&r._evalUrl(j.src):p(j.textContent.replace(Da,""),k))}return a}function Ka(a,b,c){for(var d,e=b?r.filter(b,a):a,f=0;null!=(d=e[f]);f++)c||1!==d.nodeType||r.cleanData(na(d)),d.parentNode&&(c&&r.contains(d.ownerDocument,d)&&oa(na(d,"script")),d.parentNode.removeChild(d));return a}r.extend({htmlPrefilter:function(a){return a.replace(za,"<$1></$2>")},clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=r.contains(a.ownerDocument,a);if(!(o.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||r.isXMLDoc(a)))for(g=na(h),f=na(a),d=0,e=f.length;d<e;d++)Ia(f[d],g[d]);if(b)if(c)for(f=f||na(a),g=g||na(h),d=0,e=f.length;d<e;d++)Ha(f[d],g[d]);else Ha(a,h);return g=na(h,"script"),g.length>0&&oa(g,!i&&na(a,"script")),h},cleanData:function(a){for(var b,c,d,e=r.event.special,f=0;void 0!==(c=a[f]);f++)if(U(c)){if(b=c[W.expando]){if(b.events)for(d in b.events)e[d]?r.event.remove(c,d):r.removeEvent(c,d,b.handle);c[W.expando]=void 0}c[X.expando]&&(c[X.expando]=void 0)}}}),r.fn.extend({detach:function(a){return Ka(this,a,!0)},remove:function(a){return Ka(this,a)},text:function(a){return T(this,function(a){return void 0===a?r.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=a)})},null,a,arguments.length)},append:function(){return Ja(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=Ea(this,a);b.appendChild(a)}})},prepend:function(){return Ja(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=Ea(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return Ja(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return Ja(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(r.cleanData(na(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null!=a&&a,b=null==b?a:b,this.map(function(){return r.clone(this,a,b)})},html:function(a){return T(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!Aa.test(a)&&!ma[(ka.exec(a)||["",""])[1].toLowerCase()]){a=r.htmlPrefilter(a);try{for(;c<d;c++)b=this[c]||{},1===b.nodeType&&(r.cleanData(na(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=[];return Ja(this,arguments,function(b){var c=this.parentNode;r.inArray(this,a)<0&&(r.cleanData(na(this)),c&&c.replaceChild(b,this))},a)}}),r.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){r.fn[a]=function(a){for(var c,d=[],e=r(a),f=e.length-1,g=0;g<=f;g++)c=g===f?this:this.clone(!0),r(e[g])[b](c),h.apply(d,c.get());return this.pushStack(d)}});var La=/^margin/,Ma=new RegExp("^("+aa+")(?!px)[a-z%]+$","i"),Na=function(b){var c=b.ownerDocument.defaultView;return c&&c.opener||(c=a),c.getComputedStyle(b)};!function(){function b(){if(i){i.style.cssText="box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",i.innerHTML="",ra.appendChild(h);var b=a.getComputedStyle(i);c="1%"!==b.top,g="2px"===b.marginLeft,e="4px"===b.width,i.style.marginRight="50%",f="4px"===b.marginRight,ra.removeChild(h),i=null}}var c,e,f,g,h=d.createElement("div"),i=d.createElement("div");i.style&&(i.style.backgroundClip="content-box",i.cloneNode(!0).style.backgroundClip="",o.clearCloneStyle="content-box"===i.style.backgroundClip,h.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",h.appendChild(i),r.extend(o,{pixelPosition:function(){return b(),c},boxSizingReliable:function(){return b(),e},pixelMarginRight:function(){return b(),f},reliableMarginLeft:function(){return b(),g}}))}();function Oa(a,b,c){var d,e,f,g,h=a.style;return c=c||Na(a),c&&(g=c.getPropertyValue(b)||c[b],""!==g||r.contains(a.ownerDocument,a)||(g=r.style(a,b)),!o.pixelMarginRight()&&Ma.test(g)&&La.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function Pa(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}var Qa=/^(none|table(?!-c[ea]).+)/,Ra=/^--/,Sa={position:"absolute",visibility:"hidden",display:"block"},Ta={letterSpacing:"0",fontWeight:"400"},Ua=["Webkit","Moz","ms"],Va=d.createElement("div").style;function Wa(a){if(a in Va)return a;var b=a[0].toUpperCase()+a.slice(1),c=Ua.length;while(c--)if(a=Ua[c]+b,a in Va)return a}function Xa(a){var b=r.cssProps[a];return b||(b=r.cssProps[a]=Wa(a)||a),b}function Ya(a,b,c){var d=ba.exec(b);return d?Math.max(0,d[2]-(c||0))+(d[3]||"px"):b}function Za(a,b,c,d,e){var f,g=0;for(f=c===(d?"border":"content")?4:"width"===b?1:0;f<4;f+=2)"margin"===c&&(g+=r.css(a,c+ca[f],!0,e)),d?("content"===c&&(g-=r.css(a,"padding"+ca[f],!0,e)),"margin"!==c&&(g-=r.css(a,"border"+ca[f]+"Width",!0,e))):(g+=r.css(a,"padding"+ca[f],!0,e),"padding"!==c&&(g+=r.css(a,"border"+ca[f]+"Width",!0,e)));return g}function $a(a,b,c){var d,e=Na(a),f=Oa(a,b,e),g="border-box"===r.css(a,"boxSizing",!1,e);return Ma.test(f)?f:(d=g&&(o.boxSizingReliable()||f===a.style[b]),"auto"===f&&(f=a["offset"+b[0].toUpperCase()+b.slice(1)]),f=parseFloat(f)||0,f+Za(a,b,c||(g?"border":"content"),d,e)+"px")}r.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Oa(a,"opacity");return""===c?"1":c}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=r.camelCase(b),i=Ra.test(b),j=a.style;return i||(b=Xa(h)),g=r.cssHooks[b]||r.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:j[b]:(f=typeof c,"string"===f&&(e=ba.exec(c))&&e[1]&&(c=fa(a,b,e),f="number"),null!=c&&c===c&&("number"===f&&(c+=e&&e[3]||(r.cssNumber[h]?"":"px")),o.clearCloneStyle||""!==c||0!==b.indexOf("background")||(j[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i?j.setProperty(b,c):j[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=r.camelCase(b),i=Ra.test(b);return i||(b=Xa(h)),g=r.cssHooks[b]||r.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=Oa(a,b,d)),"normal"===e&&b in Ta&&(e=Ta[b]),""===c||c?(f=parseFloat(e),c===!0||isFinite(f)?f||0:e):e}}),r.each(["height","width"],function(a,b){r.cssHooks[b]={get:function(a,c,d){if(c)return!Qa.test(r.css(a,"display"))||a.getClientRects().length&&a.getBoundingClientRect().width?$a(a,b,d):ea(a,Sa,function(){return $a(a,b,d)})},set:function(a,c,d){var e,f=d&&Na(a),g=d&&Za(a,b,d,"border-box"===r.css(a,"boxSizing",!1,f),f);return g&&(e=ba.exec(c))&&"px"!==(e[3]||"px")&&(a.style[b]=c,c=r.css(a,b)),Ya(a,c,g)}}}),r.cssHooks.marginLeft=Pa(o.reliableMarginLeft,function(a,b){if(b)return(parseFloat(Oa(a,"marginLeft"))||a.getBoundingClientRect().left-ea(a,{marginLeft:0},function(){return a.getBoundingClientRect().left}))+"px"}),r.each({margin:"",padding:"",border:"Width"},function(a,b){r.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];d<4;d++)e[a+ca[d]+b]=f[d]||f[d-2]||f[0];return e}},La.test(a)||(r.cssHooks[a+b].set=Ya)}),r.fn.extend({css:function(a,b){return T(this,function(a,b,c){var d,e,f={},g=0;if(Array.isArray(b)){for(d=Na(a),e=b.length;g<e;g++)f[b[g]]=r.css(a,b[g],!1,d);return f}return void 0!==c?r.style(a,b,c):r.css(a,b)},a,b,arguments.length>1)}});function _a(a,b,c,d,e){return new _a.prototype.init(a,b,c,d,e)}r.Tween=_a,_a.prototype={constructor:_a,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||r.easing._default,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(r.cssNumber[c]?"":"px")},cur:function(){var a=_a.propHooks[this.prop];return a&&a.get?a.get(this):_a.propHooks._default.get(this)},run:function(a){var b,c=_a.propHooks[this.prop];return this.options.duration?this.pos=b=r.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):_a.propHooks._default.set(this),this}},_a.prototype.init.prototype=_a.prototype,_a.propHooks={_default:{get:function(a){var b;return 1!==a.elem.nodeType||null!=a.elem[a.prop]&&null==a.elem.style[a.prop]?a.elem[a.prop]:(b=r.css(a.elem,a.prop,""),b&&"auto"!==b?b:0)},set:function(a){r.fx.step[a.prop]?r.fx.step[a.prop](a):1!==a.elem.nodeType||null==a.elem.style[r.cssProps[a.prop]]&&!r.cssHooks[a.prop]?a.elem[a.prop]=a.now:r.style(a.elem,a.prop,a.now+a.unit)}}},_a.propHooks.scrollTop=_a.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},r.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2},_default:"swing"},r.fx=_a.prototype.init,r.fx.step={};var ab,bb,cb=/^(?:toggle|show|hide)$/,db=/queueHooks$/;function eb(){bb&&(d.hidden===!1&&a.requestAnimationFrame?a.requestAnimationFrame(eb):a.setTimeout(eb,r.fx.interval),r.fx.tick())}function fb(){return a.setTimeout(function(){ab=void 0}),ab=r.now()}function gb(a,b){var c,d=0,e={height:a};for(b=b?1:0;d<4;d+=2-b)c=ca[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function hb(a,b,c){for(var d,e=(kb.tweeners[b]||[]).concat(kb.tweeners["*"]),f=0,g=e.length;f<g;f++)if(d=e[f].call(c,b,a))return d}function ib(a,b,c){var d,e,f,g,h,i,j,k,l="width"in b||"height"in b,m=this,n={},o=a.style,p=a.nodeType&&da(a),q=W.get(a,"fxshow");c.queue||(g=r._queueHooks(a,"fx"),null==g.unqueued&&(g.unqueued=0,h=g.empty.fire,g.empty.fire=function(){g.unqueued||h()}),g.unqueued++,m.always(function(){m.always(function(){g.unqueued--,r.queue(a,"fx").length||g.empty.fire()})}));for(d in b)if(e=b[d],cb.test(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}n[d]=q&&q[d]||r.style(a,d)}if(i=!r.isEmptyObject(b),i||!r.isEmptyObject(n)){l&&1===a.nodeType&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=q&&q.display,null==j&&(j=W.get(a,"display")),k=r.css(a,"display"),"none"===k&&(j?k=j:(ia([a],!0),j=a.style.display||j,k=r.css(a,"display"),ia([a]))),("inline"===k||"inline-block"===k&&null!=j)&&"none"===r.css(a,"float")&&(i||(m.done(function(){o.display=j}),null==j&&(k=o.display,j="none"===k?"":k)),o.display="inline-block")),c.overflow&&(o.overflow="hidden",m.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]})),i=!1;for(d in n)i||(q?"hidden"in q&&(p=q.hidden):q=W.access(a,"fxshow",{display:j}),f&&(q.hidden=!p),p&&ia([a],!0),m.done(function(){p||ia([a]),W.remove(a,"fxshow");for(d in n)r.style(a,d,n[d])})),i=hb(p?q[d]:0,d,m),d in q||(q[d]=i.start,p&&(i.end=i.start,i.start=0))}}function jb(a,b){var c,d,e,f,g;for(c in a)if(d=r.camelCase(c),e=b[d],f=a[c],Array.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=r.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function kb(a,b,c){var d,e,f=0,g=kb.prefilters.length,h=r.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=ab||fb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;g<i;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),f<1&&i?c:(i||h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:r.extend({},b),opts:r.extend(!0,{specialEasing:{},easing:r.easing._default},c),originalProperties:b,originalOptions:c,startTime:ab||fb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=r.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;c<d;c++)j.tweens[c].run(1);return b?(h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j,b])):h.rejectWith(a,[j,b]),this}}),k=j.props;for(jb(k,j.opts.specialEasing);f<g;f++)if(d=kb.prefilters[f].call(j,a,k,j.opts))return r.isFunction(d.stop)&&(r._queueHooks(j.elem,j.opts.queue).stop=r.proxy(d.stop,d)),d;return r.map(k,hb,j),r.isFunction(j.opts.start)&&j.opts.start.call(a,j),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always),r.fx.timer(r.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j}r.Animation=r.extend(kb,{tweeners:{"*":[function(a,b){var c=this.createTween(a,b);return fa(c.elem,a,ba.exec(b),c),c}]},tweener:function(a,b){r.isFunction(a)?(b=a,a=["*"]):a=a.match(L);for(var c,d=0,e=a.length;d<e;d++)c=a[d],kb.tweeners[c]=kb.tweeners[c]||[],kb.tweeners[c].unshift(b)},prefilters:[ib],prefilter:function(a,b){b?kb.prefilters.unshift(a):kb.prefilters.push(a)}}),r.speed=function(a,b,c){var d=a&&"object"==typeof a?r.extend({},a):{complete:c||!c&&b||r.isFunction(a)&&a,duration:a,easing:c&&b||b&&!r.isFunction(b)&&b};return r.fx.off?d.duration=0:"number"!=typeof d.duration&&(d.duration in r.fx.speeds?d.duration=r.fx.speeds[d.duration]:d.duration=r.fx.speeds._default),null!=d.queue&&d.queue!==!0||(d.queue="fx"),d.old=d.complete,d.complete=function(){r.isFunction(d.old)&&d.old.call(this),d.queue&&r.dequeue(this,d.queue)},d},r.fn.extend({fadeTo:function(a,b,c,d){return this.filter(da).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=r.isEmptyObject(a),f=r.speed(b,c,d),g=function(){var b=kb(this,r.extend({},a),f);(e||W.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=r.timers,g=W.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&db.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));!b&&c||r.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=W.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=r.timers,g=d?d.length:0;for(c.finish=!0,r.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;b<g;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),r.each(["toggle","show","hide"],function(a,b){var c=r.fn[b];r.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(gb(b,!0),a,d,e)}}),r.each({slideDown:gb("show"),slideUp:gb("hide"),slideToggle:gb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){r.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),r.timers=[],r.fx.tick=function(){var a,b=0,c=r.timers;for(ab=r.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||r.fx.stop(),ab=void 0},r.fx.timer=function(a){r.timers.push(a),r.fx.start()},r.fx.interval=13,r.fx.start=function(){bb||(bb=!0,eb())},r.fx.stop=function(){bb=null},r.fx.speeds={slow:600,fast:200,_default:400},r.fn.delay=function(b,c){return b=r.fx?r.fx.speeds[b]||b:b,c=c||"fx",this.queue(c,function(c,d){var e=a.setTimeout(c,b);d.stop=function(){a.clearTimeout(e)}})},function(){var a=d.createElement("input"),b=d.createElement("select"),c=b.appendChild(d.createElement("option"));a.type="checkbox",o.checkOn=""!==a.value,o.optSelected=c.selected,a=d.createElement("input"),a.value="t",a.type="radio",o.radioValue="t"===a.value}();var lb,mb=r.expr.attrHandle;r.fn.extend({attr:function(a,b){return T(this,r.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){r.removeAttr(this,a)})}}),r.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return"undefined"==typeof a.getAttribute?r.prop(a,b,c):(1===f&&r.isXMLDoc(a)||(e=r.attrHooks[b.toLowerCase()]||(r.expr.match.bool.test(b)?lb:void 0)),void 0!==c?null===c?void r.removeAttr(a,b):e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:(a.setAttribute(b,c+""),c):e&&"get"in e&&null!==(d=e.get(a,b))?d:(d=r.find.attr(a,b),
null==d?void 0:d))},attrHooks:{type:{set:function(a,b){if(!o.radioValue&&"radio"===b&&B(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}},removeAttr:function(a,b){var c,d=0,e=b&&b.match(L);if(e&&1===a.nodeType)while(c=e[d++])a.removeAttribute(c)}}),lb={set:function(a,b,c){return b===!1?r.removeAttr(a,c):a.setAttribute(c,c),c}},r.each(r.expr.match.bool.source.match(/\w+/g),function(a,b){var c=mb[b]||r.find.attr;mb[b]=function(a,b,d){var e,f,g=b.toLowerCase();return d||(f=mb[g],mb[g]=e,e=null!=c(a,b,d)?g:null,mb[g]=f),e}});var nb=/^(?:input|select|textarea|button)$/i,ob=/^(?:a|area)$/i;r.fn.extend({prop:function(a,b){return T(this,r.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[r.propFix[a]||a]})}}),r.extend({prop:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return 1===f&&r.isXMLDoc(a)||(b=r.propFix[b]||b,e=r.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=r.find.attr(a,"tabindex");return b?parseInt(b,10):nb.test(a.nodeName)||ob.test(a.nodeName)&&a.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),o.optSelected||(r.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null},set:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex)}}),r.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){r.propFix[this.toLowerCase()]=this});function pb(a){var b=a.match(L)||[];return b.join(" ")}function qb(a){return a.getAttribute&&a.getAttribute("class")||""}r.fn.extend({addClass:function(a){var b,c,d,e,f,g,h,i=0;if(r.isFunction(a))return this.each(function(b){r(this).addClass(a.call(this,b,qb(this)))});if("string"==typeof a&&a){b=a.match(L)||[];while(c=this[i++])if(e=qb(c),d=1===c.nodeType&&" "+pb(e)+" "){g=0;while(f=b[g++])d.indexOf(" "+f+" ")<0&&(d+=f+" ");h=pb(d),e!==h&&c.setAttribute("class",h)}}return this},removeClass:function(a){var b,c,d,e,f,g,h,i=0;if(r.isFunction(a))return this.each(function(b){r(this).removeClass(a.call(this,b,qb(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof a&&a){b=a.match(L)||[];while(c=this[i++])if(e=qb(c),d=1===c.nodeType&&" "+pb(e)+" "){g=0;while(f=b[g++])while(d.indexOf(" "+f+" ")>-1)d=d.replace(" "+f+" "," ");h=pb(d),e!==h&&c.setAttribute("class",h)}}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):r.isFunction(a)?this.each(function(c){r(this).toggleClass(a.call(this,c,qb(this),b),b)}):this.each(function(){var b,d,e,f;if("string"===c){d=0,e=r(this),f=a.match(L)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else void 0!==a&&"boolean"!==c||(b=qb(this),b&&W.set(this,"__className__",b),this.setAttribute&&this.setAttribute("class",b||a===!1?"":W.get(this,"__className__")||""))})},hasClass:function(a){var b,c,d=0;b=" "+a+" ";while(c=this[d++])if(1===c.nodeType&&(" "+pb(qb(c))+" ").indexOf(b)>-1)return!0;return!1}});var rb=/\r/g;r.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=r.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,r(this).val()):a,null==e?e="":"number"==typeof e?e+="":Array.isArray(e)&&(e=r.map(e,function(a){return null==a?"":a+""})),b=r.valHooks[this.type]||r.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=r.valHooks[e.type]||r.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(rb,""):null==c?"":c)}}}),r.extend({valHooks:{option:{get:function(a){var b=r.find.attr(a,"value");return null!=b?b:pb(r.text(a))}},select:{get:function(a){var b,c,d,e=a.options,f=a.selectedIndex,g="select-one"===a.type,h=g?null:[],i=g?f+1:e.length;for(d=f<0?i:g?f:0;d<i;d++)if(c=e[d],(c.selected||d===f)&&!c.disabled&&(!c.parentNode.disabled||!B(c.parentNode,"optgroup"))){if(b=r(c).val(),g)return b;h.push(b)}return h},set:function(a,b){var c,d,e=a.options,f=r.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=r.inArray(r.valHooks.option.get(d),f)>-1)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),r.each(["radio","checkbox"],function(){r.valHooks[this]={set:function(a,b){if(Array.isArray(b))return a.checked=r.inArray(r(a).val(),b)>-1}},o.checkOn||(r.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var sb=/^(?:focusinfocus|focusoutblur)$/;r.extend(r.event,{trigger:function(b,c,e,f){var g,h,i,j,k,m,n,o=[e||d],p=l.call(b,"type")?b.type:b,q=l.call(b,"namespace")?b.namespace.split("."):[];if(h=i=e=e||d,3!==e.nodeType&&8!==e.nodeType&&!sb.test(p+r.event.triggered)&&(p.indexOf(".")>-1&&(q=p.split("."),p=q.shift(),q.sort()),k=p.indexOf(":")<0&&"on"+p,b=b[r.expando]?b:new r.Event(p,"object"==typeof b&&b),b.isTrigger=f?2:3,b.namespace=q.join("."),b.rnamespace=b.namespace?new RegExp("(^|\\.)"+q.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=e),c=null==c?[b]:r.makeArray(c,[b]),n=r.event.special[p]||{},f||!n.trigger||n.trigger.apply(e,c)!==!1)){if(!f&&!n.noBubble&&!r.isWindow(e)){for(j=n.delegateType||p,sb.test(j+p)||(h=h.parentNode);h;h=h.parentNode)o.push(h),i=h;i===(e.ownerDocument||d)&&o.push(i.defaultView||i.parentWindow||a)}g=0;while((h=o[g++])&&!b.isPropagationStopped())b.type=g>1?j:n.bindType||p,m=(W.get(h,"events")||{})[b.type]&&W.get(h,"handle"),m&&m.apply(h,c),m=k&&h[k],m&&m.apply&&U(h)&&(b.result=m.apply(h,c),b.result===!1&&b.preventDefault());return b.type=p,f||b.isDefaultPrevented()||n._default&&n._default.apply(o.pop(),c)!==!1||!U(e)||k&&r.isFunction(e[p])&&!r.isWindow(e)&&(i=e[k],i&&(e[k]=null),r.event.triggered=p,e[p](),r.event.triggered=void 0,i&&(e[k]=i)),b.result}},simulate:function(a,b,c){var d=r.extend(new r.Event,c,{type:a,isSimulated:!0});r.event.trigger(d,null,b)}}),r.fn.extend({trigger:function(a,b){return this.each(function(){r.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];if(c)return r.event.trigger(a,b,c,!0)}}),r.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(a,b){r.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),r.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),o.focusin="onfocusin"in a,o.focusin||r.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){r.event.simulate(b,a.target,r.event.fix(a))};r.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=W.access(d,b);e||d.addEventListener(a,c,!0),W.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=W.access(d,b)-1;e?W.access(d,b,e):(d.removeEventListener(a,c,!0),W.remove(d,b))}}});var tb=a.location,ub=r.now(),vb=/\?/;r.parseXML=function(b){var c;if(!b||"string"!=typeof b)return null;try{c=(new a.DOMParser).parseFromString(b,"text/xml")}catch(d){c=void 0}return c&&!c.getElementsByTagName("parsererror").length||r.error("Invalid XML: "+b),c};var wb=/\[\]$/,xb=/\r?\n/g,yb=/^(?:submit|button|image|reset|file)$/i,zb=/^(?:input|select|textarea|keygen)/i;function Ab(a,b,c,d){var e;if(Array.isArray(b))r.each(b,function(b,e){c||wb.test(a)?d(a,e):Ab(a+"["+("object"==typeof e&&null!=e?b:"")+"]",e,c,d)});else if(c||"object"!==r.type(b))d(a,b);else for(e in b)Ab(a+"["+e+"]",b[e],c,d)}r.param=function(a,b){var c,d=[],e=function(a,b){var c=r.isFunction(b)?b():b;d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(null==c?"":c)};if(Array.isArray(a)||a.jquery&&!r.isPlainObject(a))r.each(a,function(){e(this.name,this.value)});else for(c in a)Ab(c,a[c],b,e);return d.join("&")},r.fn.extend({serialize:function(){return r.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=r.prop(this,"elements");return a?r.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!r(this).is(":disabled")&&zb.test(this.nodeName)&&!yb.test(a)&&(this.checked||!ja.test(a))}).map(function(a,b){var c=r(this).val();return null==c?null:Array.isArray(c)?r.map(c,function(a){return{name:b.name,value:a.replace(xb,"\r\n")}}):{name:b.name,value:c.replace(xb,"\r\n")}}).get()}});var Bb=/%20/g,Cb=/#.*$/,Db=/([?&])_=[^&]*/,Eb=/^(.*?):[ \t]*([^\r\n]*)$/gm,Fb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Gb=/^(?:GET|HEAD)$/,Hb=/^\/\//,Ib={},Jb={},Kb="*/".concat("*"),Lb=d.createElement("a");Lb.href=tb.href;function Mb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(L)||[];if(r.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function Nb(a,b,c,d){var e={},f=a===Jb;function g(h){var i;return e[h]=!0,r.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function Ob(a,b){var c,d,e=r.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&r.extend(!0,a,d),a}function Pb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}if(f)return f!==i[0]&&i.unshift(f),c[f]}function Qb(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}r.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:tb.href,type:"GET",isLocal:Fb.test(tb.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Kb,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":r.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?Ob(Ob(a,r.ajaxSettings),b):Ob(r.ajaxSettings,a)},ajaxPrefilter:Mb(Ib),ajaxTransport:Mb(Jb),ajax:function(b,c){"object"==typeof b&&(c=b,b=void 0),c=c||{};var e,f,g,h,i,j,k,l,m,n,o=r.ajaxSetup({},c),p=o.context||o,q=o.context&&(p.nodeType||p.jquery)?r(p):r.event,s=r.Deferred(),t=r.Callbacks("once memory"),u=o.statusCode||{},v={},w={},x="canceled",y={readyState:0,getResponseHeader:function(a){var b;if(k){if(!h){h={};while(b=Eb.exec(g))h[b[1].toLowerCase()]=b[2]}b=h[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return k?g:null},setRequestHeader:function(a,b){return null==k&&(a=w[a.toLowerCase()]=w[a.toLowerCase()]||a,v[a]=b),this},overrideMimeType:function(a){return null==k&&(o.mimeType=a),this},statusCode:function(a){var b;if(a)if(k)y.always(a[y.status]);else for(b in a)u[b]=[u[b],a[b]];return this},abort:function(a){var b=a||x;return e&&e.abort(b),A(0,b),this}};if(s.promise(y),o.url=((b||o.url||tb.href)+"").replace(Hb,tb.protocol+"//"),o.type=c.method||c.type||o.method||o.type,o.dataTypes=(o.dataType||"*").toLowerCase().match(L)||[""],null==o.crossDomain){j=d.createElement("a");try{j.href=o.url,j.href=j.href,o.crossDomain=Lb.protocol+"//"+Lb.host!=j.protocol+"//"+j.host}catch(z){o.crossDomain=!0}}if(o.data&&o.processData&&"string"!=typeof o.data&&(o.data=r.param(o.data,o.traditional)),Nb(Ib,o,c,y),k)return y;l=r.event&&o.global,l&&0===r.active++&&r.event.trigger("ajaxStart"),o.type=o.type.toUpperCase(),o.hasContent=!Gb.test(o.type),f=o.url.replace(Cb,""),o.hasContent?o.data&&o.processData&&0===(o.contentType||"").indexOf("application/x-www-form-urlencoded")&&(o.data=o.data.replace(Bb,"+")):(n=o.url.slice(f.length),o.data&&(f+=(vb.test(f)?"&":"?")+o.data,delete o.data),o.cache===!1&&(f=f.replace(Db,"$1"),n=(vb.test(f)?"&":"?")+"_="+ub++ +n),o.url=f+n),o.ifModified&&(r.lastModified[f]&&y.setRequestHeader("If-Modified-Since",r.lastModified[f]),r.etag[f]&&y.setRequestHeader("If-None-Match",r.etag[f])),(o.data&&o.hasContent&&o.contentType!==!1||c.contentType)&&y.setRequestHeader("Content-Type",o.contentType),y.setRequestHeader("Accept",o.dataTypes[0]&&o.accepts[o.dataTypes[0]]?o.accepts[o.dataTypes[0]]+("*"!==o.dataTypes[0]?", "+Kb+"; q=0.01":""):o.accepts["*"]);for(m in o.headers)y.setRequestHeader(m,o.headers[m]);if(o.beforeSend&&(o.beforeSend.call(p,y,o)===!1||k))return y.abort();if(x="abort",t.add(o.complete),y.done(o.success),y.fail(o.error),e=Nb(Jb,o,c,y)){if(y.readyState=1,l&&q.trigger("ajaxSend",[y,o]),k)return y;o.async&&o.timeout>0&&(i=a.setTimeout(function(){y.abort("timeout")},o.timeout));try{k=!1,e.send(v,A)}catch(z){if(k)throw z;A(-1,z)}}else A(-1,"No Transport");function A(b,c,d,h){var j,m,n,v,w,x=c;k||(k=!0,i&&a.clearTimeout(i),e=void 0,g=h||"",y.readyState=b>0?4:0,j=b>=200&&b<300||304===b,d&&(v=Pb(o,y,d)),v=Qb(o,v,y,j),j?(o.ifModified&&(w=y.getResponseHeader("Last-Modified"),w&&(r.lastModified[f]=w),w=y.getResponseHeader("etag"),w&&(r.etag[f]=w)),204===b||"HEAD"===o.type?x="nocontent":304===b?x="notmodified":(x=v.state,m=v.data,n=v.error,j=!n)):(n=x,!b&&x||(x="error",b<0&&(b=0))),y.status=b,y.statusText=(c||x)+"",j?s.resolveWith(p,[m,x,y]):s.rejectWith(p,[y,x,n]),y.statusCode(u),u=void 0,l&&q.trigger(j?"ajaxSuccess":"ajaxError",[y,o,j?m:n]),t.fireWith(p,[y,x]),l&&(q.trigger("ajaxComplete",[y,o]),--r.active||r.event.trigger("ajaxStop")))}return y},getJSON:function(a,b,c){return r.get(a,b,c,"json")},getScript:function(a,b){return r.get(a,void 0,b,"script")}}),r.each(["get","post"],function(a,b){r[b]=function(a,c,d,e){return r.isFunction(c)&&(e=e||d,d=c,c=void 0),r.ajax(r.extend({url:a,type:b,dataType:e,data:c,success:d},r.isPlainObject(a)&&a))}}),r._evalUrl=function(a){return r.ajax({url:a,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,"throws":!0})},r.fn.extend({wrapAll:function(a){var b;return this[0]&&(r.isFunction(a)&&(a=a.call(this[0])),b=r(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this},wrapInner:function(a){return r.isFunction(a)?this.each(function(b){r(this).wrapInner(a.call(this,b))}):this.each(function(){var b=r(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=r.isFunction(a);return this.each(function(c){r(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(a){return this.parent(a).not("body").each(function(){r(this).replaceWith(this.childNodes)}),this}}),r.expr.pseudos.hidden=function(a){return!r.expr.pseudos.visible(a)},r.expr.pseudos.visible=function(a){return!!(a.offsetWidth||a.offsetHeight||a.getClientRects().length)},r.ajaxSettings.xhr=function(){try{return new a.XMLHttpRequest}catch(b){}};var Rb={0:200,1223:204},Sb=r.ajaxSettings.xhr();o.cors=!!Sb&&"withCredentials"in Sb,o.ajax=Sb=!!Sb,r.ajaxTransport(function(b){var c,d;if(o.cors||Sb&&!b.crossDomain)return{send:function(e,f){var g,h=b.xhr();if(h.open(b.type,b.url,b.async,b.username,b.password),b.xhrFields)for(g in b.xhrFields)h[g]=b.xhrFields[g];b.mimeType&&h.overrideMimeType&&h.overrideMimeType(b.mimeType),b.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest");for(g in e)h.setRequestHeader(g,e[g]);c=function(a){return function(){c&&(c=d=h.onload=h.onerror=h.onabort=h.onreadystatechange=null,"abort"===a?h.abort():"error"===a?"number"!=typeof h.status?f(0,"error"):f(h.status,h.statusText):f(Rb[h.status]||h.status,h.statusText,"text"!==(h.responseType||"text")||"string"!=typeof h.responseText?{binary:h.response}:{text:h.responseText},h.getAllResponseHeaders()))}},h.onload=c(),d=h.onerror=c("error"),void 0!==h.onabort?h.onabort=d:h.onreadystatechange=function(){4===h.readyState&&a.setTimeout(function(){c&&d()})},c=c("abort");try{h.send(b.hasContent&&b.data||null)}catch(i){if(c)throw i}},abort:function(){c&&c()}}}),r.ajaxPrefilter(function(a){a.crossDomain&&(a.contents.script=!1)}),r.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(a){return r.globalEval(a),a}}}),r.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),r.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(e,f){b=r("<script>").prop({charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&f("error"===a.type?404:200,a.type)}),d.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Tb=[],Ub=/(=)\?(?=&|$)|\?\?/;r.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Tb.pop()||r.expando+"_"+ub++;return this[a]=!0,a}}),r.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Ub.test(b.url)?"url":"string"==typeof b.data&&0===(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Ub.test(b.data)&&"data");if(h||"jsonp"===b.dataTypes[0])return e=b.jsonpCallback=r.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Ub,"$1"+e):b.jsonp!==!1&&(b.url+=(vb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||r.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){void 0===f?r(a).removeProp(e):a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Tb.push(e)),g&&r.isFunction(f)&&f(g[0]),g=f=void 0}),"script"}),o.createHTMLDocument=function(){var a=d.implementation.createHTMLDocument("").body;return a.innerHTML="<form></form><form></form>",2===a.childNodes.length}(),r.parseHTML=function(a,b,c){if("string"!=typeof a)return[];"boolean"==typeof b&&(c=b,b=!1);var e,f,g;return b||(o.createHTMLDocument?(b=d.implementation.createHTMLDocument(""),e=b.createElement("base"),e.href=d.location.href,b.head.appendChild(e)):b=d),f=C.exec(a),g=!c&&[],f?[b.createElement(f[1])]:(f=qa([a],b,g),g&&g.length&&r(g).remove(),r.merge([],f.childNodes))},r.fn.load=function(a,b,c){var d,e,f,g=this,h=a.indexOf(" ");return h>-1&&(d=pb(a.slice(h)),a=a.slice(0,h)),r.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&r.ajax({url:a,type:e||"GET",dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?r("<div>").append(r.parseHTML(a)).find(d):a)}).always(c&&function(a,b){g.each(function(){c.apply(this,f||[a.responseText,b,a])})}),this},r.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){r.fn[b]=function(a){return this.on(b,a)}}),r.expr.pseudos.animated=function(a){return r.grep(r.timers,function(b){return a===b.elem}).length},r.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=r.css(a,"position"),l=r(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=r.css(a,"top"),i=r.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),r.isFunction(b)&&(b=b.call(a,c,r.extend({},h))),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},r.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){r.offset.setOffset(this,a,b)});var b,c,d,e,f=this[0];if(f)return f.getClientRects().length?(d=f.getBoundingClientRect(),b=f.ownerDocument,c=b.documentElement,e=b.defaultView,{top:d.top+e.pageYOffset-c.clientTop,left:d.left+e.pageXOffset-c.clientLeft}):{top:0,left:0}},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===r.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),B(a[0],"html")||(d=a.offset()),d={top:d.top+r.css(a[0],"borderTopWidth",!0),left:d.left+r.css(a[0],"borderLeftWidth",!0)}),{top:b.top-d.top-r.css(c,"marginTop",!0),left:b.left-d.left-r.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent;while(a&&"static"===r.css(a,"position"))a=a.offsetParent;return a||ra})}}),r.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c="pageYOffset"===b;r.fn[a]=function(d){return T(this,function(a,d,e){var f;return r.isWindow(a)?f=a:9===a.nodeType&&(f=a.defaultView),void 0===e?f?f[b]:a[d]:void(f?f.scrollTo(c?f.pageXOffset:e,c?e:f.pageYOffset):a[d]=e)},a,d,arguments.length)}}),r.each(["top","left"],function(a,b){r.cssHooks[b]=Pa(o.pixelPosition,function(a,c){if(c)return c=Oa(a,b),Ma.test(c)?r(a).position()[b]+"px":c})}),r.each({Height:"height",Width:"width"},function(a,b){r.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){r.fn[d]=function(e,f){var g=arguments.length&&(c||"boolean"!=typeof e),h=c||(e===!0||f===!0?"margin":"border");return T(this,function(b,c,e){var f;return r.isWindow(b)?0===d.indexOf("outer")?b["inner"+a]:b.document.documentElement["client"+a]:9===b.nodeType?(f=b.documentElement,Math.max(b.body["scroll"+a],f["scroll"+a],b.body["offset"+a],f["offset"+a],f["client"+a])):void 0===e?r.css(b,c,h):r.style(b,c,e,h)},b,g?e:void 0,g)}})}),r.fn.extend({bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}}),r.holdReady=function(a){a?r.readyWait++:r.ready(!0)},r.isArray=Array.isArray,r.parseJSON=JSON.parse,r.nodeName=B,"function"=="function"&&__webpack_require__(46)&&!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return r}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));var Vb=a.jQuery,Wb=a.$;return r.noConflict=function(b){return a.$===r&&(a.$=Wb),b&&a.jQuery===r&&(a.jQuery=Vb),r},b||(a.jQuery=a.$=r),r});


/***/ }),
/* 218 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * コンテンツの評価画面
 * @return {[type]} [description]
 */

(function() {

    angular
        .module('learnApp')
        .controller('contentEvaluteController', contentEvaluteController);

    contentEvaluteController.$inject = ['$scope', 'ApiService'];

    function contentEvaluteController($scope, ApiService) {
        var contentEvaluteCtrl = this;

        contentEvaluteCtrl.value = {
            comment: "" //評価画面のコメント
        };

        contentEvaluteCtrl.method = {
            clickFinishButton: clickFinishButton, //終了ボタンクリックメソッド
            evaluationRegist: evaluationRegist //評価値の登録メソッド
        };

        //グローバル変数の読み込み
        contentEvaluteCtrl.globalParam = __webpack_require__(14);

        /**
         * 終了ボタンクリックメソッド
         * @param  {[type]} difficult  [難易度]
         * @param  {[type]} understand [理解度]
         * @return {[type]}            [description]
         */
        function clickFinishButton(difficult, understand){
            contentEvaluteCtrl.globalParam.flag.showExplain = false; //解説を非表示
            //評価オブジェクトの仮処理
            if(typeof contentEvaluteCtrl.globalParam.value.showExplain.evalute !== 'object'){
                contentEvaluteCtrl.globalParam.value.showExplain.evalute = {
                    difficult: 0,
                    understand: 0
                };
            }
            //評価がされた時
            if(difficult != null && understand != null){
                evaluationRegist(difficult, understand); //評価の登録メソッドの呼び出し
            //評価がされなかった時
            }else{
                //理解度と難易度に0を代入
                showExplain.evalute.difficult += 0;
                showExplain.evalute.understand += 0;
            }

            //コメントがされた時
            if(contentEvaluteCtrl.value.comment != ""){
                console.log(contentEvaluteCtrl.value.comment)
                //POST情報の生成
                var sendData = {};
               sendData.items = {};
               sendData.items.commentId = contentEvaluteCtrl.globalParam.value.showExplain.id;
               sendData.items.comment = contentEvaluteCtrl.value.comment;
               sendData.items.fromUserId = $scope.indexCtrl.value.userId;
               sendData.items.toUserId = contentEvaluteCtrl.globalParam.value.showExplain.userId;
               sendData.items.explainFlag = true;
               /**
                * コメントの登録
                * @type {[Object]} POST情報のオブジェクト
                */
               ApiService.postComment(sendData).success(
                   function(data){
                       console.log("registComment:" + data)
                   }
               )
            }
        }

        /**
         * 評価の登録メソッド
         * @param {Number} difficult 難易度
         * @param {Number} understand 理解度
         */
        function evaluationRegist(difficult, understand){
            var showExplain = contentEvaluteCtrl.globalParam.value.showExplain; //表示中の解説を変数に退避
            showExplain.evalute.difficult += Number(difficult); //難易度の計算
            showExplain.evalute.understand += Number(understand); //理解度の計算
            /**
             * 解説の更新
             * @type {Object} 更新対象の解説オブジェクト
             */
            ApiService.upDateExplain(showExplain).success(
                function(data){
                    console.log("upDateExplain:success")
                }
            )
            /**
             * 評価情報の登録
             * @type {Object} 評価対象の解説オブジェクト
             * @type {String} ユーザID
             * @type {Object} 評価値
             * @type {Boolean} 解説フラグ
             */
            var evalute = {};
            evalute.difficult = Number(difficult);
            evalute.understand = Number(understand);
            ApiService.postEvalute(showExplain,$scope.indexCtrl.value.userId,evalute,true).success(
                function(data){
                    console.log("registEvalute:success");
                }
            )
        }
    }
}());


/***/ }),
/* 219 */
/***/ (function(module, exports) {

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


/***/ }),
/* 220 */
/***/ (function(module, exports, __webpack_require__) {

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
        $scope.indexCtrl.value.src.log = __webpack_require__(221);

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


/***/ }),
/* 221 */
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAACPCAYAAADUSI02AAAgAElEQVR4Xu2dC5gkVXn331M9szsjs+waFlRYLkZuAUV0FcQbI+5OV61yMYqJKGr8/Iy3CGjMl08lovESjI9GIyoiCSBBEgQvyNTpnl0YwKgYUIywcgvgclF3vQC7MLfuevP8x1P71NTW5VR192x3z1vPw8NO96lz3vM7p9//uR9F8ggBISAEhIAQKEFAlXhHXhECQkAICAEhQCIgUgmEgBAQAkKgFAERkFLY5CUhIASEgBAQAZE6IASEgBAQAqUIiICUwiYvCQEhIASEgAiI1AEhIASEgBAoRUAEpBQ2eUkICAEhIAREQKQOCAEhIASEQCkCIiClsMlLQkAICAEhIAIidUAICAEhIARKERABKYVNXhICQkAICAEREKkDQkAICAEhUIqACEgpbPKSEBACQkAIiIBIHRACQkAICIFSBERASmGTl4SAEBACQkAEROqAEBACQkAIlCIgAlIKm7wkBISAEBACIiBSB4SAEBACQqAUARGQUtjkJSEgBISAEBABkTogBISAEBACpQiIgJTCJi8JASEgBISACIjUASEgBISAEChFQASkFDZ5SQgIASEgBERApA4IASEgBIRAKQIiIKWwyUtCQAgIASEgAiJ1QAgIASEgBEoREAEphU1eEgJCQAgIAREQqQNCQAgIASFQioAISCls8pIQEAJCQAiIgEgdEAJCQAgIgVIEREBKYZOXhIAQEAJCQARE6oAQEAJCQAiUIiACUgqbvCQEhIAQEAIiIFIHhIAQEAJCoBQBEZAUbOvXrz+6UqmcHH6tlDqamVclBVdKPeL7/qtKlYC8JASEgBDoUQIiICkF53neJBEdb1uuzPwyrTXekUcICAEhsCQIiICIgCyJii6ZFAJCoP0EREBEQNpfqyRGISAElgQBERARkCVR0SWTQkAItJ+ACIgISPtrlcQoBITAkiAgAtImASGis3zf/6clUWskk0JACAgBIhIBaZOAMPNHtNbnSK0SAkJACCwVAl0lIJ7nncLMZ1jCv19r/ReWYQsHc133zUR0UOTF1CW6sny3MF55QQgIgT4g0G0CInsv+qBSSRaEgBBYGgREQJZGOUsuhYAQEAJtJyAC0nakdhHiqJSBgYGVzDxKRBdrre+3e1NCCQEhIAS6g4AISEY5VKvVdyml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"

/***/ }),
/* 222 */
/***/ (function(module, exports) {

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


/***/ }),
/* 223 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * mainController as mainCtrl
 * コーストップ
 */

(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('mainController', mainController);

    mainController.$inject = ['$scope'];
    function mainController($scope) {
        var mainCtrl = this;

        mainCtrl.value = {
            src: {
                explain: "",
                problem: "",
                board: "",
                makeExplain: "",
                makeProblem: ""
            }
        };

        //imageインポート
        mainCtrl.value.src.explain = __webpack_require__(83);
        mainCtrl.value.src.problem =__webpack_require__(84);
        mainCtrl.value.src.board =__webpack_require__(224);
        mainCtrl.value.src.makeExplain =__webpack_require__(44);
        mainCtrl.value.src.makeProblem =__webpack_require__(45);
        init();

        /**
         * 初期化メソッド
         */
        function init(){
            $scope.indexCtrl.value.title = "コースについて";
            $scope.indexCtrl.method.clickNav(1);
            $scope.indexCtrl.value.titleString = []; //タイトルの初期化
        };

    }

}());


/***/ }),
/* 224 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,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"

/***/ }),
/* 225 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * myPageController as myPageCtrl
 * マイページ
 */

(function() {

    angular
        .module('learnApp')
        .controller('myPageController', myPageController)
        .directive('fileModel',fileModel);

    myPageController.$inject = ['$scope','ApiService'];
    fileModel.$inject = ['$parse'];

    function myPageController($scope,ApiService) {
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
            postTitle: "", //ポストタブのタイトル
            img: {
                makeExplain: "",
                makeProblem: "",
                evaluteExplain: "",
                evaluteProblem: "",
                postExplain: "",
                postProblem: ""
            }
         }


        //画像ロード
        myPageCtrl.value.img.makeExplain = __webpack_require__(44);
        myPageCtrl.value.img.makeProblem = __webpack_require__(45);
        myPageCtrl.value.img.evaluteExplain = __webpack_require__(226);
        myPageCtrl.value.img.evaluteProblem = __webpack_require__(227);
        myPageCtrl.value.img.postExplain = __webpack_require__(228);
        myPageCtrl.value.img.postProblem = __webpack_require__(229);

        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            $scope.indexCtrl.method.check(); //ユーザログインチェック
            $scope.indexCtrl.method.clickNav(2); //画面デザイン2
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
                   console.log(data)
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
        * @return {[type]} [description]
        */
       function chart(){
           //今週の月曜日の月日
           var day = __webpack_require__(230);
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
        * @return {[type]} [description]
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
        * @return {[type]} [description]
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
         * @return {[type]} [description]
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
         * @return {[type]} [description]
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
         * @return {[type]} [description]
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
        }

        /**
         * ブックマークの取得メソッド
         * @return {[type]} [description]
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
         * @return {[type]} [description]
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
         * @return {[type]} [description]
         */
        function clickExplain(explain,flag) {
            $rootScope.explainModal = explain;
            $scope.indexCtrl.value.flag.showExplain = true;
        }

        /**
         * 学習記録タブクリックメソッド
         * @param  {[String]} type [選択したメニュー種類]
         * @return {[type]} [description]
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
                $scope.indexCtrl.value.problemList = myPageCtrl.value.userProblem;
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
         * @return {[type]} [description]
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
                       $scope.indexCtrl.value.problemList = data.data;
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
         * @return {[type]} [description]
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
/* 226 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAXAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAQEBAQEBAQEBAQEBAQEBAgEBAQECAgICAgICAgMCAgICAgIDAwMDAwMDAwQEBAQEBAYGBgYGBwcHBwcHBwcHBwEBAQECAgIEAwMEBgUEBQYHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcH/8AAEQgAgACAAwERAAIRAQMRAf/EAMEAAQACAgMBAQAAAAAAAAAAAAAHCAUJBAYKAQMBAQACAgMBAQAAAAAAAAAAAAADCAIHAQQGCQUQAAEDAgMDBwULCgcAAAAAAAEAAgQDBREGByFBEjFRIjITFAhhFXUWF3GxwZIj05Q1NlYJoUJis9TFhkdXGTNTRFRkRSYRAAEDAQMGBQ8KBwAAAAAAAAABAgMREgQFITETBgcIQVFhcZKRIoLSg7PDFERUtFU2GBmhwTJColOT0xU38NFSYiM0Cf/aAAwDAQACEQMRAD8AuitEn2VCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAID4gLqaS+CXPmpOQa2od5vMbItqk0e+5chXKJUkSp8UMLu9mkKlLsaL9nZF2JeOlgGlpdKkSqaG1y294fhd8W7xRrMrfpKjkREXirRaqnDwJmz1pHOs3h5maP2K13yTmmNfWXO7C1Nj0Ijo5YTRfW4y51V+I6GGGC4cyh+vs52uR6w3p8LYFjsMtVVyLXKiUzJxlclGbiCAIAgCAIAgCAIAgCAID4gNlng88HhzWbXqxqxay3KrSyfk/J89mBuhHSpT59J3+j5DSpEfLdZ3yWAqTxx8KlWtsm2TQ27hcH9fmkkT6vG1q8fGvBmTLm2Zaj3eXEoxLTGcKMeZRc+SWbHOa0hopjmbz8/uKYqIh56/GJrXnHMWrV2ycZFOBlnT26ug2u1RySyvX7JvbS5ROHG9wcWtHIxuwbS5xjdlLrbF9WbvcMOZe2ZZZm1VV4ErkanJwrxrzIiQ9ZrzGvMYVqJ4KzMBIjk9JjvhB3FQKlCwV3vDZG1QzCxOwEAQBAEAQHU855lflSyPuzIbZrmyaccUXvNMdMnbxBruTBes1H1abi+KRXRX2Efay0rSy1XZqpxUNR7c9pr9T9V7zizIUmdDo+sV1lFtyMjzojqUtVzcFCIfbnL+7kf6S75tWC926Dzt3QTtj58/Eovvqln47vyh7c5f3cj/SXfNp7t0HnbugnbD4lF99Us/Hd+UPbnL+7kf6S75tPdug87d0E7YfEovvqln47vyiwmg9n1A1+9avU/KNOV6p9x849nOiUuHv/eOxx74+hjj3d3Vx8uGzHVW03ZozV/QWZVk0lvO2zSzZ5VrW18hYXYPvmXLWrxv9Qhbc9Do7NFfLbt27WaNLNmymfPa5DaV4X/A3eRmAZz12sVCJa7NWpSMu5LqSIcyncqpaKrZU90OrWp92pkgCg441HdcBg4amrmR8Z6vant1hlu/i2FyKttOuko5qon9LbSItV4XcCZsuVNtYAaAAAABgAOQBTFTyINSLZd7tLgizxe89jHdTr1BUpM4CXY4DtHNxOHMhk1UNJutXgZ8SGddVc8ZqsGT7XJs18vbptvr1rtbKTnUyxoBdTfWDmnEchWCoWz1K2r4JcsKgglkVHsbRUsuXLzohHUDwA+LG2SWS4mTLQ2pT5W+erVg4b2uHb7QVirKnrItt+AMdVJndB38jK3Lw4azWS1zLjd8oig+20HVrhBiy4siuzs/8QMpUXlz8NpwAxw3KJYlPU4Ztr1dvUzImzUc5aJaa5EryqqUTnUhFRm2AgCAIAgIs1h+xtT0lQ98raexb2lu3Z97eVT32v20xHng9IiKnq+h8EQgCA2/fhSfz6/hb97qsW8d5F3XwZZ7dw8t7l4Q9Elo+qbX6OofqmqsZZpT85s3s8aNE9Pke8fm+QeVAYRAEAQEa6hWWC+3vvQHYzqD2UnOYBhWa5waA/wArRtB5tnuDNimnTxWZIy1lXM9ku9hpCDKzXSlzLvbaIAotqUX0gJFJo6pqmo7iA2YjHlJXXmaiKXd3fta77iFxlhnW0kKtRrlz0W11q8dmiUXiWnAhVRQlgggCAICLNYfsbU9JUPfK2nsW9pbt2fe3lU99r9tMR54PSIip6vofBEIAgNv34Un8+v4W/e6rFvHeRd18GWe3cPLe5eEPQhFncFpttGien5uoh7x+b8k3YPKqxlmlOIgCAIAgI81Jr9nZI1EHbIuDcR+i1jify4IhmzOaKfHbmSTG1eyrDhVeE2fI9KtUaeQvlTZBexw3gspsPL+VRyJUuBu+xOiwuWVM7pV6iNb86qQBZrzGvMYVqJ4KzMBIjk9JjvhB3FddUoWXu94bI2qGYWJ2AgCAizWH7G1PSVD3ytp7FvaW7dn3t5VPfa/bTEeeD0iIqer6HwRCAIDbd+FlKNJuvNOmem71XBeN31vyeVVi3jfI+6+DLP7t6f7vcvCHoEtH1TbPR9H9W1VjLMqZFAEAQBARNqfX+p4wP+dXePiNb8K5QkYeefxi3YXTxA5zYxwfRtNC3Wmk4c9O30alUcg5Kj3BROzl4dj100Wr8K8Llc7quVE+REK3QJ8m2yacqLU4KjNhB6rm72uG8FYqlTaUUrmOqhNVmvMa8xhWongrMwEiOT0mO+EHcVCqUPR3e8NkbVDMLE7AQEWaw/Y2p6Soe+VtPYt7S3bs+9vKp77X7aYjzwekRFT1fQ+CIQHFrVuHFjD0t55li5xkiF0PBv4ifYH7Rv8Ax/rZ62eaP+w7h3fuHff+NI4+PvHkww347Kw7xjqeJ918GXr3Ldnf6/8AqX+bR6PQfVtVtab+5tKWeXOb3vCv40cka/1auTpdo9Qs826OHWzL02a2Yy5RaNIdpWhyuxj8VWngTUolmIb0gXAO4ayotSz+v2yq94IxJUdpYVzuRtLK8qVXIvAtc+RaZK3fXJqsIAgPiArdqxnPL1u77fbldYsDL+Xba59yusp3DRZwuLnuDtvENoaMBi47BjiFyfoYdcJrzK2KJque5aIiZ1X+OoecHVTNUbO+pOeM2wTWNvv2Z5lwtpkN4andXVnCNxtxPC7sg3EY7CoVPoJqrhTrjhsEDvpMY1FpmrTL8tToC4P3zmwJ8m2yacqLU4KjNhB6rm72uG8FFSpJFK5jqoWCXXPVhAddzTl2PmmzSLRIrPjis9lWnIpjiLHscHAhpIBxGIPur0mqOsj8IxCO9sajlZayLmW01W/PU1ptf2awa36vXjCZpHRMmsVc1EVUsSNkSiLkyq2nMpW646d+a5T4sqTIa9u1jw1vC9u5zTvBW703jL6vkzOq4ojN/wA7MHY6i4jN0GGPdkuMQQJ0hpO8NanvF33zZnVcR/Dxwb1jN0GHG9Q4n+/k/FasfeIvvmzOq4y+Hng3rGboMM/ZLDRsneuykVK/euDi7QAYcHFhhhz8S13r9tEmx/RaSNrNHapRVWtqzx8VksNsF3eblqF434veHzeM6OttESzo7dKU47a15jt1pu1zsVzgXqyz5dqu9ql059tuUCo6lXoV6Tg+nVpVGEOa5rgCCCtdlgLzdo5o3Me1HNclFRcqKi8Cmx60/iia1wLZb4U/J+nt5mxIdONKu8qlPpVZL2NDXV6tOhJZSa95GLgxobjyADYsrRo+87AMKfI5zZZGoq5ERWqiciVSuTlymQ/unawf0802+LdP2pLRB7vmGffy/Z7Uf3TtYP6eabfFun7Uloe75hn38v2e1MbdfxPtYbpDqQvUjT6HTrdGs+KLkHObvZi6ScAd+CWjlN33DPvpfs9qVV1m8SWf9a49utt8Fvstht7u38xWLtmUK8jE4SJBqve6o5oODQTg3lAxJK4V1T3epmzfD8Ec58VXyOyWnUqicSURKcvCpX1YmwQgCAseuuevCAIDE3e0RbxFMeQOF7cXUK7R0mO5xzg7wskWhBeLu2RtFIVuNulWuU+LKZwvbtY8dV7dzmneCpkWp5yaFzHUU4CEQQBAEAQBAEAQBAEAQFj11z14QBAEBibvaIt4imPIHC9uLqFdo6THc45wd4WSLQgvF3bI2ikK3G3SrXKfFlM4Xt2seOq9u5zTvBUyLU85NC5jqKcBCIIAgCAIAgCAIAgCAseuuevCAIAgCAxN3tEW8RTHkDhe3F1Cu0dJjucc4O8LJFoQXi7tkbRSFbjbpVrlPiymcL27WPHVe3c5p3gqZFqecmhcx1FOAhEEAQBAEAQBAEAQFj11z14QBAEAQBAYm72iLeIpjyBwvbi6hXaOkx3OOcHeFki0ILxd2yNopCtxt0q1ynxZTOF7drHjqvbuc07wVMi1POTQuY6inAQiCAIAgCAIAgCA/9k="

/***/ }),
/* 227 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,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"

/***/ }),
/* 228 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAXAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAQEBAQEBAQEBAQEBAQEBAgEBAQECAgICAgICAgMCAgICAgIDAwMDAwMDAwQEBAQEBAYGBgYGBwcHBwcHBwcHBwEBAQECAgIEAwMEBgUEBQYHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcH/8AAEQgAgACAAwERAAIRAQMRAf/EAMsAAQACAQUBAQAAAAAAAAAAAAAGCAcCAwUJCgQBAQEAAAcBAQAAAAAAAAAAAAAAAQQFBgcICQIDEAABAwICAwkKCggHAAAAAAACAAEDBAURBiESBzFBUdEiFFUXCGGSE5PTVKRWGAlxgZGxMkJS0rQ4YnQVhTa2V3fBIzNzhLU3EQACAQECCQQNCAYLAAAAAAAAAQIDEQQhMUFRkRIFBgdx0RMWYYGhsVJykqJTNVUXCNIzc4MUNDYZ8CJis1QJ4fFCgrJDY7QVNxj/2gAMAwEAAhEDEQA/APRQtLzowEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQBAEAQHB5lv9FlaxXO/wBw13pLZT+GMI/pGTkwRxj3TMmFvhU9s24TvVeNKGOT/rfaRZfETfm57tbEvO071b0VCGs0sbbajGK7MpNRVuC14Ss5dpiXWLVy9TsGs+ozyG7s2OhnfRj8ODfAsnR4a0rMNV6Ec2a38xi/ub1NnU1G3AnOTdmS12K19mxciNPtMT+r9N358aj7tqPpHoR8/wAxfaXs+l5Ux7TE/q/Td+fGnu2o+kehD8xfaXs+l5Ux7TE/q/Td+fGnu2o+kehD8xfaXs+l5Ux7TE/q/Td+fGnu2o+kehD8xfaXs+l5Ux7TE/q/Td+fGnu2o+kehD8xfaXs+l5Ux7TE/q/Td+fGnu2o+kehD8xfaXs+l5Ux7TE/q/Td+fGnu2o+kehD8xfaXs+l5Uzfp+0jPUSjE1jogIiZhaSSQdbTuM7Y4O/dUJcNqVnzj0I+93/mJ7RnNJ7PpeXNW9vDZoLGZVzLRZrs1NdqNvBPIzhVUZExHDKL4EBO2GLaMRfBsWwfBY22vsydzrypSw2Zc6OinCziNdN69h0dpXeLgqlqcW7XCUXZKLeWxrA7FamnYrbCRqmGQwgCAIAgMTbcv/Lc0f8AC/7GnV17k+tKX97/AAyNXfjP/wCtNpfUf7mideiz+cGTlrLYrrmGsegs9LzuraEqh4teOPkC7M760pC267b6JE7cdn1rzPUpq2VluNLv2Er6rM+dBelUfllHVZWOqG0fR+dHnHVZnzoL0qj8smqx1Q2j6Pzo846rM+dBelUflk1WOqG0fR+dHnHVZnzoL0qj8smqx1Q2j6Pzo846rM+dBelUflk1WOqG0fR+dHnIhdrRcbFXSW260/Na2EROSHXA8GMWIeVGRDpZ+FQaKJfblVu9RwqKySyYH3jjUJUs9kS/12XwgraM9ZnJxqac3fUlDHFxLu8D7ywpvtBSvr5EdxPgrqOO5FN/61TvotfZL3Q36hCuoTxF+TNCX04z3wNuHgffVhzg4uxm4MJqStRy68HsIAgMIdovbzlDs07H837Y87RVtXZ8r00QwWq2sL1NdW1Uw01FRQa3JF5ZjFiN9ADiT6GdVbYmx6t/vMaNPHLK8SSwtlC3k3go7LuU7zVtcY5FjbeBJcr0YzpV2ee9nzn2nNo9q2K1GxzLGTct54Oqf9pQ3Srr66lG20Ut2BtcoaeKRzkpWB38GOh9zFlmzZnDmlcKka6quUo25Ek7VZnec0F+KDi9X2puRfrs6MYRn0WHWbasr05ZksmYtqroORxIcs5lr8qXErpboqSaoKmKlcK0TINU3F3fACB8eTwqKdhU9k7VqXOr0kEm7LMP9DRkDrszV0fl/wAVU+XUddlydfb54MND+UOuzNXR+X/FVPl012Ovt88GGh/KHXZmro/L/iqny6a7HX2+eDDQ/lDrszV0fl/xVT5dNdjr7fPBhofyh12Zq6Py/wCKqfLprsdfb54MND+UY5zFf6zM11nu9fHTRVM4BGYUjEIM0YMDYMZE+42nSvLdpa+09ozvdZ1JpJuzFiwaSH3K5BRBqBgdSbcgOD9IlAl6NFyfYM/5FkOWwRySE5yHUyERFuu+LLC++X318iO4Hwaqzcin9LU76MmWG/V2X64ayjLEXwGppifkSh9ku7wPvK0pwUkbWwm4ssvZL3Q36hCuoTxF+TNCX04z3wNuHgffVOnBxdjKjCakrUcuvB7CA6q/fJ/kovn9xMv/AIg1kPhh61XiyMTcafUcvHj3zzk9hT81Oyz9+fy5cFsPfvmn+mU5wcdPwrevq/3sD0TK3zneTXIWWaTNl8O11tRUU0I0MlU0lLq62sBCzNy2dsOUoxVpXt3dkwvl46OTaVjeDtGZepDL/S14+WD7i96iL56g3bw5dzmHUhl/pa8fLB9xNRDqDdvDl3OYdSGX+lrx8sH3E1EOoN28OXc5h1IZf6WvHywfcTUQ6g3bw5dzmHUhl/pa8fLB9xNRDqDdvDl3OYhmdtnWX8sWO5VtLc7nU3GloZKqCnleHUbVF3Z5NUGfDuY6V5lFIl77uNd6VCdRTl+qm8nMVNkkOUykkJzM31iIt9fMspJJFssgfw5B+sSfOywxvl99fIjtd8G34Jp/S1O+iaq1Tak5qw36uy/XDWUZYi+A1NMT8iUPsl3eB95eJwUke4TcWWuVLKoEB1V++T/JRfP7iZf/ABBrIfDD1qvFkYm40+o5ePHvnnJ7Cn5qdln78/ly4LYe/fNP9Mpzg46fhW9fV/vYHomVvnO81hJJEWtGZxlhhrA7s+Hwsh6jJrEbvPKvzqo78uND300870jnlX51Ud+XGg6aed6Rzyr86qO/LjQdNPO9I55V+dVHflxoOmnnek4u5X6oog1AqpzqTbkBrlo/SLSoWn3o9JJ43ZykHmrKucjOapnlKR8ZHMyfHHh0qBUeklZZaz5kPJbTIH8OQfrEnzssMb5ffXyI7W/Bt+Caf0tTvomqtU2pCAuQqQVcIDqr98n+Si+f3Ey/+INZD4YetV4sjE3Gn1HLx49885PYU/NTss/fn8uXBbD375p/plOcHHT8K3r6v97A9Eyt853k42f3mzWK+nW3yPwtE9BJAw+CaXlkQOL6r9xn0qMWV/du/ULveNaqrY2NYrcOAzV1k7N/M/QR4l71kX51p2X4PmjrJ2b+Z+gjxJrIdadl+D5o6ydm/mfoI8SayHWnZfg+aVNvN1ipZJvA4FLNIRwx/ZF3fByb/BfJsxdGlrybyWkEkkOUykkJzM31iIt9QKgkkjShEIC2mQP4cg/WJPnZYY3y++vkR2t+Db8E0/panfRNVaptSEBchUgq4QHVX75P8lF8/uJl/wDEGsh8MPWq8WRibjT6jl48e+ebjsUXW3WXtP7Kq26VcNDSHXXK3DPUEwj4etstZR0seL78k0oA3ddlsRfVbSZzp413SpW3XvcYJt2ReDNGpGTfaSb7R6Lee0XndL4wONW6c6eilmY57Red0vjA40HRSzMc9ovO6XxgcaDopZmawqqaUmCOogkN9wQMXf5GdCDhJZD4blcgog1AwOpNuQHB+kSH1o0XJ9ghMkhSEcspuRE+sZkoFTjGzAj4+e0XndL4wOND3qPMOe0XndL4wONBqPMOe0fndL4wONBqPMW/yCJNlqkN25MsskkRbxDjgxN3MWWFd76ilfpWZEjtt8INwrUNyKDqRcdepUkrcsday3kbTsz48RNFbBs8EBchUgq4QHXL71bZvm/aZ2M8+W3JNmrsw3jL17tWcJ7Pa4ymqZaOhq256cEQYkbwxGUpMzY6ovhi6vjh5fqVDakHN2Jpq14rWsGnEY14s7MrXrYlSNKLlKLjKxY7E8OhYeRHjaAzjMJIzKOSMmMDB3Z2dnxZ2dtLOzrZ00rlFNWMzjS9pnb7R00FJDtWze8NPE0Mb1FQ0x6otg2tLMJGT90nd1Lu603kRYtXhju/OTk7pTteZWdxYF2j6Pai7QP9Vc0+Mi+4n2SnmPn7rN3v4SnofOPai7QP9Vc0+Mi+4n2SnmHus3e/hKeh859tr7XnaDsF0oLoG0i73OShqRqP2dd2imppmb6Uc8eqLuBNiz6rsTbrOzszt5ldKVmIlr7wi3er0pU/s0Y2qy2Nqa7KefSs6aO1rs+drDKG3GlC31s0dhz5DD4S42CskbGXVblzUZvh4WNsMXwbWH6zYYO9GvF1lT5DUjiDwrvuwp6yWvd28E0sXYksj7jyZlamb/Rl/wBovmUqYvWMqp2AqPaZtL2w7d7vtCa7Zi2UZcra/LGW5L0OFGFzG74hDRvqj4QoaWMmPB31WIcfpMrX382qrtRpxpS1ajdrsx2WZe2dXeAXA3d7ad0hXvdwp1IOjDDJPDNqLdmHC8dua3sna/1Z5C9V7X3pcaxj1jv3pWbF/wDm/cb2ZR0PnNcezfIkUgShle068ZMY60es2LbmIk7s/wAag94r81Z0sj6Ufh03HpzUlsyhanbhjatDbT5GrCagARgEcYDHHGLAAAzMzMzYMzM2hmZlRpSbdrxmZKFCFKChBKMYpJJKxJLAkksCSWJGpQPqEBchUgq4QBAYRz7sK2d5r8NdhyHkqXMOLyS1VTbKEjquEZZCjxcuAn+B9G5UrvtSvDBrys5WUm87Gu1R6zpxb8VYe4Vym2W7PKeWSCfZ1kuKaI3jliktFCxCTPg7OzxaHZVFbRvHpJaWU7/iLr6KHkrmPOx70mzWexdpa30NjtVts1D1YWubmdqgip4tcqyt1j8HCIji+DYvgs68Oas57Pbk23rvHhyI1e4w0IU9rJQikujjgSsyyNjsge77zrt/O254z7+0cj7IDNqiGu1WC5XqNn+ja45RJghLfqTFx+wx6cI7078UbjbTp2Sq9yPL2expsPO4/DO8bTsrVrYUM/8Aal4vY/afatPQRlXYRsZyVl+15Xy5sxyTQ2Wz0zUtFBLbqaok1WfFzlqKkJJpZCd3IzkNyJ3xd3dYQvO2b3WqOc6km32X3lgNmbnu5cLvSjThRgorFgT7rwvlZJItm2zqCQZYMg5LglB8QlhtdCBDowxYhiZ2XwW0bwv8yWlkb3u7s+vSlTqUKcoSTTThFpp4GmmrGnmMO522V1lmGoueVIpq+1apHUWNnc56dt13pXfTIDfYflNvY72Rd398VOynXdjySyPlzcuLkOZ3xB/BrWuWvtDYMXUo4XOhhc4ZbaeWcf2cM1k1smb8kRjHkzKgjGMeOXKKQxFmHlHTgRu7NvuTu791WBtj73V8eXfZ0E4POT3S2W5Y/sl3t5eihb3SUKmmRggCAIAgLkKkFXCAIAgIBnPJkV+iKuoRCK7xBofQwzizaAN94m+qXxPo3JijW1cDxEvWo62FYzq0z52Lsh7Te0XLts2sAOaKax5foMu5b2d1sGrRRy0RyyyVN0YnfnX+ZK+rC7MGH02Nnwa+bnvZXu1w+z0f1W225ZcORZuXHmsMbbR3Du182p9rvH66UUowswYLcMs+F4sWe0t/HGEQBFEARxxg0cccbMwiLNgwizaGZm3GVrN2l8pWGtQIhAEB+bmhtDNuMhBKw/UIhAEAQBAXIVIKuEAQBAEBAM55Miv0RV1CIRXeIND6GGcWbQBvvE31S+J9G5MUa2rgeIl61HWwrGV6mhlp5ZIJ4zimiN45YpGdiEmfB2dn3HZT6ZIG2gCAIAgCAIAgCAIC5CpBVwgCAIAgCAgGc8mRX6Iq6hEIrvEGh9DDOLNoA33ib6pfE+jcmKNbVwPES9ajrYVjK9TQy08skE8ZxTRG8csUjOxCTPg7Oz7jsp9MkDbQBAEAQBAEAQBAXIVIKuEAQBAEAQBAQDOeTIr9EVdQiEV3iDQ+hhnFm0Ab7xN9UvifRuTFGtq4HiJetR1sKxlepoZaeWSCeM4pojeOWKRnYhJnwdnZ9x2U+mSBtoAgCAIAgCAID//Z"

/***/ }),
/* 229 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAXAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAQEBAQEBAQEBAQEBAQEBAgEBAQECAgICAgICAgMCAgICAgIDAwMDAwMDAwQEBAQEBAYGBgYGBwcHBwcHBwcHBwEBAQECAgIEAwMEBgUEBQYHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcH/8AAEQgAgQCBAwERAAIRAQMRAf/EANQAAQACAgMBAQAAAAAAAAAAAAAFCAcJAwYKBAEBAQABBQEBAQAAAAAAAAAAAAAFAgMEBwgGAQkQAAAFAgIDCQgPBwIHAAAAAAABAgMEBQYRByExEkHSE5S0FjYIGFFhFXWVVhdXgZEiMkLiU9MU1OSlZ3cJc6OzVbU3KHE40VIjJFR0JhEAAQIDAQcMDQkHBAMAAAAAAAECEQMEBSExURKSVAZBYZHRMlKyNRYHCBhxobHhYnLSE3OTFBUXgcGiM1Ojs+Nl8DRkdCU2J/EiQoIjRCb/2gAMAwEAAhEDEQA/APXJc9z3KzctwtNXDXGmmq5LbbbblyEpSlMhZElJEvAiItRDhzSDSCvbXz0SfMREmPgmO7fLrkkxiQS4QfOu6fOWv8ckb8RHKS0c4mZbtsqxG4Bzrunzlr/HJG/DlJaOcTMt22MRuAc67p85a/xyRvw5SWjnEzLdtjEbgHOu6fOWv8ckb8OUlo5xMy3bYxG4Bzrunzlr/HJG/DlJaOcTMt22MRuAc67p85a/xyRvw5SWjnEzLdtjEbgHOu6fOWv8ckb8OUlo5xMy3bYxG4Bzrunzlr/HJG/DlJaOcTMt22MRuAc67p85a/xyRvw5SWjnEzLdtjEbgHOu6fOWv8ckb8OUlo5xMy3bYxG4Bzrunzlr/HJG/DlJaOcTMt22MRuAc67p85a/xyRvw5SWjnEzLdtjEbgHOu6fOWv8ckb8OUlo5xMy3bYxG4Bzrunzlr/HJG/DlJaOcTMt22MRuAc67p85a/xyRvw5SWjnEzLdtjEbgHOu6fOWv8ckb8OUlo5xMy3bYxG4BdfSm5fH8zlCw0k4xqPSP4Shm5QgBClQAAAAAAAAAAAAAAAAAAAAAAAABP3X0puXx/M5QsTWknGNR6R/CUpZuUIAQpUAAAAAAAAAAAAAAAAAAAAAAAAAT919Kbl8fzOULE1pJxjUekfwlKWblCAEKVAAcMiQxEjvy5TrbEaKyqRIfdPBKEISalrUZ6iIixMXZEl816MYkXOVEREvqq3EQs1FQyVLc96ojWoqqq3kRLqqvYQre/1o8v233m2kTHWUL2WnjMiNZf8ANskSiLHc0/64HoHRtH0abTfKa6ZPlscqXUgqw1o3I/JcwKt85rqelJYbZioyW9zUW4txI68LsP2jBbhxdqaw/kJft/EGT1ZK/OpeS4sdaixvsn7KbQ7U1h/IS/b+IHVkr86l5Lh1qLG+yfsptDtTWH8hL9v4gdWSvzqXkuHWosb7J+ym0O1NYfyEv2/iB1ZK/OpeS4daixvsn7KbQ7U1h/IS/b+IHVkr86l5Lh1qLG+yfsptDtTWH8hL9v4gdWSvzqXkuHWosb7J+ym0O1NYfyEv2/iB1ZK/OpeS4daixvsn7KbRzx+s9ZMt1LEeNIU84ey2hxxKCM9wtpaSLEw6stfnUvJcXJXSjsh7oNkuj4yJ8xm61Lqpt30zwlTkvs8G+cWVFkkRONOJIlbJ7JmRkZGRpMj0ke4eJFpDTLQ2ssOtWnqIRhFFS85F1UvLfRUVFS4qG89D9L6S26Tz8iKIiwVFvtVNRYRS8qKipqLhiidmHkz1QAAAT919Kbl8fzOULE1pJxjUekfwlKWblCAEKVAAdIzNMyy3zBMjwMrIqxkZf+g6PWaBce0Xp5XDaeL5yV/+dr/5ad+G408j9Nz8iz7qbTKlWZ0emUenzqrUpajRFp9NacffdMkmoybaaJSlGSSMzwLUKXvRqRVYIZdDQT6qakqSxz3uvNaiucurcRIqtw7l6J80/VpmB5GqPzIxvb5G/bsoem+HWkGYVHqZnkj0T5p+rTMDyNUfmQ9vkb9uyg+HWkGYVHqZnkj0T5p+rTMDyNUfmQ9vkb9uyg+HWkGYVHqZnkj0T5p+rTMDyNUfmQ9vkb9uyg+HWkGYVHqZnkj0T5p+rTMDyNUfmQ9vkb9uyg+HWkGYVHqZnknWa3bdxWzIaiXJQa1b8qQz9IYjVuK/EcW3tGnhEIfSkzTiRliRYYi/KnMekWqi9i6QVq2HW0D0ZUyXynKkUR7XNVUwojkS5rkKLhFl0MrLnqlBgUqqx3TdcegsJnMumey+jYLEnD7u6StZH7I5G6R8lr6ynRd47hH6I9GJ6usqaq38ZvBLp0GvU+4qe3UKe5ik/cPsLw22l4aULLu9w90ctTZSsWCnS5NC0AAJ+6+lNy+P5nKFia0k4xqPSP4SlLNyhACFKiAuq6bese2LhvO7avDoFrWpRZVxXFW6grZYiQobKpEqQ6oiMyS22g1HgWOgX6WmmTpjZbEi5yoiImqq3EQ+KsDRpWf1w8hcyrpPJuxMqc0KhGzFqKctqPeVbXTYLRPVh7wW1OOEl5936Ok3UuESjSs06DSk9A6K0O5l66mtCmqJs1iKyaxytSK7lyLCMESNyGDXPBc5FUi6PV6fw078Nx20dpH5KneMt7z9Ht70C8fBvhfwHIcf8HcN9H4XhGFs4cNsObOG3j709Qxqyn87KVkYRPV6D6T+5rVk1uJ5zzaquLHFjFqpfgsL+BS4/bn/AAu++/sA89yZ8Ptd86b62f6f99+UO3P+F3339gDkz4fa7462f6f99+UO3P8Ahd99/YA5M+H2u+Otn+n/AH35Q7c/4Xfff2AOTPh9rvjrZ/p/335Q7c/4Xfff2AOTPh9rvjrZ/p/335RWfO3N70x1+k1zm9zc8F0cqT9F+l/TNv8A6y3uE2+BY2ff4YYHq1iZs2z/AGditjGKxvQNE86nOTymrJc/zPmsRmLDGx43VWMcVsL96Bg6ZMZhMqeeVo1IQWtR9whIKsDWUuWrlghZnKyc/ULcYeePUwwhtstSUk3oIhyT0h3RrafxF7p+ifRmlo2yJiJhbwTNVu3FULaqCJ0FeKTwRKirM9h5GPvVd/uHuDnOdJR6QU6ULVUGvU+4qe3UKe5ik/cPsLw22l4aULLu9w90Qk2UrFgpSTQtAn7r6U3L4/mcoWJrSTjGo9I/hKUs3KEAIUqKO/qVLW31EOs+ptakKPLCSgzQZkeyp9pKi0bhkZkfeHtObpP65TeOnzlqduFPD/1ef7/ZG/nDbP8AWow7vovrmeMndNcc4v8Ab9f/AC878Nx6pRsA/KM7pl3ZruYF50Kz2Z6KY5W33GEz3WzdS3wbC3sTbJSTPHYw1jGq6jzUtXwjA9RoVow62bUk0TX4izFVMaEYQRVvRTBhLd9h2q+sWn+TXPrAgeUrd52+8dI9U+oz1vq18sdh2q+sWn+TXPrAcpW7zt94dU+oz1vq18sdh2q+sWn+TXPrAcpW7zt94dU+oz1vq18sdh2q+sWn+TXPrAcpW7zt94dU+oz1vq18sdh2q+sWn+TXPrAcpW7zt94dU+oz1vq18siK51NZdCpsqpSsxYCkx2FuoYTTnCU4pKTVsJ/7jWeGvcBNJWx3Hb7xan9FSoYxzvbW3EVfq11P+5rbmzXpzxuuno1NtlqSXcIT6rE5jly0akELn5PdFWP2TP8ACIcn9IX99p/EXun6BdGrimZ2W8EywOeTpAnrduKoW1UEToK8UngiVFWZ7DyMfeq7/cPcFqdJR6QUGZfTDR/5TUvba3wj/d7sJ8gZ+uvpTcvj+ZyhYytJOMaj0j+EpQzcoQAhSoo3+pb/ALD+s9+Wb/KGR7Xm648pvH+ZS1O3CniB6vP9/sjfzhtn+tRh3dRfXM8ZO6a45xf7fr/5ed+G49Uo2AflGSNIq9UoNRi1eiz5VLqkJRriT4K1NutmpJoM0LTpLFJmQomS2vSCpFDNs20qijntnSHqyY285qwVNS4vYO/emvNz1j3hx5/fDF920+8TYPYfFPSTPp2W7bHprzc9Y94cef3we7afeJsD4p6SZ9Oy3bY9NebnrHvDjz++D3bT7xNgfFPSTPp2W7bHprzc9Y94cef3we7afeJsD4p6SZ9Oy3bZ8szPfNaEyp57Mi8MNSEFOfxUfcL3Q+LZ1On/AATYLkvnP0lcsErp2W7bMb1PO/NuruLVNzCux1tSDaSyua+aSQeg04Grd3RY9gkR3CbBI/ErSDFxVrZyovhrtmKxmHiS7WT3RVj9kz/CIcodIX99p/EXunf3Rq4pmdlvBMsDnk6QAAADYDdfSm5fH8zlCxiaScY1HpH8JS2zcoQAhSoo3+pb/sP6z35Zv8oZHtebrjym8f5lLU7cKeIHq8/3+yN/OG2f61GHd1F9czxk7prjnF/t+v8A5ed+G49Uo2AflGZGyl5p+kS2OfP0Hmp9Kd8MeEtrgNj6M5scJs6cOE2cO+MSv855l2JutQ9tzc+7vfcj2/F9niuPjbmGKsI/LAvz/ht+H/78eW/qPhHYP+Mf4f6Q/wANvw//AH4f1Hwh/jH+H+kP8Nvw/wD34f1Hwh/jH+H+ka58z5ltQrzu5621RebXh6SVBRBx4JUfhD4EmdrTs7OrEerpVckpuPuoXTjLTCXSOteoSjh5jzjsSF7FjchrQMGTZr0543XT0am2y1JLuEPqrEjZctGpBD5B8LgAF2snuirH7Jn+EQ5Q6Qv77T+IvdO/ujVxTM7LeCZYHPJ0gAAAGwG6+lNy+P5nKFjE0k4xqPSP4Sltm5QgBClRRv8AUt/2H9Z78s3+UMj2vN1x5TeP8ylqduFPD5kA+zFz3yUkyXW2I8fNu23333TJKUIRWY6lLUo9BERFiZju2jX/AMzOyndNdc4Mtz7ArmokVWnmonq3HqqGwT8oQAAAAD5ZkxmEyp55WjUhBa1H3CHxVgVy5auWCGPZs16c8brp6NTbZakl3CFhViSsuWjUgh8g+FwAAALs5PH/APLMlp0NMYnuY8ER4Y93AcndIR6e3U6auIvC7x3/ANGpF90zF1MZvB/0Msjns6PAAADYDdfSm5fH8zlCxiaScY1HpH8JS2zcoQAhSopt+oXblauzqSdZqh29T5FVqz+VFRmRqfDSpx11MNKZjyWm0kalr4JpRpSRYmegtI9doDUMlWzTOesEx0u9m4W5yf7VPAOlSkKStCjStJkpKkngZGWkjIyHdZEKiKhcCh9enrE0SlQqUdy0msFBZKO3UK5AYflLQksE8M+nYNxRFrWrFR61GZ6RJMtaciQiaYr+YLRqfOdM805mMsYNcqN+RLsOwlxNREJXt/dYf+ZWp5La3wq98TtbYMPq76N72ZlqO391h/5lanktrfB74na2wOrvo3vZmWpysfqD9YSE+xKXNtF9LDyXTjrpqUk4SVYmg1NuJWRKLQZpUR9wyH1LZnJgKJvR00bc1URsxIpfx72vdRU2TZrkL1t7O6wUNDLjyKBekSPt1G1ZjhGpCS0KdiuYJJ5rHWsiIy+ESdGM7R2k2cmBcBynzhc0tdo7MiqY8hV/2zES52HJ/wAV1ry6iqWeGeawKbZB3nfmaPXtuHI2qRUT8rLegT6pWVU6NsPxmm6Uh2M49NSZmlKpjzaCxLTiRDUnORphU2VSPfKc1H4yI2KRjG/2onavNnzLWJalj09TPa9XvaqrByolxype+Q3A9m/LL/xaxxtf/AaE+N9vb5mShsPq6aNbyZlqfpdXDLIjIziVcyI9Ry16faIfPjfb2+ZkIOrpo1vJmWpmWjUWmW/To9Ko8RuFAip2WmG8T72KlKM1KPvmY1rbNtVVoVCzqh6veuqvcREuImsht+w7CpLNpmyKZiMltvJ86qt1V11JQRZLgAABsBuvpTcvj+ZyhYxNJOMaj0j+EpbZuUIAQpUABRHND9Obqf37KqNy9njLBm6pkhyfMfgQEQm5jrizceU81ENprhVqM1GvZxMz90e6XtbP5wLXkNRiVD8VNeMNktrKbgKrPdQTqgxnnI8jq9WIy+ys23WnGHyUlRHgZGRu6DITqae2wv8A7Du0ffMMwGk/9WfI3KTJO4MkomVFhUGxo1wUeuya01Q0LQUlcd+ElhTprUoz2CWoi/1Mbq5p7cq62XPWfMV6tVsI6kYmFVMRIQKLdWvqq5tdaS7k27l3Rzbo8J9srovaqJWil0ppenafeIj23jTibbDeK1dwkkai9zpJpVSWXJx5y3VvNS+vY1te8WJcpXLcPSTlV+mZ1UMvbMpluXHl7Tc0bgZTw9avS8kuKky5KkkThtR2nCajMEZYNspx2S98pasVHzda3OVatTOV7Jiy26jW3kTs6q4V7iXCRbTNRDK1K6jXVKoVRh1ii5F2XSqrTn0yoFRp6ZTLzLiferbcQ8SkmXeMR7dPbZRYpUPj2SxWWZT1Ep0uaxHMckFRUiipropDZh5L1C2eHrNntSatbyTNyRRC2nZcNOszYM8VPNF3D90Rd3SY6F5vOeeXVYtPXqjZt5H3mu7Oo1forrXEOKedfo9zaLGqrMRXyb6y7quZ4uq5v0k8K6qZL6u9p2nR7HTc1Dtug0qvXlNkzLprlNiMsy6kuLMfixXJshCSceNplJIRtmeyWrWY07zyVMx2kE9iuVWtxYIqrBIsaqwTUip0PzDuV2ilIq34PTYmPRDPo1abeAAAAAAAADYDdfSm5fH8zlCxiaScY1HpH8JS2zcoQAhSoAAAMb31YrNxMqqFPShmtMo7xJkJItCFnuKL4KvYPRqzKWqxLi3gaWuuH1H53WxzhyjfuyuFa2WWW9Fqbd1NwDPwzOlTJTCigRUuIU0wgkR8VvLxMscCQozxTtvRDTdLJo5yMbjTXqkI7lERFurqrfvdsszZOOqYC6eXOWti5SWhSbDy4tmmWlalFZ4KDSaWg0p2jIiW884o1OPPOGWLjrilLWelRmY8XaNpT6ucs2c5XPW+q/tcTAiXELzWoiQQ7wMEqAAADgjxo0RrgYrDMZnhXHuCYSSE7bqzdcVspwLFS1Goz3TMzF6dPfMdjPVVWCJFVjcRIInyIiImsWKemlyW4rGo1IqsESCRVVVVuaqqqquFVVTnFkvgAAAAAAABsBuvpTcvj+ZyhYxNJOMaj0j+EpbZuUIAQpUAAAAAY3vqxWbiZVUKelDNaZR3iTISRaELPcUXwVewejVmUtViXFvArS8y9GecjyG1svsrNt1pwjJSVEeBkZHqMhMosSo4wAAAAAAAAAAAAAAABsBuvpTcvj+ZyhYxNJOMaj0j+EpbZuUIAQpUAAAAAABje+rFZuJlVQp6UM1plHeJMhJFoQs9xRfBV7B6NWZS1WJcW8CtLzL0Z5yPIbWy+ys23WnCMlJUR4GRkeoyEyixKjjAAAAAAAAAAAAAABsBuvpTcvj+ZyhYxNJOMaj0j+EpbZuUIAQpUAAAAAAAAGN76sVm4mVVCnpQzWmUd4kyEkWhCz3FF8FXsHo1ZlLVYlxbwK0vMvRnnI8htbL7KzbdacIyUlRHgZGR6jITKLEqOMAAAAAAAAAAAABsBuvpTcvj+ZyhYxNJOMaj0j+EpbZuUIAQpUAAAAAAAAAAVZzL6YVL9mz/AAUico/q0PqHQxkn0AAAAAAAAAAAD//Z"

/***/ }),
/* 230 */
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


/***/ }),
/* 231 */
/***/ (function(module, exports, __webpack_require__) {

var problem = __webpack_require__(232);
var problemForm = __webpack_require__(235);
var problemList = __webpack_require__(238);
var problemPrint = __webpack_require__(239);
var makeProblem = __webpack_require__(240);
var showProblem = __webpack_require__(241);


/***/ }),
/* 232 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * problemController as problemCtrl
 * 問題を解く
 */
(function() {

    angular
        .module('learnApp')
        .controller('problemController', problemController)

    problemController.$inject = ['$scope','$sce','$routeParams','ApiService'];
    function problemController($scope,$sce,$routeParams,ApiService) {
        var problemCtrl = this;

        problemCtrl.method = {
            clickComp: clickComp, //編集完了ボタンクリック
            deleteProblem: deleteProblem, //削除ボタンクリック
            clickBookmark:clickBookmark, //ブックマーククリック
            clickBookmarkComp:clickBookmarkComp, //ブックマーク選択完了クリック
            chooseBookmark:chooseBookmark, //ブックマーク選択
        };

        problemCtrl.value = {
            flag: {
                bookmarkLoading: false
            },
            bookmark: [] //ブックマークリスト
        };

        //スタイルの読み込み
        __webpack_require__(90);
        __webpack_require__(91);

        //グローバル変数の読み込み
        problemCtrl.globalParam = __webpack_require__(23);

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            problemCtrl.globalParam.value.problemList = undefined;
            problemCtrl.globalParam.flag.problemList = true; //問題リスト表示
            problemCtrl.globalParam.flag.problemListLoading = true; //問題リスト読み込み中オン
            $scope.indexCtrl.method.clickNav(1); //画面スタイル設定

            //パラメタが'null'でないときはシャッフル問題
            if($routeParams.problems !== 'null'){
                var problems = JSON.parse(base64url.decode($routeParams.problems)); //パラメタからシャッフル問題を取得
                problemCtrl.globalParam.value.problemList = problems; //問題リストにセット
                problemCtrl.globalParam.flag.problemListLoading = false; //問題リスト読み込み中オフ
                problemCtrl.globalParam.flag.problemList = true; //問題リスト表示
            }
        }

       /**
        * 編集完了ボタンクリックメソッド
        * @return {[type]} [description]
        */
       function clickComp(){
            var detailProblem = problemCtrl.globalParam.value.detailProblem; //問題の編集内容を退避
            //選択肢の配列化
            detailProblem.choiceNo[0] = detailProblem.No1;
            detailProblem.choiceNo[1] = detailProblem.No2;
            detailProblem.choiceNo[2] = detailProblem.No3;
            detailProblem.choiceNo[3] = detailProblem.No4;
           /**
            * 問題の更新
            * @type {Object} 問題の編集内容
            */
           ApiService.updateProblem(detailProblem).success(
               function(){
                   problemCtrl.globalParam.value.detailProblem = undefined; //問題の編集内容をリセット
                   init(); //初期化メソッド
               }
           );

       }

       /**
        * 削除ボタンクリックメソッド
        * @return {[type]} [description]
        */
       function deleteProblem(){
           var deleteProblem = problemCtrl.globalParam.value.showProblem; //削除対象(表示中)の問題を退避
           /**
            * 問題の削除
            * @type {Object} 削除する問題
            */
           ApiService.deleteProblem(deleteProblem).success(
               function(){
                   problemCtrl.globalParam.flag.showProblem = false; //問題非表示
                   problemCtrl.globalParam.value.showProblem = undefined; //表示中の問題をリセット
                   init();
               }
           );
       }

       /**
        * ブックマーク取得メソッド
        * @return {[type]} [description]
        */
       function clickBookmark(){
           problemCtrl.value.flag.bookmarkLoading = true;
           //ブックマークの登録
           ApiService.getBookmark($scope.indexCtrl.value.userId,"問題").success(
              function(data) {
                  // 通信成功時の処理
                  problemCtrl.value.bookmark = data.data;
                  for(var key in problemCtrl.value.bookmark){
                      problemCtrl.value.bookmark[key].flag = false;
                  }
                  problemCtrl.value.flag.bookmarkLoading = false;
              }
           );
       }

       /**
        * ブックマーク選択完了メソッド
        * @return {[type]} [description]
        */
       function clickBookmarkComp(){
           var postItem = {};
           for(var key in problemCtrl.value.bookmark){
               if(problemCtrl.value.bookmark[key].flag){
                   postItem.bookmarkId = problemCtrl.value.bookmark[key].id;
                   break;
               }
           }
           postItem.itemId = problemCtrl.value.problem.id;

           //ブックマーク追加
           ApiService.postBookmarkItem(postItem);
       }

       /**
        * ブックマーク選択メソッド
        * @param  {[Number]} id [ブックマークID]
        * @return {[type]} [description]
        */
       function chooseBookmark(id){
           for(var key in problemCtrl.value.bookmark){
               if(problemCtrl.value.bookmark[key].id === id){
                   problemCtrl.value.bookmark[key].flag = true;
               }else{
                   problemCtrl.value.bookmark[key].flag = false;
               }
           }
       }

    }

}());


/***/ }),
/* 233 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".common-problemSection{\n    margin-left: 20px;\n    position: relative;\n    padding: 0.5em 1em;\n    border: solid 1.5px #4790BB;\n    width: 95%;\n    margin-top: 40px;\n}\n\n.common-problemNo{\n    position: absolute;\n    display: inline-block;\n    top: -45px;\n    left: -3px;\n    padding: 0 9px;\n    line-height: 25px;\n    font-size: 17px;\n    background: #4790BB;\n    color: #ffffff;\n    border-radius: 5px 5px 0 0;\n}\n\n.common-problem{\n    margin: 30px;\n}\n\nol.common-answer{\n   counter-reset:list;\n   list-style-type:none;\n   padding: 1.5em;\n   width: 90%;\n}\nol.common-answer li{\n    position: relative;\n    padding: 7px 5px 7px 40px;\n    margin: 7px 0 10px 30px;\n    font-weight: bold;\n    font-size: 14px;\n    border-bottom: dashed 1px #4790BB;\n    transition: 0.3s;\n}\nol.common-answer li:before{\n    counter-increment: list;\n    content: counter(list);\n    position: absolute;\n    left: 0px;\n    width: 30px;\n    height: 30px;\n    text-align: center;\n    vertical-align: center;\n    line-height: 30px;\n    background: #4790BB;\n    color: #fff;\n    top: 50%;\n    transform: translateY(-50%);\n}\nol.common-answer li:hover{\n    cursor:pointer;\n    filter: alpha(opacity=60);\n    -ms-filter: \"alpha(opacity=60)\";\n    -moz-opacity:0.6;\n    -khtml-opacity: 0.6;\n    opacity:0.6;\n    zoom:1;\n}\n\n/*.common-judge{\n    margin-left: 50px;\n    -webkit-animation: fadeIn 2s ease 0s 1 normal;\n}*/\n\n/*@keyframes fadeIn {\n    0% {opacity: 0}\n    100% {opacity: 1}\n}\n\n@-webkit-keyframes fadeIn {\n    0% {opacity: 0}\n    100% {opacity: 1}\n}\n\n.common-explain {\n    position: relative;\n    padding: 0.5em 1em;\n    border: solid 1.5px #4790BB;\n    border-radius: 5px;\n    margin-left: 50px;\n    margin-bottom: 30px;\n    margin-top: 30px;\n    width:90%;\n    -webkit-animation: fadeIn 2s ease 0s 1 normal;\n}\n\n.common-explain .box-title{\n    position: absolute;\n    display: inline-block;\n    top: -13px;\n    left: 10px;\n    padding: 0 9px;\n    line-height: 1;\n    font-size: 19px;\n    background: #FFF;\n    color: #4790BB;\n    font-weight: bold;\n}\n\n.common-explain p{\n   margin: 10;\n   padding: 0.5em;\n}*/\n\n.common-problemBox {\n    margin: 2em 0;\n    background: #fff;\n    margin-left: 20px;\n    margin-right: 20px;\n}\n.common-problemBox .common-problemBox-title {\n    font-size: 1.2em;\n    background: #4790BB;\n    padding: 4px;\n    text-align: center;\n    color: #FFF;\n    font-weight: bold;\n    letter-spacing: 0.05em;\n}\n\n.common-problemForm,\n.common-answerForm,\n.common-explainForm {\n    position: relative;\n    margin: 2em 0;\n    padding: 25px 10px 7px;\n    border: solid 2px #4790BB;\n    width: 90%;\n    margin-left:30px;\n}\n\n.common-problemForm .common-problem-title,\n.common-answerForm .common-answer-title,\n.common-explainForm .common-explain-title {\n    position: absolute;\n    display: inline-block;\n    top: -2px;\n    left: -2px;\n    padding: 0 9px;\n    height: 25px;\n    line-height: 25px;\n    vertical-align: middle;\n    font-size: 17px;\n    background: #4790BB;\n    color: #ffffff;\n    font-weight: bold;\n}\n\n.common-problemForm textarea,\n.common-explainForm textarea,\n.common-answerForm textarea{\n    margin-left: 10px;\n    margin-top: 10px;\n    width: 95%;\n    font-size: 14px;\n}\n\nol.common-answer-list{\n  counter-reset:list;\n  list-style-type:none;\n  font: 14px/1.6;\n  padding: 0px;\n}\n\nol.common-answer-list li{\n  position:relative;\n  line-height: 30px;\n  margin: 7px 0 7px 40px;\n  padding-left: 10px;\n  font-weight: bold;\n  font-size:14px;\n  cursor: pointer;\n}\n\nol.common-answer-list input{\n   width:100%;\n   font-size: 14px;\n}\n\n\nol.common-answer-list li:before{\n  counter-increment: list;\n  content: counter(list);\n  position: absolute;\n  left: -35px;\n  width: 30px;\n  height: 30px;\n  background: #4790BB;\n  text-align: center;\n  color: #fff;\n  top: 50%;\n  -moz-transform: translateY(-50%);\n  -webkit-transform: translateY(-50%);\n  -o-transform: translateY(-50%);\n  -ms-transform: translateY(-50%);\n  transform: translateY(-50%);\n}\n\n.common-writeAnswer{\n    margin-left: 40px;\n    width: 90%;\n    margin-bottom: 20px;\n}\n\n.common-writeAnswer textarea{\n    font-size: 14px;\n    width: 100%;\n}\n", ""]);

// exports


/***/ }),
/* 234 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, ".problem-evalute{\n    margin-left: 40px;\n    padding: .5em;\n}\n\n.problem-evalute textarea{\n    width: 95%;\n    margin-left: 10px;\n}\n\n.problem-modal-header-icon{\n    float:right;\n    margin-right:25px;\n    margin-top:-3px;\n}\n\n.problem-modal-header-icon i{\n    padding-left: .3em;\n    cursor: pointer;\n}\n\n.common-writeAnswer{\n    margin-left: 40px;\n    width: 90%;\n    margin-bottom: 20px;\n}\n\n.common-writeAnswer textarea{\n    font-size: 14px;\n    width: 100%;\n}\n\n@keyframes fadeIn {\n    0% {opacity: 0}\n    100% {opacity: 1}\n}\n\n@-webkit-keyframes fadeIn {\n    0% {opacity: 0}\n    100% {opacity: 1}\n}\n\n.common-explain {\n    position: relative;\n    padding: 0.5em 1em;\n    border: solid 1.5px #4790BB;\n    border-radius: 5px;\n    margin-left: 50px;\n    margin-bottom: 30px;\n    margin-top: 30px;\n    width:90%;\n    -webkit-animation: fadeIn 2s ease 0s 1 normal;\n}\n\n.common-explain .box-title{\n    position: absolute;\n    display: inline-block;\n    top: -13px;\n    left: 10px;\n    padding: 0 9px;\n    line-height: 1;\n    font-size: 19px;\n    background: #FFF;\n    color: #4790BB;\n    font-weight: bold;\n}\n\n.common-explain p{\n   margin: 10;\n   padding: 0.5em;\n}\n\n.common-judge{\n    margin-left: 50px;\n    -webkit-animation: fadeIn 2s ease 0s 1 normal;\n}\n\n.evaluation-items{\n    margin:10px;\n}\n\n.radio label{\n    margin-right: 20px;\n}\n\n.problem-answer_rate{\n    margin-left: 20px;\n    font-weight: normal;\n    font-size: 17px;\n}\n", ""]);

// exports


/***/ }),
/* 235 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * problemFormController as problemFormCtrl
 * 問題を作成する
 */
(function() {

    angular
        .module('learnApp')
        .controller('problemFormController', problemFormController);

    problemFormController.$inject = ['$scope','$sce'];

    function problemFormController($scope,$sce) {
        var problemFormCtrl = this;

        problemFormCtrl.value = {
            problem: {}, //作成or編集する問題
            previewContent: "", //プレビュー時の問題文
            flag:{
                choiceFlag: true, //選択式フラグ
                writeFlag: false, //書き取り式フラグ
                statementFlag: false, //論述式フラグ
                alert: false, //アラートフラグ
            },
            style:{
                choiceStyle: "", //選択式のスタイル
                writeStyle: "", //書き取り式のスタイル
                statementStyle: "", //論述式のスタイル
            },
            alert: [] //アラート文
        };

        problemFormCtrl.method = {
            clickPreview: clickPreview, //プレビュー表示
            styleChange: styleChange, //スタイル変更(タブが押された時)
            dataCheck: dataCheck, //入力データチェック
            clickChoiceAnswer:clickChoiceAnswer //選択肢式の正解番号クリック
        };

        //スタイルロード
        __webpack_require__(236);
        __webpack_require__(90);

        //グローバル変数の読み込み
        problemFormCtrl.globalParam = __webpack_require__(23);

        init();//初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //タブスタイルセット
            problemFormCtrl.value.style.choiceStyle = {background: '#4790BB',color: '#fff'};
            problemFormCtrl.value.style.writeStyle = {background:'#fff',color: '#4790BB'};
            problemFormCtrl.value.style.statementStyle = {background:'#fff',color: '#4790BB'};

            //問題編集のとき
            if(problemFormCtrl.globalParam.flag.detailProblem){
                problemFormCtrl.value.problem = problemFormCtrl.globalParam.value.detailProblem; //問題編集内容のセット
                //問題の形式が選択肢式のとき
                if(problemFormCtrl.value.problem.format == '選択肢'){
                    //選択肢をセット
                    problemFormCtrl.value.problem.No1 = problemFormCtrl.globalParam.value.detailProblem.choiceNo[0];
                    problemFormCtrl.value.problem.No2 = problemFormCtrl.globalParam.value.detailProblem.choiceNo[1];
                    problemFormCtrl.value.problem.No3 = problemFormCtrl.globalParam.value.detailProblem.choiceNo[2];
                    problemFormCtrl.value.problem.No4 = problemFormCtrl.globalParam.value.detailProblem.choiceNo[3];
                }
            }
        }

        /**
         * タブのスタイル変更メソッド
         * @param  {[Number]} style [0:選択式,1:書き取り式,2:論述式]
         * @return {[type]} [description]
         */
        function styleChange(style){
            problemFormCtrl.value.answer = "";
            if(style == 0){ //選択式
                problemFormCtrl.value.flag.choiceFlag = true;
                problemFormCtrl.value.flag.writeFlag = false;
                problemFormCtrl.value.flag.statementFlag = false;
                problemFormCtrl.value.style.choiceStyle = {background: '#4790BB',color: '#fff'};
                problemFormCtrl.value.style.writeStyle = {background:'#fff',color: '#4790BB'};
                problemFormCtrl.value.style.statementStyle = {background:'#fff',color: '#4790BB'};
            }else if(style == 1){ //書き取り式
                problemFormCtrl.value.flag.writeFlag = true;
                problemFormCtrl.value.flag.choiceFlag = false;
                problemFormCtrl.value.flag.statementFlag = false;
                problemFormCtrl.value.style.choiceStyle = {background: '#fff',color: '#4790BB'};
                problemFormCtrl.value.style.writeStyle = {background:'#4790BB',color: '#fff'};
                problemFormCtrl.value.style.statementStyle = {background:'#fff',color: '#4790BB'};
            }else{ //論述式
                problemFormCtrl.value.flag.writeFlag = false;
                problemFormCtrl.value.flag.choiceFlag = false;
                problemFormCtrl.value.flag.statementFlag = true;
                problemFormCtrl.value.style.choiceStyle = {background: '#fff',color: '#4790BB'};
                problemFormCtrl.value.style.writeStyle = {background:'#fff',color: '#4790BB'};
                problemFormCtrl.value.style.statementStyle = {background:'#4790BB',color: '#fff'};
            }
        }

        /**
         * プレビューボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickPreview(){
            dataCheck(); //入力データのチェックメソッド呼び出し
            //入力データにエラーがなかった時
            if(!problemFormCtrl.value.flag.alert){
                //問題のhtml化
                var problem = __webpack_require__(15); //マークチェンジモジュールの呼び出し
                problemFormCtrl.value.previewProblem = problem.markupChange(problemFormCtrl.value.problem.problem);
                problemFormCtrl.value.previewProblem = $sce.trustAsHtml(problemFormCtrl.value.previewProblem); //ng-bind-view
                problemFormCtrl.value.previewExplain = problem.markupChange(problemFormCtrl.value.problem.explain);
                problemFormCtrl.value.previewExplain = $sce.trustAsHtml(problemFormCtrl.value.previewExplain); //ng-bind-view

                problemFormCtrl.globalParam.value.previewProblem = problemFormCtrl.value.problem; //プレビュー対象の問題をセット
                problemFormCtrl.globalParam.value.previewProblem.sceProblem = problemFormCtrl.value.previewProblem; //プレビュー対象の問題の問題文をセット
                problemFormCtrl.globalParam.value.previewProblem.sceExplain = problemFormCtrl.value.previewExplain; //プレビュー対象の問題の解説文をセット
                problemFormCtrl.globalParam.flag.detailProblem = false; //問題編集画面を非表示
                problemFormCtrl.globalParam.flag.previewProblem = true; //プレビュー画面の表示
            }
        }

        /**
         * 入力データチェックメソッド
         * @param  {[String]} value [クリックした公開範囲]
         * @return {[type]} [description]
         */
        function dataCheck(value){
            problemFormCtrl.value.alert = []; //アラート文のリセット
            //問題文がなかった時
            if(problemFormCtrl.value.problem.problem == undefined){
                problemFormCtrl.value.alert.push('問題文を入力してください');
            }
            //解答がなかった時
            if(problemFormCtrl.value.problem.answer == undefined){
                problemFormCtrl.value.alert.push('解答を入力してください');
            }
            //解説がなかった時
            if(problemFormCtrl.value.problem.explain == undefined){
                problemFormCtrl.value.alert.push('解説を入力してください');
            }
            //選択肢式の解答がなかった時
            if(problemFormCtrl.value.flag.choiceFlag){
                if(problemFormCtrl.value.problem.No1 == undefined || problemFormCtrl.value.problem.No2 == undefined || problemFormCtrl.value.problem.No3 ==  undefined || problemFormCtrl.value.problem.No4 == undefined){
                    problemFormCtrl.value.alert.push('選択肢を入力してください')
                }
            }
            //アラートがあった時はアラート表示オン
            if(problemFormCtrl.value.alert.length !== 0){
                problemFormCtrl.value.flag.alert = true;
            }else{
                problemFormCtrl.value.flag.alert = false;
                //解説編集の時
                if(problemFormCtrl.globalParam.flag.detailProblem){
                    problemFormCtrl.globalParam.flag.detailProblem = false; //問題編集画面の非表示
                    problemFormCtrl.globalParam.value.detailProblem = problemFormCtrl.value.problem; //編集した問題を問題編集にセット
                }else{
                    //フォーマット情報の追加
                    if(problemFormCtrl.value.flag.choiceFlag){
                        problemFormCtrl.value.problem.format = "選択肢";
                        problemFormCtrl.value.problem.choiceNo = [];
                        //選択肢の配列化
                        problemFormCtrl.value.problem.choiceNo[0] = problemFormCtrl.value.problem.No1;
                        problemFormCtrl.value.problem.choiceNo[1] = problemFormCtrl.value.problem.No2;
                        problemFormCtrl.value.problem.choiceNo[2] = problemFormCtrl.value.problem.No3;
                        problemFormCtrl.value.problem.choiceNo[3] = problemFormCtrl.value.problem.No4;
                    }else if(problemFormCtrl.value.flag.writeFlag){
                        problemFormCtrl.value.problem.format = "書き取り";
                    }else{
                        problemFormCtrl.value.problem.format = "論述";
                    }
                    problemFormCtrl.globalParam.value.makeProblem = problemFormCtrl.value.problem; //作成した問題を作成問題にセット
                }
            }
            problemFormCtrl.value.problem.openRange = value; //問題の公開範囲
        }

        /**
         * 選択肢クリック
         * @param  {Number} number 選択した選択肢番号
         * @return {[type]}        [description]
         */
        function clickChoiceAnswer(number){
            problemFormCtrl.value.problem.answer = number; //選択した選択肢番号を解答にセット
        }
    }
}());


/***/ }),
/* 236 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(237);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(4)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./makeProblem.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./makeProblem.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 237 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 238 */
/***/ (function(module, exports, __webpack_require__) {

(function() {

    angular
        .module('learnApp')
        .controller('problemListController', problemListController);

    problemListController.$inject = ['$scope','$sce','ApiService'];
    function problemListController($scope,$sce,ApiService) {
        var problemListCtrl = this;

        problemListCtrl.value = {
            problems: [], //表示する問題
            allProblems: [], //全ての問題
            myProblems: [], //自分が作成した問題
            flag: {
                empty: false //問題空フラグ
            },
            orderMark: { //並び替え記号
                insertTime: "▼",
                difficult: "●",
                understand: "●"
            },
            showProblem: [], //1ページに表示する問題
            showProblemPage:[], //ページ数
            currentPage: 1, //現在のページ
            averageEvalute: {
                difficult: 0,
                understand: 0
            },
            img: {
                difficult: "",
                understand: ""
            },
            displayRange: { //表示範囲
                all: true, //全部
                my: false //自分
            },
        };

        problemListCtrl.method = {
            print:print, //印刷
            clickRange:clickRange, //表示範囲指定
            clickOrder:clickOrder, //並び替え
            clickProblem:clickProblem, //問題表示
            goMakeProblem:goMakeProblem, //問題作成ページ表示
            clickNextPage:clickNextPage, //次のページ表示
            clickBackPage:clickBackPage, //前のページ表示
            clickPage:clickPage //指定ページ表示
        };

        //スタイルロード
        __webpack_require__(43);

        //グローバル変数の読み込み
        problemListCtrl.globalParam = __webpack_require__(23);

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            problemListCtrl.value.orderMark = { //並び替え記号
                insertTime: "▼",
                difficult: "●",
                understand: "●"
            };
            /**
             * 問題の取得
             * @type {String} 分野名
             * @type {String} メニュー名
             * @type {String} ユーザID
             */
            ApiService.getProblem($scope.indexCtrl.value.field,$scope.indexCtrl.value.menu,$scope.indexCtrl.value.userId).success(
               function(data) {
                   // 通信成功時の処理
                  problemListCtrl.globalParam.value.problemList = data.data; //取得したデータを問題リストにセット
                  problemListCtrl.globalParam.flag.problemListLoading = false; //問題リスト読み込み中オフ
                  //もし問題リストが0件だったら
                  if(problemListCtrl.globalParam.value.problemList.length == 0){
                      problemListCtrl.value.flag.empty = true; //問題が空であることを表示
                  }else{
                      var problems = problemListCtrl.globalParam.value.problemList; //問題リストの退避
                      problemSet(problems); //問題のセット
                  }
               }
            );
        }

        /**
         * 問題のセットメソッド
         * @param  {[Array]} problems [取得した問題]
         * @return {[type]} [description]
         */
        function problemSet(problems){
            //評価値の算出
            var evalute = __webpack_require__(87); //評価計算モジュールの読み込み
            problems = evalute.calcEvalute(problems);
            //選択肢の配列化
            for(var i=0; i<problems.length; i++){
                if(problems[i].format === '選択肢' && !Array.isArray(problems[i].choiceNo)){
                    problems[i].choiceNo = problems[i].choiceNo.split(",");
                }
            }
            problemListCtrl.value.allProblems = problems; //全ての問題をセット
            problemListCtrl.value.problems = problemListCtrl.value.allProblems; //表示する問題のセット(最初は全ての問題を表示)
            problemListCtrl.value.problems = problemHtml(problemListCtrl.value.problems); //問題文のhtml化
            //自分が作成した問題の抽出
            for(var i = 0; i < problems.length; i++){
                if(problems[i].userId == $scope.indexCtrl.value.userId){
                    problemListCtrl.value.myProblems.push(problems[i]); //自分が作成した問題のセット
                }
            }
            problemListCtrl.value.problems.sort(function(a,b){
                    if( a.insertTime < b.insertTime ) return 1;
                    if( a.insertTime > b.insertTime ) return -1;
                    return 0;
            });
            showProblemCalc(); //問題の表示数計算メソッド呼び出し
            inputNo(); //問題番号の付与メソッド呼び出し
        }

        /**
         * 問題の表示数計算メソッド
         * @return {[type]} [description]
         */
        function showProblemCalc(){
            problemListCtrl.value.showProblem = []; //1ページに表示する問題のリセット
            problemListCtrl.value.showProblemPage = []; //問題リストのページ数リセット
            //ページ数の計算
            for(var i = 0; i < Math.ceil(problemListCtrl.value.problems.length / 10); i++) {
              var j = i * 10;
              var p = problemListCtrl.value.problems.slice(j, j + 10);
              problemListCtrl.value.showProblem.push(p);
              problemListCtrl.value.showProblemPage.push(i+1);
            }
        }

        /**
         * 問題のhtml化メソッド
         * @param  {[Array]} item [html化対象の問題]
         * @return {[Array]} item [html化後の問題]
         */
        function problemHtml(item){
            var problem = __webpack_require__(15); //マークチェンジモジュールの呼び出し
            //問題がオブジェクト形式じゃないとき(問題プレビューじゃないとき)
            if(item.length !== undefined){
                //問題と解説のhtml化
                for(var i=0; i<item.length; i++){
                    item[i].sceProblem = problem.markupChange(item[i].problem);
                    item[i].sceProblem = $sce.trustAsHtml(item[i].sceProblem);
                    item[i].sceExplain = problem.markupChange(item[i].explain);
                    item[i].sceExplain = $sce.trustAsHtml(item[i].sceExplain);
                }
            }else{
                item.sceProblem = problem.markupChange(item.problem);
                item.sceProblem = $sce.trustAsHtml(item.sceProblem);
                item.sceExplain = problem.markupChange(item.explain);
                item.sceExplain = $sce.trustAsHtml(item.sceExplain);
            }
            return item;
        }

        /**
         * 問題クリックメソッド
         * @param  {[Array]} problem [クリックした問題]
         * @return {[type]} [description]
         */
         function clickProblem(problem){
             problemListCtrl.globalParam.value.showProblem = problem; //クリックした問題を表示問題にセット
             problemListCtrl.globalParam.value.problemList = problemListCtrl.value.problems; //表示中の問題リストを問題リストにセット
             problemListCtrl.globalParam.flag.showProblem = true; //問題モーダル表示
         }

        /**
         * 並び替えクリックメソッド
         * @param  {[String]} value [選択した並び替え]
         * @return {[type]} [description]
         */
        function clickOrder(chooseOrder){
            var order = __webpack_require__(88); //並び替えモジュールの呼び出し
            var problems = JSON.stringify(problemListCtrl.value.problems); //並び替え対象の解説を文字列化
            var orderMark = problemListCtrl.value.orderMark;
            var returnObject = order.order(problems,chooseOrder,orderMark);
            problemListCtrl.value.problems = returnObject.order;
            problemListCtrl.value.orderMark = returnObject.mark;
            problemHtml(problemListCtrl.value.problems);
            inputNo(); //問題の連番付与メソッド呼び出し
            showProblemCalc(); //問題の表示数計算メソッドの呼び出し
        }

        /**
         * 問題番号の付与メソッド
         * @return {[type]} [description]
         */
        function inputNo(){
            //問題番号のセット
            for(var i=0; i<problemListCtrl.value.problems.length; i++){
                problemListCtrl.value.problems[i].No = i+1;
            }
        }


        /**
         * 問題作成ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function goMakeProblem(){
            $scope.indexCtrl.method.directory("",4,""); //ディレクトリセット
            window.location.href = './#/makeProblem/'; //遷移先のパスセット
            //画面タイトルのセット
            $scope.indexCtrl.value.titleUrl[2] = './#/makeProblem/';
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }

        /**
         * 問題表示範囲変更メソッド
         * @param  {[String]} range [クリックした表示範囲]
         * @return {[type]} [description]
         */
        function clickRange(range){
            //表示範囲が「全部」のとき
            if(range == 'all'){
                problemListCtrl.value.problems = problemListCtrl.value.allProblems; //全ての問題を表示する問題にセット
            }else{
                problemListCtrl.value.problems = problemListCtrl.value.myProblems; //自分が作成した問題を表示する問題にセット
            }
            //問題があるかどうか
            if(problemListCtrl.value.problems.length == 0){
                problemListCtrl.value.flag.empty = true;
            }else{
                problemListCtrl.value.flag.empty = false;
                //並び替え記号と並び順の初期化
                problemListCtrl.value.orderMark = {
                    insertTime: "▼",
                    difficult: "●",
                    understand: "●"
                };
                problemListCtrl.value.problems.sort(function(a,b){
                        if( a.insertTime < b.insertTime ) return 1;
                        if( a.insertTime > b.insertTime ) return -1;
                        return 0;
                });
                showProblemCalc(); //問題の表示数計算メソッド呼び出し
                inputNo(); //問題番号の付与
            }
        }

        /**
         * 印刷メソッド
         * @return {[type]} [description]
         */
        function print(){
            //URLパラメタの生成
            var itemsString = JSON.stringify(problemListCtrl.value.problems); //印刷対象の問題を文字列化
            var itemsStringBase64 = base64url.encode(itemsString); //印刷対象の問題をbase64エンコード
             //印刷タイトルの生成
             var printTitle = '';
             //シャッフル問題のとき
             if($scope.indexCtrl.method.GetCookie('titleString[2]') == '> シャッフル問題'){
                 printTitle = base64url.encode('シャッフル問題');
             }else{
                 printTitle = base64url.encode(problemListCtrl.value.problems[0].field);
             }
             var url = './#/problemPrint/' + itemsStringBase64 + '/' + printTitle; //URLの生成
             window.open(url); //印刷画面表示
        }

        /**
         * 次のページ表示メソッド
         * @return {[type]} [description]
         */
        function clickNextPage(){
            if(problemListCtrl.value.currentPage != problemListCtrl.value.showProblemPage.length){
                problemListCtrl.value.currentPage += 1;
            }
        }

        /**
         * 前のページ表示メソッド
         * @return {[type]} [description]
         */
        function clickBackPage(){
            if(problemListCtrl.value.currentPage != 1){
                problemListCtrl.value.currentPage -= 1;
            }
        }


        /**
         * 指定ページ表示メソッド
         * @param  {Number} page ページ番号
         * @return {[type]}      [description]
         */
        function clickPage(page){
            problemListCtrl.value.currentPage = page;
        }

    }
}());


/***/ }),
/* 239 */
/***/ (function(module, exports, __webpack_require__) {

(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('problemPrintController', problemPrintController);

    problemPrintController.$inject = ['$scope', '$sce','$routeParams','$http','ApiService'];
    function problemPrintController($scope,$sce, $routeParams, $http,ApiService) {
        var problemPrintCtrl = this;

        problemPrintCtrl.value = {
            flag:{
                problem: true,
                answer: false
            },
            content: {},
            title: ""
        };

        problemPrintCtrl.method = {
            clickMenu: clickMenu,
            clickPrint: clickPrint
        };

        __webpack_require__(89);
        init();

        function init(){
            $scope.indexCtrl.value.flag.print = true;
            $scope.indexCtrl.method.clickNav(3);
            problemPrintCtrl.value.content = JSON.parse(base64url.decode($routeParams.item));
            problemPrintCtrl.value.title = base64url.decode($routeParams.title);
            var explain = __webpack_require__(15);
            //問題文
            for(var i=0; i<problemPrintCtrl.value.content.length;i++){
                problemPrintCtrl.value.content[i].problem = explain.markupChange(problemPrintCtrl.value.content[i].problem);
                problemPrintCtrl.value.content[i].sceProblem = $sce.trustAsHtml(problemPrintCtrl.value.content[i].problem); //ng-bind-view/*
            }
        }

        /*メニュークリック*/
        function clickMenu(menu){
            if(menu == 'problem'){
                problemPrintCtrl.value.flag.problem = true;
                problemPrintCtrl.value.flag.answer = false;
            }else if(menu == 'answer'){
                problemPrintCtrl.value.flag.problem = false;
                problemPrintCtrl.value.flag.answer = true;
            }
        };

        /*印刷*/
        function clickPrint(){
            window.print();
        };
    }

}());


/***/ }),
/* 240 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * makeProblemController as makeProblemCtrl
 * 問題を作成する
 */
(function() {

    angular
        .module('learnApp')
        .controller('makeProblemController', makeProblemController);

    makeProblemController.$inject = ['$scope','ApiService'];
    function makeProblemController($scope,ApiService) {
        var makeProblemCtrl = this;

        makeProblemCtrl.value = {
            problem: {},
            flag:{
                submiting: false
            }
        };

        makeProblemCtrl.method = {
            clickMake: clickMake, //問題作成
            goProblem: goProblem //問題ページへ
        };

        //グローバル変数の読み込み
        makeProblemCtrl.globalParam = __webpack_require__(23);

        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            $scope.indexCtrl.method.clickNav(1);
        }

        /**
         * 問題作成ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickMake(){
            makeProblemCtrl.value.flag.submiting = true;
            //解説作成の場合
            var sendData = {};
            sendData.items = {};

           sendData.items.problem = makeProblemCtrl.globalParam.value.makeProblem.problem;
           sendData.items.answer = makeProblemCtrl.globalParam.value.makeProblem.answer;
           sendData.items.explain = makeProblemCtrl.globalParam.value.makeProblem.explain;
           sendData.items.openRange = makeProblemCtrl.globalParam.value.makeProblem.openRange;
           sendData.items.format = makeProblemCtrl.globalParam.value.makeProblem.format;
           //sendData.items.evalute = 0;
           if(makeProblemCtrl.globalParam.value.makeProblem.format == '選択肢'){
               var noArray = [];
               noArray.push(makeProblemCtrl.globalParam.value.makeProblem.No1);
               noArray.push(makeProblemCtrl.globalParam.value.makeProblem.No2);
               noArray.push(makeProblemCtrl.globalParam.value.makeProblem.No3);
               noArray.push(makeProblemCtrl.globalParam.value.makeProblem.No4);
               sendData.items.choiceNo = noArray;
           }
           sendData.items.userId = $scope.indexCtrl.value.userId;
           sendData.items.field = $scope.indexCtrl.value.field;
           sendData.items.menu = $scope.indexCtrl.value.menu;
           sendData.items.insertTime = new Date().getTime();

           var sendDataJSON = JSON.stringify(sendData);
           /*問題の投稿*/
           ApiService.postProblem(sendData).success(
               function () {
                   makeProblemCtrl.value.flag.submiting = false;
               }
           );
        }

        /**
         * 問題を解くボタンクリックメソッド
         * @return {[type]} [description]
         */
        function goProblem(){
            $scope.indexCtrl.method.directory("",1,"");
            window.location.href = './#/problem/' + 'null';
            $scope.indexCtrl.value.titleUrl[2] = './#/problem/' + 'null';
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }
    }
}());


/***/ }),
/* 241 */
/***/ (function(module, exports, __webpack_require__) {

(function() {

    angular
        .module('learnApp')
        .controller('showProblemController', showProblemController);

    showProblemController.$inject = ['$scope','$sce','ApiService'];
    function showProblemController($scope,$sce,ApiService) {
        var showProblemCtrl = this;

        showProblemCtrl.method = {
            clickAnswer:clickAnswer, //選択肢の解答クリック
            clickSubmit:clickSubmit, //書き取りの解答クリック
            clickNextProblem:clickNextProblem, //次の問題クリック
            clickBackProblem:clickBackProblem, //前の問題クリック
            clickReturn:clickReturn,  //問題一覧に戻るクリック
            clickDetail:clickDetail, //編集クリック
            calcAnswerRate: calcAnswerRate //正解率の計算
        };

        showProblemCtrl.value = {
            problem: {}, //表示する問題
            problems: [], //全ての問題
            flag: {
                correct: false, //正解
                inCorrect: false, //不正解
                showExplain: false, //解説表示
                sameUser: false //自分が作成した解説
            },
            inputAnswer: "", //入力した解答
            evalute: { //評価
                dif_level: undefined,
                und_level: undefined
            },
            answerRate: 0, //正解率
            answeredProblemNum: 0, //解答した問題数
            answerNum: 0 //正解数

        }
        //スタイルロード
        __webpack_require__(91);

        //グローバル変数の読み込み
        showProblemCtrl.globalParam = __webpack_require__(23);

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //問題編集のプレビュー時
            if(showProblemCtrl.globalParam.flag.previewProblem){
                showProblemCtrl.value.problem = showProblemCtrl.globalParam.value.previewProblem; //プレビューの問題を表示する問題にセット
                showProblemCtrl.value.problems = showProblemCtrl.value.problem;
            }else{
                showProblemCtrl.value.problems = showProblemCtrl.globalParam.value.problemList; //問題リストを全ての問題にセット
                showProblemCtrl.value.problem = showProblemCtrl.globalParam.value.showProblem; //表示する問題のセット
            }
            showProblemCtrl.value.flag.correct = false; //正解非表示
            showProblemCtrl.value.flag.inCorrect = false; //不正解非表示
            //表示する問題の作成者かどうか
            sameUserCheck(showProblemCtrl.value.problem); //作成者チェックメソッド呼び出し
        }

        /**
         * 解答ボタンクリックメソッド
         * @param  {[Number]} No [クリックした解答番号]
         * @return {[type]} [description]
         */
        function clickAnswer(No){
            //プレビューでないとき
            //解答の可否を表示
            if(No == showProblemCtrl.value.problem.answer){ //正解
                showProblemCtrl.value.flag.correct = true;
                showProblemCtrl.value.flag.inCorrect = false;
            }else{                                      //不正解
                showProblemCtrl.value.flag.inCorrect = true;
                showProblemCtrl.value.flag.correct = false;
            }
        }

        /**
         * 書き取り式の解答ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickSubmit(){
            //プレビューでないとき
            //解答の可否を表示
            if(showProblemCtrl.value.inputAnswer == showProblemCtrl.value.problem.answer){ //正解
                showProblemCtrl.value.flag.correct = true;
                showProblemCtrl.value.flag.inCorrect = false;
            }else{                                                                 //不正解
                showProblemCtrl.value.flag.inCorrect = true;
                showProblemCtrl.value.flag.correct = false;
            }
            showProblemCtrl.value.flag.showExplain = true;
        }

        /**
         * 次の問題ボタンクリックメソッド
         * @param  {[Number]} No    [問題番号]
         * @return {[type]} [description]
         */
        function clickNextProblem(No){
            calcAnswerRate(); //正解率の計算メソッド呼び出し
            newProblemSetting(); //新しい問題表示の設定メソッド呼び出し
            showProblemCtrl.value.problem = showProblemCtrl.value.problems[No]; //次の問題をセット
            sameUserCheck(showProblemCtrl.value.problem); //作成者チェックメソッド呼び出し
        }

        /**
         * 前の問題ボタンクリックメソッド
         * @param  {[Number]} No [クリックした問題番号]
         * @return {[type]} [description]
         */
        function clickBackProblem(No){
            calcAnswerRate(); //正解率の計算メソッド呼び出し
            newProblemSetting(); //新しい問題表示の設定メソッド呼び出し
            showProblemCtrl.value.problem = showProblemCtrl.value.problems[No-2];
            sameUserCheck(showProblemCtrl.value.problem);
        }

        /**
         * 新しい問題の設定メソッド
         * @return {[type]} [description]
         */
        function newProblemSetting(){
            //評価がされたとき評価計算へ
            if(showProblemCtrl.value.evalute.dif_level !== undefined || showProblemCtrl.value.evalute.und_level !== undefined){
                calcEvalute(showProblemCtrl.value.evalute.dif_level, showProblemCtrl.value.evalute.und_level);
            }
            showProblemCtrl.value.inputAnswer = undefined; //入力した解答を初期化
            showProblemCtrl.value.flag.showExplain = false; //解説非表示
            showProblemCtrl.value.flag.correct = false; //正解非表示
            showProblemCtrl.value.flag.inCorrect = false; //不正解非表示
        }

        /**
         * 表示する問題の作成者がどうかチェックするメソッド
         * @param  {[Array]} problem [表示する問題]
         * @return {[type]}         [description]
         */
        function sameUserCheck(problem){
            if(problem.userId == $scope.indexCtrl.value.userId){
                showProblemCtrl.value.flag.sameUser = true;
            }else{
                showProblemCtrl.value.flag.sameUser = false;
            }
        }

        /**
         * 問題一覧に戻るクリックメソッド
         * @return {[type]} [description]
         */
        function clickReturn(){
            //プレビュー表示のとき
            if(showProblemCtrl.globalParam.flag.previewProblem){
                showProblemCtrl.globalParam.flag.previewProblem = false;//プレビュー非表示
                showProblemCtrl.globalParam.flag.detailProblem = true; //編集表示
            }else{
                showProblemCtrl.globalParam.flag.showProblem = false; //問題非表示
            }
            newProblemSetting(); //新しい問題表示の設定メソッド呼び出し
        }

        /**
         * 評価計算
         * @param  {[Number]} dif_level [難易度の評価値]
         * @param  {[Number]} und_level [理解度の評価値]
         * @return {[type]} [description]
         */
        function calcEvalute(dif_level, und_level){
            //仮処理
            if(typeof showProblemCtrl.value.problem.evalute !== 'object'){
                showProblemCtrl.value.problem.evalute = {
                    difficult: 0,
                    understand: 0
                };
            }
            showProblemCtrl.value.problem.evalute.difficult += Number(dif_level); //評価値の計算
            showProblemCtrl.value.problem.evalute.understand += Number(und_level); //評価値の計算
            /**
             * 評価の登録
             * @type {Object} 評価された問題
             * @type {String} ユーザID
             * @type {Number} 評価値
             * @type {Boolean} 解説フラグ
             */
            var evalute = {};
            evalute.difficult = Number(dif_level);
            evalute.understand = Number(und_level);
            ApiService.postEvalute(showProblemCtrl.value.problem,$scope.indexCtrl.value.userId,evalute,false);
            /**
             * 問題の更新
             * @type {Object} 更新対象の問題
             */
            ApiService.updateProblem(showProblemCtrl.value.problem);
            showProblemCtrl.value.evalute.dif_level = undefined;
            showProblemCtrl.value.evalute.und_level = undefined;

            if(showProblemCtrl.value.comment !== undefined){
                //POSTデータの設定
                var sendData = {};
                sendData.items = {};
                sendData.items.commentId = showProblemCtrl.value.problem.id;
                sendData.items.comment = showProblemCtrl.value.comment;
                sendData.items.fromUserId = $scope.indexCtrl.value.userId;
                sendData.items.toUserId = showProblemCtrl.value.problem.userId;
                sendData.items.explainFlag = false;
                /**
                 * コメントの登録
                 * @type {Object} POSTデータ
                 */
                ApiService.postComment(sendData);
                showProblemCtrl.value.comment = ""; //コメントの初期化
            }
       }

       /**
        * 編集ボタンクリックメソッド
        * @return {[type]} [description]
        */
       function clickDetail(){
           showProblemCtrl.globalParam.value.detailProblem = showProblemCtrl.value.problem; //表示中の問題を編集する問題にセット
           showProblemCtrl.globalParam.flag.showProblem = false; //問題非表示
           showProblemCtrl.globalParam.flag.detailProblem = true; //問題編集表示
       }

       /**
        * 正解率の計算メソッド
        * @return {[type]} [description]
        */
       function calcAnswerRate(){
           showProblemCtrl.value.answeredProblemNum++;
           if(showProblemCtrl.value.flag.correct){
               showProblemCtrl.value.answerNum++;
           }
           showProblemCtrl.value.answerRate = Math.round((showProblemCtrl.value.answerNum / showProblemCtrl.value.answeredProblemNum) * Math.round(10, 2)) / Math.round(10, 2) * 100;
           //showProblemCtrl.value.answerRate = showProblemCtrl.value.answerNum / showProblemCtrl.value.answeredProblemNum * 100;
       }

    }
}());


/***/ }),
/* 242 */
/***/ (function(module, exports) {

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


/***/ })
],[180]);