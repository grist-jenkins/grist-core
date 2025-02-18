/**
 * Various utilities and constants for communicating with the python sandbox.
 */
import * as MemBuffer from 'app/common/MemBuffer';
import * as log from 'app/server/lib/log';


/**
 * SandboxError is an error type for reporting errors forwarded from the sandbox.
 */
export class SandboxError extends Error {
  constructor(message: string) {
    super("[Sandbox] " + (message || 'Python reported an error'));
  }
}


/**
 * Special msgCode values that precede msgBody to indicate what kind of message it is.
 * These all cost one byte. If we needed more, we should probably switch to a number (5 bytes)
 *    CALL = call to the other side. The data must be an array of [func_name, arguments...]
 *    DATA = data must be a value to return to a call from the other side
 *    EXC = data must be an exception to return to a call from the other side
 */
export const CALL = null;
export const DATA = true;
export const EXC = false;


/**
 * Returns a function that takes data buffers and logs them to log.info() with the given prefix.
 * The logged output is line-oriented, so that the prefix is only inserted at the start of a line.
 * Binary data is encoded as with JSON.stringify.
 */
export function makeLinePrefixer(prefix: string, logMeta: object) {
  let partial = '';
  return (data: Uint8Array) => {
    partial += MemBuffer.arrayToString(data);
    let newline;
    while ((newline = partial.indexOf("\n")) !== -1) {
      const line = partial.slice(0, newline);
      partial = partial.slice(newline + 1);
      // Escape some parts of the string by serializing it to JSON (without the quotes).
      log.origLog('info', "%s%s", prefix,
        JSON.stringify(line).slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\'),
        logMeta);
    }
  };
}
