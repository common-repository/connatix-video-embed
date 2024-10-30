<?php
register_block_type(
  'cnx/video-embed',
  [
    'attributes'      => [
      'blockText' => [
        'default' => 'Wholesome Plugin – hello from the editor!',
        'type'    => 'string',
      ],
    ],
    'editor_script'   => 'cnx-video-embed-js',
    'render_callback' =>  'cnx_video_embed_render',
    'style'           => 'cnx-video-embed-css',
  ]
);



function cnx_video_embed_render($attributes){
	if(!is_array($attributes) || !array_key_exists('embed_script', $attributes) || empty($attributes['embed_script']))
		return;
  
  if(preg_match('/<script/', $attributes['embed_script']))
    return '<p class="wp-block-cnx-video-embed">' . $attributes['embed_script'] . '</p>';
	return '<p class="wp-block-cnx-video-embed">' . base64_decode($attributes['embed_script']) . '</p>';
}
