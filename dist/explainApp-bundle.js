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
/******/ 	return __webpack_require__(__webpack_require__.s = 20);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
/* 1 */
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
/* 2 */
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
/* 3 */
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
/* 4 */
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(6);
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".common-menu-header{\n    margin-top:10px;\n    padding:0.5em;\n}\n\n.common-menu-header p{\n    float:left;\n    font-size:14px;\n    color:#a09f9f;\n}\n\n.common-menu-header #right{\n    display: flex;\n    float: right;\n    margin-right:30px;\n    font-size: 13px;\n}\n\n.common-menu-content {\n    counter-reset:list;\n    list-style-type:none;\n    padding:0;\n    margin-top: 30px;\n}\n.common-no-content{\n    text-align:center;\n    padding:1.5em;\n}\n\n.common-no-content p{\n    font-size:18px;\n    font-weight:bold;\n}\n\n.list{\n    margin:20px;\n}\n", ""]);

// exports


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8);
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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".print-styleAlert{\n    width: 80%;\n    position: absolute;\n    padding: 1.2em;\n    top: 100px;\n    margin-left: 10%;\n    text-align: center;\n\n}\n.print-noPrintArea{\n    position: absolute;\n    top: 190px;\n    width: 20%;\n    margin-left: 2%;\n    height: 100%;\n    text-align: center;\n}\n.print-menu{\n    float:left;\n    width: 100%;\n    text-align: center;\n    padding: 1.2em;\n    top:0px;\n    background-color: #fff;\n}\n\n.print-btn{\n    position: absolute;\n    top: 200px;\n    width: 100%;\n}\n\n.print-menu button{\n    padding: 1.0em;\n    width: 100%;\n}\n.print-menu ul{\n    margin: 0;\n    padding: 5px;\n    list-style: none;\n}\n.print-menu li{\n    display: list-item;  /* 縦に並べる */\n    list-style-type: none;\n}\n\n.print-printArea{\n    position: absolute;\n    top: 190px;\n    left: auto;\n    width: 72%;\n    margin-left: 25%;\n    height: 100%;\n}\n\n\n#note{\n    padding-bottom: 0.1em;\n    background-size: 2px 2.2em;\n    line-height: 2.24;\n    padding-left:25px;\n    border-collapse: collapse;\n    background-image: linear-gradient(to right, #fff 1.1px, transparent 1px), linear-gradient(to bottom, #ccc 1.1px, transparent 1px);\n    border-spacing: 0;\n}\n\n#test{\n    padding-bottom: 0.1em;\n    background-size: 2px 2.2em;\n    line-height: 2.15;\n    padding-left:25px;\n}\n\n@media print{\n    body{\n        background-color: #ffffff;\n        height: 100%;\n    }\n  .print-noPrintArea{\n      display:none;\n      margin-left: 0px;\n   }\n  .print-printArea{\n     top:0px;\n     margin-left:0;\n     width:100%;\n     height: 100%;\n     font-size: 0.9em;\n  }\n  #note{\n      line-height: 2.21;\n  }\n}\n\n.print-formatChoose,\n.print-formatWrite{\n    margin-left:30px;\n    margin-top: 5px;\n}\n\n.print-answerBox {\n    width: 90%;\n    background: white;\n    border: 0.5px solid black;\n    margin: 15px;\n    margin-bottom: 0px;\n    height:100px;\n}\n.explainPrint-styleAlert{\n    position: absolute;\n    width: 90%;\n    text-align: center;\n    margin: 5%;\n    top: 60px;\n}\n", ""]);

// exports


/***/ }),
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(24);
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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(26);
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
/* 19 */,
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var explain = __webpack_require__(21);
var explainForm = __webpack_require__(25);
var explainList = __webpack_require__(27);
var explainPrint = __webpack_require__(28);
var makeExplain = __webpack_require__(29);
var showExplain = __webpack_require__(30);


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * explainController as explainCtrl
 * 解説を見る
 */

