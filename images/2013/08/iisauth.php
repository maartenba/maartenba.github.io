<?php
/*
Plugin Name: RealDolmen - IIS Authentication Plugin
Plugin URI: http://realdolmen.com
Description: This plugin allows WordPress to use any IIS authentication method for authentication instead of only the built-in WordPress forms-based authentication method. Ensure Windows Authentication is enabled in IIS.
Version: 1.1
Author: Maarten Balliauw
Author URI: http://blog.maartenballiauw.be
*/

add_action('init', 'iisauth_auto_login');
add_action('login_form', 'iisauth_wp_login_form');

/**
 * Check if the user is browsing from the internal network
 * 
 * @return boolean
 */
function iisauth_is_lan_user() {
	// Is it a user from the internal LAN?
	$remoteAddress = $_SERVER['REMOTE_ADDR'];	
	return (substr($remoteAddress, 0, 8) === '192.168.' || substr($remoteAddress, 0, 3) === '10.');
}

/**
 * Is the user using IE?
 * 
 * @return boolean
 */
function iisauth_using_ie() 
{ 
    $userAgent = $_SERVER['HTTP_USER_AGENT'];
    if (preg_match('/MSIE/i', $userAgent) && preg_match('/Win/i', $userAgent)) 
    { 
        return true;
    }
    return false; 
}

/**
 * Should autologin occur?
 */
function iisauth_should_autologin() {
	return iisauth_is_lan_user() && iisauth_using_ie();
}


/**
 * Auto-login if the user is known
 */
function iisauth_auto_login() {
	if (!is_user_logged_in() && iisauth_should_autologin()) {
		iisauth_wp_login_form();
	}
}


/**
 * Add Windows Authentication to wp-login.php
 *
 * @action: login_form
 **/
function iisauth_wp_login_form() {
	// Checks if IIS provided a user, and if not, rejects the request with 401
	// so that it can be authenticated
	if (iisauth_should_autologin() && empty($_SERVER["REMOTE_USER"])) {
		nocache_headers();
		header("HTTP/1.1 401 Unauthorized");
		ob_clean();
		exit();
	} else if (iisauth_should_autologin() && !empty($_SERVER["REMOTE_USER"])) {
		if (function_exists('get_user_by')) {
			$username = strtolower(substr($_SERVER['REMOTE_USER'], strrpos($_SERVER['REMOTE_USER'], '\\') + 1));

			$user = get_user_by('login', $username);
			if (!is_a($user, 'WP_User')) {
				// Create the user
				$newUserId = iisauth_create_wp_user($username);
				if (!is_a($newUserId, 'WP_Error')) {
					$user = get_user_by('login', $username);
				}
			}
			
			if ($user && $username == $user->user_login) {
				// Clean buffers
				ob_clean();
								
				// Feed WordPress a double-MD5 hash (MD5 of value generated in check_passwords)
				$password = md5($user->user_pass);
				
				// User is now authorized; force WordPress to use the generated password
				$using_cookie = true;
				wp_setcookie($user->user_login, $password, $using_cookie);
				
				// Redirect and stop execution
				$redirectUrl = home_url();
				if (isset($_GET['redirect_to'])) {
					$redirectUrl = $_GET['redirect_to'];
				}
				wp_redirect($redirectUrl);
				exit;
			}
		}
	}
}

/**
 * Creates a Wordpress User
 * 
 * @return int
 */
function iisauth_create_wp_user($username)
{
	$userData = array(
		'user_pass'     => microtime(),
		'user_login'    => $username,
		'user_nicename' => $username,
		'user_email'    => $username . '@localhost',
		'display_name'  => $username,
		'first_name'    => $username,
		'last_name'     => $username,
		'role'			=> 'subscriber'
	);
				
	return wp_insert_user($userData);
}
?>