import { BlockControls } from '@wordpress/block-editor';
import { Toolbar,  ToolbarButton } from '@wordpress/components';

import InnerHTML from 'dangerously-set-html-content'


export const PreviewEmbed = props => {
	const { embed_script = "", change_state = () => {} } = props;

	if (embed_script.length < 1) {
		return (
			<div> </div> 
		);
	}

	return (
        <div>
            <BlockControls>
                <Toolbar label="Options">
                    <ToolbarButton
                        label="Edit Embed"
                        icon="admin-settings"
                        onClick={ () => change_state('edit') }
                    />
                    
                </Toolbar>
            </BlockControls>
            &nbsp;
            <InnerHTML html={embed_script} /> 
        </div>
	);
};