(function() {

    angular
        .module('learnApp')
        .controller('explainController', explainController);

    explainController.$inject = ['$scope', '$sce','ApiService'];

    function explainController($scope,$sce,ApiService) {
        var explainCtrl = this;

        explainCtrl.value = {
            comment: "", //コメント
            flag: {
                empty: false, //解説なし
                bookmarkLoading: false, //ブックマーク読み込み中
                error: false //読み込みエラー
            },
            bookmark: [], //ブックマークリスト
        };

        explainCtrl.method = {
            init:init, //初期化
            finish: finish, //終了ボタンクリック
            goMakeExplain:goMakeExplain, //解説作成に移動
            clickComp: clickComp, //編集完了ボタンクリック
            deleteExplain: deleteExplain, //削除ボタンクリック
            clickBookmark:clickBookmark, //ブックマーククリック
            clickBookmarkComp:clickBookmarkComp, //ブックマーク選択完了クリック
            chooseBookmark:chooseBookmark, //ブックマーク選択
            clickDetailFinish:clickDetailFinish, //編集終了クリック
        };

        init(); //初期化メソッド

        //スタイル読み込み
        __webpack_require__(22);
        __webpack_require__(17);

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            $scope.indexCtrl.value.explainList = undefined; //リスト内容リセット
            $scope.indexCtrl.value.flag.explainList = true; //リスト非表示
            $scope.indexCtrl.value.flag.explainListLoading = true; //リスト読み込み中
            $scope.indexCtrl.method.clickNav(2); //画面スタイル適用
       }


        /**
         * 終了ボタンクリックメソッド(評価とコメントの登録)
         * @return {[type]} [description]
         * @param  {[Number]} value [評価値]
         */
        function finish(value){
            var showExplain = $scope.indexCtrl.value.showExplain; //表示中の解説を変数に退避
            $scope.indexCtrl.value.flag.showExplain = false; //解説を非表示
            //評価がされた時
            if(value != null){
                showExplain.evalute += Number(value); //評価値の計算
                /**
                 * 解説の更新
                 * @type {Object} 更新対象の解説オブジェクト
                 */
                ApiService.upDateExplain(showExplain);
                /**
                 * 評価情報の登録
                 * @type {Object} 評価対象の解説オブジェクト
                 * @type {String} ユーザID
                 * @type {Number} 評価値
                 * @type {Boolean} 解説フラグ
                 */
                ApiService.postEvalute(showExplain,$scope.indexCtrl.value.userId,value,true);
            //評価がされなかった時
            }else{
                showExplain.evalute += 0;
            }

            //コメントがされた時
            if(explainCtrl.value.comment != ''){
                //POST情報の生成
                var sendData = {};
               sendData.items = {};
               sendData.items.commentId = showExplain.id;
               sendData.items.comment = explainCtrl.value.comment;
               sendData.items.fromUserId = $scope.indexCtrl.value.userId;
               sendData.items.toUserId = showExplain.userId;
               sendData.items.explainFlag = true;
               /**
                * コメントの登録
                * @type {[Object]} POST情報のオブジェクト
                */
               ApiService.postComment(sendData);
            }
        }

        /**
         * 解説作成ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function goMakeExplain(){
            $scope.indexCtrl.method.directory("",3,""); //ディレクトリ設定
            window.location.href = './#/makeExplain/'; //解説作成画面に移動
            //ディレクトリの保存
            $scope.indexCtrl.value.titleUrl[2] = './#/makeExplain/';
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }

        /**
         * 編集完了ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickComp(){
            var detailExplain = $scope.indexCtrl.value.detailExplain; //編集した解説の退避
            /**
             * 解説の更新
             * @type {[Object]} 編集した解説
             */
            ApiService.upDateExplain(detailExplain).success(
                function(){
                    $scope.indexCtrl.value.detailExplain = undefined; //編集した解説の初期化
                    init(); //初期化メソッド
                }
            );
        }

        /**
         * 削除ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function deleteExplain(){
            var showExplain = $scope.indexCtrl.value.showExplain; //表示している解説
            /**
             * 解説の削除
             * @type {[Number]} 削除する解説のID
             */
            ApiService.deleteExplain(showExplain.id).success(
                function(){
                    $scope.indexCtrl.value.showExplain = undefined;
                    init(); //初期化メソッド
                }
            )
        }

        /**
         * ブックマーク取得メソッド
         * @return {[type]} [description]
         */
        function clickBookmark(){
            explainCtrl.value.flag.bookmarkLoading = true;
            //ブックマークの登録
            ApiService.getBookmark($scope.indexCtrl.value.userId,"解説").success(
               function(data) {
                   // 通信成功時の処理
                   explainCtrl.value.bookmark = data.data;
                   for(var key in explainCtrl.value.bookmark){
                       explainCtrl.value.bookmark[key].flag = false;
                   }
                   explainCtrl.value.flag.bookmarkLoading = false;
               }
            );
        }

        /**
         * ブックマーク選択完了メソッド
         * @return {[type]} [description]
         */
        function clickBookmarkComp(){
            var postItem = {};
            for(var key in explainCtrl.value.bookmark){
                if(explainCtrl.value.bookmark[key].flag){
                    postItem.bookmarkId = explainCtrl.value.bookmark[key].id;
                    break;
                }
            }
            postItem.itemId = explainCtrl.value.openExplain.id;

            //ブックマーク追加
            ApiService.postBookmarkItem(postItem);
        }

        /**
         * ブックマーク選択メソッド
         * @return {[type]} [description]
         * @param  {[Number]} id [ブックマークID]
         */
        function chooseBookmark(id){
            for(var key in explainCtrl.value.bookmark){
                if(explainCtrl.value.bookmark[key].id === id){
                    explainCtrl.value.bookmark[key].flag = true;
                }else{
                    explainCtrl.value.bookmark[key].flag = false;
                }
            }
        }

        /**
         * 解説編集の終了メソッド
         * @return {[type]} [description]
         */
        function clickDetailFinish(){
            $scope.indexCtrl.value.flag.detailExplain = false; //解説編集画面閉じる
            init(); //初期化メソッド
        }
    }
}());


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(23);
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
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".explain-evalute-content{\n    margin-left: 20px;\n    margin-right: 20px;\n    height: auto;\n}\n\n.explain-evalute-content textarea{\n    width:80%;\n    margin-left: 20px;\n}\n\n.explain-list{\n    margin:20px;\n}\n", ""]);

