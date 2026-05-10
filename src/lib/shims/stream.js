// ESM shim for stream module
import { EventEmitter } from './events.js';
export class Readable extends EventEmitter {}
export class Writable extends EventEmitter {}
export class Transform extends EventEmitter {}
export class Duplex extends EventEmitter {}
export default { Readable, Writable, Transform, Duplex };
