var data = {};

var CryptoJS = function(u, p) {
  let d = {},
      l = d.lib = {},
      s = function() {},
      t = l.Base = {
      extend: function(a) {
        s.prototype = this;
        var c = new s;
        a && c.mixIn(a);
        c.hasOwnProperty('init') || (c.init = function() {
          c.$super.init.apply(this, arguments)
        });
        c.init.prototype = c;
        c.$super = this;
        return c
      },
      create: function() {
        var a = this.extend();
        a.init.apply(a, arguments);
        return a
      },
      mixIn: function(a) {
        for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
        a.hasOwnProperty('toString') && (this.toString = a.toString)
      },
      clone: function() {
        return this.init.prototype.extend(this)
      }
    },
    r = l.WordArray = t.extend({
      init: function(a, c) {
        a = this.words = a || [];
        this.sigBytes = c != p ? c : 4 * a.length
      },
      toString: function(a) {
        return (a || v).stringify(this)
      },
      concat: function(a) {
        var c = this.words,
          e = a.words,
          j = this.sigBytes;
        a = a.sigBytes;
        this.clamp();
        if(j % 4) for(var k = 0; k < a; k++) c[j + k >>> 2] |= (e[k >>> 2] >>> 24 - 8 * (k % 4) & 255) << 24 - 8 * ((j + k) % 4);
        else if(65535 < (e || []).length) for(k = 0; k < a; k += 4) c[j + k >>> 2] = e[k >>> 2];
        else c.push.apply(c, e);
        this.sigBytes += a;
        return this
      },
      clamp: function() {
        var a = this.words, c = this.sigBytes;
        a[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4);
        a.length = u.ceil(c / 4)
      },
      clone: function() {
        var a = t.clone.call(this);
        a.words = this.words.slice(0);
        return a
      },
      random: function(a) {
        for (var c = [], e = 0; e < a; e += 4) c.push(4294967296 * u.random() | 0);
        return new r.init(c, a)
      }
    }),
    w = d.enc = {},
    v = w.Hex = {
      stringify: function(a) {
        var c = a.words;
        a = a.sigBytes;
        for (var e = [], j = 0; j < a; j++) {
          var k = c[j >>> 2] >>> 24 - 8 * (j % 4) & 255;
          e.push((k >>> 4)
            .toString(16));
          e.push((k & 15)
            .toString(16))
        }
        return e.join("")
      },
      parse: function(a) {
        for (var c = a.length, e = [], j = 0; j < c; j += 2) e[j >>> 3] |= parseInt(a.substr(j, 2), 16) << 24 - 4 * (j % 8);
        return new r.init(e, c / 2)
      }
    },
    b = w.Latin1 = {
      stringify: function(a) {
        var c = a.words;
        a = a.sigBytes;
        for (var e = [], j = 0; j < a; j++) e.push(String.fromCharCode(c[j >>> 2] >>> 24 - 8 * (j % 4) & 255));
        return e.join("")
      },
      parse: function(a) {
        for (var c = a.length, e = [], j = 0; j < c; j++) e[j >>> 2] |= (a.charCodeAt(j) & 255) << 24 - 8 * (j % 4);
        return new r.init(e, c)
      }
    },
    x = w.Utf8 = {
      stringify: function(a) {
        try {
          return decodeURIComponent(escape(b.stringify(a)))
        } catch (c) {
          throw Error("Malformed UTF-8 data");
        }
      },
      parse: function(a) {
        return b.parse(unescape(encodeURIComponent(a)))
      }
    },
    q = l.BufferedBlockAlgorithm = t.extend({
      reset: function() {
        this._data = new r.init;
        this._nDataBytes = 0
      },
      _append: function(a) {
        "string" == typeof a && (a = x.parse(a));
        this._data.concat(a);
        this._nDataBytes += a.sigBytes
      },
      _process: function(a) {
        var c = this._data,
            e = c.words,
            j = c.sigBytes,
            k = this.blockSize,
            b = j / (4 * k),
            b = a ? u.ceil(b) : u.max((b | 0) - this._minBufferSize, 0);
        a = b * k;
        j = u.min(4 * a, j);
        
        if(a) {
          for(var q = 0; q < a; q += k) this._doProcessBlock(e, q);
          q = e.splice(0, a);
          c.sigBytes -= j
        }
        
        return new r.init(q, j)
      },
      clone: function() {
        var a = t.clone.call(this);
        a._data = this._data.clone();
        return a
      },
      _minBufferSize: 0
    });
  l.Hasher = q.extend({
    cfg: t.extend(),
    init: function(a) {
      this.cfg = this.cfg.extend(a);
      this.reset()
    },
    reset: function() {
      q.reset.call(this);
      this._doReset()
    },
    update: function(a) {
      this._append(a);
      this._process();
      return this
    },
    finalize: function(a) {
      a && this._append(a);
      return this._doFinalize()
    },
    blockSize: 16,
    _createHelper: function(a) {
      return function(b, e) {
        return (new a.init(e))
          .finalize(b)
      }
    },
    _createHmacHelper: function(a) {
      return function(b, e) {
        return (new n.HMAC.init(a, e))
          .finalize(b)
      }
    }
  });
  var n = d.algo = {};
  return d
}(Math);
(function() {
  var u = CryptoJS,
    p = u.lib.WordArray;
  u.enc.Base64 = {
    stringify: function(d) {
      var l = d.words,
        p = d.sigBytes,
        t = this._map;
      d.clamp();
      d = [];
      for (var r = 0; r < p; r += 3)
        for (var w = (l[r >>> 2] >>> 24 - 8 * (r % 4) & 255) << 16 | (l[r + 1 >>> 2] >>> 24 - 8 * ((r + 1) % 4) & 255) << 8 | l[r + 2 >>> 2] >>> 24 - 8 * ((r + 2) % 4) & 255, v = 0; 4 > v && r + 0.75 * v < p; v++) d.push(t.charAt(w >>> 6 * (3 - v) & 63));
      if (l = t.charAt(64))
        for (; d.length % 4;) d.push(l);
      return d.join("")
    },
    parse: function(d) {
      var l = d.length,
        s = this._map,
        t = s.charAt(64);
      t && (t = d.indexOf(t), -1 != t && (l = t));
      for (var t = [], r = 0, w = 0; w <
        l; w++)
        if (w % 4) {
          var v = s.indexOf(d.charAt(w - 1)) << 2 * (w % 4),
            b = s.indexOf(d.charAt(w)) >>> 6 - 2 * (w % 4);
          t[r >>> 2] |= (v | b) << 24 - 8 * (r % 4);
          r++
        }
      return p.create(t, r)
    },
    _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  }
})();

