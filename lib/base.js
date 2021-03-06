// Generated by IcedCoffeeScript 1.8.0-d
(function() {
  var Base, GenericBinding, SHA256, Verifier, WordArray, add_ids, akatch, base64_extract, base64u, bufeq_secure, cieq, constants, decode, hash_sig, iced, json_stringify_sorted, katch, make_esc, make_ids, pgp_utils, proof_text_check_to_med_id, proof_type_to_string, sig_id_to_med_id, sig_id_to_short_id, streq_secure, triplesec, unix_time, util, __iced_k, __iced_k_noop, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  iced = require('iced-runtime');
  __iced_k = __iced_k_noop = function() {};

  _ref = require('./constants'), proof_type_to_string = _ref.proof_type_to_string, constants = _ref.constants;

  pgp_utils = require('pgp-utils');

  _ref1 = pgp_utils.util, katch = _ref1.katch, akatch = _ref1.akatch, bufeq_secure = _ref1.bufeq_secure, json_stringify_sorted = _ref1.json_stringify_sorted, unix_time = _ref1.unix_time, base64u = _ref1.base64u, streq_secure = _ref1.streq_secure;

  triplesec = require('triplesec');

  WordArray = triplesec.WordArray;

  SHA256 = triplesec.hash.SHA256;

  decode = pgp_utils.armor.decode;

  make_esc = require('iced-error').make_esc;

  util = require('util');

  base64_extract = require('./b64extract').base64_extract;

  exports.hash_sig = hash_sig = function(sig_body) {
    return (new SHA256).bufhash(sig_body);
  };

  add_ids = function(sig_body, out) {
    var hash, id, short_id;
    hash = hash_sig(sig_body);
    id = hash.toString('hex');
    short_id = sig_id_to_short_id(hash);
    out.id = id;
    out.med_id = sig_id_to_med_id(hash);
    return out.short_id = short_id;
  };

  make_ids = function(sig_body) {
    var out;
    out = {};
    add_ids(sig_body, out);
    return out;
  };

  sig_id_to_med_id = function(sig_id) {
    return base64u.encode(sig_id);
  };

  sig_id_to_short_id = function(sig_id) {
    return base64u.encode(sig_id.slice(0, constants.short_id_bytes));
  };

  proof_text_check_to_med_id = function(proof_text_check) {
    var med_id;
    med_id = make_ids(new Buffer(proof_text_check, 'base64')).med_id;
    return med_id;
  };

  exports.cieq = cieq = function(a, b) {
    return (a != null) && (b != null) && (a.toLowerCase() === b.toLowerCase());
  };

  Verifier = (function() {
    function Verifier(_arg, sig_eng, base) {
      this.armored = _arg.armored, this.id = _arg.id, this.short_id = _arg.short_id, this.skip_ids = _arg.skip_ids, this.make_ids = _arg.make_ids;
      this.sig_eng = sig_eng;
      this.base = base;
    }

    Verifier.prototype.km = function() {
      return this.sig_eng.get_km();
    };

    Verifier.prototype.get_etime = function() {
      if ((this.json.ctime != null) && (this.json.expire_in != null)) {
        return this.json.ctime + this.json.expire_in;
      } else {
        return null;
      }
    };

    Verifier.prototype.verify = function(cb) {
      var esc, json_obj, json_str, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      esc = make_esc(cb, "Verifier::verfiy");
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/proofs/src/base.iced",
            funcname: "Verifier.verify"
          });
          _this._parse_and_process(esc(__iced_deferrals.defer({
            lineno: 72
          })));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/max/src/keybase/proofs/src/base.iced",
              funcname: "Verifier.verify"
            });
            _this._check_json(esc(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  json_obj = arguments[0];
                  return json_str = arguments[1];
                };
              })(),
              lineno: 73
            })));
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/max/src/keybase/proofs/src/base.iced",
                funcname: "Verifier.verify"
              });
              _this._check_expired(esc(__iced_deferrals.defer({
                lineno: 74
              })));
              __iced_deferrals._fulfill();
            })(function() {
              return cb(null, json_obj, json_str);
            });
          });
        };
      })(this));
    };

    Verifier.prototype._check_ids = function(body, cb) {
      var err, id, short_id, _ref2;
      _ref2 = make_ids(body), short_id = _ref2.short_id, id = _ref2.id;
      err = !((this.id != null) && streq_secure(id, this.id)) ? new Error("Long IDs aren't equal; wanted " + id + " but got " + this.id) : !((this.short_id != null) && streq_secure(short_id, this.short_id)) ? new Error("Short IDs aren't equal: wanted " + short_id + " but got " + this.short_id) : null;
      return cb(err);
    };

    Verifier.prototype._check_expired = function(cb) {
      var err, expired, now;
      err = null;
      now = unix_time();
      if (this.json.ctime == null) {
        err = new Error("No `ctime` in signature");
      } else if (this.json.expire_in == null) {
        err = new Error("No `expire_in` in signature");
      } else if ((expired = now - this.json.ctime - this.json.expire_in) > 0) {
        err = new Error("Expired " + expired + "s ago");
      } else {
        this.etime = this.json.ctime + this.json.expire_in;
      }
      return cb(err);
    };

    Verifier.prototype._parse_and_process = function(cb) {
      var body, err, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      err = null;
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/proofs/src/base.iced",
            funcname: "Verifier._parse_and_process"
          });
          _this.sig_eng.unbox(_this.armored, __iced_deferrals.defer({
            assign_fn: (function(__slot_1) {
              return function() {
                err = arguments[0];
                __slot_1.payload = arguments[1];
                return body = arguments[2];
              };
            })(_this),
            lineno: 105
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          (function(__iced_k) {
            if ((err == null) && !_this.skip_ids) {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/max/src/keybase/proofs/src/base.iced",
                  funcname: "Verifier._parse_and_process"
                });
                _this._check_ids(body, __iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      return err = arguments[0];
                    };
                  })(),
                  lineno: 107
                }));
                __iced_deferrals._fulfill();
              })(__iced_k);
            } else {
              return __iced_k();
            }
          })(function() {
            var _ref2;
            if ((err == null) && _this.make_ids) {
              _ref2 = make_ids(body), _this.short_id = _ref2.short_id, _this.id = _ref2.id;
            }
            return cb(err);
          });
        };
      })(this));
    };

    Verifier.prototype._check_json = function(cb) {
      var e, err, jsons, ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref2;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      jsons = this.payload;
      _ref2 = katch((function() {
        return JSON.parse(jsons);
      })), e = _ref2[0], this.json = _ref2[1];
      if (e != null) {
        err = new Error("Couldn't parse JSON signed message: " + e.message);
      }
      (function(_this) {
        return (function(__iced_k) {
          if (err == null) {
            jsons = jsons.toString('utf8');
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/max/src/keybase/proofs/src/base.iced",
                funcname: "Verifier._check_json"
              });
              _this.base._v_check({
                json: _this.json
              }, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return err = arguments[0];
                  };
                })(),
                lineno: 120
              }));
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        });
      })(this)((function(_this) {
        return function() {
          return cb(err, _this.json, jsons);
        };
      })(this));
    };

    return Verifier;

  })();

  Base = (function() {
    function Base(_arg) {
      this.sig_eng = _arg.sig_eng, this.seqno = _arg.seqno, this.user = _arg.user, this.host = _arg.host, this.prev = _arg.prev, this.client = _arg.client, this.merkle_root = _arg.merkle_root, this.revoke = _arg.revoke, this.seq_type = _arg.seq_type, this.eldest_kid = _arg.eldest_kid;
    }

    Base.prototype.proof_type_str = function() {
      var t;
      if ((t = this.proof_type()) != null) {
        return proof_type_to_string[t];
      } else {
        return null;
      }
    };

    Base.prototype._v_check_key = function(key) {
      var checks, err;
      checks = 0;
      if ((key != null ? key.kid : void 0) != null) {
        checks++;
        err = this._v_check_kid(key.kid);
      }
      if ((err == null) && ((key != null ? key.fingerprint : void 0) != null)) {
        checks++;
        err = this._v_check_fingerprint(key);
      }
      if ((err == null) && checks === 0) {
        err = new Error("need either a 'body.key.kid' or a 'body.key.fingerprint'");
      }
      return err;
    };

    Base.prototype._v_check_kid = function(kid) {
      var a, err;
      if (!bufeq_secure((a = this.km().get_ekid()), new Buffer(kid, "hex"))) {
        return err = new Error("Verification key doesn't match packet (via kid): " + (a.toString('hex')) + " != " + kid);
      } else {
        return null;
      }
    };

    Base.prototype._v_check_fingerprint = function(key) {
      var a, fp, key_id;
      if ((key_id = key != null ? key.key_id : void 0) == null) {
        return new Error("Needed a body.key.key_id but none given");
      } else if (!bufeq_secure((a = this.km().get_pgp_key_id()), new Buffer(key_id, "hex"))) {
        return new Error("Verification key doesn't match packet (via key ID): " + (a.toString('hex')) + " != " + key_id);
      } else if ((fp = key != null ? key.fingerprint : void 0) == null) {
        return new Error("Needed a body.key.fingerprint but none given");
      } else if (!bufeq_secure(this.km().get_pgp_fingerprint(), new Buffer(fp, "hex"))) {
        return new Error("Verifiation key doesn't match packet (via fingerprint)");
      } else {
        return null;
      }
    };

    Base.prototype._v_check = function(_arg, cb) {
      var a, b, err, json, key, seq_type, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      json = _arg.json;
      seq_type = function(v) {
        if (v != null) {
          return v;
        } else {
          return constants.seq_types.PUBLIC;
        }
      };
      err = !cieq((a = json != null ? (_ref2 = json.body) != null ? (_ref3 = _ref2.key) != null ? _ref3.username : void 0 : void 0 : void 0), (b = this.user.local.username)) ? new Error("Wrong local user: got '" + a + "' but wanted '" + b + "'") : (a = json != null ? (_ref4 = json.body) != null ? (_ref5 = _ref4.key) != null ? _ref5.uid : void 0 : void 0 : void 0) !== (b = this.user.local.uid) ? new Error("Wrong local uid: got '" + a + "' but wanted '" + b + "'") : !cieq((a = json != null ? (_ref6 = json.body) != null ? (_ref7 = _ref6.key) != null ? _ref7.host : void 0 : void 0 : void 0), (b = this.host)) ? new Error("Wrong host: got '" + a + "' but wanted '" + b + "'") : ((a = this._type()) != null) && ((b = json != null ? (_ref8 = json.body) != null ? _ref8.type : void 0 : void 0) !== a) ? new Error("Wrong signature type; got '" + a + "' but wanted '" + b + "'") : (a = this.prev) && (a !== (b = json != null ? json.prev : void 0)) ? new Error("Wrong previous hash; wanted '" + a + "' but got '" + b + "'") : (a = this.seqno) && (a !== (b = json != null ? json.seqno : void 0)) ? new Error("Wrong seqno; wanted '" + a + "' but got '" + b) : this.seqno && (a = seq_type(json != null ? json.seq_type : void 0)) !== (b = seq_type(this.seq_type)) ? new Error("Wrong seq_type: wanted '" + a + "' but got '" + b + "'") : (key = json != null ? (_ref9 = json.body) != null ? _ref9.key : void 0 : void 0) == null ? new Error("no 'body.key' block in signature") : err = this._v_check_key(key);
      return cb(err);
    };

    Base.prototype.is_remote_proof = function() {
      return false;
    };

    Base.prototype._json = function(_arg) {
      var ctime, ekid, expire_in, fp, ret, _ref2, _ref3, _ref4;
      expire_in = _arg.expire_in;
      ctime = this._ctime != null ? this._ctime : (this._ctime = unix_time());
      ret = {
        seqno: this.seqno,
        prev: this.prev,
        ctime: unix_time(),
        tag: constants.tags.sig,
        expire_in: expire_in || constants.expire_in,
        body: {
          version: constants.versions.sig,
          type: this._type(),
          key: {
            host: this.host,
            username: this.user.local.username,
            uid: this.user.local.uid
          }
        }
      };
      if ((ekid = this.km().get_ekid()) != null) {
        ret.body.key.kid = ekid.toString('hex');
      }
      if ((fp = this.km().get_pgp_fingerprint()) != null) {
        ret.body.key.fingerprint = fp.toString('hex');
        ret.body.key.key_id = this.km().get_pgp_key_id().toString('hex');
      }
      if (this.eldest_kid != null) {
        ret.body.key.eldest_kid = this.eldest_kid;
      }
      if (this.seq_type != null) {
        ret.seq_type = this.seq_type;
      }
      if (this.client != null) {
        ret.body.client = this.client;
      }
      if (this.merkle_root != null) {
        ret.body.merkle_root = this.merkle_root;
      }
      if ((((_ref2 = this.revoke) != null ? _ref2.sig_id : void 0) != null) || ((_ref3 = this.revoke) != null ? (_ref4 = _ref3.sig_ids) != null ? _ref4.length : void 0 : void 0) > 0) {
        ret.body.revoke = this.revoke;
      }
      return ret;
    };

    Base.prototype.json = function() {
      return json_stringify_sorted(this._json({}));
    };

    Base.prototype._v_generate = function(opts, cb) {
      return cb(null);
    };

    Base.prototype.generate = function(cb) {
      var armored, esc, id, json, out, pgp, raw, short_id, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      esc = make_esc(cb, "generate");
      out = null;
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/proofs/src/base.iced",
            funcname: "Base.generate"
          });
          _this._v_generate({}, esc(__iced_deferrals.defer({
            lineno: 269
          })));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          json = _this.json();
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/max/src/keybase/proofs/src/base.iced",
              funcname: "Base.generate"
            });
            _this.sig_eng.box(json, esc(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  pgp = arguments[0].pgp;
                  raw = arguments[0].raw;
                  return armored = arguments[0].armored;
                };
              })(),
              lineno: 271
            })));
            __iced_deferrals._fulfill();
          })(function() {
            var _ref2;
            _ref2 = make_ids(raw), short_id = _ref2.short_id, id = _ref2.id;
            out = {
              pgp: pgp,
              json: json,
              id: id,
              short_id: short_id,
              raw: raw,
              armored: armored
            };
            return cb(null, out);
          });
        };
      })(this));
    };

    Base.prototype.verify = function(obj, cb) {
      var err, id, json_obj, json_str, out, short_id, verifier, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      verifier = new Verifier(obj, this.sig_eng, this);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/keybase/proofs/src/base.iced",
            funcname: "Base.verify"
          });
          verifier.verify(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                json_obj = arguments[1];
                return json_str = arguments[2];
              };
            })(),
            lineno: 286
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          id = short_id = null;
          if (obj.make_ids) {
            id = obj.id = verifier.id;
            short_id = obj.short_id = verifier.short_id;
          }
          out = typeof err !== "undefined" && err !== null ? {} : {
            json_obj: json_obj,
            json_str: json_str,
            id: id,
            short_id: short_id,
            etime: verifier.get_etime(),
            reverse_sig_kid: _this.reverse_sig_kid
          };
          return cb(err, out);
        };
      })(this));
    };

    Base.prototype.km = function() {
      return this.sig_eng.get_km();
    };

    Base.prototype.check_inputs = function() {
      return null;
    };

    Base.prototype.check_existing = function() {
      return null;
    };

    Base.prototype.is_short = function() {
      return false;
    };

    Base.prototype.sanity_check_proof_text = function(_arg, cb) {
      var args, b, b64s, check_for, err, len_floor, msg, proof_text, s, slack, _i, _len, _ref2;
      args = _arg.args, proof_text = _arg.proof_text;
      if (this.is_short()) {
        check_for = args.sig_id_short;
        len_floor = constants.short_id_bytes;
        slack = 3;
      } else {
        _ref2 = decode(args.sig), err = _ref2[0], msg = _ref2[1];
        if ((err == null) && (msg.type !== "MESSAGE")) {
          err = new Error("wrong message type; expected a generic message; got " + msg.type);
        }
        if (err == null) {
          check_for = msg.body.toString('base64');
          len_floor = constants.shortest_pgp_signature;
          slack = 30;
        }
      }
      if (err == null) {
        b64s = base64_extract(proof_text);
        for (_i = 0, _len = b64s.length; _i < _len; _i++) {
          b = b64s[_i];
          if (b.length >= len_floor) {
            if (b.indexOf(check_for) < 0 || (s = b.length - check_for.length) > slack) {
              err = new Error("Found a bad signature in proof text: " + b.slice(0, 60) + " != " + check_for.slice(0, 60) + " (slack=" + s + ")");
              break;
            }
          }
        }
      }
      return cb(err);
    };

    return Base;

  })();

  GenericBinding = (function(_super) {
    __extends(GenericBinding, _super);

    function GenericBinding() {
      return GenericBinding.__super__.constructor.apply(this, arguments);
    }

    GenericBinding.prototype._type = function() {
      return null;
    };

    GenericBinding.prototype.resource_id = function() {
      return "";
    };

    GenericBinding.prototype._service_obj_check = function() {
      return true;
    };

    return GenericBinding;

  })(Base);

  exports.Base = Base;

  exports.GenericBinding = GenericBinding;

  exports.sig_id_to_short_id = sig_id_to_short_id;

  exports.sig_id_to_med_id = sig_id_to_med_id;

  exports.make_ids = make_ids;

  exports.add_ids = add_ids;

  exports.proof_text_check_to_med_id = proof_text_check_to_med_id;

}).call(this);
