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
/******/ 	return __webpack_require__(__webpack_require__.s = 33);
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
/* 17 */,
/* 18 */,
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(38);
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
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var problem = __webpack_require__(34);
var problemForm = __webpack_require__(35);
var problemList = __webpack_require__(39);
var problemPrint = __webpack_require__(40);
var makeProblem = __webpack_require__(41);
var showProblem = __webpack_require__(42);
var shuffleProblem = __webpack_require__(45);


/***/ }),
/* 34 */
/***/ (function(module, exports) {

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

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            $scope.indexCtrl.value.problemList = undefined;
            $scope.indexCtrl.value.flag.problemListLoading = true; //問題リスト読み込み中オン
            $scope.indexCtrl.value.flag.problemList = true; //問題リスト非表示
            $scope.indexCtrl.method.clickNav(2); //画面スタイル設定

            //パラメタが'null'でないときはシャッフル問題
            // if($routeParams.problems !== 'null'){
            //     var problems = JSON.parse(base64url.decode($routeParams.problems)); //パラメタからシャッフル問題を取得
            //     $scope.indexCtrl.value.problemList = problems; //問題リストにセット
            //     $scope.indexCtrl.value.flag.problemListLoading = false; //問題リスト読み込み中オフ
            //     $scope.indexCtrl.value.flag.problemList = true; //問題リスト表示
            // }else{
            // //    /**
            // //     * 問題の取得
            // //     * @type {String} 分野名
            // //     * @type {String} メニュー名
            // //     * @type {String} ユーザID
            // //     */
            // //    ApiService.getProblem($scope.indexCtrl.value.field,$scope.indexCtrl.value.menu,$scope.indexCtrl.value.userId).success(
            // //       function(data) {
            // //           // 通信成功時の処理
            // //          $scope.indexCtrl.value.problemList = data.data; //取得したデータを問題リストにセット
            // //          $scope.indexCtrl.value.flag.problemListLoading = false; //問題リスト読み込み中オフ
            // //          $scope.indexCtrl.value.flag.problemList = true; //問題リスト表示
            // //       }
            // //    );
            // }
        }

        /**
         * 問題のhtml化メソッド
         * @param  {[Array]} item [html化対象の問題]
         * @return {[Array]} item [html化後の問題]
         *
        function problemHtml(item){
            var problem = require('./../module/markChange'); //マークチェンジモジュールの読み込み
            if(item.length !== undefined){
                for(var i=0; i<item.length; i++){
                    item[i].sceProblem = problem.markupChange(item[i].problem);
                    item[i].sceProblem = $sce.trustAsHtml(item[i].sceProblem);
                }
            }else{
                item.sceProblem = problem.markupChange(item.problem);
                item.sceProblem = $sce.trustAsHtml(item.sceProblem);
            }
            return item;
        }*/

       /**
        * 編集完了ボタンクリックメソッド
        * @return {[type]} [description]
        */
       function clickComp(){
            var detailProblem = $scope.indexCtrl.value.detailProblem; //問題の編集内容を退避
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
                   $scope.indexCtrl.value.detailProblem = undefined; //問題の編集内容をリセット
                   init(); //初期化メソッド
               }
           );

       }

       /**
        * 削除ボタンクリックメソッド
        * @return {[type]} [description]
        */
       function deleteProblem(){
           var deleteProblem = $scope.indexCtrl.value.showProblem; //削除対象(表示中)の問題を退避
           /**
            * 問題の削除
            * @type {Object} 削除する問題
            */
           ApiService.deleteProblem(deleteProblem).success(
               function(){
                   $scope.indexCtrl.value.flag.showProblem = false; //問題非表示
                   $scope.indexCtrl.value.showProblem = undefined; //表示中の問題をリセット
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
/* 35 */
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
        __webpack_require__(36);
        __webpack_require__(19);

        init();//初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //$scope.indexCtrl.method.clickNav(2); //画面スタイルセット
            //タブスタイルセット
            problemFormCtrl.value.style.choiceStyle = {background: '#4790BB',color: '#fff'};
            problemFormCtrl.value.style.writeStyle = {background:'#fff',color: '#4790BB'};
            problemFormCtrl.value.style.statementStyle = {background:'#fff',color: '#4790BB'};

            //問題編集のとき
            if($scope.indexCtrl.value.flag.detailProblem){
                problemFormCtrl.value.problem = $scope.indexCtrl.value.detailProblem; //問題編集内容のセット
                //問題の形式が選択肢式のとき
                if(problemFormCtrl.value.problem.format == '選択肢'){
                    //選択肢をセット
                    problemFormCtrl.value.problem.No1 = $scope.indexCtrl.value.detailProblem.choiceNo[0];
                    problemFormCtrl.value.problem.No2 = $scope.indexCtrl.value.detailProblem.choiceNo[1];
                    problemFormCtrl.value.problem.No3 = $scope.indexCtrl.value.detailProblem.choiceNo[2];
                    problemFormCtrl.value.problem.No4 = $scope.indexCtrl.value.detailProblem.choiceNo[3];
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
                var problem = __webpack_require__(3); //マークチェンジモジュールの呼び出し
                problemFormCtrl.value.previewContent = problem.markupChange(problemFormCtrl.value.problem.problem);
                problemFormCtrl.value.previewContent = $sce.trustAsHtml(problemFormCtrl.value.previewContent); //ng-bind-view

                $scope.indexCtrl.value.previewProblem = problemFormCtrl.value.problem; //プレビュー対象の問題をセット
                $scope.indexCtrl.value.previewProblem.sceProblem = problemFormCtrl.value.previewContent; //プレビュー対象の問題の問題文をセット
                $scope.indexCtrl.value.flag.detailProblem = false; //問題編集画面を非表示
                $scope.indexCtrl.value.flag.previewProblem = true; //プレビュー画面の表示
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
                if($scope.indexCtrl.value.flag.detailProblem){
                    $scope.indexCtrl.value.flag.detailProblem = false; //問題編集画面の非表示
                    $scope.indexCtrl.value.detailProblem = problemFormCtrl.value.problem; //編集した問題を問題編集にセット
                }else{
                    //フォーマット情報の追加
                    if(problemFormCtrl.value.flag.choiceFlag){
                        problemFormCtrl.value.problem.format = "選択肢";
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
                    $scope.indexCtrl.value.makeProblem = problemFormCtrl.value.problem; //作成した問題を作成問題にセット
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
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(37);
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
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".common-problemSection{\n    margin-left: 20px;\n    position: relative;\n    padding: 0.5em 1em;\n    border: solid 1.5px #4790BB;\n    width: 95%;\n    margin-top: 40px;\n}\n\n.common-problemNo{\n    position: absolute;\n    display: inline-block;\n    top: -45px;\n    left: -3px;\n    padding: 0 9px;\n    line-height: 25px;\n    font-size: 17px;\n    background: #4790BB;\n    color: #ffffff;\n    border-radius: 5px 5px 0 0;\n}\n\n.common-problem{\n    margin-top: 20px;\n    margin-left: 20px;\n}\n\nol.common-answer{\n   counter-reset:list;\n   list-style-type:none;\n   padding: 1.5em;\n   width: 90%;\n}\nol.common-answer li{\n    position: relative;\n    padding: 7px 5px 7px 40px;\n    margin: 7px 0 10px 30px;\n    font-weight: bold;\n    font-size: 14px;\n    border-bottom: dashed 1px #4790BB;\n    transition: 0.3s;\n}\nol.common-answer li:before{\n    counter-increment: list;\n    content: counter(list);\n    position: absolute;\n    left: 0px;\n    width: 30px;\n    height: 30px;\n    text-align: center;\n    vertical-align: center;\n    line-height: 30px;\n    background: #4790BB;\n    color: #fff;\n    top: 50%;\n    transform: translateY(-50%);\n}\nol.common-answer li:hover{\n    cursor:pointer;\n    filter: alpha(opacity=60);\n    -ms-filter: \"alpha(opacity=60)\";\n    -moz-opacity:0.6;\n    -khtml-opacity: 0.6;\n    opacity:0.6;\n    zoom:1;\n}\n\n/*.common-judge{\n    margin-left: 50px;\n    -webkit-animation: fadeIn 2s ease 0s 1 normal;\n}*/\n\n/*@keyframes fadeIn {\n    0% {opacity: 0}\n    100% {opacity: 1}\n}\n\n@-webkit-keyframes fadeIn {\n    0% {opacity: 0}\n    100% {opacity: 1}\n}\n\n.common-explain {\n    position: relative;\n    padding: 0.5em 1em;\n    border: solid 1.5px #4790BB;\n    border-radius: 5px;\n    margin-left: 50px;\n    margin-bottom: 30px;\n    margin-top: 30px;\n    width:90%;\n    -webkit-animation: fadeIn 2s ease 0s 1 normal;\n}\n\n.common-explain .box-title{\n    position: absolute;\n    display: inline-block;\n    top: -13px;\n    left: 10px;\n    padding: 0 9px;\n    line-height: 1;\n    font-size: 19px;\n    background: #FFF;\n    color: #4790BB;\n    font-weight: bold;\n}\n\n.common-explain p{\n   margin: 10;\n   padding: 0.5em;\n}*/\n\n.common-problemBox {\n    margin: 2em 0;\n    background: #fff;\n    margin-left: 20px;\n    margin-right: 20px;\n}\n.common-problemBox .common-problemBox-title {\n    font-size: 1.2em;\n    background: #4790BB;\n    padding: 4px;\n    text-align: center;\n    color: #FFF;\n    font-weight: bold;\n    letter-spacing: 0.05em;\n}\n\n.common-problemForm,\n.common-answerForm,\n.common-explainForm {\n    position: relative;\n    margin: 2em 0;\n    padding: 25px 10px 7px;\n    border: solid 2px #4790BB;\n    width: 90%;\n    margin-left:30px;\n}\n\n.common-problemForm .common-problem-title,\n.common-answerForm .common-answer-title,\n.common-explainForm .common-explain-title {\n    position: absolute;\n    display: inline-block;\n    top: -2px;\n    left: -2px;\n    padding: 0 9px;\n    height: 25px;\n    line-height: 25px;\n    vertical-align: middle;\n    font-size: 17px;\n    background: #4790BB;\n    color: #ffffff;\n    font-weight: bold;\n}\n\n.common-problemForm textarea,\n.common-explainForm textarea,\n.common-answerForm textarea{\n    margin-left: 10px;\n    margin-top: 10px;\n    width: 95%;\n    font-size: 14px;\n}\n\nol.common-answer-list{\n  counter-reset:list;\n  list-style-type:none;\n  font: 14px/1.6;\n  padding: 0px;\n}\n\nol.common-answer-list li{\n  position:relative;\n  line-height: 30px;\n  margin: 7px 0 7px 40px;\n  padding-left: 10px;\n  font-weight: bold;\n  font-size:14px;\n  cursor: pointer;\n}\n\nol.common-answer-list input{\n   width:100%;\n   font-size: 14px;\n}\n\n\nol.common-answer-list li:before{\n  counter-increment: list;\n  content: counter(list);\n  position: absolute;\n  left: -35px;\n  width: 30px;\n  height: 30px;\n  background: #4790BB;\n  text-align: center;\n  color: #fff;\n  top: 50%;\n  -moz-transform: translateY(-50%);\n  -webkit-transform: translateY(-50%);\n  -o-transform: translateY(-50%);\n  -ms-transform: translateY(-50%);\n  transform: translateY(-50%);\n}\n\n.common-writeAnswer{\n    margin-left: 40px;\n    width: 90%;\n    margin-bottom: 20px;\n}\n\n.common-writeAnswer textarea{\n    font-size: 14px;\n    width: 100%;\n}\n", ""]);

// exports


/***/ }),
/* 39 */
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
            order: ['新しい順', '古い順', '難易度が低い順', '難易度が高い順'], //並び替え
            flag: {
                empty: false //問題空フラグ
            },
            showProblem: [], //1ページに表示する問題
            showProblemPage:[], //ページ数
            currentPage: 1 //現在のページ
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
        __webpack_require__(5);

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            /**
             * 問題の取得
             * @type {String} 分野名
             * @type {String} メニュー名
             * @type {String} ユーザID
             */
            ApiService.getProblem($scope.indexCtrl.value.field,$scope.indexCtrl.value.menu,$scope.indexCtrl.value.userId).success(
               function(data) {
                   // 通信成功時の処理
                  $scope.indexCtrl.value.problemList = data.data; //取得したデータを問題リストにセット
                  $scope.indexCtrl.value.flag.problemListLoading = false; //問題リスト読み込み中オフ
                  //もし問題リストが0件だったら
                  if($scope.indexCtrl.value.problemList.length == 0){
                      problemListCtrl.value.flag.empty = true; //問題が空であることを表示
                  }else{
                      var problems = $scope.indexCtrl.value.problemList; //問題リストの退避
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
            problemListCtrl.value.allProblems = problems; //全ての問題をセット
            problemListCtrl.value.problems = problemListCtrl.value.allProblems; //表示する問題のセット(最初は全ての問題を表示)
            problemListCtrl.value.problems = problemHtml(problemListCtrl.value.problems); //問題文のhtml化
            //自分が作成した問題の抽出
            for(var i = 0; i < problems.length; i++){
                if(problems[i].userId == $scope.indexCtrl.value.userId){
                    problemListCtrl.value.myProblems.push(problems[i]); //自分が作成した問題のセット
                }
            }
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
            var problem = __webpack_require__(3); //マークチェンジモジュールの呼び出し
            //問題がオブジェクト形式じゃないとき(問題プレビューじゃないとき)
            if(item.length !== undefined){
                //問題のhtml化
                for(var i=0; i<item.length; i++){
                    item[i].sceProblem = problem.markupChange(item[i].problem);
                    item[i].sceProblem = $sce.trustAsHtml(item[i].sceProblem);
                }
            }else{
                item.sceProblem = problem.markupChange(item.problem);
                item.sceProblem = $sce.trustAsHtml(item.sceProblem);
            }
            return item;
        }

        /**
         * 問題クリックメソッド
         * @param  {[Array]} problem [クリックした問題]
         * @return {[type]} [description]
         */
         function clickProblem(problem){
             $scope.indexCtrl.value.showProblem = problem; //クリックした問題を表示問題にセット
             $scope.indexCtrl.value.problemList = problemListCtrl.value.problems; //表示中の問題リストを問題リストにセット
             $scope.indexCtrl.value.flag.showProblem = true; //問題モーダル表示
         }

        /**
         * 並び替えクリックメソッド
         * @param  {[String]} value [選択した並び替え]
         * @return {[type]} [description]
         */
        function clickOrder(value){
            //並び替え
            var order = __webpack_require__(4); //並び替えモジュールの呼び出し
            var problmes = JSON.stringify(problemListCtrl.value.problems); //並び替え対象の問題の文字列化
            problemListCtrl.value.problems = JSON.parse(order.order(problmes,value)); //問題の並び替え
            //problemListCtrl.value.problems = problemHtml(problemListCtrl.value.problems); //問題文のhtml化
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
/* 40 */
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

        __webpack_require__(7);
        init();

        function init(){
            $scope.indexCtrl.value.flag.print = true;
            $scope.indexCtrl.method.clickNav(1);
            problemPrintCtrl.value.content = JSON.parse(base64url.decode($routeParams.item));
            problemPrintCtrl.value.title = base64url.decode($routeParams.title);
            var explain = __webpack_require__(3);
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
/* 41 */
/***/ (function(module, exports) {

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
            //inputAnswer: "", //入力された解答
            //previewContent: "", //プレビュー時の問題文
            flag:{
                //choiceFlag: true, //選択式フラグ
                //writeFlag: false, //書き取り式フラグ
                //statementFlag: false, //論述式フラグ
                //correct: false, //正フラグ
                //inCorrect: false, //誤フラグ
                //showExplain: false, //解説表示フラグ(論述式),
                //alert: false,
                submiting: false,
                //choiceAnswer: false, //選択式の正解番号選択フラグ
            },
            //alert: []
        };

        makeProblemCtrl.method = {
            clickMake: clickMake, //問題作成
            goProblem: goProblem //問題ページへ
        };

        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            $scope.indexCtrl.method.clickNav(2);
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

           sendData.items.problem = makeProblemCtrl.value.problem.problem;
           sendData.items.answer = makeProblemCtrl.value.problem.answer;
           sendData.items.explain = makeProblemCtrl.value.problem.explain;
           sendData.items.openRange = makeProblemCtrl.value.problem.openRange;
           sendData.items.evalute = 0;
           if(makeProblemCtrl.value.flag.choiceFlag){
               var noArray = [];
               noArray.push(makeProblemCtrl.value.problem.No1);
               noArray.push(makeProblemCtrl.value.problem.No2);
               noArray.push(makeProblemCtrl.value.problem.No3);
               noArray.push(makeProblemCtrl.value.problem.No4);
               sendData.items.choiceNo = noArray;
               sendData.items.format = '選択肢';
           }else if(makeProblemCtrl.value.flag.writeFlag){
               sendData.items.format = '書き取り';
           }else if(makeProblemCtrl.value.flag.statementFlag){
               sendData.items.format = '論述';
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
/* 42 */
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
            clickDetail:clickDetail //編集クリック
        };

        showProblemCtrl.value = {
            problem: {}, //表示する問題
            problems: [], //全ての問題
            flag: {
                correct: false, //正解
                inCorrect: false, //不正解
                //previewFlag: false, //
                showExplain: false, //解説表示
                sameUser: false //自分が作成した解説
            },
            inputAnswer: "", //入力した解答
            choose: "" //評価

        }
        //スタイルロード
        __webpack_require__(43);
        __webpack_require__(19);
        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //問題編集のプレビュー時
            if($scope.indexCtrl.value.flag.previewProblem){
                showProblemCtrl.value.problem = $scope.indexCtrl.value.previewProblem; //プレビューの問題を表示する問題にセット
                showProblemCtrl.value.problems = showProblemCtrl.value.problem;
            }else{
                showProblemCtrl.value.problems = $scope.indexCtrl.value.problemList; //問題リストを全ての問題にセット
                showProblemCtrl.value.problem = $scope.indexCtrl.value.showProblem; //表示する問題のセット
                //選択肢の配列化
                if(showProblemCtrl.value.problem.format === '選択肢' && !Array.isArray(showProblemCtrl.value.problem.choiceNo)){
                    showProblemCtrl.value.problem.choiceNo = showProblemCtrl.value.problem.choiceNo.split(",");
                }
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
            if(showProblemCtrl.value.choose != ""){
                calcEvalute(showProblemCtrl.value.choose);
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
            if($scope.indexCtrl.value.flag.previewProblem){
                $scope.indexCtrl.value.flag.previewProblem = false;//プレビュー非表示
                $scope.indexCtrl.value.flag.detailProblem = true; //編集表示
            }else{
                $scope.indexCtrl.value.flag.showProblem = false; //問題非表示
            }
            newProblemSetting(); //新しい問題表示の設定メソッド呼び出し
        }

        /**
         * 評価計算
         * @param  {[Number]} value [選択した評価値]
         * @return {[type]} [description]
         */
        function calcEvalute(value){
            showProblemCtrl.value.problem.evalute+= Number(value); //評価計算

            /**
             * 評価の登録
             * @type {Object} 評価された問題
             * @type {String} ユーザID
             * @type {Number} 評価値
             * @type {Boolean} 解説フラグ
             */
            ApiService.postEvalute(showProblemCtrl.value.problem,$scope.indexCtrl.value.userId,value,false);
            /**
             * 問題の更新
             * @type {Object} 更新対象の問題
             */
            ApiService.updateProblem(showProblemCtrl.value.problem);
            showProblemCtrl.value.choose = ""; //評価値の初期化

            //コメントがあった場合
            if(showProblemCtrl.value.comment != ''){
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
           $scope.indexCtrl.value.detailProblem = showProblemCtrl.value.problem; //表示中の問題を編集する問題にセット
           $scope.indexCtrl.value.flag.showProblem = false; //問題非表示
           $scope.indexCtrl.value.flag.detailProblem = true; //問題編集表示
       }

    }
}());


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(44);
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
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".problem-evalute{\n    margin-left: 40px;\n    padding: .5em;\n}\n\n.problem-evalute textarea{\n    width: 95%;\n    margin-left: 10px;\n}\n\n.problem-modal-header-icon{\n    float:right;\n    margin-right:25px;\n    margin-top:-3px;\n}\n\n.problem-modal-header-icon i{\n    padding-left: .3em;\n    cursor: pointer;\n}\n\n.common-writeAnswer{\n    margin-left: 40px;\n    width: 90%;\n    margin-bottom: 20px;\n}\n\n.common-writeAnswer textarea{\n    font-size: 14px;\n    width: 100%;\n}\n\n@keyframes fadeIn {\n    0% {opacity: 0}\n    100% {opacity: 1}\n}\n\n@-webkit-keyframes fadeIn {\n    0% {opacity: 0}\n    100% {opacity: 1}\n}\n\n.common-explain {\n    position: relative;\n    padding: 0.5em 1em;\n    border: solid 1.5px #4790BB;\n    border-radius: 5px;\n    margin-left: 50px;\n    margin-bottom: 30px;\n    margin-top: 30px;\n    width:90%;\n    -webkit-animation: fadeIn 2s ease 0s 1 normal;\n}\n\n.common-explain .box-title{\n    position: absolute;\n    display: inline-block;\n    top: -13px;\n    left: 10px;\n    padding: 0 9px;\n    line-height: 1;\n    font-size: 19px;\n    background: #FFF;\n    color: #4790BB;\n    font-weight: bold;\n}\n\n.common-explain p{\n   margin: 10;\n   padding: 0.5em;\n}\n\n.common-problem{\n    margin-top: 20px;\n    margin-left: 20px;\n}\n\n.common-judge{\n    margin-left: 50px;\n    -webkit-animation: fadeIn 2s ease 0s 1 normal;\n}\n", ""]);

// exports


/***/ }),
/* 45 */
/***/ (function(module, exports) {

(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('shuffleProblemController', shuffleProblemController);

    shuffleProblemController.$inject = ['$scope', '$sce','$routeParams','$http','ApiService','$timeout'];
    function shuffleProblemController($scope,$sce, $routeParams, $http,ApiService,$timeout) {
        var shuffleProblemCtrl = this;

        shuffleProblemCtrl.method = {
            clickParent: clickParent,
            clickChild: clickChild,
            clickStart: clickStart
        };

        shuffleProblemCtrl.value = {
            child: [],
            key:[],　
            choose: {},　
            problems: [],
            problem: {},
            flag:{
                parent: true,
                loading: false
            }
        };

    init()

    function init(){
        $scope.indexCtrl.method.check();
        $scope.indexCtrl.method.clickNav(2);
        var url = '././json/' + $scope.indexCtrl.value.menu + '.json'; //JSONファイルURL指定
        jsonRead(url); //JSONファイル読み込み
    }

    /*JSONファイル読み込み*/
    function jsonRead(url){
        $timeout(function() {
            $http.get(url)
              .success(function(data) {
              shuffleProblemCtrl.value.items = data;
              for(var key in  shuffleProblemCtrl.value.items){
                  shuffleProblemCtrl.value.key.push(key);
              }
             })
            .error(function(err) {
              alert('読み込み失敗');
            });
        });
    }

    /*親分野のチェックボックス操作
    *(全指定or全解除)
    */
    function clickParent(keyName){
        for(var key in shuffleProblemCtrl.value.items){
            if(keyName == key){
                for(var i=0; i<shuffleProblemCtrl.value.items[key].items.length;i++){
                    //親分野フラグを子分野のフラグに上書き(全指定or全解除)
                    shuffleProblemCtrl.value.items[key].items[i].flag = shuffleProblemCtrl.value.items[key].flag;
                }
            }
        }
    }

    /*子分野のチェックボックス操作
    *(親分野フラグtrue(全指定)のときに子分野のチェックが押されたら親分野フラグをfalseにする)
    */
    function clickChild(keyName,item){
        if(!item.flag){
            for(var key in shuffleProblemCtrl.value.items){
                if(keyName == key){
                    shuffleProblemCtrl.value.items[key].flag = false;
                }
            }
        }
    }

    /*出題開始
    *num: 指定した問題数
    */
    function clickStart(num){
        shuffleProblemCtrl.value.flag.loading = true;
        var fields = [];
        for(var key in shuffleProblemCtrl.value.items){
            //親分野のフラグがtrue(全選択)の場合は全部の子分野を対象
            if(shuffleProblemCtrl.value.items[key].flag){
                for(var i=0; i<shuffleProblemCtrl.value.items[key].items.length;i++){
                    fields.push(shuffleProblemCtrl.value.items[key].items[i].name)
                }
            //フラグがtrueの子分野のみ対象
            }else{
                for(var i=0; i<shuffleProblemCtrl.value.items[key].items.length;i++){
                    if(shuffleProblemCtrl.value.items[key].items[i].flag){
                    fields.push(shuffleProblemCtrl.value.items[key].items[i].name)
                    }
                }
            }
        }

        /*シャッフル問題の取得
        *fields: 選択した分野, num: 指定した出題数
        */
        ApiService.getShuffleProblem(fields,$scope.indexCtrl.value.menu,num).success(
           function(data) {
               // 通信成功時の処理
              console.log(data)
              shuffleProblemCtrl.value.flag.loading = false;
              //URLパラメタの生成
              var itemsString = JSON.stringify(data.data);
              var itemsStringBase64 = base64url.encode(itemsString);
              var url = './#/problem/' + itemsStringBase64;
              document.cookie = 'titleUrl[2]=' + url;
              window.location.href = url;
           },
           function(data) {
              console.log("取得失敗")
          }
        );
    }
}
}());


/***/ })
/******/ ]);