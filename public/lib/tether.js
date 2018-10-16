// @license magnet:?xt=urn:btih:d3d9a9a6595521f9666a5e94cc830dab83b65699&dn=expat.txt Expat License
!(function(t, e){
	'function' == typeof define && define.amd ? define(e) : 'object' == typeof exports ? (module.exports = e(require, exports, module)) : (t.Tether = e());
})(this, function(t, e, o){
	'use strict';
	function i(t, e){
		if (!(t instanceof e)) throw new TypeError('Cannot call a class as a function');
	}
	function n(t){
		var e = t.getBoundingClientRect(),
			o = {};
		for (var i in e) o[i] = e[i];
		if (t.ownerDocument !== document) {
			var r = t.ownerDocument.defaultView.frameElement;
			if (r) {
				var s = n(r);
				(o.top += s.top), (o.bottom += s.top), (o.left += s.left), (o.right += s.left);
			}
		}
		return o;
	}
	function r(t){
		var e = getComputedStyle(t) || {},
			o = e.position,
			i = [];
		if ('fixed' === o) return [ t ];
		for (var n = t; (n = n.parentNode) && n && 1 === n.nodeType; ) {
			var r = void 0;
			try {
				r = getComputedStyle(n);
			} catch (s) {}
			if ('undefined' == typeof r || null === r) return i.push(n), i;
			var a = r,
				f = a.overflow,
				l = a.overflowX,
				h = a.overflowY;
			/(auto|scroll)/.test(f + h + l) && ('absolute' !== o || [ 'relative', 'absolute', 'fixed' ].indexOf(r.position) >= 0) && i.push(n);
		}
		return i.push(t.ownerDocument.body), t.ownerDocument !== document && i.push(t.ownerDocument.defaultView), i;
	}
	function s(){
		A && document.body.removeChild(A), (A = null);
	}
	function a(t){
		var e = void 0;
		t === document ? ((e = document), (t = document.documentElement)) : (e = t.ownerDocument);
		var o = e.documentElement,
			i = n(t),
			r = P();
		return (
			(i.top -= r.top),
			(i.left -= r.left),
			'undefined' == typeof i.width && (i.width = document.body.scrollWidth - i.left - i.right),
			'undefined' == typeof i.height && (i.height = document.body.scrollHeight - i.top - i.bottom),
			(i.top = i.top - o.clientTop),
			(i.left = i.left - o.clientLeft),
			(i.right = e.body.clientWidth - i.width - i.left),
			(i.bottom = e.body.clientHeight - i.height - i.top),
			i
		);
	}
	function f(t){
		return t.offsetParent || document.documentElement;
	}
	function l(){
		if (M) return M;
		var t = document.createElement('div');
		(t.style.width = '100%'), (t.style.height = '200px');
		var e = document.createElement('div');
		h(e.style, {position: 'absolute', top: 0, left: 0, pointerEvents: 'none', visibility: 'hidden', width: '200px', height: '150px', overflow: 'hidden'}),
			e.appendChild(t),
			document.body.appendChild(e);
		var o = t.offsetWidth;
		e.style.overflow = 'scroll';
		var i = t.offsetWidth;
		o === i && (i = e.clientWidth), document.body.removeChild(e);
		var n = o - i;
		return (M = {width: n, height: n});
	}
	function h(){
		var t = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0],
			e = [];
		return (
			Array.prototype.push.apply(e, arguments),
			e.slice(1).forEach(function(e){
				if (e) for (var o in e) ({}.hasOwnProperty.call(e, o) && (t[o] = e[o]));
			}),
			t
		);
	}
	function d(t, e){
		if ('undefined' != typeof t.classList)
			e.split(' ').forEach(function(e){
				e.trim() && t.classList.remove(e);
			});
		else {
			var o = new RegExp('(^| )' + e.split(' ').join('|') + '( |$)', 'gi'),
				i = c(t).replace(o, ' ');
			g(t, i);
		}
	}
	function p(t, e){
		if ('undefined' != typeof t.classList)
			e.split(' ').forEach(function(e){
				e.trim() && t.classList.add(e);
			});
		else {
			d(t, e);
			var o = c(t) + (' ' + e);
			g(t, o);
		}
	}
	function u(t, e){
		if ('undefined' != typeof t.classList) return t.classList.contains(e);
		var o = c(t);
		return new RegExp('(^| )' + e + '( |$)', 'gi').test(o);
	}
	function c(t){
		return t.className instanceof t.ownerDocument.defaultView.SVGAnimatedString ? t.className.baseVal : t.className;
	}
	function g(t, e){
		t.setAttribute('class', e);
	}
	function m(t, e, o){
		o.forEach(function(o){
			e.indexOf(o) === -1 && u(t, o) && d(t, o);
		}),
			e.forEach(function(e){
				u(t, e) || p(t, e);
			});
	}
	function i(t, e){
		if (!(t instanceof e)) throw new TypeError('Cannot call a class as a function');
	}
	function v(t, e){
		if ('function' != typeof e && null !== e) throw new TypeError('Super expression must either be null or a function, not ' + typeof e);
		(t.prototype = Object.create(e && e.prototype, {constructor: {value: t, enumerable: !1, writable: !0, configurable: !0}})),
			e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : (t.__proto__ = e));
	}
	function y(t, e){
		var o = arguments.length <= 2 || void 0 === arguments[2] ? 1 : arguments[2];
		return t + o >= e && e >= t - o;
	}
	function b(){
		return 'undefined' != typeof performance && 'undefined' != typeof performance.now ? performance.now() : +new Date();
	}
	function w(){
		for (var t = {top: 0, left: 0}, e = arguments.length, o = Array(e), i = 0; i < e; i++) o[i] = arguments[i];
		return (
			o.forEach(function(e){
				var o = e.top,
					i = e.left;
				'string' == typeof o && (o = parseFloat(o, 10)), 'string' == typeof i && (i = parseFloat(i, 10)), (t.top += o), (t.left += i);
			}),
			t
		);
	}
	function C(t, e){
		return (
			'string' == typeof t.left && t.left.indexOf('%') !== -1 && (t.left = parseFloat(t.left, 10) / 100 * e.width),
			'string' == typeof t.top && t.top.indexOf('%') !== -1 && (t.top = parseFloat(t.top, 10) / 100 * e.height),
			t
		);
	}
	function O(t, e){
		return (
			'scrollParent' === e
				? (e = t.scrollParents[0])
				: 'window' === e && (e = [ pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset ]),
			e === document && (e = e.documentElement),
			'undefined' != typeof e.nodeType &&
				!(function(){
					var t = e,
						o = a(e),
						i = o,
						n = getComputedStyle(e);
					if (((e = [ i.left, i.top, o.width + i.left, o.height + i.top ]), t.ownerDocument !== document)) {
						var r = t.ownerDocument.defaultView;
						(e[0] += r.pageXOffset), (e[1] += r.pageYOffset), (e[2] += r.pageXOffset), (e[3] += r.pageYOffset);
					}
					G.forEach(function(t, o){
						(t = t[0].toUpperCase() + t.substr(1)),
							'Top' === t || 'Left' === t ? (e[o] += parseFloat(n['border' + t + 'Width'])) : (e[o] -= parseFloat(n['border' + t + 'Width']));
					});
				})(),
			e
		);
	}
	var E = (function(){
			function t(t, e){
				for (var o = 0; o < e.length; o++) {
					var i = e[o];
					(i.enumerable = i.enumerable || !1), (i.configurable = !0), 'value' in i && (i.writable = !0), Object.defineProperty(t, i.key, i);
				}
			}
			return function(e, o, i){
				return o && t(e.prototype, o), i && t(e, i), e;
			};
		})(),
		x = void 0;
	'undefined' == typeof x && (x = {modules: []});
	var A = null,
		T = (function(){
			var t = 0;
			return function(){
				return ++t;
			};
		})(),
		S = {},
		P = function(){
			var t = A;
			(t && document.body.contains(t)) ||
				((t = document.createElement('div')),
				t.setAttribute('data-tether-id', T()),
				h(t.style, {top: 0, left: 0, position: 'absolute'}),
				document.body.appendChild(t),
				(A = t));
			var e = t.getAttribute('data-tether-id');
			return (
				'undefined' == typeof S[e] &&
					((S[e] = n(t)),
					k(function(){
						delete S[e];
					})),
				S[e]
			);
		},
		M = null,
		W = [],
		k = function(t){
			W.push(t);
		},
		_ = function(){
			for (var t = void 0; (t = W.pop()); ) t();
		},
		B = (function(){
			function t(){
				i(this, t);
			}
			return (
				E(t, [
					{
						key: 'on',
						value: function(t, e, o){
							var i = !(arguments.length <= 3 || void 0 === arguments[3]) && arguments[3];
							'undefined' == typeof this.bindings && (this.bindings = {}),
								'undefined' == typeof this.bindings[t] && (this.bindings[t] = []),
								this.bindings[t].push({handler: e, ctx: o, once: i});
						},
					},
					{
						key: 'once',
						value: function(t, e, o){
							this.on(t, e, o, !0);
						},
					},
					{
						key: 'off',
						value: function(t, e){
							if ('undefined' != typeof this.bindings && 'undefined' != typeof this.bindings[t])
								if ('undefined' == typeof e) delete this.bindings[t];
								else for (var o = 0; o < this.bindings[t].length; ) this.bindings[t][o].handler === e ? this.bindings[t].splice(o, 1) : ++o;
						},
					},
					{
						key: 'trigger',
						value: function(t){
							if ('undefined' != typeof this.bindings && this.bindings[t]) {
								for (var e = 0, o = arguments.length, i = Array(o > 1 ? o - 1 : 0), n = 1; n < o; n++) i[n - 1] = arguments[n];
								for (; e < this.bindings[t].length; ) {
									var r = this.bindings[t][e],
										s = r.handler,
										a = r.ctx,
										f = r.once,
										l = a;
									'undefined' == typeof l && (l = this), s.apply(l, i), f ? this.bindings[t].splice(e, 1) : ++e;
								}
							}
						},
					},
				]),
				t
			);
		})();
	x.Utils = {
		getActualBoundingClientRect: n,
		getScrollParents: r,
		getBounds: a,
		getOffsetParent: f,
		extend: h,
		addClass: p,
		removeClass: d,
		hasClass: u,
		updateClasses: m,
		defer: k,
		flush: _,
		uniqueId: T,
		Evented: B,
		getScrollBarSize: l,
		removeUtilElements: s,
	};
	var z = (function(){
			function t(t, e){
				var o = [],
					i = !0,
					n = !1,
					r = void 0;
				try {
					for (var s, a = t[Symbol.iterator](); !(i = (s = a.next()).done) && (o.push(s.value), !e || o.length !== e); i = !0);
				} catch (f) {
					(n = !0), (r = f);
				} finally {
					try {
						!i && a['return'] && a['return']();
					} finally {
						if (n) throw r;
					}
				}
				return o;
			}
			return function(e, o){
				if (Array.isArray(e)) return e;
				if (Symbol.iterator in Object(e)) return t(e, o);
				throw new TypeError('Invalid attempt to destructure non-iterable instance');
			};
		})(),
		E = (function(){
			function t(t, e){
				for (var o = 0; o < e.length; o++) {
					var i = e[o];
					(i.enumerable = i.enumerable || !1), (i.configurable = !0), 'value' in i && (i.writable = !0), Object.defineProperty(t, i.key, i);
				}
			}
			return function(e, o, i){
				return o && t(e.prototype, o), i && t(e, i), e;
			};
		})(),
		j = function(t, e, o){
			for (var i = !0; i; ) {
				var n = t,
					r = e,
					s = o;
				(i = !1), null === n && (n = Function.prototype);
				var a = Object.getOwnPropertyDescriptor(n, r);
				if (void 0 !== a) {
					if ('value' in a) return a.value;
					var f = a.get;
					if (void 0 === f) return;
					return f.call(s);
				}
				var l = Object.getPrototypeOf(n);
				if (null === l) return;
				(t = l), (e = r), (o = s), (i = !0), (a = l = void 0);
			}
		};
	if ('undefined' == typeof x) throw new Error('You must include the utils.js file before tether.js');
	var Y = x.Utils,
		r = Y.getScrollParents,
		a = Y.getBounds,
		f = Y.getOffsetParent,
		h = Y.extend,
		p = Y.addClass,
		d = Y.removeClass,
		m = Y.updateClasses,
		k = Y.defer,
		_ = Y.flush,
		l = Y.getScrollBarSize,
		s = Y.removeUtilElements,
		L = (function(){
			if ('undefined' == typeof document) return '';
			for (
				var t = document.createElement('div'), e = [ 'transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform' ], o = 0;
				o < e.length;
				++o
			) {
				var i = e[o];
				if (void 0 !== t.style[i]) return i;
			}
		})(),
		D = [],
		X = function(){
			D.forEach(function(t){
				t.position(!1);
			}),
				_();
		};
	!(function(){
		var t = null,
			e = null,
			o = null,
			i = function n(){
				return 'undefined' != typeof e && e > 16
					? ((e = Math.min(e - 16, 250)), void (o = setTimeout(n, 250)))
					: void (('undefined' != typeof t && b() - t < 10) || (null != o && (clearTimeout(o), (o = null)), (t = b()), X(), (e = b() - t)));
			};
		'undefined' != typeof window &&
			'undefined' != typeof window.addEventListener &&
			[ 'resize', 'scroll', 'touchmove' ].forEach(function(t){
				window.addEventListener(t, i);
			});
	})();
	var F = {center: 'center', left: 'right', right: 'left'},
		H = {middle: 'middle', top: 'bottom', bottom: 'top'},
		N = {top: 0, left: 0, middle: '50%', center: '50%', bottom: '100%', right: '100%'},
		U = function(t, e){
			var o = t.left,
				i = t.top;
			return 'auto' === o && (o = F[e.left]), 'auto' === i && (i = H[e.top]), {left: o, top: i};
		},
		V = function(t){
			var e = t.left,
				o = t.top;
			return 'undefined' != typeof N[t.left] && (e = N[t.left]), 'undefined' != typeof N[t.top] && (o = N[t.top]), {left: e, top: o};
		},
		R = function(t){
			var e = t.split(' '),
				o = z(e, 2),
				i = o[0],
				n = o[1];
			return {top: i, left: n};
		},
		q = R,
		I = (function(t){
			function e(t){
				var o = this;
				i(this, e),
					j(Object.getPrototypeOf(e.prototype), 'constructor', this).call(this),
					(this.position = this.position.bind(this)),
					D.push(this),
					(this.history = []),
					this.setOptions(t, !1),
					x.modules.forEach(function(t){
						'undefined' != typeof t.initialize && t.initialize.call(o);
					}),
					this.position();
			}
			return (
				v(e, t),
				E(e, [
					{
						key: 'getClass',
						value: function(){
							var t = arguments.length <= 0 || void 0 === arguments[0] ? '' : arguments[0],
								e = this.options.classes;
							return 'undefined' != typeof e && e[t]
								? this.options.classes[t]
								: this.options.classPrefix ? this.options.classPrefix + '-' + t : t;
						},
					},
					{
						key: 'setOptions',
						value: function(t){
							var e = this,
								o = arguments.length <= 1 || void 0 === arguments[1] || arguments[1],
								i = {offset: '0 0', targetOffset: '0 0', targetAttachment: 'auto auto', classPrefix: 'tether'};
							this.options = h(i, t);
							var n = this.options,
								s = n.element,
								a = n.target,
								f = n.targetModifier;
							if (
								((this.element = s),
								(this.target = a),
								(this.targetModifier = f),
								'viewport' === this.target
									? ((this.target = document.body), (this.targetModifier = 'visible'))
									: 'scroll-handle' === this.target && ((this.target = document.body), (this.targetModifier = 'scroll-handle')),
								[ 'element', 'target' ].forEach(function(t){
									if ('undefined' == typeof e[t]) throw new Error('Tether Error: Both element and target must be defined');
									'undefined' != typeof e[t].jquery ? (e[t] = e[t][0]) : 'string' == typeof e[t] && (e[t] = document.querySelector(e[t]));
								}),
								p(this.element, this.getClass('element')),
								this.options.addTargetClasses !== !1 && p(this.target, this.getClass('target')),
								!this.options.attachment)
							)
								throw new Error('Tether Error: You must provide an attachment');
							(this.targetAttachment = q(this.options.targetAttachment)),
								(this.attachment = q(this.options.attachment)),
								(this.offset = R(this.options.offset)),
								(this.targetOffset = R(this.options.targetOffset)),
								'undefined' != typeof this.scrollParents && this.disable(),
								'scroll-handle' === this.targetModifier ? (this.scrollParents = [ this.target ]) : (this.scrollParents = r(this.target)),
								this.options.enabled !== !1 && this.enable(o);
						},
					},
					{
						key: 'getTargetBounds',
						value: function(){
							if ('undefined' == typeof this.targetModifier) return a(this.target);
							if ('visible' === this.targetModifier) {
								if (this.target === document.body) return {top: pageYOffset, left: pageXOffset, height: innerHeight, width: innerWidth};
								var t = a(this.target),
									e = {height: t.height, width: t.width, top: t.top, left: t.left};
								return (
									(e.height = Math.min(e.height, t.height - (pageYOffset - t.top))),
									(e.height = Math.min(e.height, t.height - (t.top + t.height - (pageYOffset + innerHeight)))),
									(e.height = Math.min(innerHeight, e.height)),
									(e.height -= 2),
									(e.width = Math.min(e.width, t.width - (pageXOffset - t.left))),
									(e.width = Math.min(e.width, t.width - (t.left + t.width - (pageXOffset + innerWidth)))),
									(e.width = Math.min(innerWidth, e.width)),
									(e.width -= 2),
									e.top < pageYOffset && (e.top = pageYOffset),
									e.left < pageXOffset && (e.left = pageXOffset),
									e
								);
							}
							if ('scroll-handle' === this.targetModifier) {
								var t = void 0,
									o = this.target;
								o === document.body
									? ((o = document.documentElement), (t = {left: pageXOffset, top: pageYOffset, height: innerHeight, width: innerWidth}))
									: (t = a(o));
								var i = getComputedStyle(o),
									n = o.scrollWidth > o.clientWidth || [ i.overflow, i.overflowX ].indexOf('scroll') >= 0 || this.target !== document.body,
									r = 0;
								n && (r = 15);
								var s = t.height - parseFloat(i.borderTopWidth) - parseFloat(i.borderBottomWidth) - r,
									e = {width: 15, height: 0.975 * s * (s / o.scrollHeight), left: t.left + t.width - parseFloat(i.borderLeftWidth) - 15},
									f = 0;
								s < 408 && this.target === document.body && (f = -11e-5 * Math.pow(s, 2) - 0.00727 * s + 22.58),
									this.target !== document.body && (e.height = Math.max(e.height, 24));
								var l = this.target.scrollTop / (o.scrollHeight - s);
								return (
									(e.top = l * (s - e.height - f) + t.top + parseFloat(i.borderTopWidth)),
									this.target === document.body && (e.height = Math.max(e.height, 24)),
									e
								);
							}
						},
					},
					{
						key: 'clearCache',
						value: function(){
							this._cache = {};
						},
					},
					{
						key: 'cache',
						value: function(t, e){
							return (
								'undefined' == typeof this._cache && (this._cache = {}),
								'undefined' == typeof this._cache[t] && (this._cache[t] = e.call(this)),
								this._cache[t]
							);
						},
					},
					{
						key: 'enable',
						value: function(){
							var t = this,
								e = arguments.length <= 0 || void 0 === arguments[0] || arguments[0];
							this.options.addTargetClasses !== !1 && p(this.target, this.getClass('enabled')),
								p(this.element, this.getClass('enabled')),
								(this.enabled = !0),
								this.scrollParents.forEach(function(e){
									e !== t.target.ownerDocument && e.addEventListener('scroll', t.position);
								}),
								e && this.position();
						},
					},
					{
						key: 'disable',
						value: function(){
							var t = this;
							d(this.target, this.getClass('enabled')),
								d(this.element, this.getClass('enabled')),
								(this.enabled = !1),
								'undefined' != typeof this.scrollParents &&
									this.scrollParents.forEach(function(e){
										e.removeEventListener('scroll', t.position);
									});
						},
					},
					{
						key: 'destroy',
						value: function(){
							var t = this;
							this.disable(),
								D.forEach(function(e, o){
									e === t && D.splice(o, 1);
								}),
								0 === D.length && s();
						},
					},
					{
						key: 'updateAttachClasses',
						value: function(t, e){
							var o = this;
							(t = t || this.attachment), (e = e || this.targetAttachment);
							var i = [ 'left', 'top', 'bottom', 'right', 'middle', 'center' ];
							'undefined' != typeof this._addAttachClasses &&
								this._addAttachClasses.length &&
								this._addAttachClasses.splice(0, this._addAttachClasses.length),
								'undefined' == typeof this._addAttachClasses && (this._addAttachClasses = []);
							var n = this._addAttachClasses;
							t.top && n.push(this.getClass('element-attached') + '-' + t.top),
								t.left && n.push(this.getClass('element-attached') + '-' + t.left),
								e.top && n.push(this.getClass('target-attached') + '-' + e.top),
								e.left && n.push(this.getClass('target-attached') + '-' + e.left);
							var r = [];
							i.forEach(function(t){
								r.push(o.getClass('element-attached') + '-' + t), r.push(o.getClass('target-attached') + '-' + t);
							}),
								k(function(){
									'undefined' != typeof o._addAttachClasses &&
										(m(o.element, o._addAttachClasses, r),
										o.options.addTargetClasses !== !1 && m(o.target, o._addAttachClasses, r),
										delete o._addAttachClasses);
								});
						},
					},
					{
						key: 'position',
						value: function(){
							var t = this,
								e = arguments.length <= 0 || void 0 === arguments[0] || arguments[0];
							if (this.enabled) {
								this.clearCache();
								var o = U(this.targetAttachment, this.attachment);
								this.updateAttachClasses(this.attachment, o);
								var i = this.cache('element-bounds', function(){
										return a(t.element);
									}),
									n = i.width,
									r = i.height;
								if (0 === n && 0 === r && 'undefined' != typeof this.lastSize) {
									var s = this.lastSize;
									(n = s.width), (r = s.height);
								} else this.lastSize = {width: n, height: r};
								var h = this.cache('target-bounds', function(){
										return t.getTargetBounds();
									}),
									d = h,
									p = C(V(this.attachment), {width: n, height: r}),
									u = C(V(o), d),
									c = C(this.offset, {width: n, height: r}),
									g = C(this.targetOffset, d);
								(p = w(p, c)), (u = w(u, g));
								for (var m = h.left + u.left - p.left, v = h.top + u.top - p.top, y = 0; y < x.modules.length; ++y) {
									var b = x.modules[y],
										O = b.position.call(this, {
											left: m,
											top: v,
											targetAttachment: o,
											targetPos: h,
											elementPos: i,
											offset: p,
											targetOffset: u,
											manualOffset: c,
											manualTargetOffset: g,
											scrollbarSize: S,
											attachment: this.attachment,
										});
									if (O === !1) return !1;
									'undefined' != typeof O && 'object' == typeof O && ((v = O.top), (m = O.left));
								}
								var E = {
										page: {top: v, left: m},
										viewport: {
											top: v - pageYOffset,
											bottom: pageYOffset - v - r + innerHeight,
											left: m - pageXOffset,
											right: pageXOffset - m - n + innerWidth,
										},
									},
									A = this.target.ownerDocument,
									T = A.defaultView,
									S = void 0;
								return (
									T.innerHeight > A.documentElement.clientHeight && ((S = this.cache('scrollbar-size', l)), (E.viewport.bottom -= S.height)),
									T.innerWidth > A.documentElement.clientWidth && ((S = this.cache('scrollbar-size', l)), (E.viewport.right -= S.width)),
									([ '', 'static' ].indexOf(A.body.style.position) !== -1 &&
										[ '', 'static' ].indexOf(A.body.parentElement.style.position) !== -1) ||
										((E.page.bottom = A.body.scrollHeight - v - r), (E.page.right = A.body.scrollWidth - m - n)),
									'undefined' != typeof this.options.optimizations &&
										this.options.optimizations.moveElement !== !1 &&
										'undefined' == typeof this.targetModifier &&
										!(function(){
											var e = t.cache('target-offsetparent', function(){
													return f(t.target);
												}),
												o = t.cache('target-offsetparent-bounds', function(){
													return a(e);
												}),
												i = getComputedStyle(e),
												n = o,
												r = {};
											if (
												([ 'Top', 'Left', 'Bottom', 'Right' ].forEach(function(t){
													r[t.toLowerCase()] = parseFloat(i['border' + t + 'Width']);
												}),
												(o.right = A.body.scrollWidth - o.left - n.width + r.right),
												(o.bottom = A.body.scrollHeight - o.top - n.height + r.bottom),
												E.page.top >= o.top + r.top &&
													E.page.bottom >= o.bottom &&
													E.page.left >= o.left + r.left &&
													E.page.right >= o.right)
											) {
												var s = e.scrollTop,
													l = e.scrollLeft;
												E.offset = {top: E.page.top - o.top + s - r.top, left: E.page.left - o.left + l - r.left};
											}
										})(),
									this.move(E),
									this.history.unshift(E),
									this.history.length > 3 && this.history.pop(),
									e && _(),
									!0
								);
							}
						},
					},
					{
						key: 'move',
						value: function(t){
							var e = this;
							if ('undefined' != typeof this.element.parentNode) {
								var o = {};
								for (var i in t) {
									o[i] = {};
									for (var n in t[i]) {
										for (var r = !1, s = 0; s < this.history.length; ++s) {
											var a = this.history[s];
											if ('undefined' != typeof a[i] && !y(a[i][n], t[i][n])) {
												r = !0;
												break;
											}
										}
										r || (o[i][n] = !0);
									}
								}
								var l = {top: '', left: '', right: '', bottom: ''},
									d = function(t, o){
										var i = 'undefined' != typeof e.options.optimizations,
											n = i ? e.options.optimizations.gpu : null;
										if (n !== !1) {
											var r = void 0,
												s = void 0;
											if (
												(t.top ? ((l.top = 0), (r = o.top)) : ((l.bottom = 0), (r = -o.bottom)),
												t.left ? ((l.left = 0), (s = o.left)) : ((l.right = 0), (s = -o.right)),
												window.matchMedia)
											) {
												var a =
													window.matchMedia('only screen and (min-resolution: 1.3dppx)').matches ||
													window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3)').matches;
												a || ((s = Math.round(s)), (r = Math.round(r)));
											}
											(l[L] = 'translateX(' + s + 'px) translateY(' + r + 'px)'), 'msTransform' !== L && (l[L] += ' translateZ(0)');
										} else
											t.top ? (l.top = o.top + 'px') : (l.bottom = o.bottom + 'px'),
												t.left ? (l.left = o.left + 'px') : (l.right = o.right + 'px');
									},
									p = !1;
								if (
									((o.page.top || o.page.bottom) && (o.page.left || o.page.right)
										? ((l.position = 'absolute'), d(o.page, t.page))
										: (o.viewport.top || o.viewport.bottom) && (o.viewport.left || o.viewport.right)
											? ((l.position = 'fixed'), d(o.viewport, t.viewport))
											: 'undefined' != typeof o.offset && o.offset.top && o.offset.left
												? !(function(){
														l.position = 'absolute';
														var i = e.cache('target-offsetparent', function(){
															return f(e.target);
														});
														f(e.element) !== i &&
															k(function(){
																e.element.parentNode.removeChild(e.element), i.appendChild(e.element);
															}),
															d(o.offset, t.offset),
															(p = !0);
													})()
												: ((l.position = 'absolute'), d({top: !0, left: !0}, t.page)),
									!p)
								)
									if (this.options.bodyElement) this.options.bodyElement.appendChild(this.element);
									else {
										for (var u = !0, c = this.element.parentNode; c && 1 === c.nodeType && 'BODY' !== c.tagName; ) {
											if ('static' !== getComputedStyle(c).position) {
												u = !1;
												break;
											}
											c = c.parentNode;
										}
										u || (this.element.parentNode.removeChild(this.element), this.element.ownerDocument.body.appendChild(this.element));
									}
								var g = {},
									m = !1;
								for (var n in l) {
									var v = l[n],
										b = this.element.style[n];
									b !== v && ((m = !0), (g[n] = v));
								}
								m &&
									k(function(){
										h(e.element.style, g), e.trigger('repositioned');
									});
							}
						},
					},
				]),
				e
			);
		})(B);
	(I.modules = []), (x.position = X);
	var $ = h(I, x),
		z = (function(){
			function t(t, e){
				var o = [],
					i = !0,
					n = !1,
					r = void 0;
				try {
					for (var s, a = t[Symbol.iterator](); !(i = (s = a.next()).done) && (o.push(s.value), !e || o.length !== e); i = !0);
				} catch (f) {
					(n = !0), (r = f);
				} finally {
					try {
						!i && a['return'] && a['return']();
					} finally {
						if (n) throw r;
					}
				}
				return o;
			}
			return function(e, o){
				if (Array.isArray(e)) return e;
				if (Symbol.iterator in Object(e)) return t(e, o);
				throw new TypeError('Invalid attempt to destructure non-iterable instance');
			};
		})(),
		Y = x.Utils,
		a = Y.getBounds,
		h = Y.extend,
		m = Y.updateClasses,
		k = Y.defer,
		G = [ 'left', 'top', 'right', 'bottom' ];
	x.modules.push({
		position: function(t){
			var e = this,
				o = t.top,
				i = t.left,
				n = t.targetAttachment;
			if (!this.options.constraints) return !0;
			var r = this.cache('element-bounds', function(){
					return a(e.element);
				}),
				s = r.height,
				f = r.width;
			if (0 === f && 0 === s && 'undefined' != typeof this.lastSize) {
				var l = this.lastSize;
				(f = l.width), (s = l.height);
			}
			var d = this.cache('target-bounds', function(){
					return e.getTargetBounds();
				}),
				p = d.height,
				u = d.width,
				c = [ this.getClass('pinned'), this.getClass('out-of-bounds') ];
			this.options.constraints.forEach(function(t){
				var e = t.outOfBoundsClass,
					o = t.pinnedClass;
				e && c.push(e), o && c.push(o);
			}),
				c.forEach(function(t){
					[ 'left', 'top', 'right', 'bottom' ].forEach(function(e){
						c.push(t + '-' + e);
					});
				});
			var g = [],
				v = h({}, n),
				y = h({}, this.attachment);
			return (
				this.options.constraints.forEach(function(t){
					var r = t.to,
						a = t.attachment,
						l = t.pin;
					'undefined' == typeof a && (a = '');
					var h = void 0,
						d = void 0;
					if (a.indexOf(' ') >= 0) {
						var c = a.split(' '),
							m = z(c, 2);
						(d = m[0]), (h = m[1]);
					} else h = d = a;
					var b = O(e, r);
					('target' !== d && 'both' !== d) ||
						(o < b[1] && 'top' === v.top && ((o += p), (v.top = 'bottom')), o + s > b[3] && 'bottom' === v.top && ((o -= p), (v.top = 'top'))),
						'together' === d &&
							('top' === v.top &&
								('bottom' === y.top && o < b[1]
									? ((o += p), (v.top = 'bottom'), (o += s), (y.top = 'top'))
									: 'top' === y.top && o + s > b[3] && o - (s - p) >= b[1] && ((o -= s - p), (v.top = 'bottom'), (y.top = 'bottom'))),
							'bottom' === v.top &&
								('top' === y.top && o + s > b[3]
									? ((o -= p), (v.top = 'top'), (o -= s), (y.top = 'bottom'))
									: 'bottom' === y.top && o < b[1] && o + (2 * s - p) <= b[3] && ((o += s - p), (v.top = 'top'), (y.top = 'top'))),
							'middle' === v.top &&
								(o + s > b[3] && 'top' === y.top
									? ((o -= s), (y.top = 'bottom'))
									: o < b[1] && 'bottom' === y.top && ((o += s), (y.top = 'top')))),
						('target' !== h && 'both' !== h) ||
							(i < b[0] && 'left' === v.left && ((i += u), (v.left = 'right')),
							i + f > b[2] && 'right' === v.left && ((i -= u), (v.left = 'left'))),
						'together' === h &&
							(i < b[0] && 'left' === v.left
								? 'right' === y.left
									? ((i += u), (v.left = 'right'), (i += f), (y.left = 'left'))
									: 'left' === y.left && ((i += u), (v.left = 'right'), (i -= f), (y.left = 'right'))
								: i + f > b[2] && 'right' === v.left
									? 'left' === y.left
										? ((i -= u), (v.left = 'left'), (i -= f), (y.left = 'right'))
										: 'right' === y.left && ((i -= u), (v.left = 'left'), (i += f), (y.left = 'left'))
									: 'center' === v.left &&
										(i + f > b[2] && 'left' === y.left
											? ((i -= f), (y.left = 'right'))
											: i < b[0] && 'right' === y.left && ((i += f), (y.left = 'left')))),
						('element' !== d && 'both' !== d) ||
							(o < b[1] && 'bottom' === y.top && ((o += s), (y.top = 'top')), o + s > b[3] && 'top' === y.top && ((o -= s), (y.top = 'bottom'))),
						('element' !== h && 'both' !== h) ||
							(i < b[0] && ('right' === y.left ? ((i += f), (y.left = 'left')) : 'center' === y.left && ((i += f / 2), (y.left = 'left'))),
							i + f > b[2] && ('left' === y.left ? ((i -= f), (y.left = 'right')) : 'center' === y.left && ((i -= f / 2), (y.left = 'right')))),
						'string' == typeof l
							? (l = l.split(',').map(function(t){
									return t.trim();
								}))
							: l === !0 && (l = [ 'top', 'left', 'right', 'bottom' ]),
						(l = l || []);
					var w = [],
						C = [];
					o < b[1] && (l.indexOf('top') >= 0 ? ((o = b[1]), w.push('top')) : C.push('top')),
						o + s > b[3] && (l.indexOf('bottom') >= 0 ? ((o = b[3] - s), w.push('bottom')) : C.push('bottom')),
						i < b[0] && (l.indexOf('left') >= 0 ? ((i = b[0]), w.push('left')) : C.push('left')),
						i + f > b[2] && (l.indexOf('right') >= 0 ? ((i = b[2] - f), w.push('right')) : C.push('right')),
						w.length &&
							!(function(){
								var t = void 0;
								(t = 'undefined' != typeof e.options.pinnedClass ? e.options.pinnedClass : e.getClass('pinned')),
									g.push(t),
									w.forEach(function(e){
										g.push(t + '-' + e);
									});
							})(),
						C.length &&
							!(function(){
								var t = void 0;
								(t = 'undefined' != typeof e.options.outOfBoundsClass ? e.options.outOfBoundsClass : e.getClass('out-of-bounds')),
									g.push(t),
									C.forEach(function(e){
										g.push(t + '-' + e);
									});
							})(),
						(w.indexOf('left') >= 0 || w.indexOf('right') >= 0) && (y.left = v.left = !1),
						(w.indexOf('top') >= 0 || w.indexOf('bottom') >= 0) && (y.top = v.top = !1),
						(v.top === n.top && v.left === n.left && y.top === e.attachment.top && y.left === e.attachment.left) ||
							(e.updateAttachClasses(y, v), e.trigger('update', {attachment: y, targetAttachment: v}));
				}),
				k(function(){
					e.options.addTargetClasses !== !1 && m(e.target, g, c), m(e.element, g, c);
				}),
				{top: o, left: i}
			);
		},
	});
	var Y = x.Utils,
		a = Y.getBounds,
		m = Y.updateClasses,
		k = Y.defer;
	x.modules.push({
		position: function(t){
			var e = this,
				o = t.top,
				i = t.left,
				n = this.cache('element-bounds', function(){
					return a(e.element);
				}),
				r = n.height,
				s = n.width,
				f = this.getTargetBounds(),
				l = o + r,
				h = i + s,
				d = [];
			o <= f.bottom &&
				l >= f.top &&
				[ 'left', 'right' ].forEach(function(t){
					var e = f[t];
					(e !== i && e !== h) || d.push(t);
				}),
				i <= f.right &&
					h >= f.left &&
					[ 'top', 'bottom' ].forEach(function(t){
						var e = f[t];
						(e !== o && e !== l) || d.push(t);
					});
			var p = [],
				u = [],
				c = [ 'left', 'top', 'right', 'bottom' ];
			return (
				p.push(this.getClass('abutted')),
				c.forEach(function(t){
					p.push(e.getClass('abutted') + '-' + t);
				}),
				d.length && u.push(this.getClass('abutted')),
				d.forEach(function(t){
					u.push(e.getClass('abutted') + '-' + t);
				}),
				k(function(){
					e.options.addTargetClasses !== !1 && m(e.target, u, p), m(e.element, u, p);
				}),
				!0
			);
		},
	});
	var z = (function(){
		function t(t, e){
			var o = [],
				i = !0,
				n = !1,
				r = void 0;
			try {
				for (var s, a = t[Symbol.iterator](); !(i = (s = a.next()).done) && (o.push(s.value), !e || o.length !== e); i = !0);
			} catch (f) {
				(n = !0), (r = f);
			} finally {
				try {
					!i && a['return'] && a['return']();
				} finally {
					if (n) throw r;
				}
			}
			return o;
		}
		return function(e, o){
			if (Array.isArray(e)) return e;
			if (Symbol.iterator in Object(e)) return t(e, o);
			throw new TypeError('Invalid attempt to destructure non-iterable instance');
		};
	})();
	return (
		x.modules.push({
			position: function(t){
				var e = t.top,
					o = t.left;
				if (this.options.shift) {
					var i = this.options.shift;
					'function' == typeof this.options.shift && (i = this.options.shift.call(this, {top: e, left: o}));
					var n = void 0,
						r = void 0;
					if ('string' == typeof i) {
						(i = i.split(' ')), (i[1] = i[1] || i[0]);
						var s = i,
							a = z(s, 2);
						(n = a[0]), (r = a[1]), (n = parseFloat(n, 10)), (r = parseFloat(r, 10));
					} else (n = i.top), (r = i.left);
					return (e += n), (o += r), {top: e, left: o};
				}
			},
		}),
		$
	);
});

// @license-end