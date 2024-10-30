<?php
/**
 * @package Connatix Video Embed
 * @version 1.0.5
 */
/*
Plugin Name: Connatix Video Embed
Plugin URI: https://wordpress.org/plugins/connatix-video-embed/
Description: Easily access, deliver, and monetize your video content directly from WordPress using the Connatix plugin. Built for editors to streamline workflows, natively embed videos within articles without having to log in to the Connatix Platform. 
Author: Connatix
Version: 1.0.5
Author URI: https://connatix.com
*/


if ( ! class_exists( 'ConnatixVideoEmbed' ) ) {

class ConnatixVideoEmbed {

    protected $apiUrl = '';

    public $headScriptData = <<<EOD
    <script id="cnx-init-script">!function(n){if(!window.cnx){window.cnx={},window.cnx.cmd=[];var t=n.createElement('iframe');t.display='none',t.onload=function(){var n=t.contentWindow.document,c=n.createElement('script');c.src='//cd.connatix.com/connatix.player.js',c.setAttribute('async','1'),c.setAttribute('type','text/javascript'),n.body.appendChild(c)},n.head.appendChild(t)}}(document);</script>

    <script type="text/javascript"> 
        if( !window.cnx_plugin ){
            window.cnx_plugin={}
        }
        window.cnx_plugin.cnx_script_iframe_url = "https://assets.connatix.com/Elements/a8df8668-464c-4966-817d-d93f35ae9bc2/wp-iframe.html"; 
        window.cnx_plugin.iframe_origin = ["https://embedded.connatix.com" ];
    </script>
EOD;

    public $consoleIframeUrl = "https://embedded.connatix.com/?wordpress=true";
    
    protected $user_token;
     
    public function __construct()
    {
        $this->add_scripts_admin_head();
        $this->add_scripts_site_head();

        add_action( 'init', function(){

            $this->register_blocks();
            $this->register_editor_button();
        });


        add_action( 'show_user_profile', [$this, 'show_profile_fields'] );
        add_action( 'edit_user_profile', [$this, 'show_profile_fields'] );

        add_action( 'personal_options_update', [$this, 'save_user_auth_token'] );
        add_action( 'edit_user_profile_update', [$this, 'save_user_auth_token'] );

        add_action( 'wp_ajax_ajax_save_user_auth_token', [$this, 'ajax_save_user_auth_token' ]);

    }

    public function add_scripts_admin_head() {

        add_action('admin_enqueue_scripts', function(){
            wp_enqueue_script( 'cnx_common_script', plugins_url( 'src/common.js', __FILE__ ) );
        });

        add_action( 'admin_print_scripts', function() {
            include( plugin_dir_path( __FILE__ ) . 'partials/head_script_admin.php');
        } );

    }

    public function add_scripts_site_head() {
          add_action('wp_head', function(){
            include( plugin_dir_path( __FILE__ ) . 'partials/head_script_site.php');
          });
    }

    public function register_blocks() {

        // Check if Gutenberg is active.
        if ( ! function_exists( 'register_block_type' ) ) {
            return;
        }
        $asset_file = include( plugin_dir_path( __FILE__ ) . 'build/index.asset.php');

    
        // Add block script.
        wp_register_script(
            'cnx-video-embed-js',
            plugins_url( 'build/index.js', __FILE__ ),
            $asset_file['dependencies'],
            $asset_file['version']
        );
    
        // Add block style.
        wp_register_style(
            'cnx-video-embed-css',
            plugins_url( 'blocks/video-embed/video-embed.css', __FILE__ ),
            [],
            filemtime( plugin_dir_path( __FILE__ ) . 'blocks/video-embed/video-embed.css' )
				);



				require_once(plugin_dir_path(__FILE__) . 'blocks/video-embed/video-embed.php');
    


    }

    public function register_editor_button() {

        if ( ! current_user_can( 'edit_posts' ) && ! current_user_can( 'edit_pages' ) ) {
            return;
        }

        if ( get_user_option( 'rich_editing' ) !== 'true' ) {
            return;
        }

        add_filter( 'mce_external_plugins', function($plugin_array){
            $plugin_array['cnx_video_embed'] = plugins_url( 'src/tinymce_buttons.js', __FILE__ );
            return $plugin_array;
        });

        add_filter( 'mce_buttons', function($buttons){
            array_push( $buttons, 'cnx_video_embed' );
            return $buttons;
        });

        function tinymce_remove_root_block_tag( $init ) {
            
            $init['extended_valid_elements'] = 'script[charset|defer|language|src|type]';

            return $init;
        }
        add_filter( 'tiny_mce_before_init', 'tinymce_remove_root_block_tag' );

        wp_enqueue_style( 'cnx_css', plugins_url( 'style/styles.css', __FILE__ ) );

        add_action( 'admin_footer',  function(){
            $cnx_iframe_url = $this->consoleIframeUrl;

            $user_id = get_current_user_id();
            $cnx_auth_token = get_user_meta($user_id, 'cnx_auth_token', true);

            $auth_param = "";
            if(!empty($cnx_auth_token)){
                $auth_param = "&t=${cnx_auth_token}";
            }

            include( plugin_dir_path( __FILE__ ) . 'partials/modal.php');
        } );
  
    }


    public function show_profile_fields($user) {
        include( plugin_dir_path( __FILE__ ) . 'partials/edit_user_fields.php');
    }

    /**
     * This function is also used to save auth token via AJAX
     */
    public function save_user_auth_token($user_id, $check_nonce=true){


        if ( !current_user_can( 'edit_user', $user_id ) ) { 
            return false; 
        }

        if( isset($_POST['cnx_auth_token']) ) {

            if($check_nonce) {
                if(!isset( $_POST['_wpnonce'] ) || empty($_POST['_wpnonce']) ) {
                    wp_die('Request error');
                }
        
                $nonce = sanitize_text_field( $_POST['_wpnonce'] );
        
                if ( ! wp_verify_nonce( $nonce, 'update-user_' . $user_id ) ) {
                    wp_die('Request error');
                }
            }

            $auth_token = sanitize_text_field( $_POST['cnx_auth_token'] ); 
            update_user_meta( $user_id, 'cnx_auth_token', $auth_token );
        }

    }

    public function ajax_save_user_auth_token() {

        if(!isset( $_POST['nonce'] ) || empty($_POST['nonce']) ) {
            wp_die('Request error');
        }

        $nonce = sanitize_text_field( $_POST['nonce'] );

        if ( ! wp_verify_nonce( $nonce, 'cnx-ajax-nonce' ) ) {
            wp_die('Request error');
        }

        $user_id = get_current_user_id();

        $this->save_user_auth_token($user_id, false);

        echo "{'success': true}";

        wp_die();         
    }

}

$wp_cnx_video_embed = new ConnatixVideoEmbed();

add_shortcode('cnx_script_code', 'connatix_shortcode_script');
function connatix_shortcode_script($atts, $content){
return base64_decode($content);
}

function cnx_fix_older_blocks_compat( $post ) {
    $post->post_content = preg_replace_callback('/(<!-- wp:cnx\/video-embed.+?{"embed_script":")(.+?)("} -->\n<p class="wp-block-cnx-video-embed">)(.+?)(<\/p>\n<!-- \/wp:cnx\/video-embed\s?-->)/ms', function($matches){
        return $matches[1] . base64_encode($matches[4]) . '"} /-->';
    }, $post->post_content);
    return $post;
}
add_action( 'the_post', 'cnx_fix_older_blocks_compat' );

}

