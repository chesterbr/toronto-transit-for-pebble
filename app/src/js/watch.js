// Asynchronous communication with Pebble

var message_queue = [];
var current_message;
var current_item_ord;

var MAX_ITEMS_PER_MESSAGE = 10;

var routeSelectedCallback;

function sendRoutes(response) {
  enqueueMessages(JSON.parse(response));
  dispatchMessages();
}

function addEventListener(event, callback) {
  if (event == "route_selected") {
    routeSelectedCallback = callback;
  } else {
    Pebble.addEventListener(event, callback);
  }
}

module.exports.addEventListener = addEventListener;
module.exports.sendRoutes = sendRoutes;

// Private

Pebble.addEventListener('appmessage', function(message) {
  section = message.payload.KEY_MENU_SELECTED_SECTION;
  item = message.payload.KEY_MENU_SELECTED_ITEM;
  if (section & item) {
    routeSelected(section + "," + item);
  }
});

function enqueueMessages(stops) {
  new_message();
  append_to_message('section_count', stops.length);
  append_to_message('string_buffer_size', stringBufferSize(stops));

  stops.forEach(function(stop) {
    new_message();
    routes = stop['routes'];
    append_to_message('section_items_count', routes.length);
    append_to_message('section_title', stop['stop']);
    routes.forEach(function(route) {
      append_to_message('item_title', route['route']);
      append_to_message('item_subtitle', route['direction']);
      // TODO store URL for subsequent call requests from Pebble
    });
  });

  append_to_message('show', 0);
}

function dispatchMessages() {
  enqueue_current_message_if_any();
  dispatch_until_queue_is_empty();
}

function dispatch_until_queue_is_empty() {
  var dict = message_queue.shift();
  if (dict) {
    Pebble.sendAppMessage(dict, function(e) {
      dispatch_until_queue_is_empty();
    }, function(e) {
      console.log('Error sending message to Pebble!' + JSON.stringify(e));
    });
  }
}

function new_message() {
  enqueue_current_message_if_any();
  current_message = {}
  current_item_ord = 1;
}

function append_to_message(type, value) {
  var key = 'KEY_MENU_' + type.toUpperCase();
  if (type == 'item_title') {
    key += '_' + current_item_ord;
  } else if (type == 'item_subtitle') {
    key += '_' + current_item_ord++;
  }
  current_message[key] = value;

  if (current_item_ord > MAX_ITEMS_PER_MESSAGE) {
    new_message();
  }
}

function enqueue_current_message_if_any() {
  if (current_message && Object.keys(current_message).length > 0) {
    message_queue.push(current_message);
  }
}

function stringBufferSize(stops) {
  var size = 0;
  stops.forEach(function(stop) {
    routes = stop['routes'];
    size += stop['stop'].length + 1;
    routes.forEach(function(route) {
      size += route['route'].length + 1;
      size += route['direction'].length + 1;
    });
  });
  return size;
}