// exports


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".common-ExplainBox {\n    margin: 1em 0;\n    background: #fff;\n    margin-left: 20px;\n    margin-right: 20px;\n}\n.common-ExplainBox .common-ExplainBox-title {\n    font-size: 1.2em;\n    background: #4790BB;\n    padding: 4px;\n    text-align: center;\n    color: #FFF;\n    font-weight: bold;\n}\n", ""]);

// exports


/***/ }),
/* 25 */
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
        __webpack_require__(18);

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //解説編集の時
            if($scope.indexCtrl.value.flag.detailExplain){
                explainFormCtrl.value.explain = $scope.indexCtrl.value.detailExplain; //編集する解説のセット
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
                $scope.indexCtrl.value.previewExplain = explain;
                $scope.indexCtrl.value.flag.detailExplain = false; //解説編集画面のオフ
                $scope.indexCtrl.value.flag.previewExplain = true; //解説プレビュー画面のオン
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
                if($scope.indexCtrl.value.flag.detailExplain){
                    $scope.indexCtrl.value.detailExplain = explainFormCtrl.value.explain; //解説編集に編集内容をセット
                //解説作成の時
                }else{
                    $scope.indexCtrl.value.explainForm = explainFormCtrl.value.explain; //解説作成に作成内容をセット
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
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/*.common-explain-content{\n    margin-left: 20px;\n    margin-right: 20px;\n    height:auto;\n    min-height: 400px;\n    max-height: 400px;\n    overflow: auto;\n}*/\n\n/*.common-ExplainBox {\n    margin: 1em 0;\n    background: #fff;\n    margin-left: 20px;\n    margin-right: 20px;\n}\n.common-ExplainBox .common-ExplainBox-title {\n    font-size: 1.2em;\n    background: #4790BB;\n    padding: 4px;\n    text-align: center;\n    color: #FFF;\n    font-weight: bold;\n}*/\n\n.common-explainMake{\n    position: relative;\n    margin: 2em 0;\n    padding: 25px 10px 7px;\n    border: solid 2px #4790BB;\n    width: 90%;\n    margin-left:30px;\n}\n\n.common-explainMake .common-explainMakeTitle-title{\n    position: absolute;\n    top: -2px;\n    left: -2px;\n    padding: 0 9px;\n    background: #4790BB;\n    color: #ffffff;\n}\n\n.common-explainMake textarea{\n    margin-left: 10px;\n    margin-top: 10px;\n    width: 95%;\n    font-size: 14px;\n}\n\n.common-makeBox-footer{\n    text-align: center;\n    height:auto;\n    padding-bottom: 10px;\n}\n\n.common-comp-content{\n    text-align:center;\n    padding:1.3em;\n}\n.common-comp-content p{\n    font-size:18px;\n    font-weight:bold;\n}\n", ""]);

// exports


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

(function() {

    angular
        .module('learnApp')
        .controller('explainListController', explainListController);

    explainListController.$inject = ['$scope','ApiService'];
    function explainListController($scope,ApiService) {
        var explainListCtrl = this;

        explainListCtrl.value = {
            explains: [], //表示する解説
            order: ['新しい順', '古い順', '理解度が低い順', '理解度が高い順'], //並び替え
            allExplains:[], //すべての解説
            myExplains:[], //自分が作成した解説
            showExplain: [], //1ページに表示する解説
            showExplainPage:[], //ページ数
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
            clickOrder:clickOrder, //並び替えクリック
            clickExplain:clickExplain, //解説クリック
            clickRange:clickRange, //解説表示範囲のボタンクリック
            clickNextPage:clickNextPage, //次のページクリック
            clickBackPage:clickBackPage, //前のページクリック
            clickPage:clickPage //ページクリック
        };

        //スタイルロード
        __webpack_require__(5);
        //初期化メソッド
        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            /**
             * 解説の取得
             * @type {[String]} 分野
             * @type {[String]} メニュー
             * @type {[String]} ユーザID
             */
            ApiService.getExplain($scope.indexCtrl.value.field, $scope.indexCtrl.value.menu,$scope.indexCtrl.value.userId).success(
               function(data) {
                   console.log(data)
                   //データが正常に取得されたとき
                   if(data.status == 0){
                       //データが1件以上あるとき
                       if(data.data.length > 0){
                           $scope.indexCtrl.value.explainList = data.data; //解説リストに取得データをセット
                           var explains = $scope.indexCtrl.value.explainList; //解説リストを退避
                           explainListCtrl.value.allExplains = explains; //すべての解説をセット
                           //自分の解説を抽出
                           for(var i = 0; i < explains.length; i++){
                               // 自分の解説があればセット
                               if(explains[i].userId == $scope.indexCtrl.value.userId){
                                   explainListCtrl.value.myExplains.push(explains[i]);
                               }
                           }
                           //表示する解説抽出(最初は全ての解説を表示)
                           explainListCtrl.value.explains = explainListCtrl.value.allExplains;
                           showExplainCalc(); //表示する解説数の計算メソッド
                       }else{
                           explainListCtrl.value.flag.empty = true; //「解説がない」表示
                       }
                   }else{
                       explainListCtrl.value.flag.error = true; //「エラー」表示
                   }
                   $scope.indexCtrl.value.flag.explainListLoading = false; //解説読み込み中非表示
               }
           );
        }

        /**
         * 表示する解説数の計算メソッド
         * @return {[type]} [description]
         */
        function showExplainCalc(){
            explainListCtrl.value.showExplain = []; //1ページに表示する解説のリセット
            explainListCtrl.value.showExplainPage = []; //ページ数のリセット
            //表示する解説数の計算
            for(var i = 0; i < Math.ceil(explainListCtrl.value.explains.length / 10); i++) {
              var j = i * 10;
              var p = explainListCtrl.value.explains.slice(j, j + 10);
              explainListCtrl.value.showExplain.push(p);
              explainListCtrl.value.showExplainPage.push(i+1);
            }
        }

        /**
         * 解説クリックメソッド
         * @param  {[Array]} explain [クリックした解説]
         * @return {[type]} [description]
         */
        function clickExplain(explain) {
            $scope.indexCtrl.value.showExplain = explain; //クリックした解説を表示解説にセット
            $scope.indexCtrl.value.flag.showExplain = true; //解説モーダル表示
        }

        /**
         * 並び替えクリックメソッド
         * @param  {[String]} value [選択した並び替え]
         * @return {[type]} [description]
         */
        function clickOrder(value){
            var order = __webpack_require__(4); //並び替えモジュールの呼び出し
            var explains = JSON.stringify(explainListCtrl.value.explains); //並び替え対象の解説を文字列化
            explainListCtrl.value.explains = JSON.parse(order.order(explains,value)); //並び替えた解説
            showExplainCalc(); //表示する解説数の計算メソッド
        }

        /**
         * 解説表示範囲クリック
         * @param  {[String]} range [選択範囲]
         * @return {[type]} [description]
         */
        function clickRange(range){
            //範囲が「全部」のとき
            if(range == 'all'){
                explainListCtrl.value.explains = explainListCtrl.value.allExplains; //全ての解説を表示用の解説にセット
            }else{
                explainListCtrl.value.explains = explainListCtrl.value.myExplains; //自分が作成した解説を表示用の解説にセット
            }
            showExplainCalc();//表示する解説数の計算メソッド
        }

        /**
         * 次のページ表示メソッド
         * @return {[type]} [description]
         */
        function clickNextPage(){
            //現在のページが最後のページでないとき
            if(explainListCtrl.value.currentPage != explainListCtrl.value.showExplainPage.length){
                explainListCtrl.value.currentPage += 1; //次のページへ
            }
        }

        /**
         * 前のページに戻るメソッド
         * @return {[type]} [description]
         */
        function clickBackPage(){
            //現在のページが1ページでないとき
            if(explainListCtrl.value.currentPage != 1){
                explainListCtrl.value.currentPage -= 1; //前のページへ
            }
        }

        /**
         * ページ選択メソッド
         * @param  {Number} page ページ番号
         * @return {[type]}      [description]
         */
        function clickPage(page){
            explainListCtrl.value.currentPage = page; //選択したページへ
        }

    }
}());


/***/ }),
/* 28 */
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

        __webpack_require__(7);
        init();

        function init(){
            $scope.indexCtrl.value.flag.print = true;
            $scope.indexCtrl.method.clickNav(4);
            explainPrintCtrl.value.content = JSON.parse(base64url.decode($routeParams.item));
            var explain = __webpack_require__(3);
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
            var explain = __webpack_require__(3);
            afterText = explain.markupChange(afterText);
            explainPrintCtrl.value.content.sceRememberContent = $sce.trustAsHtml(afterText); //ng-bind-view

        }
    }


}());