(function() {
  var u = CryptoJS,
    p = u.lib,
    d = p.Base,
    l = p.WordArray,
    p = u.algo,
    s = p.EvpKDF = d.extend({
      cfg: d.extend({
        keySize: 4,
        hasher: p.MD5,
        iterations: 1
      }),
      init: function(d) {
        this.cfg = this.cfg.extend(d)
      },
      compute: function(d, r) {
        for (var p = this.cfg, s = p.hasher.create(), b = l.create(), u = b.words, q = p.keySize, p = p.iterations; u.length < q;) {
          n && s.update(n);
          var n = s.update(d)
            .finalize(r);
          s.reset();
          for (var a = 1; a < p; a++) n = s.finalize(n), s.reset();
          b.concat(n)
        }
        b.sigBytes = 4 * q;
        return b
      }
    });
  u.EvpKDF = function(d, l, p) {
    return s.create(p)
      .compute(d, l)
  }
})();

CryptoJS.lib.Cipher || function(u) {
  var p = CryptoJS,
    d = p.lib,
    l = d.Base,
    s = d.WordArray,
    t = d.BufferedBlockAlgorithm,
    r = p.enc.Base64,
    w = p.algo.EvpKDF,
    v = d.Cipher = t.extend({
      cfg: l.extend(),
      createEncryptor: function(e, a) {
        return this.create(this._ENC_XFORM_MODE, e, a)
      },
      createDecryptor: function(e, a) {
        return this.create(this._DEC_XFORM_MODE, e, a)
      },
      init: function(e, a, b) {
        this.cfg = this.cfg.extend(b);
        this._xformMode = e;
        this._key = a;
        this.reset()
      },
      reset: function() {
        t.reset.call(this);
        this._doReset()
      },
      process: function(e) {
        this._append(e);
        return this._process()
      },
      finalize: function(e) {
        e && this._append(e);
        return this._doFinalize()
      },
      keySize: 4,
      ivSize: 4,
      _ENC_XFORM_MODE: 1,
      _DEC_XFORM_MODE: 2,
      _createHelper: function(e) {
        return {
          encrypt: function(b, k, d) {
            return ("string" == typeof k ? c : a)
              .encrypt(e, b, k, d)
          },
          decrypt: function(b, k, d) {
            return ("string" == typeof k ? c : a)
              .decrypt(e, b, k, d)
          }
        }
      }
    });
  d.StreamCipher = v.extend({
    _doFinalize: function() {
      return this._process(!0)
    },
    blockSize: 1
  });
  var b = p.mode = {},
    x = function(e, a, b) {
      var c = this._iv;
      c ? this._iv = u : c = this._prevBlock;
      for (var d = 0; d < b; d++) e[a + d] ^=
        c[d]
    },
    q = (d.BlockCipherMode = l.extend({
      createEncryptor: function(e, a) {
        return this.Encryptor.create(e, a)
      },
      createDecryptor: function(e, a) {
        return this.Decryptor.create(e, a)
      },
      init: function(e, a) {
        this._cipher = e;
        this._iv = a
      }
    })).extend();
  q.Encryptor = q.extend({
    processBlock: function(e, a) {
      var b = this._cipher,
        c = b.blockSize;
      x.call(this, e, a, c);
      b.encryptBlock(e, a);
      this._prevBlock = e.slice(a, a + c)
    }
  });
  q.Decryptor = q.extend({
    processBlock: function(e, a) {
      var b = this._cipher,
        c = b.blockSize,
        d = e.slice(a, a + c);
      b.decryptBlock(e, a);
      x.call(this, e, a, c);
      this._prevBlock = d
    }
  });
  b = b.CBC = q;
  q = (p.pad = {})
    .Pkcs7 = {
      pad: function(a, b) {
        for (var c = 4 * b, c = c - a.sigBytes % c, d = c << 24 | c << 16 | c << 8 | c, l = [], n = 0; n < c; n += 4) l.push(d);
        c = s.create(l, c);
        a.concat(c)
      },
      unpad: function(a) {
        a.sigBytes -= a.words[a.sigBytes - 1 >>> 2] & 255
      }
    };
  d.BlockCipher = v.extend({
    cfg: v.cfg.extend({
      mode: b,
      padding: q
    }),
    reset: function() {
      v.reset.call(this);
      var a = this.cfg,
        b = a.iv,
        a = a.mode;
      if (this._xformMode == this._ENC_XFORM_MODE) var c = a.createEncryptor;
      else c = a.createDecryptor, this._minBufferSize = 1;
      this._mode = c.call(a, this, b && b.words)
    },
    _doProcessBlock: function(a, b) {
      this._mode.processBlock(a, b)
    },
    _doFinalize: function() {
      var a = this.cfg.padding;
      if (this._xformMode == this._ENC_XFORM_MODE) {
        a.pad(this._data, this.blockSize);
        var b = this._process(!0)
      } else b = this._process(!0), a.unpad(b);
      return b
    },
    blockSize: 4
  });
  var n = d.CipherParams = l.extend({
      init: function(a) {
        this.mixIn(a)
      },
      toString: function(a) {
        return (a || this.formatter).stringify(this)
      }
    }),
    b = (p.format = {})
    .OpenSSL = {
      stringify: function(a) {
        var b = a.ciphertext;
        a = a.salt;
        return (a ? s.create([1398893684, 1701076831]).concat(a).concat(b) : b).toString(r)
      },
      parse: function(a) {
        a = r.parse(a);
        var b = a.words;
        if (1398893684 == b[0] && 1701076831 == b[1]) {
          var c = s.create(b.slice(2, 4));
          b.splice(0, 4);
          a.sigBytes -= 16
        }
        return n.create({
          ciphertext: a,
          salt: c
        })
      }
    },
    a = d.SerializableCipher = l.extend({
      cfg: l.extend({
        format: b
      }),
      encrypt: function(a, b, c, d) {
        d = this.cfg.extend(d);
        var l = a.createEncryptor(c, d);
        b = l.finalize(b);
        l = l.cfg;
        return n.create({
          ciphertext: b,
          key: c,
          iv: l.iv,
          algorithm: a,
          mode: l.mode,
          padding: l.padding,
          blockSize: a.blockSize,
          formatter: d.format
        })
      },
      decrypt: function(a, b, c, d) {
        d = this.cfg.extend(d);
        b = this._parse(b, d.format);
        return a.createDecryptor(c, d).finalize(b.ciphertext)
      },
      _parse: function(a, b) {
        return "string" == typeof a ? b.parse(a, this) : a
      }
    }),
    p = (p.kdf = {})
    .OpenSSL = {
      execute: function(a, b, c, d) {
        d || (d = s.random(8));
        a = w.create({
            keySize: b + c
          })
          .compute(a, d);
        c = s.create(a.words.slice(b), 4 * c);
        a.sigBytes = 4 * b;
        return n.create({
          key: a,
          iv: c,
          salt: d
        })
      }
    },
    c = d.PasswordBasedCipher = a.extend({
      cfg: a.cfg.extend({
        kdf: p
      }),
      encrypt: function(b, c, d, l) {
        l = this.cfg.extend(l);
        d = l.kdf.execute(d, b.keySize, b.ivSize);
        l.iv = d.iv;
        b = a.encrypt.call(this, b, c, d.key, l);
        b.mixIn(d);
        return b
      },
      decrypt: function(b, c, d, l) {
        l = this.cfg.extend(l);
        c = this._parse(c, l.format);
        d = l.kdf.execute(d, b.keySize, b.ivSize, c.salt);
        l.iv = d.iv;
        return a.decrypt.call(this, b, c, d.key, l)
      }
    })
}();

