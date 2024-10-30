<h3>Connatix</h3>

<table class="form-table">

    <tr>
        <th><label for="cnx_auth_token">Auth Token</label></th>

        <td>

            <input  type="text" 
                    name="cnx_auth_token" 
                    id="cnx_auth_token" 
                    value="<?php echo esc_attr( get_user_meta($user->ID, 'cnx_auth_token', true ) ); ?>" 
                    class="regular-text" />

            <br />

            <span class="description">Connatix authentication token</span>
        </td>
    </tr>

</table>