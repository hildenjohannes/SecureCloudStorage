"use strict";
// This object will hold all exports.
var Haste = {};
if(typeof window === 'undefined') window = global;

/* Constructor functions for small ADTs. */
function T0(t){this._=t;}
function T1(t,a){this._=t;this.a=a;}
function T2(t,a,b){this._=t;this.a=a;this.b=b;}
function T3(t,a,b,c){this._=t;this.a=a;this.b=b;this.c=c;}
function T4(t,a,b,c,d){this._=t;this.a=a;this.b=b;this.c=c;this.d=d;}
function T5(t,a,b,c,d,e){this._=t;this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;}
function T6(t,a,b,c,d,e,f){this._=t;this.a=a;this.b=b;this.c=c;this.d=d;this.e=e;this.f=f;}

/* Thunk
   Creates a thunk representing the given closure.
   If the non-updatable flag is undefined, the thunk is updatable.
*/
function T(f, nu) {
    this.f = f;
    if(nu === undefined) {
        this.x = __updatable;
    }
}

/* Hint to optimizer that an imported symbol is strict. */
function __strict(x) {return x}

// A tailcall.
function F(f) {
    this.f = f;
}

// A partially applied function. Invariant: members are never thunks.
function PAP(f, args) {
    this.f = f;
    this.args = args;
    this.arity = f.length - args.length;
}

// "Zero" object; used to avoid creating a whole bunch of new objects
// in the extremely common case of a nil-like data constructor.
var __Z = new T0(0);

// Special object used for blackholing.
var __blackhole = {};

// Used to indicate that an object is updatable.
var __updatable = {};

// Indicates that a closure-creating tail loop isn't done.
var __continue = {};

/* Generic apply.
   Applies a function *or* a partial application object to a list of arguments.
   See https://ghc.haskell.org/trac/ghc/wiki/Commentary/Rts/HaskellExecution/FunctionCalls
   for more information.
*/
function A(f, args) {
    while(true) {
        f = E(f);
        if(f instanceof Function) {
            if(args.length === f.length) {
                return f.apply(null, args);
            } else if(args.length < f.length) {
                return new PAP(f, args);
            } else {
                var f2 = f.apply(null, args.slice(0, f.length));
                args = args.slice(f.length);
                f = B(f2);
            }
        } else if(f instanceof PAP) {
            if(args.length === f.arity) {
                return f.f.apply(null, f.args.concat(args));
            } else if(args.length < f.arity) {
                return new PAP(f.f, f.args.concat(args));
            } else {
                var f2 = f.f.apply(null, f.args.concat(args.slice(0, f.arity)));
                args = args.slice(f.arity);
                f = B(f2);
            }
        } else {
            return f;
        }
    }
}

function A1(f, x) {
    f = E(f);
    if(f instanceof Function) {
        return f.length === 1 ? f(x) : new PAP(f, [x]);
    } else if(f instanceof PAP) {
        return f.arity === 1 ? f.f.apply(null, f.args.concat([x]))
                             : new PAP(f.f, f.args.concat([x]));
    } else {
        return f;
    }
}

function A2(f, x, y) {
    f = E(f);
    if(f instanceof Function) {
        switch(f.length) {
        case 2:  return f(x, y);
        case 1:  return A1(B(f(x)), y);
        default: return new PAP(f, [x,y]);
        }
    } else if(f instanceof PAP) {
        switch(f.arity) {
        case 2:  return f.f.apply(null, f.args.concat([x,y]));
        case 1:  return A1(B(f.f.apply(null, f.args.concat([x]))), y);
        default: return new PAP(f.f, f.args.concat([x,y]));
        }
    } else {
        return f;
    }
}

function A3(f, x, y, z) {
    f = E(f);
    if(f instanceof Function) {
        switch(f.length) {
        case 3:  return f(x, y, z);
        case 2:  return A1(B(f(x, y)), z);
        case 1:  return A2(B(f(x)), y, z);
        default: return new PAP(f, [x,y,z]);
        }
    } else if(f instanceof PAP) {
        switch(f.arity) {
        case 3:  return f.f.apply(null, f.args.concat([x,y,z]));
        case 2:  return A1(B(f.f.apply(null, f.args.concat([x,y]))), z);
        case 1:  return A2(B(f.f.apply(null, f.args.concat([x]))), y, z);
        default: return new PAP(f.f, f.args.concat([x,y,z]));
        }
    } else {
        return f;
    }
}

/* Eval
   Evaluate the given thunk t into head normal form.
   If the "thunk" we get isn't actually a thunk, just return it.
*/
function E(t) {
    if(t instanceof T) {
        if(t.f !== __blackhole) {
            if(t.x === __updatable) {
                var f = t.f;
                t.f = __blackhole;
                t.x = f();
            } else {
                return t.f();
            }
        }
        if(t.x === __updatable) {
            throw 'Infinite loop!';
        } else {
            return t.x;
        }
    } else {
        return t;
    }
}

/* Tail call chain counter. */
var C = 0, Cs = [];

/* Bounce
   Bounce on a trampoline for as long as we get a function back.
*/
function B(f) {
    Cs.push(C);
    while(f instanceof F) {
        var fun = f.f;
        f.f = __blackhole;
        C = 0;
        f = fun();
    }
    C = Cs.pop();
    return f;
}

// Export Haste, A, B and E. Haste because we need to preserve exports, A, B
// and E because they're handy for Haste.Foreign.
if(!window) {
    var window = {};
}
window['Haste'] = Haste;
window['A'] = A;
window['E'] = E;
window['B'] = B;


/* Throw an error.
   We need to be able to use throw as an exception so we wrap it in a function.
*/
function die(err) {
    throw E(err);
}

function quot(a, b) {
    return (a-a%b)/b;
}

function quotRemI(a, b) {
    return {_:0, a:(a-a%b)/b, b:a%b};
}

// 32 bit integer multiplication, with correct overflow behavior
// note that |0 or >>>0 needs to be applied to the result, for int and word
// respectively.
if(Math.imul) {
    var imul = Math.imul;
} else {
    var imul = function(a, b) {
        // ignore high a * high a as the result will always be truncated
        var lows = (a & 0xffff) * (b & 0xffff); // low a * low b
        var aB = (a & 0xffff) * (b & 0xffff0000); // low a * high b
        var bA = (a & 0xffff0000) * (b & 0xffff); // low b * high a
        return lows + aB + bA; // sum will not exceed 52 bits, so it's safe
    }
}

function addC(a, b) {
    var x = a+b;
    return {_:0, a:x & 0xffffffff, b:x > 0x7fffffff};
}

function subC(a, b) {
    var x = a-b;
    return {_:0, a:x & 0xffffffff, b:x < -2147483648};
}

function sinh (arg) {
    return (Math.exp(arg) - Math.exp(-arg)) / 2;
}

function tanh (arg) {
    return (Math.exp(arg) - Math.exp(-arg)) / (Math.exp(arg) + Math.exp(-arg));
}

function cosh (arg) {
    return (Math.exp(arg) + Math.exp(-arg)) / 2;
}

function isFloatFinite(x) {
    return isFinite(x);
}

function isDoubleFinite(x) {
    return isFinite(x);
}

function err(str) {
    die(toJSStr(str));
}

/* unpackCString#
   NOTE: update constructor tags if the code generator starts munging them.
*/
function unCStr(str) {return unAppCStr(str, __Z);}

function unFoldrCStr(str, f, z) {
    var acc = z;
    for(var i = str.length-1; i >= 0; --i) {
        acc = B(A(f, [str.charCodeAt(i), acc]));
    }
    return acc;
}

function unAppCStr(str, chrs) {
    var i = arguments[2] ? arguments[2] : 0;
    if(i >= str.length) {
        return E(chrs);
    } else {
        return {_:1,a:str.charCodeAt(i),b:new T(function() {
            return unAppCStr(str,chrs,i+1);
        })};
    }
}

function charCodeAt(str, i) {return str.charCodeAt(i);}

function fromJSStr(str) {
    return unCStr(E(str));
}

function toJSStr(hsstr) {
    var s = '';
    for(var str = E(hsstr); str._ == 1; str = E(str.b)) {
        s += String.fromCharCode(E(str.a));
    }
    return s;
}

// newMutVar
function nMV(val) {
    return ({x: val});
}

// readMutVar
function rMV(mv) {
    return mv.x;
}

// writeMutVar
function wMV(mv, val) {
    mv.x = val;
}

// atomicModifyMutVar
function mMV(mv, f) {
    var x = B(A(f, [mv.x]));
    mv.x = x.a;
    return x.b;
}

function localeEncoding() {
    var le = newByteArr(5);
    le['v']['i8'][0] = 'U'.charCodeAt(0);
    le['v']['i8'][1] = 'T'.charCodeAt(0);
    le['v']['i8'][2] = 'F'.charCodeAt(0);
    le['v']['i8'][3] = '-'.charCodeAt(0);
    le['v']['i8'][4] = '8'.charCodeAt(0);
    return le;
}

var isDoubleNaN = isNaN;
var isFloatNaN = isNaN;

function isDoubleInfinite(d) {
    return (d === Infinity);
}
var isFloatInfinite = isDoubleInfinite;

function isDoubleNegativeZero(x) {
    return (x===0 && (1/x)===-Infinity);
}
var isFloatNegativeZero = isDoubleNegativeZero;

function strEq(a, b) {
    return a == b;
}

function strOrd(a, b) {
    if(a < b) {
        return 0;
    } else if(a == b) {
        return 1;
    }
    return 2;
}

/* Convert a JS exception into a Haskell JSException */
function __hsException(e) {
  e = e.toString();
  var x = new Long(2904464383, 3929545892, true);
  var y = new Long(3027541338, 3270546716, true);
  var t = new T5(0, x, y
                  , new T5(0, x, y
                            , unCStr("haste-prim")
                            , unCStr("Haste.Prim.Foreign")
                            , unCStr("JSException")), __Z, __Z);
  var show = function(x) {return unCStr(E(x).a);}
  var dispEx = function(x) {return unCStr("JavaScript exception: " + E(x).a);}
  var showList = function(_, s) {return unAppCStr(e, s);}
  var showsPrec = function(_, _p, s) {return unAppCStr(e, s);}
  var showDict = new T3(0, showsPrec, show, showList);
  var self;
  var fromEx = function(_) {return new T1(1, self);}
  var dict = new T5(0, t, showDict, null /* toException */, fromEx, dispEx);
  self = new T2(0, dict, new T1(0, e));
  return self;
}

function jsCatch(act, handler) {
    try {
        return B(A(act,[0]));
    } catch(e) {
        if(typeof e._ === 'undefined') {
            e = __hsException(e);
        }
        return B(A(handler,[e, 0]));
    }
}

/* Haste represents constructors internally using 1 for the first constructor,
   2 for the second, etc.
   However, dataToTag should use 0, 1, 2, etc. Also, booleans might be unboxed.
 */
function dataToTag(x) {
    if(x instanceof Object) {
        return x._;
    } else {
        return x;
    }
}

function __word_encodeDouble(d, e) {
    return d * Math.pow(2,e);
}

var __word_encodeFloat = __word_encodeDouble;
var jsRound = Math.round, rintDouble = jsRound, rintFloat = jsRound;
var jsTrunc = Math.trunc ? Math.trunc : function(x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
};
function jsRoundW(n) {
    return Math.abs(jsTrunc(n));
}
var realWorld = undefined;
if(typeof _ == 'undefined') {
    var _ = undefined;
}

function popCnt64(i) {
    return popCnt(i.low) + popCnt(i.high);
}