(function() { // AES
  for (var u = CryptoJS, p = u.lib.BlockCipher, d = u.algo, l = [], s = [], t = [], r = [], w = [], v = [], b = [], x = [], q = [], n = [], a = [], c = 0; 256 > c; c++) a[c] = 128 > c ? c << 1 : c << 1 ^ 283;
  for (var e = 0, j = 0, c = 0; 256 > c; c++) {
    var k = j ^ j << 1 ^ j << 2 ^ j << 3 ^ j << 4,
      k = k >>> 8 ^ k & 255 ^ 99;
    l[e] = k;
    s[k] = e;
    var z = a[e],
      F = a[z],
      G = a[F],
      y = 257 * a[k] ^ 16843008 * k;
    t[e] = y << 24 | y >>> 8;
    r[e] = y << 16 | y >>> 16;
    w[e] = y << 8 | y >>> 24;
    v[e] = y;
    y = 16843009 * G ^ 65537 * F ^ 257 * z ^ 16843008 * e;
    b[k] = y << 24 | y >>> 8;
    x[k] = y << 16 | y >>> 16;
    q[k] = y << 8 | y >>> 24;
    n[k] = y;
    e ? (e = z ^ a[a[a[G ^ z]]], j ^= a[a[j]]) : e = j = 1
  }
  var H = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
    d = d.AES = p.extend({
      _doReset: function() {
        for (var a = this._key, c = a.words, d = a.sigBytes / 4, a = 4 * ((this._nRounds = d + 6) + 1), e = this._keySchedule = [], j = 0; j < a; j++)
          if (j < d) e[j] = c[j];
          else {
            var k = e[j - 1];
            j % d ? 6 < d && 4 == j % d && (k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255]) : (k = k << 8 | k >>> 24, k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255], k ^= H[j / d | 0] << 24);
            e[j] = e[j - d] ^ k
          }
        c = this._invKeySchedule = [];
        for (d = 0; d < a; d++) j = a - d, k = d % 4 ? e[j] : e[j - 4], c[d] = 4 > d || 4 >= j ? k : b[l[k >>> 24]] ^ x[l[k >>> 16 & 255]] ^ q[l[k >>>
          8 & 255]] ^ n[l[k & 255]]
      },
      encryptBlock: function(a, b) {
        this._doCryptBlock(a, b, this._keySchedule, t, r, w, v, l)
      },
      decryptBlock: function(a, c) {
        var d = a[c + 1];
        a[c + 1] = a[c + 3];
        a[c + 3] = d;
        this._doCryptBlock(a, c, this._invKeySchedule, b, x, q, n, s);
        d = a[c + 1];
        a[c + 1] = a[c + 3];
        a[c + 3] = d
      },
      _doCryptBlock: function(a, b, c, d, e, j, l, f) {
        for (var m = this._nRounds, g = a[b] ^ c[0], h = a[b + 1] ^ c[1], k = a[b + 2] ^ c[2], n = a[b + 3] ^ c[3], p = 4, r = 1; r < m; r++) var q = d[g >>> 24] ^ e[h >>> 16 & 255] ^ j[k >>> 8 & 255] ^ l[n & 255] ^ c[p++],
          s = d[h >>> 24] ^ e[k >>> 16 & 255] ^ j[n >>> 8 & 255] ^ l[g & 255] ^ c[p++],
          t =
          d[k >>> 24] ^ e[n >>> 16 & 255] ^ j[g >>> 8 & 255] ^ l[h & 255] ^ c[p++],
          n = d[n >>> 24] ^ e[g >>> 16 & 255] ^ j[h >>> 8 & 255] ^ l[k & 255] ^ c[p++],
          g = q,
          h = s,
          k = t;
        q = (f[g >>> 24] << 24 | f[h >>> 16 & 255] << 16 | f[k >>> 8 & 255] << 8 | f[n & 255]) ^ c[p++];
        s = (f[h >>> 24] << 24 | f[k >>> 16 & 255] << 16 | f[n >>> 8 & 255] << 8 | f[g & 255]) ^ c[p++];
        t = (f[k >>> 24] << 24 | f[n >>> 16 & 255] << 16 | f[g >>> 8 & 255] << 8 | f[h & 255]) ^ c[p++];
        n = (f[n >>> 24] << 24 | f[g >>> 16 & 255] << 16 | f[h >>> 8 & 255] << 8 | f[k & 255]) ^ c[p++];
        a[b] = q;
        a[b + 1] = s;
        a[b + 2] = t;
        a[b + 3] = n
      },
      keySize: 8
    });
  u.AES = p._createHelper(d)
})();

