
import { __ } from '@wordpress/i18n';
const { Component } = wp.element;
import { TextControl, Button, Placeholder } from '@wordpress/components';
import { useState } from '@wordpress/element';

import { EmbedEditModal } from "./edit-embed-modal";

/**
 * PostSelector Component
 */
export class EditEmbed extends Component {

	constructor(props) {

		super(...arguments);
		this.props = props;

		this.state = {
			isModalOpen: false
		};

        this.open_modal = this.open_modal.bind(this);
        this.close_modal = this.close_modal.bind(this);

	}

    open_modal(edit_mode) {

        if( typeof(edit_mode) !== 'undefined' && edit_mode === true ) {

            var frameUrl = jQuery("#cnx_frame_wrap iframe").attr("src");
            var url = new URL(frameUrl);
            url.searchParams.set("embed", encodeURIComponent( this.props.embed_script ) );
            jQuery("#cnx_frame").attr("src", url.toString() );

        }

        this.setState({ isModalOpen: true })

        // bind the insert script event
        var self = this;
        window.handle_script_select = function(e){

            self.props.update_embed( e.detail.script.script );
            self.close_modal();

        }

        window.document.addEventListener('cnx_plugin_insert_script', window.handle_script_select, true);

    }

    close_modal() {
        
        window.document.removeEventListener("cnx_plugin_insert_script", window.handle_script_select, true);
        this.setState({ isModalOpen: false });

        var frameUrl = jQuery("#cnx_frame_wrap iframe").attr("src");
        var url = new URL(frameUrl);
        url.searchParams.delete("embed");
        jQuery("#cnx_frame").attr("src", url.toString() );

    }

	render() {

		const { embed_script = "", change_state = () => {}, update_embed = () => {} } = this.props;

		return (
			<div>
                <Placeholder
                        icon="format-video"
                        label={ __( 'Connatix Video Embed', 'connatix-video-embed' ) }
                        instructions="Select the video to embed"
                    >
                        <form>

                            <Button 
                                isPrimary
                                variant="primary"
                                onClick={() => this.open_modal() }
                            >
                                {__( 'Select Video', 'connatix-video-embed' )}
                            </Button>  

                            <TextControl 
                                className="embed-text-input"
                                value={embed_script}
                                onChange={(new_script) => update_embed(new_script) }
                            /> 

                            { embed_script.length > 0 && false && (

                            <Button 
                                isPrimary
                                variant="primary"
                                onClick={() => this.open_modal(true) }
                            >
                                {__( 'Edit Video', 'connatix-video-embed' )}
                            </Button>  

                            )}   

                            { embed_script.length > 0 && (

                                <Button 
                                    isPrimary
                                    variant="primary"
                                    onClick={() => change_state('preview') }
                                >
                                    {__( 'Preview Video', 'connatix-video-embed' )}
                                </Button>  

                            )}   

                        </form>

                </Placeholder>
                { this.state.isModalOpen && (
                    <EmbedEditModal
                        embed_script={embed_script}
                        close_modal={this.close_modal}
                        update_embed={this.update_embed}
                    ></EmbedEditModal>
                    
                ) }

            </div>
		);
	}
}