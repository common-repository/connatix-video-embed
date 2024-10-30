(function() {
    
    cnx_get_iframe_url_with_script = function(script_text){

        var url_string = window.cnx_plugin.cnx_script_iframe_url;
        var url = new URL(url_string);

        url.searchParams.set("script", encodeURIComponent( script_text ) );

        return url.toString();
    }

    cnx_get_iframe_text = function(script_text){
        /* 
         *  Use an iframe wo workaround wordpress core functionalty that
         *  filters scripts inside the clasic editor. We use this only for the classic editor
         *  in the database only the original script embed will be saved.
         */
        return `<iframe class="cnx-video-iframe" data-script="`+ encodeURIComponent(script_text) +`" src="`+ cnx_get_iframe_url_with_script(script_text) +`"></iframe>`;
    }

	  cnx_encode_64 = function(script_text){
			  return '[cnx_script_code]' + btoa(script_text) + '[/cnx_script_code]';
		}

	  cnx_decode_64 = function(script_text){
				return atob(script_text.replace('[cnx_script_code]', '').replace('[/cnx_script_code]',''));
		}

    cnx_get_embed_script_from_element = function(elem_text) {
        /**
         *  Given an html text with elements get the embed script
         */

        var string = "";
         if ( match = elem_text.match( /[\s\-]data-script="([^"]+)"/ ) ) {
            string = decodeURIComponent( match[1] );
        }

        return string;
    }

    cnx_current_selected_node = false;

    function cnx_resize_thickbox(){

        // check if the iframe modal is open
        if( jQuery("#cnx_frame_wrap").parents("#TB_window").length < 1 ){
            return;
        }

        var viewportWidth = jQuery(window).width();
        var viewportHeight = jQuery(window).height();

        var TB_WIDTH = parseInt(viewportWidth - (viewportWidth / 10));
        var TB_HEIGHT = parseInt(viewportHeight - (viewportHeight / 10));

        // get window size
        jQuery(document).find('#TB_window').width(TB_WIDTH).height(TB_HEIGHT).css("margin-left", "-"+ parseInt(TB_WIDTH / 2) + "px" );

        // set TB_ajaxContent content size
        jQuery(document).find('#TB_window #TB_ajaxContent').width(TB_WIDTH - 30).height(TB_HEIGHT - 35);

        jQuery(document).find('#TB_window #TB_ajaxContent #cnx_frame_wrap').height(TB_HEIGHT - 35 - 40);
    }
    jQuery(window).on( 'resize', cnx_resize_thickbox );
    jQuery("#cnx_frame_wrap").width("100%");


    tinymce.PluginManager.add( 'cnx_video_embed', function( editor, url ) {

        // Add Button to Visual Editor Toolbar
        editor.addButton('cnx_video_embed', {
            title: 'Connatix Video Embed',
            cmd: 'cnx_open_modal',
            icon: ' cnx-icons cnx-video-embed-icon dashicons dashicons-format-video ',
        });

        // thickbox functionality
        editor.addCommand('cnx_open_modal', function(show_ui, data){

            var iframe_url = jQuery("#cnx_frame").attr("src");
            var url = new URL(iframe_url);

            if( data && data.hasOwnProperty('script') ) {
                // update the iframe url with edit script
                url.searchParams.set("embed", encodeURIComponent( data.script ) );

                // save the selected embed so we can replace it later
                var $node = editor.selection.getNode();
                cnx_current_selected_node = $node;

            }
            else {
                // remove the embed script
                url.searchParams.delete("embed");
                // clear the edit state
                cnx_current_selected_node = false;
            }

            jQuery("#cnx_frame").attr("src", url.toString() );

            tb_show("", "#TB_inline?inlineId=cnx-video-selct-modal");
            cnx_resize_thickbox();
        });

        jQuery("#cnx-modal-cancel").on('click', function(){

            tb_remove()

            // clear the edit information
            var iframe_url = jQuery("#cnx_frame").attr("src");
            var url = new URL(iframe_url);
            url.searchParams.delete("embed");
            jQuery("#cnx_frame").attr("src", url.toString() );

        });

        // listen to embed video events and call the editor to embed the video
        document.addEventListener('cnx_plugin_insert_script', function(e){
            editor.execCommand('cnx_video_embed', false, e.detail);
        });

        editor.addCommand('cnx_video_embed', function(show_ui, data) {

            // add class for later identification
            script_text = jQuery(data.script.script).attr("class", "cnx-video-embed").prop('outerHTML');

            // set the iframe here; add attr with encoded script
            // add custom class on script and iframe to be easier to identify
            iframe_text = cnx_get_iframe_text(script_text);

            // check if the user is in edit mode
            if(cnx_current_selected_node){
                // replace the selected embed with the new one and clear the edit state
                tinymce.activeEditor.execCommand('mceSelectNode', false, cnx_current_selected_node);
                cnx_current_selected_node = false;
            }

            editor.execCommand('mceReplaceContent', false, iframe_text);

            tb_remove();

            // clear iframe edit state
            var iframe_url = jQuery("#cnx_frame").attr("src");
            var url = new URL(iframe_url);
            url.searchParams.delete("embed");
            jQuery("#cnx_frame").attr("src", url.toString() );
            
            return;
        });


        editor.on( 'PostProcess', function( event ) {
					//HERE IS WHERE TINYMCE RENDERS THE TEXT, OR UPDATE is clicked

            if ( event.get ) {
                // get all iframes with video and replace with
                // the url decoded script for DB save
                event.content = event.content.replace(/<iframe[^>]+cnx-video-iframe[^>]+>/ig, function( iframe ) {

                    var match,
                        string,
                        moretext = '';
    
                    if ( iframe.indexOf( 'data-script' ) !== -1 ) {
                        string = cnx_encode_64(cnx_get_embed_script_from_element(iframe));
                    }
                    return string || iframe;
                });
            }
        });

        
        // bind the initial content load to replace the placeholder images with actual videos
        editor.on("BeforeSetContent", function(event){
					// HERE IS WHERE TINYMCE RENDERS THE VIEW

            //look for scripts inside image tags, and replace with iframe just like on insert video functionality
					//
						event.content = event.content.replace(/\[cnx_script_code\](.+?)\[\/cnx_script_code\]/ig, function(match){
							return cnx_decode_64(match);
						})

            // replace the script images with the actual scripts if there are any players
            if ( event.content.indexOf( 'cnx-video-embed' ) !== -1 ) {
                // there are players embeded in this post

                event.content = event.content.replace( /<img[^>]*(?:cnx-video-embed)[^>]*\/>/ig, function( match, tag ) {

                    var $elem = jQuery(match);
                    var script_text = decodeURIComponent($elem.attr("data-wp-preserve"))

                    // replace the script with iframe
                    iframe_text = cnx_get_iframe_text(script_text);

                    return iframe_text;
                });

                // check if there are any script tags embeded in the content
                event.content = event.content.replace( /<script[^>]*(?:cnx-video-embed)[^>]*>[\s\S]*?<\/script>/ig, function( match, tag ) {
                    
                    // replace the script with iframe
                    iframe_text = cnx_get_iframe_text(match);

                    return iframe_text;
                });
                
            }
            
        });

        // "on-click" toolbar bellow
        editor.addButton( 'cnx_video_remove', {
            tooltip: 'Remove',
            icon: 'dashicon dashicons-no',
            onclick: function() {
                var $node = editor.selection.getNode();
                editor.dom.remove( $node );

                editor.nodeChanged();
		        editor.undoManager.add();
            }
        });
    
        editor.addButton( 'cnx_video_edit', {
            tooltip: 'Edit|button', // '|button' is not displayed, only used for context.
            icon: 'dashicon dashicons-edit',
            onclick: function() {
                
                // get the script text
                var node = editor.selection.getNode();
                var script = cnx_get_embed_script_from_element( node.outerHTML );

                // open the lightbox with custom URL
                editor.execCommand('cnx_open_modal', false, {"script": script} );
            }
        });

        editor.once( 'preinit', function() {
            if ( editor.wp && editor.wp._createToolbar ) {
                toolbar = editor.wp._createToolbar( [
                    'cnx_video_edit',
                    'cnx_video_remove'
                ] );
            }
        } );
    
        editor.on( 'wptoolbar', function( event ) {

            var $elem = editor.dom.$(event.element);

            if( $elem.hasClass('mce-object-iframe') && $elem.find("iframe.cnx-video-iframe") ) {
                event.toolbar = toolbar;
            }

        } );


    });
})();