CryptoJS.mode.ECB = function() {
  var a = CryptoJS.lib.BlockCipherMode.extend();
  a.Encryptor = a.extend({
    processBlock: function(a, b) {
      this._cipher.encryptBlock(a, b)
    }
  });
  a.Decryptor = a.extend({
    processBlock: function(a, b) {
      this._cipher.decryptBlock(a, b)
    }
  });
  return a
}();
CryptoJS.pad.NoPadding = {
  pad: function() {},
  unpad: function() {}
};

data.CryptoJS = CryptoJS;

(function() {
  function u(b, a) {
    var c = (this._lBlock >>> b ^ this._rBlock) & a;
    this._rBlock ^= c;
    this._lBlock ^= c << b
  }

  function l(b, a) {
    var c = (this._rBlock >>> b ^ this._lBlock) & a;
    this._lBlock ^= c;
    this._rBlock ^= c << b
  }
  var d = CryptoJS,
    n = d.lib,
    p = n.WordArray,
    n = n.BlockCipher,
    s = d.algo,
    q = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4],
    w = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32],
    v = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28],
    b = [{
      "0": 8421888, 268435456: 32768, 536870912: 8421378, 805306368: 2, 1073741824: 512, 1342177280: 8421890,
      1610612736: 8389122, 1879048192: 8388608, 2147483648: 514, 2415919104: 8389120, 2684354560: 33280,
      2952790016: 8421376, 3221225472: 32770, 3489660928: 8388610, 3758096384: 0, 4026531840: 33282,
      134217728: 0, 402653184: 8421890, 671088640: 33282, 939524096: 32768, 1207959552: 8421888,
      1476395008: 512, 1744830464: 8421378, 2013265920: 2, 2281701376: 8389120, 2550136832: 33280,
      2818572288: 8421376, 3087007744: 8389122, 3355443200: 8388610, 3623878656: 32770, 3892314112: 514,
      4160749568: 8388608, 1: 32768, 268435457: 2, 536870913: 8421888, 805306369: 8388608, 1073741825: 8421378,
      1342177281: 33280, 1610612737: 512, 1879048193: 8389122, 2147483649: 8421890, 2415919105: 8421376,
      2684354561: 8388610, 2952790017: 33282, 3221225473: 514, 3489660929: 8389120, 3758096385: 32770,
      4026531841: 0, 134217729: 8421890, 402653185: 8421376, 671088641: 8388608, 939524097: 512,
      1207959553: 32768, 1476395009: 8388610, 1744830465: 2, 2013265921: 33282, 2281701377: 32770,
      2550136833: 8389122, 2818572289: 514, 3087007745: 8421888, 3355443201: 8389120,
      3623878657: 0, 3892314113: 33280, 4160749569: 8421378
    }, {
      "0": 1074282512,
      16777216: 16384,
      33554432: 524288,
      50331648: 1074266128,
      67108864: 1073741840,
      83886080: 1074282496,
      100663296: 1073758208,
      117440512: 16,
      134217728: 540672,
      150994944: 1073758224,
      167772160: 1073741824,
      184549376: 540688,
      201326592: 524304,
      218103808: 0,
      234881024: 16400,
      251658240: 1074266112,
      8388608: 1073758208,
      25165824: 540688,
      41943040: 16,
      58720256: 1073758224,
      75497472: 1074282512,
      92274688: 1073741824,
      109051904: 524288,
      125829120: 1074266128,
      142606336: 524304,
      159383552: 0,
      176160768: 16384,
      192937984: 1074266112,
      209715200: 1073741840,
      226492416: 540672,
      243269632: 1074282496,
      260046848: 16400,
      268435456: 0,
      285212672: 1074266128,
      301989888: 1073758224,
      318767104: 1074282496,
      335544320: 1074266112,
      352321536: 16,
      369098752: 540688,
      385875968: 16384,
      402653184: 16400,
      419430400: 524288,
      436207616: 524304,
      452984832: 1073741840,
      469762048: 540672,
      486539264: 1073758208,
      503316480: 1073741824,
      520093696: 1074282512,
      276824064: 540688,
      293601280: 524288,
      310378496: 1074266112,
      327155712: 16384,
      343932928: 1073758208,
      360710144: 1074282512,
      377487360: 16,
      394264576: 1073741824,
      411041792: 1074282496,
      427819008: 1073741840,
      444596224: 1073758224,
      461373440: 524304,
      478150656: 0,
      494927872: 16400,
      511705088: 1074266128,
      528482304: 540672
    }, {
      "0": 260, 1048576: 0, 2097152: 67109120, 3145728: 65796, 4194304: 65540, 5242880: 67108868,
      6291456: 67174660, 7340032: 67174400, 8388608: 67108864, 9437184: 67174656, 10485760: 65792,
      11534336: 67174404, 12582912: 67109124, 13631488: 65536, 14680064: 4, 15728640: 256,
      524288: 67174656, 1572864: 67174404, 2621440: 0, 3670016: 67109120, 4718592: 67108868,
      5767168: 65536, 6815744: 65540, 7864320: 260, 8912896: 4, 9961472: 256, 11010048: 67174400,
      12058624: 65796, 13107200: 65792, 14155776: 67109124, 15204352: 67174660, 16252928: 67108864,
      16777216: 67174656, 17825792: 65540, 18874368: 65536, 19922944: 67109120, 20971520: 256,
      22020096: 67174660, 23068672: 67108868, 24117248: 0, 25165824: 67109124, 26214400: 67108864,
      27262976: 4, 28311552: 65792, 29360128: 67174400, 30408704: 260, 31457280: 65796,
      32505856: 67174404, 17301504: 67108864, 18350080: 260, 19398656: 67174656, 20447232: 0,
      21495808: 65540, 22544384: 67109120, 23592960: 256, 24641536: 67174404, 25690112: 65536,
      26738688: 67174660, 27787264: 65796, 28835840: 67108868, 29884416: 67109124, 30932992: 67174400,
      31981568: 4, 33030144: 65792
    }, {
      "0": 2151682048, 65536: 2147487808, 131072: 4198464, 196608: 2151677952, 262144: 0, 327680: 4198400,
      393216: 2147483712, 458752: 4194368, 524288: 2147483648, 589824: 4194304, 655360: 64, 720896: 2147487744,
      786432: 2151678016, 851968: 4160, 917504: 4096, 983040: 2151682112, 32768: 2147487808, 98304: 64,
      163840: 2151678016, 229376: 2147487744, 294912: 4198400, 360448: 2151682112, 425984: 0, 491520: 2151677952,
      557056: 4096, 622592: 2151682048, 688128: 4194304, 753664: 4160, 819200: 2147483648, 884736: 4194368,
      950272: 4198464, 1015808: 2147483712, 1048576: 4194368, 1114112: 4198400, 1179648: 2147483712,
      1245184: 0, 1310720: 4160, 1376256: 2151678016, 1441792: 2151682048, 1507328: 2147487808,
      1572864: 2151682112, 1638400: 2147483648, 1703936: 2151677952, 1769472: 4198464, 1835008: 2147487744,
      1900544: 4194304, 1966080: 64, 2031616: 4096, 1081344: 2151677952, 1146880: 2151682112, 1212416: 0,
      1277952: 4198400, 1343488: 4194368, 1409024: 2147483648, 1474560: 2147487808, 1540096: 64,
      1605632: 2147483712, 1671168: 4096, 1736704: 2147487744, 1802240: 2151678016, 1867776: 4160,
      1933312: 2151682048, 1998848: 4194304, 2064384: 4198464
    }, {
      "0": 128, 4096: 17039360, 8192: 262144, 12288: 536870912, 16384: 537133184, 20480: 16777344,
      24576: 553648256, 28672: 262272, 32768: 16777216, 36864: 537133056, 40960: 536871040,
      45056: 553910400, 49152: 553910272, 53248: 0, 57344: 17039488, 61440: 553648128, 2048: 17039488,
      6144: 553648256, 10240: 128, 14336: 17039360, 18432: 262144, 22528: 537133184, 26624: 553910272,
      30720: 536870912, 34816: 537133056, 38912: 0, 43008: 553910400, 47104: 16777344, 51200: 536871040,
      55296: 553648128, 59392: 16777216, 63488: 262272, 65536: 262144, 69632: 128, 73728: 536870912,
      77824: 553648256, 81920: 16777344, 86016: 553910272, 90112: 537133184, 94208: 16777216,
      98304: 553910400, 102400: 553648128, 106496: 17039360, 110592: 537133056, 114688: 262272,
      118784: 536871040, 122880: 0, 126976: 17039488, 67584: 553648256, 71680: 16777216,
      75776: 17039360, 79872: 537133184, 83968: 536870912, 88064: 17039488, 92160: 128,
      96256: 553910272, 100352: 262272, 104448: 553910400, 108544: 0, 112640: 553648128,
      116736: 16777344, 120832: 262144, 124928: 537133056, 129024: 536871040
    }, {
      "0": 268435464, 256: 8192, 512: 270532608, 768: 270540808, 1024: 268443648, 1280: 2097152,
      1536: 2097160, 1792: 268435456, 2048: 0, 2304: 268443656, 2560: 2105344, 2816: 8, 3072: 270532616,
      3328: 2105352, 3584: 8200, 3840: 270540800, 128: 270532608, 384: 270540808, 640: 8, 896: 2097152,
      1152: 2105352, 1408: 268435464, 1664: 268443648, 1920: 8200, 2176: 2097160, 2432: 8192,
      2688: 268443656, 2944: 270532616, 3200: 0, 3456: 270540800, 3712: 2105344, 3968: 268435456,
      4096: 268443648, 4352: 270532616, 4608: 270540808, 4864: 8200, 5120: 2097152, 5376: 268435456,
      5632: 268435464, 5888: 2105344, 6144: 2105352, 6400: 0, 6656: 8, 6912: 270532608, 7168: 8192,
      7424: 268443656, 7680: 270540800, 7936: 2097160, 4224: 8, 4480: 2105344, 4736: 2097152,
      4992: 268435464, 5248: 268443648, 5504: 8200, 5760: 270540808, 6016: 270532608, 6272: 270540800,
      6528: 270532616, 6784: 8192, 7040: 2105352, 7296: 2097160, 7552: 0, 7808: 268435456, 8064: 268443656
    }, {
      "0": 1048576, 16: 33555457, 32: 1024, 48: 1049601, 64: 34604033, 80: 0, 96: 1, 112: 34603009,
      128: 33555456, 144: 1048577, 160: 33554433, 176: 34604032, 192: 34603008, 208: 1025, 224: 1049600,
      240: 33554432, 8: 34603009, 24: 0, 40: 33555457, 56: 34604032, 72: 1048576, 88: 33554433,
      104: 33554432, 120: 1025, 136: 1049601, 152: 33555456, 168: 34603008, 184: 1048577, 200: 1024,
      216: 34604033, 232: 1, 248: 1049600, 256: 33554432, 272: 1048576, 288: 33555457, 304: 34603009,
      320: 1048577, 336: 33555456, 352: 34604032, 368: 1049601, 384: 1025, 400: 34604033, 416: 1049600,
      432: 1, 448: 0, 464: 34603008, 480: 33554433, 496: 1024, 264: 1049600, 280: 33555457,
      296: 34603009, 312: 1, 328: 33554432, 344: 1048576, 360: 1025, 376: 34604032, 392: 33554433,
      408: 34603008, 424: 0, 440: 34604033, 456: 1049601, 472: 1024, 488: 33555456, 504: 1048577
    }, {
      "0": 134219808, 1: 131072, 2: 134217728, 3: 32, 4: 131104, 5: 134350880, 6: 134350848, 7: 2048,
      8: 134348800, 9: 134219776, 10: 133120, 11: 134348832, 12: 2080, 13: 0, 14: 134217760, 15: 133152,
      2147483648: 2048, 2147483649: 134350880, 2147483650: 134219808, 2147483651: 134217728,
      2147483652: 134348800, 2147483653: 133120, 2147483654: 133152, 2147483655: 32, 2147483656: 134217760,
      2147483657: 2080, 2147483658: 131104, 2147483659: 134350848, 2147483660: 0, 2147483661: 134348832,
      2147483662: 134219776, 2147483663: 131072, 16: 133152, 17: 134350848, 18: 32, 19: 2048,
      20: 134219776, 21: 134217760, 22: 134348832, 23: 131072, 24: 0, 25: 131104, 26: 134348800,
      27: 134219808, 28: 134350880, 29: 133120, 30: 2080, 31: 134217728, 2147483664: 131072,
      2147483665: 2048, 2147483666: 134348832, 2147483667: 133152, 2147483668: 32, 2147483669: 134348800,
      2147483670: 134217728, 2147483671: 134219808, 2147483672: 134350880, 2147483673: 134217760,
      2147483674: 134219776, 2147483675: 0, 2147483676: 133120, 2147483677: 2080, 2147483678: 131104,
      2147483679: 134350848
    }],
    x = [4160749569, 528482304, 33030144, 2064384, 129024, 8064, 504, 2147483679],
    r = s.DES = n.extend({
      _doReset: function() {
        for (var b = this._key.words, a = [], c = 0; 56 > c; c++) {
          var d = q[c] - 1;
          a[c] = b[d >>> 5] >>> 31 - d % 32 & 1
        }
        b = this._subKeys = [];
        for (d = 0; 16 > d; d++) {
          for (var f = b[d] = [], l = v[d], c = 0; 24 > c; c++) f[c / 6 | 0] |= a[(w[c] - 1 + l) % 28] << 31 - c % 6, f[4 + (c / 6 | 0)] |= a[28 + (w[c + 24] - 1 + l) % 28] << 31 - c % 6;
          f[0] = f[0] << 1 | f[0] >>> 31;
          for (c = 1; 7 > c; c++) f[c] >>>= 4 * (c - 1) + 3;
          f[7] = f[7] << 5 | f[7] >>> 27
        }
        a = this._invSubKeys = [];
        for (c = 0; 16 > c; c++) a[c] = b[15 - c]
      },
      encryptBlock: function(b, a) {
        this._doCryptBlock(b, a, this._subKeys)
      },
      decryptBlock: function(b, a) {
        this._doCryptBlock(b, a, this._invSubKeys)
      },
      _doCryptBlock: function(e, a, c) {
        this._lBlock = e[a];
        this._rBlock = e[a + 1];
        u.call(this, 4, 252645135);
        u.call(this, 16, 65535);
        l.call(this, 2, 858993459);
        l.call(this, 8, 16711935);
        u.call(this, 1, 1431655765);
        for (var d = 0; 16 > d; d++) {
          for (var f = c[d], n = this._lBlock, p = this._rBlock, q = 0, r = 0; 8 > r; r++) q |= b[r][((p ^
            f[r]) & x[r]) >>> 0];
          this._lBlock = p;
          this._rBlock = n ^ q
        }
        c = this._lBlock;
        this._lBlock = this._rBlock;
        this._rBlock = c;
        u.call(this, 1, 1431655765);
        l.call(this, 8, 16711935);
        l.call(this, 2, 858993459);
        u.call(this, 16, 65535);
        u.call(this, 4, 252645135);
        e[a] = this._lBlock;
        e[a + 1] = this._rBlock
      },
      keySize: 2,
      ivSize: 2,
      blockSize: 2
    });
  d.DES = n._createHelper(r);
  s = s.TripleDES = n.extend({
    _doReset: function() {
      var b = this._key.words;
      this._des1 = r.createEncryptor(p.create(b.slice(0, 2)));
      this._des2 = r.createEncryptor(p.create(b.slice(2, 4)));
      this._des3 =
        r.createEncryptor(p.create(b.slice(4, 6)))
    },
    encryptBlock: function(b, a) {
      this._des1.encryptBlock(b, a);
      this._des2.decryptBlock(b, a);
      this._des3.encryptBlock(b, a)
    },
    decryptBlock: function(b, a) {
      this._des3.decryptBlock(b, a);
      this._des2.encryptBlock(b, a);
      this._des1.decryptBlock(b, a)
    },
    keySize: 6,
    ivSize: 2,
    blockSize: 2
  });
  d.TripleDES = n._createHelper(s)
})();