function popCnt(i) {
    i = i - ((i >> 1) & 0x55555555);
    i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
    return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

function __clz(bits, x) {
    x &= (Math.pow(2, bits)-1);
    if(x === 0) {
        return bits;
    } else {
        return bits - (1 + Math.floor(Math.log(x)/Math.LN2));
    }
}

// TODO: can probably be done much faster with arithmetic tricks like __clz
function __ctz(bits, x) {
    var y = 1;
    x &= (Math.pow(2, bits)-1);
    if(x === 0) {
        return bits;
    }
    for(var i = 0; i < bits; ++i) {
        if(y & x) {
            return i;
        } else {
            y <<= 1;
        }
    }
    return 0;
}

// Scratch space for byte arrays.
var rts_scratchBuf = new ArrayBuffer(8);
var rts_scratchW32 = new Uint32Array(rts_scratchBuf);
var rts_scratchFloat = new Float32Array(rts_scratchBuf);
var rts_scratchDouble = new Float64Array(rts_scratchBuf);

function decodeFloat(x) {
    if(x === 0) {
        return __decodedZeroF;
    }
    rts_scratchFloat[0] = x;
    var sign = x < 0 ? -1 : 1;
    var exp = ((rts_scratchW32[0] >> 23) & 0xff) - 150;
    var man = rts_scratchW32[0] & 0x7fffff;
    if(exp === 0) {
        ++exp;
    } else {
        man |= (1 << 23);
    }
    return {_:0, a:sign*man, b:exp};
}

var __decodedZero = {_:0,a:1,b:0,c:0,d:0};
var __decodedZeroF = {_:0,a:1,b:0};

function decodeDouble(x) {
    if(x === 0) {
        // GHC 7.10+ *really* doesn't like 0 to be represented as anything
        // but zeroes all the way.
        return __decodedZero;
    }
    rts_scratchDouble[0] = x;
    var sign = x < 0 ? -1 : 1;
    var manHigh = rts_scratchW32[1] & 0xfffff;
    var manLow = rts_scratchW32[0];
    var exp = ((rts_scratchW32[1] >> 20) & 0x7ff) - 1075;
    if(exp === 0) {
        ++exp;
    } else {
        manHigh |= (1 << 20);
    }
    return {_:0, a:sign, b:manHigh, c:manLow, d:exp};
}

function isNull(obj) {
    return obj === null;
}

function jsRead(str) {
    return Number(str);
}

function jsShowI(val) {return val.toString();}
function jsShow(val) {
    var ret = val.toString();
    return val == Math.round(val) ? ret + '.0' : ret;
}

window['jsGetMouseCoords'] = function jsGetMouseCoords(e) {
    var posx = 0;
    var posy = 0;
    if (!e) var e = window.event;
    if (e.pageX || e.pageY) 	{
	posx = e.pageX;
	posy = e.pageY;
    }
    else if (e.clientX || e.clientY) 	{
	posx = e.clientX + document.body.scrollLeft
	    + document.documentElement.scrollLeft;
	posy = e.clientY + document.body.scrollTop
	    + document.documentElement.scrollTop;
    }
    return [posx - (e.currentTarget.offsetLeft || 0),
	    posy - (e.currentTarget.offsetTop || 0)];
}

var jsRand = Math.random;

// Concatenate a Haskell list of JS strings
function jsCat(strs, sep) {
    var arr = [];
    strs = E(strs);
    while(strs._) {
        strs = E(strs);
        arr.push(E(strs.a));
        strs = E(strs.b);
    }
    return arr.join(sep);
}

// Parse a JSON message into a Haste.JSON.JSON value.
// As this pokes around inside Haskell values, it'll need to be updated if:
// * Haste.JSON.JSON changes;
// * E() starts to choke on non-thunks;
// * data constructor code generation changes; or
// * Just and Nothing change tags.
function jsParseJSON(str) {
    try {
        var js = JSON.parse(str);
        var hs = toHS(js);
    } catch(_) {
        return __Z;
    }
    return {_:1,a:hs};
}

function toHS(obj) {
    switch(typeof obj) {
    case 'number':
        return {_:0, a:jsRead(obj)};
    case 'string':
        return {_:1, a:obj};
    case 'boolean':
        return {_:2, a:obj}; // Booleans are special wrt constructor tags!
    case 'object':
        if(obj instanceof Array) {
            return {_:3, a:arr2lst_json(obj, 0)};
        } else if (obj == null) {
            return {_:5};
        } else {
            // Object type but not array - it's a dictionary.
            // The RFC doesn't say anything about the ordering of keys, but
            // considering that lots of people rely on keys being "in order" as
            // defined by "the same way someone put them in at the other end,"
            // it's probably a good idea to put some cycles into meeting their
            // misguided expectations.
            var ks = [];
            for(var k in obj) {
                ks.unshift(k);
            }
            var xs = [0];
            for(var i = 0; i < ks.length; i++) {
                xs = {_:1, a:{_:0, a:ks[i], b:toHS(obj[ks[i]])}, b:xs};
            }
            return {_:4, a:xs};
        }
    }
}

function arr2lst_json(arr, elem) {
    if(elem >= arr.length) {
        return __Z;
    }
    return {_:1, a:toHS(arr[elem]), b:new T(function() {return arr2lst_json(arr,elem+1);}),c:true}
}

/* gettimeofday(2) */
function gettimeofday(tv, _tz) {
    var t = new Date().getTime();
    writeOffAddr("i32", 4, tv, 0, (t/1000)|0);
    writeOffAddr("i32", 4, tv, 1, ((t%1000)*1000)|0);
    return 0;
}

// Create a little endian ArrayBuffer representation of something.
function toABHost(v, n, x) {
    var a = new ArrayBuffer(n);
    new window[v](a)[0] = x;
    return a;
}

function toABSwap(v, n, x) {
    var a = new ArrayBuffer(n);
    new window[v](a)[0] = x;
    var bs = new Uint8Array(a);
    for(var i = 0, j = n-1; i < j; ++i, --j) {
        var tmp = bs[i];
        bs[i] = bs[j];
        bs[j] = tmp;
    }
    return a;
}

window['toABle'] = toABHost;
window['toABbe'] = toABSwap;

// Swap byte order if host is not little endian.
var buffer = new ArrayBuffer(2);
new DataView(buffer).setInt16(0, 256, true);
if(new Int16Array(buffer)[0] !== 256) {
    window['toABle'] = toABSwap;
    window['toABbe'] = toABHost;
}

/* bn.js by Fedor Indutny, see doc/LICENSE.bn for license */
var __bn = {};
(function (module, exports) {
'use strict';

function BN(number, base, endian) {
  // May be `new BN(bn)` ?
  if (number !== null &&
      typeof number === 'object' &&
      Array.isArray(number.words)) {
    return number;
  }

  this.negative = 0;
  this.words = null;
  this.length = 0;

  if (base === 'le' || base === 'be') {
    endian = base;
    base = 10;
  }

  if (number !== null)
    this._init(number || 0, base || 10, endian || 'be');
}
if (typeof module === 'object')
  module.exports = BN;
else
  exports.BN = BN;

BN.BN = BN;
BN.wordSize = 26;

BN.max = function max(left, right) {
  if (left.cmp(right) > 0)
    return left;
  else
    return right;
};

BN.min = function min(left, right) {
  if (left.cmp(right) < 0)
    return left;
  else
    return right;
};

BN.prototype._init = function init(number, base, endian) {
  if (typeof number === 'number') {
    return this._initNumber(number, base, endian);
  } else if (typeof number === 'object') {
    return this._initArray(number, base, endian);
  }
  if (base === 'hex')
    base = 16;

  number = number.toString().replace(/\s+/g, '');
  var start = 0;
  if (number[0] === '-')
    start++;

  if (base === 16)
    this._parseHex(number, start);
  else
    this._parseBase(number, base, start);

  if (number[0] === '-')
    this.negative = 1;

  this.strip();

  if (endian !== 'le')
    return;

  this._initArray(this.toArray(), base, endian);
};

BN.prototype._initNumber = function _initNumber(number, base, endian) {
  if (number < 0) {
    this.negative = 1;
    number = -number;
  }
  if (number < 0x4000000) {
    this.words = [ number & 0x3ffffff ];
    this.length = 1;
  } else if (number < 0x10000000000000) {
    this.words = [
      number & 0x3ffffff,
      (number / 0x4000000) & 0x3ffffff
    ];
    this.length = 2;
  } else {
    this.words = [
      number & 0x3ffffff,
      (number / 0x4000000) & 0x3ffffff,
      1
    ];
    this.length = 3;
  }

  if (endian !== 'le')
    return;

  // Reverse the bytes
  this._initArray(this.toArray(), base, endian);
};

BN.prototype._initArray = function _initArray(number, base, endian) {
  if (number.length <= 0) {
    this.words = [ 0 ];
    this.length = 1;
    return this;
  }

  this.length = Math.ceil(number.length / 3);
  this.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    this.words[i] = 0;

  var off = 0;
  if (endian === 'be') {
    for (var i = number.length - 1, j = 0; i >= 0; i -= 3) {
      var w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
  } else if (endian === 'le') {
    for (var i = 0, j = 0; i < number.length; i += 3) {
      var w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
  }
  return this.strip();
};

function parseHex(str, start, end) {
  var r = 0;
  var len = Math.min(str.length, end);
  for (var i = start; i < len; i++) {
    var c = str.charCodeAt(i) - 48;

    r <<= 4;

    // 'a' - 'f'
    if (c >= 49 && c <= 54)
      r |= c - 49 + 0xa;

    // 'A' - 'F'
    else if (c >= 17 && c <= 22)
      r |= c - 17 + 0xa;

    // '0' - '9'
    else
      r |= c & 0xf;
  }
  return r;
}

BN.prototype._parseHex = function _parseHex(number, start) {
  // Create possibly bigger array to ensure that it fits the number
  this.length = Math.ceil((number.length - start) / 6);
  this.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    this.words[i] = 0;

  // Scan 24-bit chunks and add them to the number
  var off = 0;
  for (var i = number.length - 6, j = 0; i >= start; i -= 6) {
    var w = parseHex(number, i, i + 6);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
    off += 24;
    if (off >= 26) {
      off -= 26;
      j++;
    }
  }
  if (i + 6 !== start) {
    var w = parseHex(number, start, i + 6);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
  }
  this.strip();
};

function parseBase(str, start, end, mul) {
  var r = 0;
  var len = Math.min(str.length, end);
  for (var i = start; i < len; i++) {
    var c = str.charCodeAt(i) - 48;

    r *= mul;

    // 'a'
    if (c >= 49)
      r += c - 49 + 0xa;

    // 'A'
    else if (c >= 17)
      r += c - 17 + 0xa;

    // '0' - '9'
    else
      r += c;
  }
  return r;
}

BN.prototype._parseBase = function _parseBase(number, base, start) {
  // Initialize as zero
  this.words = [ 0 ];
  this.length = 1;

  // Find length of limb in base
  for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base)
    limbLen++;
  limbLen--;
  limbPow = (limbPow / base) | 0;

  var total = number.length - start;
  var mod = total % limbLen;
  var end = Math.min(total, total - mod) + start;

  var word = 0;
  for (var i = start; i < end; i += limbLen) {
    word = parseBase(number, i, i + limbLen, base);

    this.imuln(limbPow);
    if (this.words[0] + word < 0x4000000)
      this.words[0] += word;
    else
      this._iaddn(word);
  }

  if (mod !== 0) {
    var pow = 1;
    var word = parseBase(number, i, number.length, base);

    for (var i = 0; i < mod; i++)
      pow *= base;
    this.imuln(pow);
    if (this.words[0] + word < 0x4000000)
      this.words[0] += word;
    else
      this._iaddn(word);
  }
};

BN.prototype.copy = function copy(dest) {
  dest.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    dest.words[i] = this.words[i];
  dest.length = this.length;
  dest.negative = this.negative;
};

BN.prototype.clone = function clone() {
  var r = new BN(null);
  this.copy(r);
  return r;
};

// Remove leading `0` from `this`
BN.prototype.strip = function strip() {
  while (this.length > 1 && this.words[this.length - 1] === 0)
    this.length--;
  return this._normSign();
};

BN.prototype._normSign = function _normSign() {
  // -0 = 0
  if (this.length === 1 && this.words[0] === 0)
    this.negative = 0;
  return this;
};

var zeros = [
  '',
  '0',
  '00',
  '000',
  '0000',
  '00000',
  '000000',
  '0000000',
  '00000000',
  '000000000',
  '0000000000',
  '00000000000',
  '000000000000',
  '0000000000000',
  '00000000000000',
  '000000000000000',
  '0000000000000000',
  '00000000000000000',
  '000000000000000000',
  '0000000000000000000',
  '00000000000000000000',
  '000000000000000000000',
  '0000000000000000000000',
  '00000000000000000000000',
  '000000000000000000000000',
  '0000000000000000000000000'
];

var groupSizes = [
  0, 0,
  25, 16, 12, 11, 10, 9, 8,
  8, 7, 7, 7, 7, 6, 6,
  6, 6, 6, 6, 6, 5, 5,
  5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5
];

var groupBases = [
  0, 0,
  33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
  43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
  16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
  6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
  24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
];

BN.prototype.toString = function toString(base, padding) {
  base = base || 10;
  var padding = padding | 0 || 1;
  if (base === 16 || base === 'hex') {
    var out = '';
    var off = 0;
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var w = this.words[i];
      var word = (((w << off) | carry) & 0xffffff).toString(16);
      carry = (w >>> (24 - off)) & 0xffffff;
      if (carry !== 0 || i !== this.length - 1)
        out = zeros[6 - word.length] + word + out;
      else
        out = word + out;
      off += 2;
      if (off >= 26) {
        off -= 26;
        i--;
      }
    }
    if (carry !== 0)
      out = carry.toString(16) + out;
    while (out.length % padding !== 0)
      out = '0' + out;
    if (this.negative !== 0)
      out = '-' + out;
    return out;
  } else if (base === (base | 0) && base >= 2 && base <= 36) {
    var groupSize = groupSizes[base];
    var groupBase = groupBases[base];
    var out = '';
    var c = this.clone();
    c.negative = 0;
    while (c.cmpn(0) !== 0) {
      var r = c.modn(groupBase).toString(base);
      c = c.idivn(groupBase);

      if (c.cmpn(0) !== 0)
        out = zeros[groupSize - r.length] + r + out;
      else
        out = r + out;
    }
    if (this.cmpn(0) === 0)
      out = '0' + out;
    while (out.length % padding !== 0)
      out = '0' + out;
    if (this.negative !== 0)
      out = '-' + out;
    return out;
  } else {
    throw 'Base should be between 2 and 36';
  }
};

BN.prototype.toJSON = function toJSON() {
  return this.toString(16);
};

BN.prototype.toArray = function toArray(endian, length) {
  this.strip();
  var littleEndian = endian === 'le';
  var res = new Array(this.byteLength());
  res[0] = 0;

  var q = this.clone();
  if (!littleEndian) {
    // Assume big-endian
    for (var i = 0; q.cmpn(0) !== 0; i++) {
      var b = q.andln(0xff);
      q.iushrn(8);

      res[res.length - i - 1] = b;
    }
  } else {
    for (var i = 0; q.cmpn(0) !== 0; i++) {
      var b = q.andln(0xff);
      q.iushrn(8);

      res[i] = b;
    }
  }

  if (length) {
    while (res.length < length) {
      if (littleEndian)
        res.push(0);
      else
        res.unshift(0);
    }
  }

  return res;
};

if (Math.clz32) {
  BN.prototype._countBits = function _countBits(w) {
    return 32 - Math.clz32(w);
  };
} else {
  BN.prototype._countBits = function _countBits(w) {
    var t = w;
    var r = 0;
    if (t >= 0x1000) {
      r += 13;
      t >>>= 13;
    }
    if (t >= 0x40) {
      r += 7;
      t >>>= 7;
    }
    if (t >= 0x8) {
      r += 4;
      t >>>= 4;
    }
    if (t >= 0x02) {
      r += 2;
      t >>>= 2;
    }
    return r + t;
  };
}

// Return number of used bits in a BN
BN.prototype.bitLength = function bitLength() {
  var hi = 0;
  var w = this.words[this.length - 1];
  var hi = this._countBits(w);
  return (this.length - 1) * 26 + hi;
};

BN.prototype.byteLength = function byteLength() {
  return Math.ceil(this.bitLength() / 8);
};

// Return negative clone of `this`
BN.prototype.neg = function neg() {
  if (this.cmpn(0) === 0)
    return this.clone();

  var r = this.clone();
  r.negative = this.negative ^ 1;
  return r;
};

BN.prototype.ineg = function ineg() {
  this.negative ^= 1;
  return this;
};

// Or `num` with `this` in-place
BN.prototype.iuor = function iuor(num) {
  while (this.length < num.length)
    this.words[this.length++] = 0;

  for (var i = 0; i < num.length; i++)
    this.words[i] = this.words[i] | num.words[i];

  return this.strip();
};

BN.prototype.ior = function ior(num) {
  //assert((this.negative | num.negative) === 0);
  return this.iuor(num);
};


// Or `num` with `this`
BN.prototype.or = function or(num) {
  if (this.length > num.length)
    return this.clone().ior(num);
  else
    return num.clone().ior(this);
};

BN.prototype.uor = function uor(num) {
  if (this.length > num.length)
    return this.clone().iuor(num);
  else
    return num.clone().iuor(this);
};


// And `num` with `this` in-place
BN.prototype.iuand = function iuand(num) {
  // b = min-length(num, this)
  var b;
  if (this.length > num.length)
    b = num;
  else
    b = this;

  for (var i = 0; i < b.length; i++)
    this.words[i] = this.words[i] & num.words[i];

  this.length = b.length;

  return this.strip();
};

BN.prototype.iand = function iand(num) {
  //assert((this.negative | num.negative) === 0);
  return this.iuand(num);
};


// And `num` with `this`
BN.prototype.and = function and(num) {
  if (this.length > num.length)
    return this.clone().iand(num);
  else
    return num.clone().iand(this);
};

BN.prototype.uand = function uand(num) {
  if (this.length > num.length)
    return this.clone().iuand(num);
  else
    return num.clone().iuand(this);
};


// Xor `num` with `this` in-place
BN.prototype.iuxor = function iuxor(num) {
  // a.length > b.length
  var a;
  var b;
  if (this.length > num.length) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  for (var i = 0; i < b.length; i++)
    this.words[i] = a.words[i] ^ b.words[i];

  if (this !== a)
    for (; i < a.length; i++)
      this.words[i] = a.words[i];

  this.length = a.length;

  return this.strip();
};

BN.prototype.ixor = function ixor(num) {
  //assert((this.negative | num.negative) === 0);
  return this.iuxor(num);
};


// Xor `num` with `this`
BN.prototype.xor = function xor(num) {
  if (this.length > num.length)
    return this.clone().ixor(num);
  else
    return num.clone().ixor(this);
};

BN.prototype.uxor = function uxor(num) {
  if (this.length > num.length)
    return this.clone().iuxor(num);
  else
    return num.clone().iuxor(this);
};


// Add `num` to `this` in-place
BN.prototype.iadd = function iadd(num) {
  // negative + positive
  if (this.negative !== 0 && num.negative === 0) {
    this.negative = 0;
    var r = this.isub(num);
    this.negative ^= 1;
    return this._normSign();

  // positive + negative
  } else if (this.negative === 0 && num.negative !== 0) {
    num.negative = 0;
    var r = this.isub(num);
    num.negative = 1;
    return r._normSign();
  }

  // a.length > b.length
  var a;
  var b;
  if (this.length > num.length) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  var carry = 0;
  for (var i = 0; i < b.length; i++) {
    var r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }
  for (; carry !== 0 && i < a.length; i++) {
    var r = (a.words[i] | 0) + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }

  this.length = a.length;
  if (carry !== 0) {
    this.words[this.length] = carry;
    this.length++;
  // Copy the rest of the words
  } else if (a !== this) {
    for (; i < a.length; i++)
      this.words[i] = a.words[i];
  }

  return this;
};

// Add `num` to `this`
BN.prototype.add = function add(num) {
  if (num.negative !== 0 && this.negative === 0) {
    num.negative = 0;
    var res = this.sub(num);
    num.negative ^= 1;
    return res;
  } else if (num.negative === 0 && this.negative !== 0) {
    this.negative = 0;
    var res = num.sub(this);
    this.negative = 1;
    return res;
  }

  if (this.length > num.length)
    return this.clone().iadd(num);
  else
    return num.clone().iadd(this);
};

// Subtract `num` from `this` in-place
BN.prototype.isub = function isub(num) {
  // this - (-num) = this + num
  if (num.negative !== 0) {
    num.negative = 0;
    var r = this.iadd(num);
    num.negative = 1;
    return r._normSign();

  // -this - num = -(this + num)
  } else if (this.negative !== 0) {
    this.negative = 0;
    this.iadd(num);
    this.negative = 1;
    return this._normSign();
  }

  // At this point both numbers are positive
  var cmp = this.cmp(num);

  // Optimization - zeroify
  if (cmp === 0) {
    this.negative = 0;
    this.length = 1;
    this.words[0] = 0;
    return this;
  }

  // a > b
  var a;
  var b;
  if (cmp > 0) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  var carry = 0;
  for (var i = 0; i < b.length; i++) {
    var r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
    carry = r >> 26;
    this.words[i] = r & 0x3ffffff;
  }
  for (; carry !== 0 && i < a.length; i++) {
    var r = (a.words[i] | 0) + carry;
    carry = r >> 26;
    this.words[i] = r & 0x3ffffff;
  }

  // Copy rest of the words
  if (carry === 0 && i < a.length && a !== this)
    for (; i < a.length; i++)
      this.words[i] = a.words[i];
  this.length = Math.max(this.length, i);

  if (a !== this)
    this.negative = 1;

  return this.strip();
};

// Subtract `num` from `this`
BN.prototype.sub = function sub(num) {
  return this.clone().isub(num);
};

function smallMulTo(self, num, out) {
  out.negative = num.negative ^ self.negative;
  var len = (self.length + num.length) | 0;
  out.length = len;
  len = (len - 1) | 0;

  // Peel one iteration (compiler can't do it, because of code complexity)
  var a = self.words[0] | 0;
  var b = num.words[0] | 0;
  var r = a * b;

  var lo = r & 0x3ffffff;
  var carry = (r / 0x4000000) | 0;
  out.words[0] = lo;

  for (var k = 1; k < len; k++) {
    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
    // note that ncarry could be >= 0x3ffffff
    var ncarry = carry >>> 26;
    var rword = carry & 0x3ffffff;
    var maxJ = Math.min(k, num.length - 1);
    for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
      var i = (k - j) | 0;
      var a = self.words[i] | 0;
      var b = num.words[j] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
      lo = (lo + rword) | 0;
      rword = lo & 0x3ffffff;
      ncarry = (ncarry + (lo >>> 26)) | 0;
    }
    out.words[k] = rword | 0;
    carry = ncarry | 0;
  }
  if (carry !== 0) {
    out.words[k] = carry | 0;
  } else {
    out.length--;
  }

  return out.strip();
}

function bigMulTo(self, num, out) {
  out.negative = num.negative ^ self.negative;
  out.length = self.length + num.length;

  var carry = 0;
  var hncarry = 0;
  for (var k = 0; k < out.length - 1; k++) {
    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
    // note that ncarry could be >= 0x3ffffff
    var ncarry = hncarry;
    hncarry = 0;
    var rword = carry & 0x3ffffff;
    var maxJ = Math.min(k, num.length - 1);
    for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = self.words[i] | 0;
      var b = num.words[j] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
      lo = (lo + rword) | 0;
      rword = lo & 0x3ffffff;
      ncarry = (ncarry + (lo >>> 26)) | 0;

      hncarry += ncarry >>> 26;
      ncarry &= 0x3ffffff;
    }
    out.words[k] = rword;
    carry = ncarry;
    ncarry = hncarry;
  }
  if (carry !== 0) {
    out.words[k] = carry;
  } else {
    out.length--;
  }

  return out.strip();
}

BN.prototype.mulTo = function mulTo(num, out) {
  var res;
  if (this.length + num.length < 63)
    res = smallMulTo(this, num, out);
  else
    res = bigMulTo(this, num, out);
  return res;
};

// Multiply `this` by `num`
BN.prototype.mul = function mul(num) {
  var out = new BN(null);
  out.words = new Array(this.length + num.length);
  return this.mulTo(num, out);
};

// In-place Multiplication
BN.prototype.imul = function imul(num) {
  if (this.cmpn(0) === 0 || num.cmpn(0) === 0) {
    this.words[0] = 0;
    this.length = 1;
    return this;
  }

  var tlen = this.length;
  var nlen = num.length;

  this.negative = num.negative ^ this.negative;
  this.length = this.length + num.length;
  this.words[this.length - 1] = 0;

  for (var k = this.length - 2; k >= 0; k--) {
    // Sum all words with the same `i + j = k` and accumulate `carry`,
    // note that carry could be >= 0x3ffffff
    var carry = 0;
    var rword = 0;
    var maxJ = Math.min(k, nlen - 1);
    for (var j = Math.max(0, k - tlen + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i] | 0;
      var b = num.words[j] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      carry += (r / 0x4000000) | 0;
      lo += rword;
      rword = lo & 0x3ffffff;
      carry += lo >>> 26;
    }
    this.words[k] = rword;
    this.words[k + 1] += carry;
    carry = 0;
  }

  // Propagate overflows
  var carry = 0;
  for (var i = 1; i < this.length; i++) {
    var w = (this.words[i] | 0) + carry;
    this.words[i] = w & 0x3ffffff;
    carry = w >>> 26;
  }

  return this.strip();
};

BN.prototype.imuln = function imuln(num) {
  // Carry
  var carry = 0;
  for (var i = 0; i < this.length; i++) {
    var w = (this.words[i] | 0) * num;
    var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
    carry >>= 26;
    carry += (w / 0x4000000) | 0;
    // NOTE: lo is 27bit maximum
    carry += lo >>> 26;
    this.words[i] = lo & 0x3ffffff;
  }

  if (carry !== 0) {
    this.words[i] = carry;
    this.length++;
  }

  return this;
};

BN.prototype.muln = function muln(num) {
  return this.clone().imuln(num);
};

// `this` * `this`
BN.prototype.sqr = function sqr() {
  return this.mul(this);
};

// `this` * `this` in-place
BN.prototype.isqr = function isqr() {
  return this.mul(this);
};

// Shift-left in-place
BN.prototype.iushln = function iushln(bits) {
  var r = bits % 26;
  var s = (bits - r) / 26;
  var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);

  if (r !== 0) {
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var newCarry = this.words[i] & carryMask;
      var c = ((this.words[i] | 0) - newCarry) << r;
      this.words[i] = c | carry;
      carry = newCarry >>> (26 - r);
    }
    if (carry) {
      this.words[i] = carry;
      this.length++;
    }
  }

  if (s !== 0) {
    for (var i = this.length - 1; i >= 0; i--)
      this.words[i + s] = this.words[i];
    for (var i = 0; i < s; i++)
      this.words[i] = 0;
    this.length += s;
  }

  return this.strip();
};

