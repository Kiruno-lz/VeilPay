// ESM shim for buffer module
// Properly extend Uint8Array without calling it without 'new'

function createBuffer(arg, encoding) {
  let array;
  if (typeof arg === 'number') {
    array = new Uint8Array(arg);
  } else if (typeof arg === 'string') {
    array = new TextEncoder().encode(arg);
  } else if (arg instanceof ArrayBuffer || arg instanceof Uint8Array) {
    array = new Uint8Array(arg);
  } else {
    array = new Uint8Array(0);
  }
  return array;
}

function Buffer(arg, encoding) {
  if (!(this instanceof Buffer)) {
    return new Buffer(arg, encoding);
  }
  
  const array = createBuffer(arg, encoding);
  // Copy array into this
  Object.setPrototypeOf(array, Buffer.prototype);
  return array;
}

// Set up prototype chain properly
Buffer.prototype = Object.create(Uint8Array.prototype);
Buffer.prototype.constructor = Buffer;
Object.setPrototypeOf(Buffer, Uint8Array);

Buffer.from = function(data, encoding) {
  return new Buffer(data, encoding);
};

Buffer.alloc = function(size, fill = 0) {
  const buf = new Buffer(size);
  if (fill !== 0) {
    buf.fill(fill);
  }
  return buf;
};

Buffer.allocUnsafe = function(size) {
  return new Buffer(size);
};

Buffer.prototype.toString = function(encoding = 'utf8') {
  if (encoding === 'hex') {
    return Array.from(this)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return new TextDecoder().decode(this);
};

Buffer.prototype.write = function(string, offset = 0, length, encoding = 'utf8') {
  const encoded = new TextEncoder().encode(string);
  const len = Math.min(length || encoded.length, this.length - offset);
  for (let i = 0; i < len; i++) {
    this[offset + i] = encoded[i];
  }
  return len;
};

Buffer.prototype.readUInt32LE = function(offset = 0) {
  return this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16) | (this[offset + 3] << 24);
};

Buffer.prototype.writeUInt32LE = function(value, offset = 0) {
  this[offset] = value & 0xff;
  this[offset + 1] = (value >> 8) & 0xff;
  this[offset + 2] = (value >> 16) & 0xff;
  this[offset + 3] = (value >> 24) & 0xff;
  return offset + 4;
};

export { Buffer };
export default Buffer;