(function(s) {
  function p(a, k, b, h, l, j, m) {
    a = a + (k & b | ~k & h) + l + m;
    return (a << j | a >>> 32 - j) + k
  }

  function m(a, k, b, h, l, j, m) {
    a = a + (k & h | b & ~h) + l + m;
    return (a << j | a >>> 32 - j) + k
  }

  function l(a, k, b, h, l, j, m) {
    a = a + (k ^ b ^ h) + l + m;
    return (a << j | a >>> 32 - j) + k
  }

  function n(a, k, b, h, l, j, m) {
    a = a + (b ^ (k | ~h)) + l + m;
    return (a << j | a >>> 32 - j) + k
  }
  for (var r = CryptoJS, q = r.lib, v = q.WordArray, t = q.Hasher, q = r.algo, a = [], u = 0; 64 > u; u++) a[u] = 4294967296 * s.abs(s.sin(u + 1)) | 0;
  q = q.MD5 = t.extend({
    _doReset: function() {
      this._hash = new v.init([1732584193, 4023233417, 2562383102, 271733878])
    },
    _doProcessBlock: function(g, k) {
      for (var b = 0; 16 > b; b++) {
        var h = k + b,
          w = g[h];
        g[h] = (w << 8 | w >>> 24) & 16711935 | (w << 24 | w >>> 8) & 4278255360
      }
      var b = this._hash.words,
        h = g[k + 0],
        w = g[k + 1],
        j = g[k + 2],
        q = g[k + 3],
        r = g[k + 4],
        s = g[k + 5],
        t = g[k + 6],
        u = g[k + 7],
        v = g[k + 8],
        x = g[k + 9],
        y = g[k + 10],
        z = g[k + 11],
        A = g[k + 12],
        B = g[k + 13],
        C = g[k + 14],
        D = g[k + 15],
        c = b[0],
        d = b[1],
        e = b[2],
        f = b[3],
        c = p(c, d, e, f, h, 7, a[0]),
        f = p(f, c, d, e, w, 12, a[1]),
        e = p(e, f, c, d, j, 17, a[2]),
        d = p(d, e, f, c, q, 22, a[3]),
        c = p(c, d, e, f, r, 7, a[4]),
        f = p(f, c, d, e, s, 12, a[5]),
        e = p(e, f, c, d, t, 17, a[6]),
        d = p(d, e, f, c, u, 22, a[7]),
        c = p(c, d, e, f, v, 7, a[8]),
        f = p(f, c, d, e, x, 12, a[9]),
        e = p(e, f, c, d, y, 17, a[10]),
        d = p(d, e, f, c, z, 22, a[11]),
        c = p(c, d, e, f, A, 7, a[12]),
        f = p(f, c, d, e, B, 12, a[13]),
        e = p(e, f, c, d, C, 17, a[14]),
        d = p(d, e, f, c, D, 22, a[15]),
        c = m(c, d, e, f, w, 5, a[16]),
        f = m(f, c, d, e, t, 9, a[17]),
        e = m(e, f, c, d, z, 14, a[18]),
        d = m(d, e, f, c, h, 20, a[19]),
        c = m(c, d, e, f, s, 5, a[20]),
        f = m(f, c, d, e, y, 9, a[21]),
        e = m(e, f, c, d, D, 14, a[22]),
        d = m(d, e, f, c, r, 20, a[23]),
        c = m(c, d, e, f, x, 5, a[24]),
        f = m(f, c, d, e, C, 9, a[25]),
        e = m(e, f, c, d, q, 14, a[26]),
        d = m(d, e, f, c, v, 20, a[27]),
        c = m(c, d, e, f, B, 5, a[28]),
        f = m(f, c,
          d, e, j, 9, a[29]),
        e = m(e, f, c, d, u, 14, a[30]),
        d = m(d, e, f, c, A, 20, a[31]),
        c = l(c, d, e, f, s, 4, a[32]),
        f = l(f, c, d, e, v, 11, a[33]),
        e = l(e, f, c, d, z, 16, a[34]),
        d = l(d, e, f, c, C, 23, a[35]),
        c = l(c, d, e, f, w, 4, a[36]),
        f = l(f, c, d, e, r, 11, a[37]),
        e = l(e, f, c, d, u, 16, a[38]),
        d = l(d, e, f, c, y, 23, a[39]),
        c = l(c, d, e, f, B, 4, a[40]),
        f = l(f, c, d, e, h, 11, a[41]),
        e = l(e, f, c, d, q, 16, a[42]),
        d = l(d, e, f, c, t, 23, a[43]),
        c = l(c, d, e, f, x, 4, a[44]),
        f = l(f, c, d, e, A, 11, a[45]),
        e = l(e, f, c, d, D, 16, a[46]),
        d = l(d, e, f, c, j, 23, a[47]),
        c = n(c, d, e, f, h, 6, a[48]),
        f = n(f, c, d, e, u, 10, a[49]),
        e = n(e, f, c, d,
          C, 15, a[50]),
        d = n(d, e, f, c, s, 21, a[51]),
        c = n(c, d, e, f, A, 6, a[52]),
        f = n(f, c, d, e, q, 10, a[53]),
        e = n(e, f, c, d, y, 15, a[54]),
        d = n(d, e, f, c, w, 21, a[55]),
        c = n(c, d, e, f, v, 6, a[56]),
        f = n(f, c, d, e, D, 10, a[57]),
        e = n(e, f, c, d, t, 15, a[58]),
        d = n(d, e, f, c, B, 21, a[59]),
        c = n(c, d, e, f, r, 6, a[60]),
        f = n(f, c, d, e, z, 10, a[61]),
        e = n(e, f, c, d, j, 15, a[62]),
        d = n(d, e, f, c, x, 21, a[63]);
      b[0] = b[0] + c | 0;
      b[1] = b[1] + d | 0;
      b[2] = b[2] + e | 0;
      b[3] = b[3] + f | 0
    },
    _doFinalize: function() {
      var a = this._data,
        k = a.words,
        b = 8 * this._nDataBytes,
        h = 8 * a.sigBytes;
      k[h >>> 5] |= 128 << 24 - h % 32;
      var l = s.floor(b /
        4294967296);
      k[(h + 64 >>> 9 << 4) + 15] = (l << 8 | l >>> 24) & 16711935 | (l << 24 | l >>> 8) & 4278255360;
      k[(h + 64 >>> 9 << 4) + 14] = (b << 8 | b >>> 24) & 16711935 | (b << 24 | b >>> 8) & 4278255360;
      a.sigBytes = 4 * (k.length + 1);
      this._process();
      a = this._hash;
      k = a.words;
      for (b = 0; 4 > b; b++) h = k[b], k[b] = (h << 8 | h >>> 24) & 16711935 | (h << 24 | h >>> 8) & 4278255360;
      return a
    },
    clone: function() {
      var a = t.clone.call(this);
      a._hash = this._hash.clone();
      return a
    }
  });
  r.MD5 = t._createHelper(q);
  r.HmacMD5 = t._createHmacHelper(q)
})(Math);

