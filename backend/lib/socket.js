/**
 * Singleton Socket.io instance.
 * Set once in server.js, imported by controllers to emit events.
 */
let _io = null;

export const setIO = (ioInstance) => {
  _io = ioInstance;
};

export const getIO = () => {
  return _io;
};
