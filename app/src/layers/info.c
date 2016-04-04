// Layer that shows information (and dubs as a splash screen)

#include "info.h"

static Layer *s_info_layer = NULL;
static GBitmap *s_info_logo_bmp;
static TextLayer *s_info_message_layer;
static BitmapLayer *s_info_streetcar_layer;
static GBitmap *s_info_streetcar_bitmap;

char *s_info_message;

static GRect s_info_bounds; // This will likely move

static void ensure_layer_initialized();
static void move_layer_to_top();


void info_show(char* message) {
  ensure_layer_initialized();
  text_layer_set_text(s_info_message_layer, message);
  //  s_info_message = message;

  move_layer_to_top();
}

void info_hide() {
  layer_remove_from_parent(s_info_layer);
}

///

static void ensure_layer_initialized() {
  if (s_info_layer) { return; }

  Layer *window_layer = window_get_root_layer(window_stack_get_top_window());
  GRect bounds = layer_get_bounds(window_layer); // TODO: leave space for watch?

  s_info_layer = layer_create(bounds);

  s_info_message_layer = text_layer_create(
    GRect(bounds.origin.x, bounds.size.h * 0.75, bounds.size.w, bounds.size.h)
  );
  text_layer_set_text_alignment(s_info_message_layer, GTextAlignmentCenter);

  s_info_streetcar_bitmap = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_STREETCAR);
  // TODO rewrite this my way
  GSize image_size = gbitmap_get_bounds(s_info_streetcar_bitmap).size;
  GPoint center = grect_center_point(&bounds);
  GRect image_frame = GRect(center.x, center.y, image_size.w, image_size.h);
  image_frame.origin.x -= image_size.w / 2;
  image_frame.origin.y = bounds.size.h * 0.1;
  s_info_streetcar_layer = bitmap_layer_create(image_frame);
  bitmap_layer_set_bitmap(s_info_streetcar_layer, s_info_streetcar_bitmap);

  layer_add_child(s_info_layer, text_layer_get_layer(s_info_message_layer));
  layer_add_child(s_info_layer, bitmap_layer_get_layer(s_info_streetcar_layer));
}

static void move_layer_to_top() {
  Layer *root_layer = window_get_root_layer(window_stack_get_top_window());
  layer_remove_from_parent(s_info_layer);
  layer_add_child(root_layer, s_info_layer);
}