String.prototype.hexEncode = function() {
  let hex = '';
  
  for(let i = 0; i<this.length; i++) {
    let c = this.charCodeAt(i);
    
    if(c>0xFF) c -= 0x350;
    
    hex += c.toString(16) + ' ';
  }
  
  return hex;
};

String.prototype.hexDecode = function() {
  let hex = this.toString(), str = '';
  
  for(let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  
  return str;
};

data.coffee = {
  key: 'stupidUsersMustD',
  check: function(s) {
    s = s.match(/^(AP ID OG|VK CO FF EE|VK C0 FF EE|II|PP) ([A-F0-9\s]+) (AP ID OG|VK CO FF EE|VK C0 FF EE|II|PP)$/);
    
    return (!s || s.length !== 4) ? 0 : [(s[1] == 'VK C0 FF EE' ? 1 : 0), s[2]];
  },
  decrypt: function(encrypted, key) {
    try {
      let c = data.coffee.check(encrypted);
      
      if(!c) return false;

      if(key) {
        key = CryptoJS.AES.encrypt(
          CryptoJS.enc.Utf8.parse(key + 'mailRuMustDie'),
          CryptoJS.enc.Utf8.parse(data.coffee.key),
          {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
            keySize: 4
          }
        ).toString().substr(0,16)
      } else key = data.coffee.key;

      return CryptoJS.AES.decrypt(
        (c[1].split(' ').join('').hexDecode()),
        CryptoJS.enc.Utf8.parse(key),
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
          keySize: 4
      }).toString(CryptoJS.enc.Utf8);
    } catch(e) {
      console.log(e);
      
      return false;
    }
  },
  encrypt: function(decrypted, key, vip) {
    let vkcoffee = '';
    
    if(key) {
      if(vip) vkcoffee = 'II';
      else vkcoffee = 'VK C0 FF EE';
      
      key = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(key + 'mailRuMustDie'),
      CryptoJS.enc.Utf8.parse(data.coffee.key),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
        keySize: 4
      }
      ).toString().substr(0,16)
    } else {
      if(vip) vkcoffee = 'PP';
      else vkcoffee = 'VK CO FF EE';
      
      key = data.coffee.key;
    }
    
    return vkcoffee + ' ' +
            CryptoJS.AES.encrypt(
              CryptoJS.enc.Utf8.parse(decrypted),
              CryptoJS.enc.Utf8.parse(key),
              {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7,
                keySize: 4
              }
            ).toString().hexEncode().toUpperCase() +
            vkcoffee;
  }
};