BN.prototype.ishln = function ishln(bits) {
  return this.iushln(bits);
};

// Shift-right in-place
BN.prototype.iushrn = function iushrn(bits, hint, extended) {
  var h;
  if (hint)
    h = (hint - (hint % 26)) / 26;
  else
    h = 0;

  var r = bits % 26;
  var s = Math.min((bits - r) / 26, this.length);
  var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
  var maskedWords = extended;

  h -= s;
  h = Math.max(0, h);

  // Extended mode, copy masked part
  if (maskedWords) {
    for (var i = 0; i < s; i++)
      maskedWords.words[i] = this.words[i];
    maskedWords.length = s;
  }

  if (s === 0) {
    // No-op, we should not move anything at all
  } else if (this.length > s) {
    this.length -= s;
    for (var i = 0; i < this.length; i++)
      this.words[i] = this.words[i + s];
  } else {
    this.words[0] = 0;
    this.length = 1;
  }

  var carry = 0;
  for (var i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
    var word = this.words[i] | 0;
    this.words[i] = (carry << (26 - r)) | (word >>> r);
    carry = word & mask;
  }

  // Push carried bits as a mask
  if (maskedWords && carry !== 0)
    maskedWords.words[maskedWords.length++] = carry;

  if (this.length === 0) {
    this.words[0] = 0;
    this.length = 1;
  }

  this.strip();

  return this;
};

BN.prototype.ishrn = function ishrn(bits, hint, extended) {
  return this.iushrn(bits, hint, extended);
};

// Shift-left
BN.prototype.shln = function shln(bits) {
  var x = this.clone();
  var neg = x.negative;
  x.negative = false;
  x.ishln(bits);
  x.negative = neg;
  return x;
};

BN.prototype.ushln = function ushln(bits) {
  return this.clone().iushln(bits);
};

// Shift-right
BN.prototype.shrn = function shrn(bits) {
  var x = this.clone();
  if(x.negative) {
      x.negative = false;
      x.ishrn(bits);
      x.negative = true;
      return x.isubn(1);
  } else {
      return x.ishrn(bits);
  }
};

BN.prototype.ushrn = function ushrn(bits) {
  return this.clone().iushrn(bits);
};

// Test if n bit is set
BN.prototype.testn = function testn(bit) {
  var r = bit % 26;
  var s = (bit - r) / 26;
  var q = 1 << r;

  // Fast case: bit is much higher than all existing words
  if (this.length <= s) {
    return false;
  }

  // Check bit and return
  var w = this.words[s];

  return !!(w & q);
};

// Add plain number `num` to `this`
BN.prototype.iaddn = function iaddn(num) {
  if (num < 0)
    return this.isubn(-num);

  // Possible sign change
  if (this.negative !== 0) {
    if (this.length === 1 && (this.words[0] | 0) < num) {
      this.words[0] = num - (this.words[0] | 0);
      this.negative = 0;
      return this;
    }

    this.negative = 0;
    this.isubn(num);
    this.negative = 1;
    return this;
  }

  // Add without checks
  return this._iaddn(num);
};

BN.prototype._iaddn = function _iaddn(num) {
  this.words[0] += num;

  // Carry
  for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
    this.words[i] -= 0x4000000;
    if (i === this.length - 1)
      this.words[i + 1] = 1;
    else
      this.words[i + 1]++;
  }
  this.length = Math.max(this.length, i + 1);

  return this;
};

// Subtract plain number `num` from `this`
BN.prototype.isubn = function isubn(num) {
  if (num < 0)
    return this.iaddn(-num);

  if (this.negative !== 0) {
    this.negative = 0;
    this.iaddn(num);
    this.negative = 1;
    return this;
  }

  this.words[0] -= num;

  // Carry
  for (var i = 0; i < this.length && this.words[i] < 0; i++) {
    this.words[i] += 0x4000000;
    this.words[i + 1] -= 1;
  }

  return this.strip();
};

BN.prototype.addn = function addn(num) {
  return this.clone().iaddn(num);
};

BN.prototype.subn = function subn(num) {
  return this.clone().isubn(num);
};

BN.prototype.iabs = function iabs() {
  this.negative = 0;

  return this;
};

BN.prototype.abs = function abs() {
  return this.clone().iabs();
};

BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
  // Bigger storage is needed
  var len = num.length + shift;
  var i;
  if (this.words.length < len) {
    var t = new Array(len);
    for (var i = 0; i < this.length; i++)
      t[i] = this.words[i];
    this.words = t;
  } else {
    i = this.length;
  }

  // Zeroify rest
  this.length = Math.max(this.length, len);
  for (; i < this.length; i++)
    this.words[i] = 0;

  var carry = 0;
  for (var i = 0; i < num.length; i++) {
    var w = (this.words[i + shift] | 0) + carry;
    var right = (num.words[i] | 0) * mul;
    w -= right & 0x3ffffff;
    carry = (w >> 26) - ((right / 0x4000000) | 0);
    this.words[i + shift] = w & 0x3ffffff;
  }
  for (; i < this.length - shift; i++) {
    var w = (this.words[i + shift] | 0) + carry;
    carry = w >> 26;
    this.words[i + shift] = w & 0x3ffffff;
  }

  if (carry === 0)
    return this.strip();

  carry = 0;
  for (var i = 0; i < this.length; i++) {
    var w = -(this.words[i] | 0) + carry;
    carry = w >> 26;
    this.words[i] = w & 0x3ffffff;
  }
  this.negative = 1;

  return this.strip();
};

BN.prototype._wordDiv = function _wordDiv(num, mode) {
  var shift = this.length - num.length;

  var a = this.clone();
  var b = num;

  // Normalize
  var bhi = b.words[b.length - 1] | 0;
  var bhiBits = this._countBits(bhi);
  shift = 26 - bhiBits;
  if (shift !== 0) {
    b = b.ushln(shift);
    a.iushln(shift);
    bhi = b.words[b.length - 1] | 0;
  }

  // Initialize quotient
  var m = a.length - b.length;
  var q;

  if (mode !== 'mod') {
    q = new BN(null);
    q.length = m + 1;
    q.words = new Array(q.length);
    for (var i = 0; i < q.length; i++)
      q.words[i] = 0;
  }

  var diff = a.clone()._ishlnsubmul(b, 1, m);
  if (diff.negative === 0) {
    a = diff;
    if (q)
      q.words[m] = 1;
  }

  for (var j = m - 1; j >= 0; j--) {
    var qj = (a.words[b.length + j] | 0) * 0x4000000 +
             (a.words[b.length + j - 1] | 0);

    // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
    // (0x7ffffff)
    qj = Math.min((qj / bhi) | 0, 0x3ffffff);

    a._ishlnsubmul(b, qj, j);
    while (a.negative !== 0) {
      qj--;
      a.negative = 0;
      a._ishlnsubmul(b, 1, j);
      if (a.cmpn(0) !== 0)
        a.negative ^= 1;
    }
    if (q)
      q.words[j] = qj;
  }
  if (q)
    q.strip();
  a.strip();

  // Denormalize
  if (mode !== 'div' && shift !== 0)
    a.iushrn(shift);
  return { div: q ? q : null, mod: a };
};

BN.prototype.divmod = function divmod(num, mode, positive) {
  if (this.negative !== 0 && num.negative === 0) {
    var res = this.neg().divmod(num, mode);
    var div;
    var mod;
    if (mode !== 'mod')
      div = res.div.neg();
    if (mode !== 'div') {
      mod = res.mod.neg();
      if (positive && mod.neg)
        mod = mod.add(num);
    }
    return {
      div: div,
      mod: mod
    };
  } else if (this.negative === 0 && num.negative !== 0) {
    var res = this.divmod(num.neg(), mode);
    var div;
    if (mode !== 'mod')
      div = res.div.neg();
    return { div: div, mod: res.mod };
  } else if ((this.negative & num.negative) !== 0) {
    var res = this.neg().divmod(num.neg(), mode);
    var mod;
    if (mode !== 'div') {
      mod = res.mod.neg();
      if (positive && mod.neg)
        mod = mod.isub(num);
    }
    return {
      div: res.div,
      mod: mod
    };
  }

  // Both numbers are positive at this point

  // Strip both numbers to approximate shift value
  if (num.length > this.length || this.cmp(num) < 0)
    return { div: new BN(0), mod: this };

  // Very short reduction
  if (num.length === 1) {
    if (mode === 'div')
      return { div: this.divn(num.words[0]), mod: null };
    else if (mode === 'mod')
      return { div: null, mod: new BN(this.modn(num.words[0])) };
    return {
      div: this.divn(num.words[0]),
      mod: new BN(this.modn(num.words[0]))
    };
  }

  return this._wordDiv(num, mode);
};

// Find `this` / `num`
BN.prototype.div = function div(num) {
  return this.divmod(num, 'div', false).div;
};

// Find `this` % `num`
BN.prototype.mod = function mod(num) {
  return this.divmod(num, 'mod', false).mod;
};

BN.prototype.umod = function umod(num) {
  return this.divmod(num, 'mod', true).mod;
};