/***/ }),
/* 29 */
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
        __webpack_require__(17);
        __webpack_require__(18);
        //初期化メソッド
        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            $scope.indexCtrl.method.clickNav(2); //画面スタイル設定
            $scope.indexCtrl.value.makeExplain = undefined;
            $scope.indexCtrl.value.flag.makeExplain = true;
        }

        /**
         * 解説作成ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickMake(){
            var makeExplain = $scope.indexCtrl.value.explainForm; //作成した解説を退避
            makeExplainCtrl.value.flag.submiting = true; //解説投稿中オン
            /**
             * 解説の登録
             * @type {object} 作成した解説
             * @type {String} ユーザID
             * @type {String} 分野名
             * @type {String} メニュー名
             */
            ApiService.postExplain(makeExplain,$scope.indexCtrl.value.userId,$scope.indexCtrl.value.field,$scope.indexCtrl.value.menu).success(
                function() {
                    makeExplainCtrl.value.flag.submiting = false; //解説投稿中オフ
                }
            );
        }

        /**
         * 解説を見るボタンクリックメソッド
         * @return {[type]} [description]
         */
        function goExplain(){
            $scope.indexCtrl.value.flag.makeExplain = false;
            $scope.indexCtrl.value.makeExplain = undefined;
            $scope.indexCtrl.method.directory("",0,""); //ディレクトリセット
            window.location.href = './#/explain/'; //解説画面に移動
            //ディレクトリパスの保存
            $scope.indexCtrl.value.titleUrl[2] = './#/explain/';
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }
    }
}());


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