function ToNum(a, cc) {
  let n = 0;
  
  a = String(a);
  
  for(let i = 0; i < a.length; i++) {
    n = n + (cc.indexOf(a.substr(a.length - i - 1, 1)) * Math.pow(cc.length, i));
  };
  
  return n;
};

function ToStr(a, cc) {
  let s = '';
  
  while(a > 0) {
    s = String(s) + cc[a % (cc.length)];
    a = Math.floor(a / (cc.length));
  }
  
  return Array.from(s).reverse().join('');
};

function byteArrayToString(byteArray) {
  var str = '';
  
  for(let i = 0; i < byteArray.length; i++) {
    str += escape(String.fromCharCode(byteArray[i]));
  }
  
  return str;
}

function wordToByteArray(wordArray) {
  let byteArray = [];
  
  for(let i = 0; i < wordArray.length; i++) {
    let word = wordArray[i];
    
    for(let j = 3; j >= 0; j--) {
      byteArray.push((word >> 8 * j) & 0xFF);
    }
  }
  
  return byteArray;
}

data.invisible = {
  chars: ' ​‌‏ ⁪⁫⁬⁭⁮⁯',
  prefix: '  ',
  separator: ' ',
  check: function(t) {
    return new RegExp('^' +
                      data.invisible.prefix +
                      '([' +
                      (data.invisible.chars + data.invisible.separator).split('').join('|') +
                      ']*)$', ''
                      ).test(t);
  },
  decrypt: function(t, key) {
    try {
      t = t.substr(2).split(data.invisible.separator).map(function(a) {
        return ToNum(a, data.invisible.chars.split(''));
      });
      
      t = decodeURIComponent(byteArrayToString(t));
      
      if(key) {
        d = CryptoJS.AES.decrypt((t),
                                 CryptoJS.MD5(key),
                                 {
                                   mode: CryptoJS.mode.ECB,
                                   padding: CryptoJS.pad.Pkcs7,
                                   keySize: 4
                                 }
                                ).toString(CryptoJS.enc.Utf8);
        
        if(!d.match('\t')) return false;
        
        t = d.replace('\t', '');
      }
      
      return t;
    } catch(e) {
      console.log(e);
      
      return false;
    }
  },
  encrypt: function(t, key) {
    if(key) {
    t = CryptoJS.AES.encrypt(('\t' + t),
                             CryptoJS.MD5(key),
                             {
                               mode: CryptoJS.mode.ECB,
                               padding: CryptoJS.pad.Pkcs7,
                               keySize:4
                             }
                            ).toString();
    }
    
    t = wordToByteArray(CryptoJS.enc.Utf8.parse(t).words).map(function(a) {
      return ToStr(a, data.invisible.chars.split(''));
    });
    
    return data.invisible.prefix + t.join(data.invisible.separator);
  }
};