// Find Round(`this` / `num`)
BN.prototype.divRound = function divRound(num) {
  var dm = this.divmod(num);

  // Fast case - exact division
  if (dm.mod.cmpn(0) === 0)
    return dm.div;

  var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

  var half = num.ushrn(1);
  var r2 = num.andln(1);
  var cmp = mod.cmp(half);

  // Round down
  if (cmp < 0 || r2 === 1 && cmp === 0)
    return dm.div;

  // Round up
  return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
};

BN.prototype.modn = function modn(num) {
  var p = (1 << 26) % num;

  var acc = 0;
  for (var i = this.length - 1; i >= 0; i--)
    acc = (p * acc + (this.words[i] | 0)) % num;

  return acc;
};

// In-place division by number
BN.prototype.idivn = function idivn(num) {
  var carry = 0;
  for (var i = this.length - 1; i >= 0; i--) {
    var w = (this.words[i] | 0) + carry * 0x4000000;
    this.words[i] = (w / num) | 0;
    carry = w % num;
  }

  return this.strip();
};

BN.prototype.divn = function divn(num) {
  return this.clone().idivn(num);
};

BN.prototype.isEven = function isEven() {
  return (this.words[0] & 1) === 0;
};

BN.prototype.isOdd = function isOdd() {
  return (this.words[0] & 1) === 1;
};

// And first word and num
BN.prototype.andln = function andln(num) {
  return this.words[0] & num;
};

BN.prototype.cmpn = function cmpn(num) {
  var negative = num < 0;
  if (negative)
    num = -num;

  if (this.negative !== 0 && !negative)
    return -1;
  else if (this.negative === 0 && negative)
    return 1;

  num &= 0x3ffffff;
  this.strip();

  var res;
  if (this.length > 1) {
    res = 1;
  } else {
    var w = this.words[0] | 0;
    res = w === num ? 0 : w < num ? -1 : 1;
  }
  if (this.negative !== 0)
    res = -res;
  return res;
};

// Compare two numbers and return:
// 1 - if `this` > `num`
// 0 - if `this` == `num`
// -1 - if `this` < `num`
BN.prototype.cmp = function cmp(num) {
  if (this.negative !== 0 && num.negative === 0)
    return -1;
  else if (this.negative === 0 && num.negative !== 0)
    return 1;

  var res = this.ucmp(num);
  if (this.negative !== 0)
    return -res;
  else
    return res;
};

// Unsigned comparison
BN.prototype.ucmp = function ucmp(num) {
  // At this point both numbers have the same sign
  if (this.length > num.length)
    return 1;
  else if (this.length < num.length)
    return -1;

  var res = 0;
  for (var i = this.length - 1; i >= 0; i--) {
    var a = this.words[i] | 0;
    var b = num.words[i] | 0;

    if (a === b)
      continue;
    if (a < b)
      res = -1;
    else if (a > b)
      res = 1;
    break;
  }
  return res;
};
})(undefined, __bn);

// MVar implementation.
// Since Haste isn't concurrent, takeMVar and putMVar don't block on empty
// and full MVars respectively, but terminate the program since they would
// otherwise be blocking forever.

function newMVar() {
    return ({empty: true});
}

function tryTakeMVar(mv) {
    if(mv.empty) {
        return {_:0, a:0, b:undefined};
    } else {
        var val = mv.x;
        mv.empty = true;
        mv.x = null;
        return {_:0, a:1, b:val};
    }
}

function takeMVar(mv) {
    if(mv.empty) {
        // TODO: real BlockedOnDeadMVar exception, perhaps?
        err("Attempted to take empty MVar!");
    }
    var val = mv.x;
    mv.empty = true;
    mv.x = null;
    return val;
}

function putMVar(mv, val) {
    if(!mv.empty) {
        // TODO: real BlockedOnDeadMVar exception, perhaps?
        err("Attempted to put full MVar!");
    }
    mv.empty = false;
    mv.x = val;
}

function tryPutMVar(mv, val) {
    if(!mv.empty) {
        return 0;
    } else {
        mv.empty = false;
        mv.x = val;
        return 1;
    }
}

function sameMVar(a, b) {
    return (a == b);
}

function isEmptyMVar(mv) {
    return mv.empty ? 1 : 0;
}

// Implementation of stable names.
// Unlike native GHC, the garbage collector isn't going to move data around
// in a way that we can detect, so each object could serve as its own stable
// name if it weren't for the fact we can't turn a JS reference into an
// integer.
// So instead, each object has a unique integer attached to it, which serves
// as its stable name.

var __next_stable_name = 1;
var __stable_table;

function makeStableName(x) {
    if(x instanceof Object) {
        if(!x.stableName) {
            x.stableName = __next_stable_name;
            __next_stable_name += 1;
        }
        return {type: 'obj', name: x.stableName};
    } else {
        return {type: 'prim', name: Number(x)};
    }
}

function eqStableName(x, y) {
    return (x.type == y.type && x.name == y.name) ? 1 : 0;
}

// TODO: inefficient compared to real fromInt?
__bn.Z = new __bn.BN(0);
__bn.ONE = new __bn.BN(1);
__bn.MOD32 = new __bn.BN(0x100000000); // 2^32
var I_fromNumber = function(x) {return new __bn.BN(x);}
var I_fromInt = I_fromNumber;
var I_fromBits = function(lo,hi) {
    var x = new __bn.BN(lo >>> 0);
    var y = new __bn.BN(hi >>> 0);
    y.ishln(32);
    x.iadd(y);
    return x;
}
var I_fromString = function(s) {return new __bn.BN(s);}
var I_toInt = function(x) {return I_toNumber(x.mod(__bn.MOD32));}
var I_toWord = function(x) {return I_toInt(x) >>> 0;};
// TODO: inefficient!
var I_toNumber = function(x) {return Number(x.toString());}
var I_equals = function(a,b) {return a.cmp(b) === 0;}
var I_compare = function(a,b) {return a.cmp(b);}
var I_compareInt = function(x,i) {return x.cmp(new __bn.BN(i));}
var I_negate = function(x) {return x.neg();}
var I_add = function(a,b) {return a.add(b);}
var I_sub = function(a,b) {return a.sub(b);}
var I_mul = function(a,b) {return a.mul(b);}
var I_mod = function(a,b) {return I_rem(I_add(b, I_rem(a, b)), b);}
var I_quotRem = function(a,b) {
    var qr = a.divmod(b);
    return {_:0, a:qr.div, b:qr.mod};
}
var I_div = function(a,b) {
    if((a.cmp(__bn.Z)>=0) != (a.cmp(__bn.Z)>=0)) {
        if(a.cmp(a.rem(b), __bn.Z) !== 0) {
            return a.div(b).sub(__bn.ONE);
        }
    }
    return a.div(b);
}
var I_divMod = function(a,b) {
    return {_:0, a:I_div(a,b), b:a.mod(b)};
}
var I_quot = function(a,b) {return a.div(b);}
var I_rem = function(a,b) {return a.mod(b);}
var I_and = function(a,b) {return a.and(b);}
var I_or = function(a,b) {return a.or(b);}
var I_xor = function(a,b) {return a.xor(b);}
var I_shiftLeft = function(a,b) {return a.shln(b);}
var I_shiftRight = function(a,b) {return a.shrn(b);}
var I_signum = function(x) {return x.cmp(new __bn.BN(0));}
var I_abs = function(x) {return x.abs();}
var I_decodeDouble = function(x) {
    var dec = decodeDouble(x);
    var mantissa = I_fromBits(dec.c, dec.b);
    if(dec.a < 0) {
        mantissa = I_negate(mantissa);
    }
    return {_:0, a:dec.d, b:mantissa};
}
var I_toString = function(x) {return x.toString();}
var I_fromRat = function(a, b) {
    return I_toNumber(a) / I_toNumber(b);
}

function I_fromInt64(x) {
    if(x.isNegative()) {
        return I_negate(I_fromInt64(x.negate()));
    } else {
        return I_fromBits(x.low, x.high);
    }
}

function I_toInt64(x) {
    if(x.negative) {
        return I_toInt64(I_negate(x)).negate();
    } else {
        return new Long(I_toInt(x), I_toInt(I_shiftRight(x,32)));
    }
}

function I_fromWord64(x) {
    return I_fromBits(x.toInt(), x.shru(32).toInt());
}

function I_toWord64(x) {
    var w = I_toInt64(x);
    w.unsigned = true;
    return w;
}

/**
 * @license long.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/long.js for details
 */
function Long(low, high, unsigned) {
    this.low = low | 0;
    this.high = high | 0;
    this.unsigned = !!unsigned;
}

var INT_CACHE = {};
var UINT_CACHE = {};
function cacheable(x, u) {
    return u ? 0 <= (x >>>= 0) && x < 256 : -128 <= (x |= 0) && x < 128;
}

function __fromInt(value, unsigned) {
    var obj, cachedObj, cache;
    if (unsigned) {
        if (cache = cacheable(value >>>= 0, true)) {
            cachedObj = UINT_CACHE[value];
            if (cachedObj)
                return cachedObj;
        }
        obj = new Long(value, (value | 0) < 0 ? -1 : 0, true);
        if (cache)
            UINT_CACHE[value] = obj;
        return obj;
    } else {
        if (cache = cacheable(value |= 0, false)) {
            cachedObj = INT_CACHE[value];
            if (cachedObj)
                return cachedObj;
        }
        obj = new Long(value, value < 0 ? -1 : 0, false);
        if (cache)
            INT_CACHE[value] = obj;
        return obj;
    }
}

