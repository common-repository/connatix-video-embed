import { __ } from '@wordpress/i18n';
const { Component } = wp.element;

import { registerBlockType } from '@wordpress/blocks';
import { BlockControls } from '@wordpress/block-editor';
import { TextControl, Button, Placeholder, Toolbar,  ToolbarButton } from '@wordpress/components';

import InnerHTML from 'dangerously-set-html-content'

import { PreviewEmbed } from "../blocks/video-embed/preview-embed";
import { EditEmbed } from "../blocks/video-embed/edit-embed";


registerBlockType(  'cnx/video-embed',  {
    title: 'Connatix: Video Embed', // The title of block in editor.
	icon: 'format-video', // The icon of block in editor.
	category: 'embed', // The category of block in editor.
	attributes: {
		embed_script: {
            type: 'string',
            default: ''
        },

	},
    edit: class extends Component {
		constructor(props) {
			super(...arguments);
			this.props = props;

            this.state = {
                view_state: 'preview', // edit or preview
            };

			this.updateEmbedScript = this.updateEmbedScript.bind(this);
			this.change_state = this.change_state.bind(this);

			// check if we can change the state there based on embed script lengtht
			if(this.props.attributes.embed_script.length < 1){
				this.state.view_state = 'edit';
			}

		}

		change_state(new_state) {

			this.setState({
                view_state: new_state,
            });
		}

		updateEmbedScript( embed_script ) {
			embed_script = btoa(embed_script);
			this.props.setAttributes({ embed_script });
		}

		render() {
			const { className, attributes: { embed_script = ''} = {} } = this.props;

			if(embed_script == "" && this.state.view_state == 'preview'){
				this.change_state('edit');
			}

			if(this.state.view_state == 'edit') {

				return (
					<div>
						<EditEmbed
							embed_script={embed_script}
							change_state={this.change_state}
							update_embed={this.updateEmbedScript}
						></EditEmbed>
					</div>
				);

			}
			else if(this.state.view_state == 'preview'){
				return(
					<div>
						<PreviewEmbed
							embed_script={atob(embed_script)}
							change_state={this.change_state}
						></PreviewEmbed>
					</div>
				)
			}

			
		}
	}

} );