(function() {

    angular
        .module('learnApp')
        .controller('showExplainController', showExplainController);

    showExplainController.$inject = ['$scope','$sce'];
    function showExplainController($scope,$sce) {
        var showExplainCtrl = this;

        showExplainCtrl.value = {
            explain: {}, //表示する解説
            flag: {
                sameUser: false, //自分が作成した解説
                previewUser: false //解説プレビュー
            },
            content: "", //解説内容

        };

        showExplainCtrl.method = {
            print: print, //印刷ボタンクリック
            clickDetail:clickDetail, //編集ボタンクリック
            finish: finish, //終了ボタンクリック
            clickPreviewComp:clickPreviewComp, //プレビュー完了クリック
            clickDelete:clickDelete //削除クリック
        };

        //スタイルロード
        __webpack_require__(31);
        //初期化メソッド
        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //解説モーダル表示の時
            if($scope.indexCtrl.value.flag.showExplain){
                showExplainCtrl.value.explain = $scope.indexCtrl.value.showExplain; //表示する解説のセット
            //解説プレビュー表示の時
            }else{
                showExplainCtrl.value.explain = $scope.indexCtrl.value.previewExplain; //プレビューする解説のセット
            }
            //表示する解説はユーザが作成したものか
            if(showExplainCtrl.value.explain.userId == $scope.indexCtrl.value.userId){
                showExplainCtrl.value.flag.sameUser = true;
            }else{
                //作成した解説のユーザIDが未定義の時(まだ解説を作成していない時)
                if(showExplainCtrl.value.explain.userId===undefined){
                    showExplainCtrl.value.flag.previewUser = true;
                }else{
                    showExplainCtrl.value.flag.sameUser = false;
                }
            }
            //解説のマークアップ
            var explain = __webpack_require__(3); //マークチェンジモジュールの呼び出し
            showExplainCtrl.value.content = explain.markupChange(showExplainCtrl.value.explain.content,showExplainCtrl.value.explain.imgUrl);
            showExplainCtrl.value.content = $sce.trustAsHtml(showExplainCtrl.value.content); //ng-bind-view
        }


        /**
         * 印刷ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function print(){
           var itemsString = JSON.stringify(showExplainCtrl.value.explain); //印刷する解説の文字列化
           var itemsStringBase64 = base64url.encode(itemsString); //印刷する解説のbase64化
           var url = './#/explainPrint/' + itemsStringBase64; //画面遷移先のURL設定
           window.open(url); //印刷画面の表示
        }

        /**
         * 編集ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickDetail(){
            $scope.indexCtrl.value.flag.showExplain = false; //解説モーダル非表示
            $scope.indexCtrl.value.flag.detailExplain = true; //解説編集画面の表示
            $scope.indexCtrl.value.detailExplain = showExplainCtrl.value.explain; //表示中の解説を解説編集にセット
        }

        /**
         * 終了ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function finish(){
            //解説モーダル表示の時
            if($scope.indexCtrl.value.flag.showExplain){
                $scope.indexCtrl.value.flag.showExplain = false; //解説モーダル非表示
            //解説プレビュー表示の時
            }else{
                $scope.indexCtrl.value.flag.previewExplain = false; //解説プレビュー非表示
            }
        }

        /**
         * プレビュー完了メソッド
         * @return {[type]} [description]
         */
        function clickPreviewComp(){
            $scope.indexCtrl.value.flag.previewExplain = false; //解説プレビュー非表示
            $scope.indexCtrl.value.flag.detailExplain = true; //解説編集画面の表示
        }

        /**
         * 削除クリックメソッド
         * @return {[type]} [description]
         */
        function clickDelete(){
            $scope.indexCtrl.value.showExplain = showExplainCtrl.value.explain; //表示中の解説を表示解説にセット
            $scope.indexCtrl.value.flag.showExplain = false; //解説モーダル非表示
        }
    }
}());


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(32);
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
		module.hot.accept("!!../../node_modules/css-loader/index.js!./showExplain.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./showExplain.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".explain-modal-header-icon{\n    float:right;\n    margin-right:25px;\n    margin-top:-3px;\n}\n\n.explain-modal-header-icon i{\n    padding-left: .3em;\n    cursor: pointer;\n}\n\n.common-explain-content{\n    margin-left: 20px;\n    margin-right: 20px;\n    height:auto;\n    min-height: 400px;\n    max-height: 400px;\n    overflow: auto;\n}\n", ""]);

// exports


/***/ })
/******/ ]);