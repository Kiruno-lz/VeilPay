// ESM shim for events module
// Minimal EventEmitter implementation for browser

function EventEmitter() {
  this._events = {};
}

EventEmitter.prototype.on = function(event, listener) {
  if (!this._events[event]) {
    this._events[event] = [];
  }
  this._events[event].push(listener);
  return this;
};

EventEmitter.prototype.once = function(event, listener) {
  const self = this;
  function onceWrapper() {
    self.off(event, onceWrapper);
    listener.apply(this, arguments);
  }
  return this.on(event, onceWrapper);
};

EventEmitter.prototype.off = function(event, listener) {
  if (!this._events[event]) return this;
  const idx = this._events[event].indexOf(listener);
  if (idx > -1) {
    this._events[event].splice(idx, 1);
  }
  return this;
};

EventEmitter.prototype.emit = function(event) {
  if (!this._events[event]) return false;
  const args = Array.prototype.slice.call(arguments, 1);
  this._events[event].forEach(function(listener) {
    listener.apply(null, args);
  });
  return true;
};

EventEmitter.prototype.removeAllListeners = function(event) {
  if (event) {
    delete this._events[event];
  } else {
    this._events = {};
  }
  return this;
};

EventEmitter.prototype.listenerCount = function(event) {
  return this._events[event] ? this._events[event].length : 0;
};

// Static method
EventEmitter.defaultMaxListeners = 10;

export { EventEmitter };
export default EventEmitter;
