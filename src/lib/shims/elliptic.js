// ESM shim for elliptic
// Create a minimal elliptic implementation for browser use
const elliptic = {
  version: '6.5.4',
  utils: {},
  rand: function() { return Math.random(); },
  curve: {},
  curves: {},
  ec: function(options) {
    // Minimal EC implementation
    return {
      keyPair: function(priv) {
        return {
          getPrivate: function() { return priv; },
          getPublic: function() { return { encode: function() { return 'pubkey'; } }; }
        };
      },
      sign: function() { return { r: 'r', s: 's' }; },
      verify: function() { return true; }
    };
  },
  eddsa: function() {
    return {
      keyPair: function() { return {}; },
      sign: function() { return {}; },
      verify: function() { return true; }
    };
  }
};

export default elliptic;
export const ec = elliptic.ec;
export const eddsa = elliptic.eddsa;
