// Event emitter for real-time message broadcasting
const EventEmitter = require('events');

class MessageEventEmitter extends EventEmitter {}

const messageEvents = new MessageEventEmitter();

// Set max listeners to handle many connected clients
messageEvents.setMaxListeners(100);

module.exports = messageEvents;