function __fromNumber(value, unsigned) {
    if (isNaN(value) || !isFinite(value))
        return unsigned ? UZERO : ZERO;
    if (unsigned) {
        if (value < 0)
            return UZERO;
        if (value >= TWO_PWR_64_DBL)
            return MAX_UNSIGNED_VALUE;
    } else {
        if (value <= -TWO_PWR_63_DBL)
            return MIN_VALUE;
        if (value + 1 >= TWO_PWR_63_DBL)
            return MAX_VALUE;
    }
    if (value < 0)
        return __fromNumber(-value, unsigned).neg();
    return new Long((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
}
var pow_dbl = Math.pow;
var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_24_DBL = 1 << 24;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
var TWO_PWR_24 = __fromInt(TWO_PWR_24_DBL);
var ZERO = __fromInt(0);
Long.ZERO = ZERO;
var UZERO = __fromInt(0, true);
Long.UZERO = UZERO;
var ONE = __fromInt(1);
Long.ONE = ONE;
var UONE = __fromInt(1, true);
Long.UONE = UONE;
var NEG_ONE = __fromInt(-1);
Long.NEG_ONE = NEG_ONE;
var MAX_VALUE = new Long(0xFFFFFFFF|0, 0x7FFFFFFF|0, false);
Long.MAX_VALUE = MAX_VALUE;
var MAX_UNSIGNED_VALUE = new Long(0xFFFFFFFF|0, 0xFFFFFFFF|0, true);
Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
var MIN_VALUE = new Long(0, 0x80000000|0, false);
Long.MIN_VALUE = MIN_VALUE;
var __lp = Long.prototype;
__lp.toInt = function() {return this.unsigned ? this.low >>> 0 : this.low;};
__lp.toNumber = function() {
    if (this.unsigned)
        return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
    return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
};
__lp.isZero = function() {return this.high === 0 && this.low === 0;};
__lp.isNegative = function() {return !this.unsigned && this.high < 0;};
__lp.isOdd = function() {return (this.low & 1) === 1;};
__lp.eq = function(other) {
    if (this.unsigned !== other.unsigned && (this.high >>> 31) === 1 && (other.high >>> 31) === 1)
        return false;
    return this.high === other.high && this.low === other.low;
};
__lp.neq = function(other) {return !this.eq(other);};
__lp.lt = function(other) {return this.comp(other) < 0;};
__lp.lte = function(other) {return this.comp(other) <= 0;};
__lp.gt = function(other) {return this.comp(other) > 0;};
__lp.gte = function(other) {return this.comp(other) >= 0;};
__lp.compare = function(other) {
    if (this.eq(other))
        return 0;
    var thisNeg = this.isNegative(),
        otherNeg = other.isNegative();
    if (thisNeg && !otherNeg)
        return -1;
    if (!thisNeg && otherNeg)
        return 1;
    if (!this.unsigned)
        return this.sub(other).isNegative() ? -1 : 1;
    return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
};
__lp.comp = __lp.compare;
__lp.negate = function() {
    if (!this.unsigned && this.eq(MIN_VALUE))
        return MIN_VALUE;
    return this.not().add(ONE);
};
__lp.neg = __lp.negate;
__lp.add = function(addend) {
    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;

    var b48 = addend.high >>> 16;
    var b32 = addend.high & 0xFFFF;
    var b16 = addend.low >>> 16;
    var b00 = addend.low & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return new Long((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
};
__lp.subtract = function(subtrahend) {return this.add(subtrahend.neg());};
__lp.sub = __lp.subtract;
__lp.multiply = function(multiplier) {
    if (this.isZero())
        return ZERO;
    if (multiplier.isZero())
        return ZERO;
    if (this.eq(MIN_VALUE))
        return multiplier.isOdd() ? MIN_VALUE : ZERO;
    if (multiplier.eq(MIN_VALUE))
        return this.isOdd() ? MIN_VALUE : ZERO;

    if (this.isNegative()) {
        if (multiplier.isNegative())
            return this.neg().mul(multiplier.neg());
        else
            return this.neg().mul(multiplier).neg();
    } else if (multiplier.isNegative())
        return this.mul(multiplier.neg()).neg();

    if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
        return __fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);

    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;

    var b48 = multiplier.high >>> 16;
    var b32 = multiplier.high & 0xFFFF;
    var b16 = multiplier.low >>> 16;
    var b00 = multiplier.low & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return new Long((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
};
__lp.mul = __lp.multiply;
__lp.divide = function(divisor) {
    if (divisor.isZero())
        throw Error('division by zero');
    if (this.isZero())
        return this.unsigned ? UZERO : ZERO;
    var approx, rem, res;
    if (this.eq(MIN_VALUE)) {
        if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
            return MIN_VALUE;
        else if (divisor.eq(MIN_VALUE))
            return ONE;
        else {
            var halfThis = this.shr(1);
            approx = halfThis.div(divisor).shl(1);
            if (approx.eq(ZERO)) {
                return divisor.isNegative() ? ONE : NEG_ONE;
            } else {
                rem = this.sub(divisor.mul(approx));
                res = approx.add(rem.div(divisor));
                return res;
            }
        }
    } else if (divisor.eq(MIN_VALUE))
        return this.unsigned ? UZERO : ZERO;
    if (this.isNegative()) {
        if (divisor.isNegative())
            return this.neg().div(divisor.neg());
        return this.neg().div(divisor).neg();
    } else if (divisor.isNegative())
        return this.div(divisor.neg()).neg();

    res = ZERO;
    rem = this;
    while (rem.gte(divisor)) {
        approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
        var log2 = Math.ceil(Math.log(approx) / Math.LN2),
            delta = (log2 <= 48) ? 1 : pow_dbl(2, log2 - 48),
            approxRes = __fromNumber(approx),
            approxRem = approxRes.mul(divisor);
        while (approxRem.isNegative() || approxRem.gt(rem)) {
            approx -= delta;
            approxRes = __fromNumber(approx, this.unsigned);
            approxRem = approxRes.mul(divisor);
        }
        if (approxRes.isZero())
            approxRes = ONE;

        res = res.add(approxRes);
        rem = rem.sub(approxRem);
    }
    return res;
};
__lp.div = __lp.divide;
__lp.modulo = function(divisor) {return this.sub(this.div(divisor).mul(divisor));};
__lp.mod = __lp.modulo;
__lp.not = function not() {return new Long(~this.low, ~this.high, this.unsigned);};
__lp.and = function(other) {return new Long(this.low & other.low, this.high & other.high, this.unsigned);};
__lp.or = function(other) {return new Long(this.low | other.low, this.high | other.high, this.unsigned);};
__lp.xor = function(other) {return new Long(this.low ^ other.low, this.high ^ other.high, this.unsigned);};

__lp.shl = function(numBits) {
    if ((numBits &= 63) === 0)
        return this;
    else if (numBits < 32)
        return new Long(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
    else
        return new Long(0, this.low << (numBits - 32), this.unsigned);
};

__lp.shr = function(numBits) {
    if ((numBits &= 63) === 0)
        return this;
    else if (numBits < 32)
        return new Long((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
    else
        return new Long(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
};

__lp.shru = function(numBits) {
    numBits &= 63;
    if (numBits === 0)
        return this;
    else {
        var high = this.high;
        if (numBits < 32) {
            var low = this.low;
            return new Long((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
        } else if (numBits === 32)
            return new Long(high, 0, this.unsigned);
        else
            return new Long(high >>> (numBits - 32), 0, this.unsigned);
    }
};

__lp.toSigned = function() {return this.unsigned ? new Long(this.low, this.high, false) : this;};
__lp.toUnsigned = function() {return this.unsigned ? this : new Long(this.low, this.high, true);};

// Int64
function hs_eqInt64(x, y) {return x.eq(y);}
function hs_neInt64(x, y) {return x.neq(y);}
function hs_ltInt64(x, y) {return x.lt(y);}
function hs_leInt64(x, y) {return x.lte(y);}
function hs_gtInt64(x, y) {return x.gt(y);}
function hs_geInt64(x, y) {return x.gte(y);}
function hs_quotInt64(x, y) {return x.div(y);}
function hs_remInt64(x, y) {return x.modulo(y);}
function hs_plusInt64(x, y) {return x.add(y);}
function hs_minusInt64(x, y) {return x.subtract(y);}
function hs_timesInt64(x, y) {return x.multiply(y);}
function hs_negateInt64(x) {return x.negate();}
function hs_uncheckedIShiftL64(x, bits) {return x.shl(bits);}
function hs_uncheckedIShiftRA64(x, bits) {return x.shr(bits);}
function hs_uncheckedIShiftRL64(x, bits) {return x.shru(bits);}
function hs_int64ToInt(x) {return x.toInt();}
var hs_intToInt64 = __fromInt;

// Word64
function hs_wordToWord64(x) {return __fromInt(x, true);}
function hs_word64ToWord(x) {return x.toInt(x);}
function hs_mkWord64(low, high) {return new Long(low,high,true);}
function hs_and64(a,b) {return a.and(b);};
function hs_or64(a,b) {return a.or(b);};
function hs_xor64(a,b) {return a.xor(b);};
function hs_not64(x) {return x.not();}
var hs_eqWord64 = hs_eqInt64;
var hs_neWord64 = hs_neInt64;
var hs_ltWord64 = hs_ltInt64;
var hs_leWord64 = hs_leInt64;
var hs_gtWord64 = hs_gtInt64;
var hs_geWord64 = hs_geInt64;
var hs_quotWord64 = hs_quotInt64;
var hs_remWord64 = hs_remInt64;
var hs_uncheckedShiftL64 = hs_uncheckedIShiftL64;
var hs_uncheckedShiftRL64 = hs_uncheckedIShiftRL64;
function hs_int64ToWord64(x) {return x.toUnsigned();}
function hs_word64ToInt64(x) {return x.toSigned();}

// Joseph Myers' MD5 implementation, ported to work on typed arrays.
// Used under the BSD license.
function md5cycle(x, k) {
    var a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17,  606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12,  1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7,  1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7,  1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22,  1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14,  643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9,  38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5,  568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20,  1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14,  1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16,  1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11,  1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4,  681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23,  76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16,  530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10,  1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6,  1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6,  1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21,  1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15,  718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);

}

function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
}

function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
}

function md51(s, n) {
    var a = s['v']['w8'];
    var orig_n = n,
        state = [1732584193, -271733879, -1732584194, 271733878], i;
    for (i=64; i<=n; i+=64) {
        md5cycle(state, md5blk(a.subarray(i-64, i)));
    }
    a = a.subarray(i-64);
    n = n < (i-64) ? 0 : n-(i-64);
    var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
    for (i=0; i<n; i++)
        tail[i>>2] |= a[i] << ((i%4) << 3);
    tail[i>>2] |= 0x80 << ((i%4) << 3);
    if (i > 55) {
        md5cycle(state, tail);
        for (i=0; i<16; i++) tail[i] = 0;
    }
    tail[14] = orig_n*8;
    md5cycle(state, tail);
    return state;
}
window['md51'] = md51;

function md5blk(s) {
    var md5blks = [], i;
    for (i=0; i<64; i+=4) {
        md5blks[i>>2] = s[i]
            + (s[i+1] << 8)
            + (s[i+2] << 16)
            + (s[i+3] << 24);
    }
    return md5blks;
}

var hex_chr = '0123456789abcdef'.split('');

function rhex(n)
{
    var s='', j=0;
    for(; j<4; j++)
        s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
        + hex_chr[(n >> (j * 8)) & 0x0F];
    return s;
}

function hex(x) {
    for (var i=0; i<x.length; i++)
        x[i] = rhex(x[i]);
    return x.join('');
}

function md5(s, n) {
    return hex(md51(s, n));
}

window['md5'] = md5;

function add32(a, b) {
    return (a + b) & 0xFFFFFFFF;
}

function __hsbase_MD5Init(ctx) {}
// Note that this is a one time "update", since that's all that's used by
// GHC.Fingerprint.
function __hsbase_MD5Update(ctx, s, n) {
    ctx.md5 = md51(s, n);
}
function __hsbase_MD5Final(out, ctx) {
    var a = out['v']['i32'];
    a[0] = ctx.md5[0];
    a[1] = ctx.md5[1];
    a[2] = ctx.md5[2];
    a[3] = ctx.md5[3];
}

// Functions for dealing with arrays.

function newArr(n, x) {
    var arr = new Array(n);
    for(var i = 0; i < n; ++i) {
        arr[i] = x;
    }
    return arr;
}

// Create all views at once; perhaps it's wasteful, but it's better than having
// to check for the right view at each read or write.
function newByteArr(n) {
    // Pad the thing to multiples of 8.
    var padding = 8 - n % 8;
    if(padding < 8) {
        n += padding;
    }
    return new ByteArray(new ArrayBuffer(n));
}

// Wrap a JS ArrayBuffer into a ByteArray. Truncates the array length to the
// closest multiple of 8 bytes.
function wrapByteArr(buffer) {
    var diff = buffer.byteLength % 8;
    if(diff != 0) {
        var buffer = buffer.slice(0, buffer.byteLength-diff);
    }
    return new ByteArray(buffer);
}

function ByteArray(buffer) {
    var views =
        { 'i8' : new Int8Array(buffer)
        , 'i16': new Int16Array(buffer)
        , 'i32': new Int32Array(buffer)
        , 'w8' : new Uint8Array(buffer)
        , 'w16': new Uint16Array(buffer)
        , 'w32': new Uint32Array(buffer)
        , 'f32': new Float32Array(buffer)
        , 'f64': new Float64Array(buffer)
        };
    this['b'] = buffer;
    this['v'] = views;
    this['off'] = 0;
}
window['newArr'] = newArr;
window['newByteArr'] = newByteArr;
window['wrapByteArr'] = wrapByteArr;
window['ByteArray'] = ByteArray;

// An attempt at emulating pointers enough for ByteString and Text to be
// usable without patching the hell out of them.
// The general idea is that Addr# is a byte array with an associated offset.

function plusAddr(addr, off) {
    var newaddr = {};
    newaddr['off'] = addr['off'] + off;
    newaddr['b']   = addr['b'];
    newaddr['v']   = addr['v'];
    return newaddr;
}

function writeOffAddr(type, elemsize, addr, off, x) {
    addr['v'][type][addr.off/elemsize + off] = x;
}

function writeOffAddr64(addr, off, x) {
    addr['v']['w32'][addr.off/8 + off*2] = x.low;
    addr['v']['w32'][addr.off/8 + off*2 + 1] = x.high;
}

function readOffAddr(type, elemsize, addr, off) {
    return addr['v'][type][addr.off/elemsize + off];
}

function readOffAddr64(signed, addr, off) {
    var w64 = hs_mkWord64( addr['v']['w32'][addr.off/8 + off*2]
                         , addr['v']['w32'][addr.off/8 + off*2 + 1]);
    return signed ? hs_word64ToInt64(w64) : w64;
}

// Two addresses are equal if they point to the same buffer and have the same
// offset. For other comparisons, just use the offsets - nobody in their right
// mind would check if one pointer is less than another, completely unrelated,
// pointer and then act on that information anyway.
function addrEq(a, b) {
    if(a == b) {
        return true;
    }
    return a && b && a['b'] == b['b'] && a['off'] == b['off'];
}

function addrLT(a, b) {
    if(a) {
        return b && a['off'] < b['off'];
    } else {
        return (b != 0); 
    }
}

function addrGT(a, b) {
    if(b) {
        return a && a['off'] > b['off'];
    } else {
        return (a != 0);
    }
}

function withChar(f, charCode) {
    return f(String.fromCharCode(charCode)).charCodeAt(0);
}

function u_towlower(charCode) {
    return withChar(function(c) {return c.toLowerCase()}, charCode);
}

function u_towupper(charCode) {
    return withChar(function(c) {return c.toUpperCase()}, charCode);
}

var u_towtitle = u_towupper;

function u_iswupper(charCode) {
    var c = String.fromCharCode(charCode);
    return c == c.toUpperCase() && c != c.toLowerCase();
}

function u_iswlower(charCode) {
    var c = String.fromCharCode(charCode);
    return  c == c.toLowerCase() && c != c.toUpperCase();
}

function u_iswdigit(charCode) {
    return charCode >= 48 && charCode <= 57;
}

function u_iswcntrl(charCode) {
    return charCode <= 0x1f || charCode == 0x7f;
}

function u_iswspace(charCode) {
    var c = String.fromCharCode(charCode);
    return c.replace(/\s/g,'') != c;
}

function u_iswalpha(charCode) {
    var c = String.fromCharCode(charCode);
    return c.replace(__hs_alphare, '') != c;
}

function u_iswalnum(charCode) {
    return u_iswdigit(charCode) || u_iswalpha(charCode);
}

function u_iswprint(charCode) {
    return !u_iswcntrl(charCode);
}

function u_gencat(c) {
    throw 'u_gencat is only supported with --full-unicode.';
}

// Regex that matches any alphabetic character in any language. Horrible thing.
var __hs_alphare = /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/g;

// Simulate handles.
// When implementing new handles, remember that passed strings may be thunks,
// and so need to be evaluated before use.

function jsNewHandle(init, read, write, flush, close, seek, tell) {
    var h = {
        read: read || function() {},
        write: write || function() {},
        seek: seek || function() {},
        tell: tell || function() {},
        close: close || function() {},
        flush: flush || function() {}
    };
    init.call(h);
    return h;
}

function jsReadHandle(h, len) {return h.read(len);}
function jsWriteHandle(h, str) {return h.write(str);}
function jsFlushHandle(h) {return h.flush();}
function jsCloseHandle(h) {return h.close();}

function jsMkConWriter(op) {
    return function(str) {
        str = E(str);
        var lines = (this.buf + str).split('\n');
        for(var i = 0; i < lines.length-1; ++i) {
            op.call(console, lines[i]);
        }
        this.buf = lines[lines.length-1];
    }
}

function jsMkStdout() {
    return jsNewHandle(
        function() {this.buf = '';},
        function(_) {return '';},
        jsMkConWriter(console.log),
        function() {console.log(this.buf); this.buf = '';}
    );
}

function jsMkStderr() {
    return jsNewHandle(
        function() {this.buf = '';},
        function(_) {return '';},
        jsMkConWriter(console.warn),
        function() {console.warn(this.buf); this.buf = '';}
    );
}

function jsMkStdin() {
    return jsNewHandle(
        function() {this.buf = '';},
        function(len) {
            while(this.buf.length < len) {
                this.buf += prompt('[stdin]') + '\n';
            }
            var ret = this.buf.substr(0, len);
            this.buf = this.buf.substr(len);
            return ret;
        }
    );
}

// "Weak Pointers". Mostly useless implementation since
// JS does its own GC.

function mkWeak(key, val, fin) {
    fin = !fin? function() {}: fin;
    return {key: key, val: val, fin: fin};
}

function derefWeak(w) {
    return {_:0, a:1, b:E(w).val};
}

function finalizeWeak(w) {
    return {_:0, a:B(A1(E(w).fin, __Z))};
}

/* For foreign import ccall "wrapper" */
function createAdjustor(args, f, a, b) {
    return function(){
        var x = f.apply(null, arguments);
        while(x instanceof F) {x = x.f();}
        return x;
    };
}

var __apply = function(f,as) {
    var arr = [];
    for(; as._ === 1; as = as.b) {
        arr.push(as.a);
    }
    arr.reverse();
    return f.apply(null, arr);
}
var __app0 = function(f) {return f();}
var __app1 = function(f,a) {return f(a);}
var __app2 = function(f,a,b) {return f(a,b);}
var __app3 = function(f,a,b,c) {return f(a,b,c);}
var __app4 = function(f,a,b,c,d) {return f(a,b,c,d);}
var __app5 = function(f,a,b,c,d,e) {return f(a,b,c,d,e);}
var __jsNull = function() {return null;}
var __eq = function(a,b) {return a===b;}
var __createJSFunc = function(arity, f){
    if(f instanceof Function && arity === f.length) {
        return (function() {
            var x = f.apply(null,arguments);
            if(x instanceof T) {
                if(x.f !== __blackhole) {
                    var ff = x.f;
                    x.f = __blackhole;
                    return x.x = ff();
                }
                return x.x;
            } else {
                while(x instanceof F) {
                    x = x.f();
                }
                return E(x);
            }
        });
    } else {
        return (function(){
            var as = Array.prototype.slice.call(arguments);
            as.push(0);
            return E(B(A(f,as)));
        });
    }
}


function __arr2lst(elem,arr) {
    if(elem >= arr.length) {
        return __Z;
    }
    return {_:1,
            a:arr[elem],
            b:new T(function(){return __arr2lst(elem+1,arr);})};
}

function __lst2arr(xs) {
    var arr = [];
    xs = E(xs);
    for(;xs._ === 1; xs = E(xs.b)) {
        arr.push(E(xs.a));
    }
    return arr;
}

var __new = function() {return ({});}
var __set = function(o,k,v) {o[k]=v;}
var __get = function(o,k) {return o[k];}
var __has = function(o,k) {return o[k]!==undefined;}

var _0=function(_1,_2){return new F(function(){return A1(_2,_1);});},_3=function(_4,_){return new T(function(){var _5=Number(E(_4)),_6=jsTrunc(_5);return _6>>>0&255;});},_7=new T(function(){return eval("(function(b,i){return b.getUint8(i);})");}),_8=function(_9){var _a=B(A1(_9,_));return E(_a);},_b=function(_c,_d){var _e=B(_8(function(_){var _f=__app2(E(_7),E(_c),_d);return new F(function(){return _3(_f,0);});}));return new T2(0,_d+1|0,_e);},_g=function(_h,_){return new T(function(){var _i=Number(E(_h));return jsTrunc(_i);});},_j=new T(function(){return eval("(function(b,i){return b.getInt32(i,true);})");}),_k=function(_l,_m){var _n=B(_8(function(_){var _o=__app2(E(_j),E(_l),_m);return new F(function(){return _g(_o,0);});}));return new T2(0,_m+4|0,_n);},_p=function(_q,_r){var _s=E(_q);return (_s._==0)?E(_r):new T2(1,_s.a,new T(function(){return B(_p(_s.b,_r));}));},_t=function(_u,_v){var _w=jsShowI(_u);return new F(function(){return _p(fromJSStr(_w),_v);});},_x=41,_y=40,_z=function(_A,_B,_C){if(_B>=0){return new F(function(){return _t(_B,_C);});}else{if(_A<=6){return new F(function(){return _t(_B,_C);});}else{return new T2(1,_y,new T(function(){var _D=jsShowI(_B);return B(_p(fromJSStr(_D),new T2(1,_x,_C)));}));}}},_E=__Z,_F=function(_G){return new F(function(){return err(B(unAppCStr("Prelude.chr: bad argument: ",new T(function(){return B(_z(9,_G,_E));}))));});},_H=function(_I,_J){var _K=B(_k(_I,E(_J))),_L=E(_K.b);if(_L>>>0>1114111){return new F(function(){return _F(_L);});}else{return new T2(0,_K.a,E(_L));}},_M=new T1(0,_H),_N=0,_O=function(_){return _N;},_P=new T(function(){return eval("(function(a,x) {a.push(x);})");}),_Q=new T(function(){return eval("window[\'toABle\']");}),_R="Int32Array",_S=function(_T){var _U=new T(function(){return B(_8(function(_){return new F(function(){return __app3(E(_Q),E(_R),4,E(_T));});}));});return function(_V,_){var _W=__app2(E(_P),E(_V),E(_U));return new F(function(){return _O(_);});};},_X=function(_Y){return new T1(0,B(_S(new T(function(){return E(_Y);},1))));},_Z=new T2(0,_M,_X),_10=function(_11,_12){return new T2(0,E(_11),E(_12));},_13=function(_14,_){return new T(function(){var _15=Number(E(_14)),_16=jsTrunc(_15);return _16>>>0;});},_17=new T(function(){return eval("(function(b,i){return b.getUint32(i,true);})");}),_18=function(_19,_1a){var _1b=B(_8(function(_){var _1c=__app2(E(_17),E(_19),_1a);return new F(function(){return _13(_1c,0);});}));return new T2(0,_1a+4|0,_1b);},_1d=function(_1e){return E(E(_1e).a);},_1f=function(_1g,_1h){while(1){var _1i=E(_1g);if(!_1i._){return E(_1h);}else{var _1j=new T2(1,_1i.a,_1h);_1g=_1i.b;_1h=_1j;continue;}}},_1k=function(_1l){var _1m=new T(function(){return B(_1d(_1l));});return function(_1n,_1o){var _1p=B(_18(_1n,E(_1o))),_1q=_1p.a,_1r=E(_1p.b);if(!_1r){return new T2(0,_1q,E(B(_1f(_E,_E))));}else{var _1s=E(_1m).a,_1t=B(A2(_1s,_1n,_1q));if(!_1t._){var _1u=function(_1v,_1w){var _1x=E(_1v);if(!_1x){var _1y=new T(function(){return B(_1f(_1w,_E));});return function(_1z,_1A){return new F(function(){return _10(_1A,_1y);});};}else{return function(_1B,_1C){var _1D=B(A2(_1s,_1B,_1C));if(!_1D._){return new F(function(){return A2(B(_1u(_1x-1>>>0,new T2(1,_1D.b,_1w))),_1B,_1D.a);});}else{return new T1(1,E(_1D.a));}};}};return new F(function(){return A2(B(_1u(_1r-1>>>0,new T2(1,_1t.b,_E))),_1n,_1t.a);});}else{return new T1(1,E(_1t.a));}}};},_1E=new T(function(){return new T1(0,function(_1F,_1G){var _1H=B(A2(B(_1k(_Z)),_1F,_1G));return (_1H._==0)?new T2(0,_1H.a,E(new T1(0,_1H.b))):new T1(1,E(_1H.a));});}),_1I=new T(function(){return B(unCStr("Wrong magic byte for ServerException"));}),_1J=new T1(1,E(_1I)),_1K=function(_1L,_1M){var _1N=B(_b(_1L,_1M));if(E(_1N.b)==2){return new F(function(){return A2(E(_1E).a,_1L,_1N.a);});}else{return E(_1J);}},_1O=function(_1P,_1Q){return new F(function(){return _1K(_1P,E(_1Q));});},_1R=new T1(0,_1O),_1S=function(_1T,_){return new T(function(){var _1U=Number(E(_1T));return jsTrunc(_1U);});},_1V=new T(function(){return eval("(function(b){return b.size;})");}),_1W=function(_1X){return new F(function(){return _8(function(_){var _1Y=__app1(E(_1V),E(_1X));return new F(function(){return _1S(_1Y,0);});});});},_1Z=new T(function(){return eval("(function(b){try {return new Blob([b]);} catch (e) {return new Blob([b.buffer]);}})");}),_20=function(_21){return new F(function(){return _8(function(_){return new F(function(){return __app1(E(_1Z),E(_21));});});});},_22=new T(function(){return eval("(function(b,off,len){return b.slice(off,len);})");}),_23=function(_24,_25,_26){var _27=E(_24);if(!_27){var _28=new T(function(){return B(_20(_26));}),_29=E(_25);if(B(_1W(_28))<=_29){return E(_28);}else{return new F(function(){return _8(function(_){return new F(function(){return __app3(E(_22),E(_28),0,_29);});});});}}else{return new F(function(){return _8(function(_){return new F(function(){return __app3(E(_22),B(_20(_26)),_24,_27+E(_25)|0);});});});}},_2a=function(_2b,_2c){var _2d=B(_k(_2b,E(_2c))),_2e=_2d.a,_2f=E(_2d.b),_2g=B(_23(_2e,_2f,_2b));return new T2(0,_2e+_2f|0,E(_2g));},_2h=new T1(0,_2a),_2i=new T(function(){return B(unCStr("Wrong magic byte for ServerReply"));}),_2j=new T1(1,E(_2i)),_2k=function(_2l,_2m){var _2n=B(_b(_2l,_2m));if(E(_2n.b)==1){var _2o=B(_k(_2l,_2n.a)),_2p=B(A2(E(_2h).a,_2l,_2o.a));return (_2p._==0)?new T2(0,_2p.a,E(new T2(0,E(_2o.b),_2p.b))):new T1(1,E(_2p.a));}else{return E(_2j);}},_2q=function(_2r,_2s){return new F(function(){return _2k(_2r,E(_2s));});},_2t=new T1(0,_2q),_2u=0,_2v=new T1(1,_E),_2w=new T(function(){return eval("(function(b,cb){var r=new FileReader();r.onload=function(){cb(new DataView(r.result));};r.readAsArrayBuffer(b);})");}),_2x=function(_2y,_){while(1){var _2z=E(_2y);if(!_2z._){return _N;}else{var _2A=_2z.b,_2B=E(_2z.a);switch(_2B._){case 0:var _2C=B(A1(_2B.a,_));_2y=B(_p(_2A,new T2(1,_2C,_E)));continue;case 1:_2y=B(_p(_2A,_2B.a));continue;default:_2y=_2A;continue;}}}},_2D=function(_2E,_2F,_){var _2G=E(_2E);switch(_2G._){case 0:var _2H=B(A1(_2G.a,_));return new F(function(){return _2x(B(_p(_2F,new T2(1,_2H,_E))),_);});break;case 1:return new F(function(){return _2x(B(_p(_2F,_2G.a)),_);});break;default:return new F(function(){return _2x(_2F,_);});}},_2I=new T0(2),_2J=function(_2K){return new T0(2);},_2L=function(_2M,_2N,_2O){return function(_){var _2P=E(_2M),_2Q=rMV(_2P),_2R=E(_2Q);if(!_2R._){var _2S=new T(function(){var _2T=new T(function(){return B(A1(_2O,_N));});return B(_p(_2R.b,new T2(1,new T2(0,_2N,function(_2U){return E(_2T);}),_E)));}),_=wMV(_2P,new T2(0,_2R.a,_2S));return _2I;}else{var _2V=E(_2R.a);if(!_2V._){var _=wMV(_2P,new T2(0,_2N,_E));return new T(function(){return B(A1(_2O,_N));});}else{var _=wMV(_2P,new T1(1,_2V.b));return new T1(1,new T2(1,new T(function(){return B(A1(_2O,_N));}),new T2(1,new T(function(){return B(A2(_2V.a,_2N,_2J));}),_E)));}}};},_2W=new T1(1,_E),_2X=function(_2Y,_2Z){return function(_){var _30=E(_2Y),_31=rMV(_30),_32=E(_31);if(!_32._){var _33=_32.a,_34=E(_32.b);if(!_34._){var _=wMV(_30,_2W);return new T(function(){return B(A1(_2Z,_33));});}else{var _35=E(_34.a),_=wMV(_30,new T2(0,_35.a,_34.b));return new T1(1,new T2(1,new T(function(){return B(A1(_2Z,_33));}),new T2(1,new T(function(){return B(A1(_35.b,_2J));}),_E)));}}else{var _36=new T(function(){var _37=function(_38){var _39=new T(function(){return B(A1(_2Z,_38));});return function(_3a){return E(_39);};};return B(_p(_32.a,new T2(1,_37,_E)));}),_=wMV(_30,new T1(1,_36));return _2I;}};},_3b=function(_){return new F(function(){return __jsNull();});},_3c=new T(function(){return B(_8(_3b));}),_3d=new T(function(){return E(_3c);}),_3e=function(_3f){var _3g=new T(function(){return B(_1W(_3f));}),_3h=function(_3i){var _3j=function(_){var _3k=nMV(_2v),_3l=_3k,_3m=function(_){var _3n=function(_3o,_){var _3p=B(_2D(new T(function(){return new T1(0,B(_2L(_3l,new T3(0,_2u,_3g,_3o),_2J)));}),_E,_));return _3d;},_3q=__createJSFunc(2,E(_3n)),_3r=__app2(E(_2w),E(_3f),_3q);return new T(function(){return new T1(0,B(_2X(_3l,_3i)));});};return new T1(0,_3m);};return new T1(0,_3j);};return E(_3h);},_3s=new T1(1,_E),_3t=new T(function(){return eval("(function(url, cb, f, err) {var ws = new WebSocket(url);ws.binaryType = \'blob\';ws.onmessage = function(e) {cb(ws,e.data);};ws.onopen = function(e) {f(ws);};ws.onerror = function(e) {err();};return ws;})");}),_3u=function(_3v,_3w,_3x,_3y,_3z){return function(_){var _3A=nMV(_3s),_3B=_3A,_3C=function(_3D){return new T1(0,B(_2L(_3B,_3D,_2J)));},_3E=function(_){var _3F=function(_3G,_3H,_){var _3I=B(_2D(new T(function(){return B(A3(_3w,_3G,_3H,_2J));}),_E,_));return _3d;},_3J=__createJSFunc(3,E(_3F)),_3K=function(_3L,_){var _3M=B(_2D(new T(function(){return B(A2(_3y,_3L,_3C));}),_E,_));return _3d;},_3N=__createJSFunc(2,E(_3K)),_3O=function(_){var _3P=B(_2D(new T(function(){return B(A1(_3x,_3C));}),_E,_));return _3d;},_3Q=__createJSFunc(0,E(_3O)),_3R=__app4(E(_3t),toJSStr(E(_3v)),_3J,_3N,_3Q);return new T(function(){return new T1(0,B(_2X(_3B,_3z)));});};return new T1(0,_3E);};},_3S=function(_3T,_3U){var _3V=E(_3U);if(!_3V._){return new T2(0,_E,_E);}else{var _3W=_3V.a;if(!B(A1(_3T,_3W))){return new T2(0,_E,_3V);}else{var _3X=new T(function(){var _3Y=B(_3S(_3T,_3V.b));return new T2(0,_3Y.a,_3Y.b);});return new T2(0,new T2(1,_3W,new T(function(){return E(E(_3X).a);})),new T(function(){return E(E(_3X).b);}));}}},_3Z=function(_40){return new F(function(){return A1(_40,_N);});},_41=new T(function(){return B(unCStr("WebSockets connection died for some reason!"));}),_42=new T(function(){return B(err(_41));}),_43=new T(function(){return B(unCStr("LApUZuWlHYm7n1MKPK7mnS"));}),_44=new T(function(){return B(unCStr("Haste.App.Protocol"));}),_45=new T(function(){return B(unCStr("ServerException"));}),_46=new T5(0,new Long(1204816463,3051677665,true),new Long(1636215421,3314643880,true),_43,_44,_45),_47=new T5(0,new Long(1204816463,3051677665,true),new Long(1636215421,3314643880,true),_46,_E,_E),_48=function(_49){return E(_47);},_4a=function(_4b){return E(E(_4b).a);},_4c=function(_4d,_4e,_4f){var _4g=B(A1(_4d,_)),_4h=B(A1(_4e,_)),_4i=hs_eqWord64(_4g.a,_4h.a);if(!_4i){return __Z;}else{var _4j=hs_eqWord64(_4g.b,_4h.b);return (!_4j)?__Z:new T1(1,_4f);}},_4k=function(_4l){var _4m=E(_4l);return new F(function(){return _4c(B(_4a(_4m.a)),_48,_4m.b);});},_4n=new T(function(){return B(unCStr("ServerException "));}),_4o=new T(function(){return B(unCStr("!!: negative index"));}),_4p=new T(function(){return B(unCStr("Prelude."));}),_4q=new T(function(){return B(_p(_4p,_4o));}),_4r=new T(function(){return B(err(_4q));}),_4s=new T(function(){return B(unCStr("!!: index too large"));}),_4t=new T(function(){return B(_p(_4p,_4s));}),_4u=new T(function(){return B(err(_4t));}),_4v=function(_4w,_4x){while(1){var _4y=E(_4w);if(!_4y._){return E(_4u);}else{var _4z=E(_4x);if(!_4z){return E(_4y.a);}else{_4w=_4y.b;_4x=_4z-1|0;continue;}}}},_4A=function(_4B,_4C){if(_4C>=0){return new F(function(){return _4v(_4B,_4C);});}else{return E(_4r);}},_4D=new T(function(){return B(unCStr("ACK"));}),_4E=new T(function(){return B(unCStr("BEL"));}),_4F=new T(function(){return B(unCStr("BS"));}),_4G=new T(function(){return B(unCStr("SP"));}),_4H=new T2(1,_4G,_E),_4I=new T(function(){return B(unCStr("US"));}),_4J=new T2(1,_4I,_4H),_4K=new T(function(){return B(unCStr("RS"));}),_4L=new T2(1,_4K,_4J),_4M=new T(function(){return B(unCStr("GS"));}),_4N=new T2(1,_4M,_4L),_4O=new T(function(){return B(unCStr("FS"));}),_4P=new T2(1,_4O,_4N),_4Q=new T(function(){return B(unCStr("ESC"));}),_4R=new T2(1,_4Q,_4P),_4S=new T(function(){return B(unCStr("SUB"));}),_4T=new T2(1,_4S,_4R),_4U=new T(function(){return B(unCStr("EM"));}),_4V=new T2(1,_4U,_4T),_4W=new T(function(){return B(unCStr("CAN"));}),_4X=new T2(1,_4W,_4V),_4Y=new T(function(){return B(unCStr("ETB"));}),_4Z=new T2(1,_4Y,_4X),_50=new T(function(){return B(unCStr("SYN"));}),_51=new T2(1,_50,_4Z),_52=new T(function(){return B(unCStr("NAK"));}),_53=new T2(1,_52,_51),_54=new T(function(){return B(unCStr("DC4"));}),_55=new T2(1,_54,_53),_56=new T(function(){return B(unCStr("DC3"));}),_57=new T2(1,_56,_55),_58=new T(function(){return B(unCStr("DC2"));}),_59=new T2(1,_58,_57),_5a=new T(function(){return B(unCStr("DC1"));}),_5b=new T2(1,_5a,_59),_5c=new T(function(){return B(unCStr("DLE"));}),_5d=new T2(1,_5c,_5b),_5e=new T(function(){return B(unCStr("SI"));}),_5f=new T2(1,_5e,_5d),_5g=new T(function(){return B(unCStr("SO"));}),_5h=new T2(1,_5g,_5f),_5i=new T(function(){return B(unCStr("CR"));}),_5j=new T2(1,_5i,_5h),_5k=new T(function(){return B(unCStr("FF"));}),_5l=new T2(1,_5k,_5j),_5m=new T(function(){return B(unCStr("VT"));}),_5n=new T2(1,_5m,_5l),_5o=new T(function(){return B(unCStr("LF"));}),_5p=new T2(1,_5o,_5n),_5q=new T(function(){return B(unCStr("HT"));}),_5r=new T2(1,_5q,_5p),_5s=new T2(1,_4F,_5r),_5t=new T2(1,_4E,_5s),_5u=new T2(1,_4D,_5t),_5v=new T(function(){return B(unCStr("ENQ"));}),_5w=new T2(1,_5v,_5u),_5x=new T(function(){return B(unCStr("EOT"));}),_5y=new T2(1,_5x,_5w),_5z=new T(function(){return B(unCStr("ETX"));}),_5A=new T2(1,_5z,_5y),_5B=new T(function(){return B(unCStr("STX"));}),_5C=new T2(1,_5B,_5A),_5D=new T(function(){return B(unCStr("SOH"));}),_5E=new T2(1,_5D,_5C),_5F=new T(function(){return B(unCStr("NUL"));}),_5G=new T2(1,_5F,_5E),_5H=92,_5I=new T(function(){return B(unCStr("\\DEL"));}),_5J=new T(function(){return B(unCStr("\\a"));}),_5K=new T(function(){return B(unCStr("\\\\"));}),_5L=new T(function(){return B(unCStr("\\SO"));}),_5M=new T(function(){return B(unCStr("\\r"));}),_5N=new T(function(){return B(unCStr("\\f"));}),_5O=new T(function(){return B(unCStr("\\v"));}),_5P=new T(function(){return B(unCStr("\\n"));}),_5Q=new T(function(){return B(unCStr("\\t"));}),_5R=new T(function(){return B(unCStr("\\b"));}),_5S=function(_5T,_5U){if(_5T<=127){var _5V=E(_5T);switch(_5V){case 92:return new F(function(){return _p(_5K,_5U);});break;case 127:return new F(function(){return _p(_5I,_5U);});break;default:if(_5V<32){var _5W=E(_5V);switch(_5W){case 7:return new F(function(){return _p(_5J,_5U);});break;case 8:return new F(function(){return _p(_5R,_5U);});break;case 9:return new F(function(){return _p(_5Q,_5U);});break;case 10:return new F(function(){return _p(_5P,_5U);});break;case 11:return new F(function(){return _p(_5O,_5U);});break;case 12:return new F(function(){return _p(_5N,_5U);});break;case 13:return new F(function(){return _p(_5M,_5U);});break;case 14:return new F(function(){return _p(_5L,new T(function(){var _5X=E(_5U);if(!_5X._){return __Z;}else{if(E(_5X.a)==72){return B(unAppCStr("\\&",_5X));}else{return E(_5X);}}},1));});break;default:return new F(function(){return _p(new T2(1,_5H,new T(function(){return B(_4A(_5G,_5W));})),_5U);});}}else{return new T2(1,_5V,_5U);}}}else{var _5Y=new T(function(){var _5Z=jsShowI(_5T);return B(_p(fromJSStr(_5Z),new T(function(){var _60=E(_5U);if(!_60._){return __Z;}else{var _61=E(_60.a);if(_61<48){return E(_60);}else{if(_61>57){return E(_60);}else{return B(unAppCStr("\\&",_60));}}}},1)));});return new T2(1,_5H,_5Y);}},_62=new T(function(){return B(unCStr("\\\""));}),_63=function(_64,_65){var _66=E(_64);if(!_66._){return E(_65);}else{var _67=_66.b,_68=E(_66.a);if(_68==34){return new F(function(){return _p(_62,new T(function(){return B(_63(_67,_65));},1));});}else{return new F(function(){return _5S(_68,new T(function(){return B(_63(_67,_65));}));});}}},_69=34,_6a=function(_6b,_6c,_6d){if(_6b<11){return new F(function(){return _p(_4n,new T2(1,_69,new T(function(){return B(_63(_6c,new T2(1,_69,_6d)));})));});}else{var _6e=new T(function(){return B(_p(_4n,new T2(1,_69,new T(function(){return B(_63(_6c,new T2(1,_69,new T2(1,_x,_6d))));}))));});return new T2(1,_y,_6e);}},_6f=function(_6g){return new F(function(){return _6a(0,E(_6g).a,_E);});},_6h=function(_6i){return new T2(0,_6j,_6i);},_6k=function(_6l,_6m,_6n){return new F(function(){return _6a(E(_6l),E(_6m).a,_6n);});},_6o=function(_6p,_6q){return new F(function(){return _6a(0,E(_6p).a,_6q);});},_6r=44,_6s=93,_6t=91,_6u=function(_6v,_6w,_6x){var _6y=E(_6w);if(!_6y._){return new F(function(){return unAppCStr("[]",_6x);});}else{var _6z=new T(function(){var _6A=new T(function(){var _6B=function(_6C){var _6D=E(_6C);if(!_6D._){return E(new T2(1,_6s,_6x));}else{var _6E=new T(function(){return B(A2(_6v,_6D.a,new T(function(){return B(_6B(_6D.b));})));});return new T2(1,_6r,_6E);}};return B(_6B(_6y.b));});return B(A2(_6v,_6y.a,_6A));});return new T2(1,_6t,_6z);}},_6F=function(_6G,_6i){return new F(function(){return _6u(_6o,_6G,_6i);});},_6H=new T3(0,_6k,_6f,_6F),_6j=new T(function(){return new T5(0,_48,_6H,_6h,_4k,_6f);}),_6I=function(_6J){return E(E(_6J).c);},_6K=function(_6L,_6M){return new F(function(){return die(new T(function(){return B(A2(_6I,_6M,_6L));}));});},_6N=function(_6O,_6P){return new F(function(){return _6K(_6O,_6P);});},_6Q=function(_6R){return new F(function(){return _6N(_6R,_6j);});},_6S=new T1(1,_N),_6T=0,_6U=function(_6V,_6W){return E(_6V)!=E(_6W);},_6X=function(_6Y,_6Z,_70){return new T1(0,B(_2L(_6Y,_6Z,_70)));},_71=new T(function(){return B(unCStr("Not enough data!"));}),_72=new T1(0,_71),_73=new T(function(){return eval("(function(s, msg) {s.send(msg);})");}),_74=function(_75,_76,_77,_78,_){var _79=new T(function(){var _7a=new T(function(){var _7b=E(_76),_7c=new T(function(){return B(unAppCStr(":",new T(function(){return B(_z(0,E(_7b.b),_E));})));},1);return B(_p(_7b.a,_7c));});return B(unAppCStr("ws://",_7a));}),_7d=function(_){var _7e=function(_){var _7f=nMV(_E),_7g=_7f,_7h=function(_7i){var _7j=new T(function(){return B(_3e(_7i));}),_7k=function(_7l){var _7m=function(_7n){var _7o=new T(function(){var _7p=E(_7n),_7q=B(A2(E(_1R).a,_7p.c,_7p.a));if(!_7q._){if(_7q.a>E(_7p.b)){return E(_6S);}else{return B(_6Q(_7q.b));}}else{return E(_6S);}}),_7r=new T(function(){var _7s=E(_7n),_7t=B(A2(E(_2t).a,_7s.c,_7s.a));if(!_7t._){if(_7t.a>E(_7s.b)){return E(_72);}else{return new T1(1,_7t.b);}}else{return new T1(0,_7t.a);}}),_7u=function(_){var _7v=function(_7w){if(!E(_7o)._){return new T2(0,_7w,_3Z);}else{var _7x=E(_7r);if(!_7x._){return new T2(0,_7w,_3Z);}else{var _7y=E(_7x.a),_7z=B(_3S(function(_7A){return new F(function(){return _6U(E(_7A).a,_7y.a);});},_7w)),_7B=E(_7z.b);return (_7B._==0)?new T2(0,_7w,_3Z):new T2(0,new T(function(){return B(_p(_7z.a,_7B.b));}),function(_7C){return new F(function(){return _6X(E(_7B.a).b,_7y.b,_7C);});});}}},_7D=mMV(_7g,_7v);return new T(function(){return B(A1(_7D,_7l));});};return new T1(0,_7u);};return new F(function(){return A1(_7j,_7m);});};return E(_7k);},_7E=function(_7F,_7G){return new F(function(){return _7h(_7G);});},_7H=function(_){var _7I=nMV(_6T),_7J=_7I,_7K=function(_){var _7L=function(_7M,_7N,_7O){var _7P=new T(function(){return E(E(_7N).a);}),_7Q=new T(function(){return B(A1(_7O,_N));}),_7R=function(_7S){var _7T=function(_){var _7U=__app2(E(_73),E(_7S),E(_7M));return _7Q;},_7V=function(_7W,_7X,_7Y){var _7Z=function(_){var _80=__app2(E(_73),E(_7S),E(_7W));return new T(function(){return B(A1(_7Y,_N));});};return new T1(0,_7Z);};return new T1(0,B(_2L(_7P,_7V,function(_81){return E(new T1(0,_7T));})));};return new T1(0,B(_2X(_7P,function(_82){return new T1(0,B(_3u(_79,_7E,_42,_0,_7R)));})));},_83=nMV(new T2(0,_7L,_E));return new T(function(){return B(A2(_75,new T3(0,_83,_7J,_7g),_2J));});};return new T1(0,_7K);};return new T1(0,_7H);};return new F(function(){return _2D(new T1(0,_7e),_E,_);});};return new T4(0,_7d,_77,_78,_76);},_84=24601,_85=new T(function(){return B(unCStr("localhost"));}),_86=new T3(0,_85,_84,_E),_87=function(_88,_89,_8a){var _8b=new T(function(){return B(A1(_88,_8a));}),_8c=function(_8d){var _8e=function(_8f){var _8g=new T(function(){return B(A1(_8d,_8f));});return new F(function(){return A2(_89,_8a,function(_8h){return E(_8g);});});};return new F(function(){return A1(_8b,_8e);});};return E(_8c);},_8i=function(_8j,_8k,_8l){var _8m=new T(function(){return B(A1(_8j,_8l));}),_8n=function(_8o){var _8p=new T(function(){return B(A2(_8k,_8l,function(_8q){return new F(function(){return A1(_8o,_8q);});}));});return new F(function(){return A1(_8m,function(_8r){return E(_8p);});});};return E(_8n);},_8s=function(_8t,_8u,_8v){var _8w=new T(function(){return B(A1(_8t,_8v));}),_8x=function(_8y){var _8z=function(_8A){var _8B=function(_8C){return new F(function(){return A1(_8y,new T(function(){return B(A1(_8A,_8C));}));});};return new F(function(){return A2(_8u,_8v,_8B);});};return new F(function(){return A1(_8w,_8z);});};return E(_8x);},_8D=function(_8E,_8F,_8G){return new F(function(){return A1(_8G,_8E);});},_8H=function(_8I,_8J,_8K){var _8L=new T(function(){return B(A1(_8J,_8K));}),_8M=function(_8N){var _8O=new T(function(){return B(A1(_8N,_8I));});return new F(function(){return A1(_8L,function(_8P){return E(_8O);});});};return E(_8M);},_8Q=function(_8R,_8S,_8T){var _8U=new T(function(){return B(A1(_8S,_8T));}),_8V=function(_8W){var _8X=function(_8Y){return new F(function(){return A1(_8W,new T(function(){return B(A1(_8R,_8Y));}));});};return new F(function(){return A1(_8U,_8X);});};return E(_8V);},_8Z=new T2(0,_8Q,_8H),_90=new T5(0,_8Z,_8D,_8s,_8i,_87),_91=function(_92,_93,_94){var _95=new T(function(){return B(A1(_92,_94));}),_96=function(_97){return new F(function(){return A1(_95,function(_98){return new F(function(){return A3(_93,_98,_94,_97);});});});};return E(_96);},_99=function(_9a){return E(E(_9a).b);},_9b=function(_9c,_9d){return new F(function(){return A3(_99,_9e,_9c,function(_9f){return E(_9d);});});},_9g=function(_9h){return new F(function(){return err(_9h);});},_9e=new T(function(){return new T5(0,_90,_91,_9b,_8D,_9g);}),_9i=function(_9j,_9k,_9l){var _9m=function(_){var _9n=B(A1(_9j,_));return new T(function(){return B(A1(_9l,_9n));});};return new T1(0,_9m);},_9o=new T2(0,_9e,_9i),_9p="deltaZ",_9q="deltaY",_9r="deltaX",_9s=new T(function(){return B(unCStr(")"));}),_9t=new T(function(){return B(_z(0,2,_9s));}),_9u=new T(function(){return B(unAppCStr(") is outside of enumeration\'s range (0,",_9t));}),_9v=function(_9w){return new F(function(){return err(B(unAppCStr("toEnum{MouseButton}: tag (",new T(function(){return B(_z(0,_9w,_9u));}))));});},_9x=function(_9y,_){return new T(function(){var _9z=Number(E(_9y)),_9A=jsTrunc(_9z);if(_9A<0){return B(_9v(_9A));}else{if(_9A>2){return B(_9v(_9A));}else{return _9A;}}});},_9B=0,_9C=new T3(0,_9B,_9B,_9B),_9D="button",_9E=new T(function(){return eval("jsGetMouseCoords");}),_9F=function(_9G,_){var _9H=E(_9G);if(!_9H._){return _E;}else{var _9I=B(_9F(_9H.b,_));return new T2(1,new T(function(){var _9J=Number(E(_9H.a));return jsTrunc(_9J);}),_9I);}},_9K=function(_9L,_){var _9M=__arr2lst(0,_9L);return new F(function(){return _9F(_9M,_);});},_9N=function(_9O,_){return new F(function(){return _9K(E(_9O),_);});},_9P=new T2(0,_1S,_9N),_9Q=function(_9R,_){var _9S=E(_9R);if(!_9S._){return _E;}else{var _9T=B(_9Q(_9S.b,_));return new T2(1,_9S.a,_9T);}},_9U=new T(function(){return B(unCStr("base"));}),_9V=new T(function(){return B(unCStr("GHC.IO.Exception"));}),_9W=new T(function(){return B(unCStr("IOException"));}),_9X=new T5(0,new Long(4053623282,1685460941,true),new Long(3693590983,2507416641,true),_9U,_9V,_9W),_9Y=new T5(0,new Long(4053623282,1685460941,true),new Long(3693590983,2507416641,true),_9X,_E,_E),_9Z=function(_a0){return E(_9Y);},_a1=function(_a2){var _a3=E(_a2);return new F(function(){return _4c(B(_4a(_a3.a)),_9Z,_a3.b);});},_a4=new T(function(){return B(unCStr(": "));}),_a5=new T(function(){return B(unCStr(")"));}),_a6=new T(function(){return B(unCStr(" ("));}),_a7=new T(function(){return B(unCStr("interrupted"));}),_a8=new T(function(){return B(unCStr("system error"));}),_a9=new T(function(){return B(unCStr("unsatisified constraints"));}),_aa=new T(function(){return B(unCStr("user error"));}),_ab=new T(function(){return B(unCStr("permission denied"));}),_ac=new T(function(){return B(unCStr("illegal operation"));}),_ad=new T(function(){return B(unCStr("end of file"));}),_ae=new T(function(){return B(unCStr("resource exhausted"));}),_af=new T(function(){return B(unCStr("resource busy"));}),_ag=new T(function(){return B(unCStr("does not exist"));}),_ah=new T(function(){return B(unCStr("already exists"));}),_ai=new T(function(){return B(unCStr("resource vanished"));}),_aj=new T(function(){return B(unCStr("timeout"));}),_ak=new T(function(){return B(unCStr("unsupported operation"));}),_al=new T(function(){return B(unCStr("hardware fault"));}),_am=new T(function(){return B(unCStr("inappropriate type"));}),_an=new T(function(){return B(unCStr("invalid argument"));}),_ao=new T(function(){return B(unCStr("failed"));}),_ap=new T(function(){return B(unCStr("protocol error"));}),_aq=function(_ar,_as){switch(E(_ar)){case 0:return new F(function(){return _p(_ah,_as);});break;case 1:return new F(function(){return _p(_ag,_as);});break;case 2:return new F(function(){return _p(_af,_as);});break;case 3:return new F(function(){return _p(_ae,_as);});break;case 4:return new F(function(){return _p(_ad,_as);});break;case 5:return new F(function(){return _p(_ac,_as);});break;case 6:return new F(function(){return _p(_ab,_as);});break;case 7:return new F(function(){return _p(_aa,_as);});break;case 8:return new F(function(){return _p(_a9,_as);});break;case 9:return new F(function(){return _p(_a8,_as);});break;case 10:return new F(function(){return _p(_ap,_as);});break;case 11:return new F(function(){return _p(_ao,_as);});break;case 12:return new F(function(){return _p(_an,_as);});break;case 13:return new F(function(){return _p(_am,_as);});break;case 14:return new F(function(){return _p(_al,_as);});break;case 15:return new F(function(){return _p(_ak,_as);});break;case 16:return new F(function(){return _p(_aj,_as);});break;case 17:return new F(function(){return _p(_ai,_as);});break;default:return new F(function(){return _p(_a7,_as);});}},_at=new T(function(){return B(unCStr("}"));}),_au=new T(function(){return B(unCStr("{handle: "));}),_av=function(_aw,_ax,_ay,_az,_aA,_aB){var _aC=new T(function(){var _aD=new T(function(){var _aE=new T(function(){var _aF=E(_az);if(!_aF._){return E(_aB);}else{var _aG=new T(function(){return B(_p(_aF,new T(function(){return B(_p(_a5,_aB));},1)));},1);return B(_p(_a6,_aG));}},1);return B(_aq(_ax,_aE));}),_aH=E(_ay);if(!_aH._){return E(_aD);}else{return B(_p(_aH,new T(function(){return B(_p(_a4,_aD));},1)));}}),_aI=E(_aA);if(!_aI._){var _aJ=E(_aw);if(!_aJ._){return E(_aC);}else{var _aK=E(_aJ.a);if(!_aK._){var _aL=new T(function(){var _aM=new T(function(){return B(_p(_at,new T(function(){return B(_p(_a4,_aC));},1)));},1);return B(_p(_aK.a,_aM));},1);return new F(function(){return _p(_au,_aL);});}else{var _aN=new T(function(){var _aO=new T(function(){return B(_p(_at,new T(function(){return B(_p(_a4,_aC));},1)));},1);return B(_p(_aK.a,_aO));},1);return new F(function(){return _p(_au,_aN);});}}}else{return new F(function(){return _p(_aI.a,new T(function(){return B(_p(_a4,_aC));},1));});}},_aP=function(_aQ){var _aR=E(_aQ);return new F(function(){return _av(_aR.a,_aR.b,_aR.c,_aR.d,_aR.f,_E);});},_aS=function(_aT,_aU,_aV){var _aW=E(_aU);return new F(function(){return _av(_aW.a,_aW.b,_aW.c,_aW.d,_aW.f,_aV);});},_aX=function(_aY,_aZ){var _b0=E(_aY);return new F(function(){return _av(_b0.a,_b0.b,_b0.c,_b0.d,_b0.f,_aZ);});},_b1=function(_b2,_b3){return new F(function(){return _6u(_aX,_b2,_b3);});},_b4=new T3(0,_aS,_aP,_b1),_b5=new T(function(){return new T5(0,_9Z,_b4,_b6,_a1,_aP);}),_b6=function(_b7){return new T2(0,_b5,_b7);},_b8=__Z,_b9=7,_ba=new T(function(){return B(unCStr("Pattern match failure in do expression at src/Haste/Prim/Any.hs:272:5-9"));}),_bb=new T6(0,_b8,_b9,_E,_ba,_b8,_b8),_bc=new T(function(){return B(_b6(_bb));}),_bd=function(_){return new F(function(){return die(_bc);});},_be=function(_bf){return E(E(_bf).a);},_bg=function(_bh,_bi,_bj,_){var _bk=__arr2lst(0,_bj),_bl=B(_9Q(_bk,_)),_bm=E(_bl);if(!_bm._){return new F(function(){return _bd(_);});}else{var _bn=E(_bm.b);if(!_bn._){return new F(function(){return _bd(_);});}else{if(!E(_bn.b)._){var _bo=B(A3(_be,_bh,_bm.a,_)),_bp=B(A3(_be,_bi,_bn.a,_));return new T2(0,_bo,_bp);}else{return new F(function(){return _bd(_);});}}}},_bq=function(_br,_bs,_){if(E(_br)==7){var _bt=__app1(E(_9E),_bs),_bu=B(_bg(_9P,_9P,_bt,_)),_bv=__get(_bs,E(_9r)),_bw=__get(_bs,E(_9q)),_bx=__get(_bs,E(_9p));return new T(function(){return new T3(0,E(_bu),E(_b8),E(new T3(0,_bv,_bw,_bx)));});}else{var _by=__app1(E(_9E),_bs),_bz=B(_bg(_9P,_9P,_by,_)),_bA=__get(_bs,E(_9D)),_bB=__eq(_bA,E(_3d));if(!E(_bB)){var _bC=B(_9x(_bA,_));return new T(function(){return new T3(0,E(_bz),E(new T1(1,_bC)),E(_9C));});}else{return new T(function(){return new T3(0,E(_bz),E(_b8),E(_9C));});}}},_bD=function(_bE,_bF,_){return new F(function(){return _bq(_bE,E(_bF),_);});},_bG="mouseout",_bH="mouseover",_bI="mousemove",_bJ="mouseup",_bK="mousedown",_bL="dblclick",_bM="click",_bN="wheel",_bO=function(_bP){switch(E(_bP)){case 0:return E(_bM);case 1:return E(_bL);case 2:return E(_bK);case 3:return E(_bJ);case 4:return E(_bI);case 5:return E(_bH);case 6:return E(_bG);default:return E(_bN);}},_bQ=new T2(0,_bO,_bD),_bR=function(_bS,_){return new T1(1,_bS);},_bT=function(_bU){return E(_bU);},_bV=new T2(0,_bT,_bR),_bW=function(_bX,_bY,_bZ){var _c0=function(_c1,_){return new F(function(){return _2D(new T(function(){return B(A3(_bX,_c1,_bY,_2J));}),_E,_);});};return new F(function(){return A1(_bZ,_c0);});},_c2=new T2(0,_9o,_bW),_c3=0,_c4=function(_c5,_c6,_){var _c7=B(A1(_c5,_)),_c8=B(A1(_c6,_));return _c7;},_c9=function(_ca,_cb,_){var _cc=B(A1(_ca,_)),_cd=B(A1(_cb,_));return new T(function(){return B(A1(_cc,_cd));});},_ce=function(_cf,_cg,_){var _ch=B(A1(_cg,_));return _cf;},_ci=function(_cj,_ck,_){var _cl=B(A1(_ck,_));return new T(function(){return B(A1(_cj,_cl));});},_cm=new T2(0,_ci,_ce),_cn=function(_co,_){return _co;},_cp=function(_cq,_cr,_){var _cs=B(A1(_cq,_));return new F(function(){return A1(_cr,_);});},_ct=new T5(0,_cm,_cn,_c9,_cp,_c4),_cu=new T(function(){return E(_b5);}),_cv=function(_cw){return new T6(0,_b8,_b9,_E,_cw,_b8,_b8);},_cx=function(_cy,_){var _cz=new T(function(){return B(A2(_6I,_cu,new T(function(){return B(A1(_cv,_cy));})));});return new F(function(){return die(_cz);});},_cA=function(_cB,_){return new F(function(){return _cx(_cB,_);});},_cC=function(_cD){return new F(function(){return A1(_cA,_cD);});},_cE=function(_cF,_cG,_){var _cH=B(A1(_cF,_));return new F(function(){return A2(_cG,_cH,_);});},_cI=new T5(0,_ct,_cE,_cp,_cn,_cC),_cJ=new T2(0,_cI,_bT),_cK="fileList",_cL=new T(function(){return eval("alert");}),_cM=function(_cN){return E(E(_cN).b);},_cO=function(_cP,_cQ){var _cR=function(_){var _cS=__app1(E(_cL),toJSStr(E(_cQ)));return new F(function(){return _O(_);});};return new F(function(){return A2(_cM,_cP,_cR);});},_cT=new T(function(){return eval("(function(c,p){p.appendChild(c);})");}),_cU=new T(function(){return eval("(function(e,p,v){e[p] = v;})");}),_cV=new T(function(){return B(unCStr("Filename.txt"));}),_cW=new T(function(){return B(unCStr("innerText"));}),_cX=new T(function(){return B(unCStr("li"));}),_cY="inputAmount",_cZ=function(_d0){return E(E(_d0).a);},_d1=function(_d2){return new F(function(){return fromJSStr(E(_d2));});},_d3=function(_d4){return E(E(_d4).a);},_d5=new T(function(){return eval("(function(e,p){var x = e[p];return typeof x === \'undefined\' ? \'\' : x.toString();})");}),_d6=function(_d7,_d8,_d9,_da){var _db=new T(function(){var _dc=function(_){var _dd=__app2(E(_d5),B(A2(_d3,_d7,_d9)),E(_da));return new T(function(){return String(_dd);});};return E(_dc);});return new F(function(){return A2(_cM,_d8,_db);});},_de=function(_df){return E(E(_df).d);},_dg=function(_dh,_di,_dj,_dk){var _dl=B(_cZ(_di)),_dm=new T(function(){return B(_de(_dl));}),_dn=function(_do){return new F(function(){return A1(_dm,new T(function(){return B(_d1(_do));}));});},_dp=new T(function(){return B(_d6(_dh,_di,_dj,new T(function(){return toJSStr(E(_dk));},1)));});return new F(function(){return A3(_99,_dl,_dp,_dn);});},_dq=new T(function(){return B(unCStr("value"));}),_dr=function(_ds){return new F(function(){return _dg(_bV,_9o,_ds,_dq);});},_dt=new T(function(){return eval("(function(id){return document.getElementById(id);})");}),_du=new T(function(){return B(unCStr(" found!"));}),_dv=function(_dw){return new F(function(){return err(B(unAppCStr("No element with ID ",new T(function(){return B(_p(fromJSStr(E(_dw)),_du));}))));});},_dx=function(_dy,_dz,_dA){var _dB=new T(function(){var _dC=function(_){var _dD=__app1(E(_dt),E(_dz)),_dE=__eq(_dD,E(_3d));return (E(_dE)==0)?new T1(1,_dD):_b8;};return B(A2(_cM,_dy,_dC));});return new F(function(){return A3(_99,B(_cZ(_dy)),_dB,function(_dF){var _dG=E(_dF);if(!_dG._){return new F(function(){return _dv(_dz);});}else{return new F(function(){return A1(_dA,_dG.a);});}});});},_dH=new T(function(){return B(_dx(_9o,_cY,_dr));}),_dI=new T(function(){return eval("(function(t){return document.createElement(t);})");}),_dJ=function(_dK){var _dL=new T(function(){return B(A1(_dH,_dK));}),_dM=function(_dN){var _dO=function(_){var _dP=E(_cX),_dQ=E(_dI),_dR=__app1(_dQ,toJSStr(_dP)),_dS=_dR,_dT=E(_cW),_dU=E(_cV),_dV=E(_cU),_dW=__app3(_dV,_dS,toJSStr(_dT),toJSStr(_dU)),_dX=B(A(_dx,[_cJ,_cK,function(_dY,_){var _dZ=__app2(E(_cT),_dS,E(_dY));return new F(function(){return _O(_);});},_])),_e0=function(_e1,_){while(1){var _e2=B((function(_e3,_){var _e4=E(_e3);if(!_e4){return _N;}else{var _e5=__app1(_dQ,toJSStr(_dP)),_e6=_e5,_e7=__app3(_dV,_e6,toJSStr(_dT),toJSStr(_dU)),_e8=B(A(_dx,[_cJ,_cK,function(_e9,_){var _ea=__app2(E(_cT),_e6,E(_e9));return new F(function(){return _O(_);});},_]));_e1=_e4-1|0;return __continue;}})(_e1,_));if(_e2!=__continue){return _e2;}}},_eb=B(_e0(2,_));return new T(function(){return B(A1(_dN,_eb));});},_ec=function(_ed){return E(new T1(0,_dO));};return new F(function(){return A1(_dL,function(_ee){return new F(function(){return A(_cO,[_9o,_ee,_dK,_ec]);});});});};return E(_dM);},_ef=function(_eg,_eh){return new F(function(){return _dJ(_eh);});},_ei=function(_ej){return E(E(_ej).a);},_ek=function(_el){return E(E(_el).b);},_em=function(_en){return E(E(_en).a);},_eo=function(_){return new F(function(){return nMV(_b8);});},_ep=new T(function(){return B(_8(_eo));}),_eq=new T(function(){return eval("(function(e,name,f){e.addEventListener(name,f,false);return [f];})");}),_er=function(_es){return E(E(_es).b);},_et=function(_eu,_ev,_ew,_ex,_ey,_ez){var _eA=B(_ei(_eu)),_eB=B(_cZ(_eA)),_eC=new T(function(){return B(_cM(_eA));}),_eD=new T(function(){return B(_de(_eB));}),_eE=new T(function(){return B(A2(_d3,_ev,_ex));}),_eF=new T(function(){return B(A2(_em,_ew,_ey));}),_eG=function(_eH){return new F(function(){return A1(_eD,new T3(0,_eF,_eE,_eH));});},_eI=function(_eJ){var _eK=new T(function(){var _eL=new T(function(){var _eM=__createJSFunc(2,function(_eN,_){var _eO=B(A2(E(_eJ),_eN,_));return _3d;}),_eP=_eM;return function(_){return new F(function(){return __app3(E(_eq),E(_eE),E(_eF),_eP);});};});return B(A1(_eC,_eL));});return new F(function(){return A3(_99,_eB,_eK,_eG);});},_eQ=new T(function(){var _eR=new T(function(){return B(_cM(_eA));}),_eS=function(_eT){var _eU=new T(function(){return B(A1(_eR,function(_){var _=wMV(E(_ep),new T1(1,_eT));return new F(function(){return A(_ek,[_ew,_ey,_eT,_]);});}));});return new F(function(){return A3(_99,_eB,_eU,_ez);});};return B(A2(_er,_eu,_eS));});return new F(function(){return A3(_99,_eB,_eQ,_eI);});},_eV=function(_eW){var _eX=new T(function(){return B(_et(_c2,_bV,_bQ,_eW,_c3,_ef));}),_eY=function(_eZ){var _f0=new T(function(){return B(A1(_eX,_eZ));}),_f1=function(_f2){var _f3=new T(function(){return B(A1(_f2,_N));});return new F(function(){return A1(_f0,function(_f4){return E(_f3);});});};return E(_f1);};return E(_eY);},_f5="button",_f6=new T(function(){return B(_dx(_9o,_f5,_eV));}),_f7=new T(function(){return B(unCStr("runApp is single-entry!"));}),_f8=new T(function(){return B(err(_f7));}),_f9=0,_fa=true,_fb=function(_fc){return new T2(0,_fa,_fc);},_fd=false,_fe=function(_){return new F(function(){return nMV(_fd);});},_ff=new T(function(){return B(_8(_fe));}),_fg=new T(function(){return B(unCStr("Prelude.undefined"));}),_fh=new T(function(){return B(err(_fg));}),_fi=function(_){var _fj=mMV(E(_ff),_fb);if(!E(_fj)){var _fk=B(_74(_f6,_86,_f9,_fh,_));return new F(function(){return A1(E(_fk).a,_);});}else{return E(_f8);}},_fl=function(_){return new F(function(){return _fi(_);});};
var hasteMain = function() {B(A(_fl, [0]));};window.onload = hasteMain;