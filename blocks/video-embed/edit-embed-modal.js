import { Button, Modal } from '@wordpress/components';
import { useState } from '@wordpress/element';
 
export const EmbedEditModal = props => {

    const { embed_script = "", close_modal = () => {}, update_embed = () => {} } = props;

    var frameUrl = jQuery("#cnx_frame_wrap iframe").attr("src");

    return (
        <>
            <Modal 
                title="Select Video" 
                onRequestClose={ close_modal } 
                shouldCloseOnEsc={false}
                shouldCloseOnClickOutside={false}
                overlayClassName="connatix-embedded-overlay"
                >
                <div id="cnx_frame_wrap">
                    <iframe src={ frameUrl } id="cnx_frame"></iframe>
                </div>
            </Modal>
        </>
    );
};