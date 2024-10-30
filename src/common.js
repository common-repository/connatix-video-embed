(function() {


document.addEventListener('DOMContentLoaded', function() {
	
    
    var framePreload = function (url) {
        var frame = document.createElement("iframe");
        frame.src = url;

        // preload iframe
        var container = document.createElement("div");
        container.style.overflow = "hidden";
        container.style.position = "fixed";
        container.style.pointerEvents = "none";
        container.style.opacity = 0;
        container.style.zIndex = -1;
        container.style.willChange = "transform";
    
        document.body.appendChild(container);

        container.appendChild(frame);
        return frame;
    };

    var frameUrl = jQuery("#cnx_frame_wrap iframe").attr("src")
    framePreload(frameUrl);

});


window.addEventListener('message', function (e) { 

    if(window.cnx_plugin.iframe_origin.indexOf(e.origin) !== -1  ){

        console.log("received message: ",e);

        // trigger custom event that will be used later
        if (e.data.hasOwnProperty('script') && e.data.script.length > 0) { 

            var insertScript = new CustomEvent('cnx_plugin_insert_script', {
                detail: {script: e.data}
            });

            document.dispatchEvent(insertScript);
        }
        if(e.data.hasOwnProperty('t') && e.data.t.length > 0) {

            var data = {
                'action': 'ajax_save_user_auth_token',
                'nonce': window.cnx_plugin.nonce,
			    'cnx_auth_token': e.data.t,
            };

            jQuery.post(ajaxurl, data, function(response) {
                
            });
        }


    }

});


})();