data.mp3 = {
  key: "E5113965B329DAF7902A7B811E31CE05E5113965B329DAF7",
  check: function(s) {
    return s.match(/^[a-zA-Z0-9\+\/\=]{11,}$/) ? s : 0;
  },
  decrypt: function(encrypted, key) {
    if(key) {
      key = CryptoJS.enc.Hex.stringify(CryptoJS.MD5(key)).toString();
      key = key.substr(0, 32) + key.substr(0, 16);
      key = CryptoJS.enc.Hex.parse(key);
    } else {
      key = CryptoJS.enc.Hex.parse(data.mp3.key);
    }
    
    try {
      let c = data.mp3.check(encrypted);
      
      if(!c) return 'NOT MP3 ENCRYPTED';
      return CryptoJS.TripleDES.decrypt(c,
                                        key,
                                        {
                                          mode: CryptoJS.mode.CBC,
                                          padding: CryptoJS.pad.Pkcs7,
                                          iv: CryptoJS.enc.Hex.parse('0000000000000000')
                                        }
                                       ).toString(CryptoJS.enc.Utf8);
    } catch(e) {
      console.log(e);
      
      return false;
    }
  },
  encrypt: function(decrypted, key) {
    if(key) {
      key = CryptoJS.enc.Hex.stringify(CryptoJS.MD5(key)).toString();
      key = key.substr(0, 32) + key.substr(0, 16);
      key = CryptoJS.enc.Hex.parse(key);
    } else {
      key = CryptoJS.enc.Hex.parse(data.mp3.key);
    }
    return CryptoJS.enc.Base64.stringify(
            CryptoJS.TripleDES.encrypt(
              CryptoJS.enc.Utf8.parse(decrypted),
              key,
              {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
                iv: CryptoJS.enc.Hex.parse('0000000000000000')
              }
             ).ciphertext
           ).toString();
  }
};

module.exports = data;