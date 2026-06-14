---
layout: post
title: "Wordpress auto sign-on with IIS7 and a plugin"
pubDatetime: 2011-05-04T11:17:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "General", "PHP", "Projects", "Publications", "Webfarm"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/05/04/wordpress-auto-sign-on-with-iis7-and-a-plugin.html
---
For our [RealDolmen blog platform](http://blogs.realdolmen.com/experts/), where we use [Wordpress](http://wordpress.org) as the engine running multiple external and internal blogs (yes, that’s an internal SaaS we have there!), we wanted to have an easy solution for our employees to sign-on to the platform. We had a look at the Wordpress plugin repository and found the excellent [Simple LDAP Login](http://wordpress.org/extend/plugins/simple-ldap-login/) plugin for providing sign-on through Active Directory. This allowed for sign-on using Active Directory credentials. However, when browsing the blogs from the corporate network, the login page is one extra step in the way of users: they are already logged on to the network, so why sign-on again using the same credentials?

Luckily for us, we are hosting [Wordpress](http://wordpress.org) on [Windows, IIS 7 and SQL Server](http://wordpress.visitmix.com/). Shocked? No Linux, MySQL, .htaccess and mod_rewrite there! And it works perfectly. In fact, we get some extras for free: single sign-on is made possible by IIS!

## Configuring Windows Authentication in IIS7

In order to provide a single sign-on scenario for Wordpress on IIS, simply enable Windows Authentication in the IIS7 management console, like so:

[![](/images/image_thumb_81.png)](/images/image_111.png)

If you now browse to the Wordpress site… Nothing happens! Except the normal stuff: a non-logged-in version of the site is displaying… The reason for this is obvious: anonymous authentication is also enabled and is higher up the chain, hence IIS7 refuses to authenticate the user using his Active Directory credentials… One solution may be to reverse the order, but that would mean *every* single user is required to sign-on. Not the ideal situation… And that’s where our custom plugin for Wordpress comes in handy, heck, we’re even sharing it with you so you can use it too!

## Fooling IIS7 when required…

A solution to the fact that anonymous authentication is higher up the chain in IIS7 and that this is required by the fact that we don’t want everyone to have to login, is fooling IIS7 into believing that Windows Authentication is higher up the chain in some situations… And why not do that from PHP and wrap that “hack” into a Wordpress plugin?

The basis for our plugin is the following: whenever a user browses the website and uses Internet Explorer (sorry, no support for this in the other browsers…), Windows Authentication is a possibility. The only step left is triggering this, which is pretty easy: if you detect a user is coming from the local LAN and is using Internet Explorer (on Windows), send the user a *HTTP/1.1 401 Unauthorized* header. This will make IE send out the Windows Authentication token to the server and will also trick IIS7 into thinking that anonymous authentication failed, which will immediately trigger Windows Authentication server-side as well.

Now how to do this in a Wordpress plugin? Well, simple: hook into 2 events Wordpress offers, namely *init* and *login_form*. Init? Well, yes! You want users to automatically sign-on when coming from the LAN. There’s no better hook to do that than *init*. The other one is obvious: if a user somehow lands at the login page and is coming from the local LAN, you want that page to be skipped and use Windows Authentication there. Here’s some simplified code for registering the hooks:

1 <?php 2 add_action('init','iisauth_auto_login'); 3 add_action('login_form','iisauth_wp_login_form');

Next, implementation! Let’s start with what happens on *init*:

1 function iisauth_auto_login() { 2 if (!is_user_logged_in() && iisauth_is_lan_user() && iisauth_using_ie()) { 3  iisauth_wp_login_form(); 4  } 5 }

As you can see: whenever we suspect a user is coming from the internal LAN and is using IE, we call the *iisauth_wp_login_form()* method (which “by accident” also gets triggered when a user is on the login page). Here’s that code:

 1 function iisauth_wp_login_form() {  2 // Checks if IIS provided a user, and if not, rejects the request with 401  3  // so that it can be authenticated 4 if (iisauth_is_lan_user() && iisauth_using_ie() &&empty($_SERVER["REMOTE_USER"])) {  5  nocache_headers();  6 header("HTTP/1.1 401 Unauthorized");  7 ob_clean();  8 exit();  9  } elseif (iisauth_is_lan_user() && iisauth_using_ie() &&!empty($_SERVER["REMOTE_USER"])) { 10 if (function_exists('get_userdatabylogin')) { 11 $username=strtolower(substr($_SERVER['REMOTE_USER'],strrpos($_SERVER['REMOTE_USER'],'\\') +1)); 12 13 $user= get_userdatabylogin($username); 14 if (!is_a($user,'WP_User')) { 15 // Create the user16 $newUserId= iisauth_create_wp_user($username); 17 if (!is_a($newUserId,'WP_Error')) { 18 $user= get_userdatabylogin($username); 19  } 20  } 21 22 if ($user&&$username==$user->user_login) { 23 // Clean buffers24 ob_clean(); 25 26 // Feed WordPress a double-MD5 hash (MD5 of value generated in check_passwords)27 $password=md5($user->user_pass); 28 29 // User is now authorized; force WordPress to use the generated password30 $using_cookie=true; 31  wp_setcookie($user->user_login,$password,$using_cookie); 32 33 // Redirect and stop execution34 $redirectUrl= home_url(); 35 if (isset($_GET['redirect_to'])) { 36 $redirectUrl=$_GET['redirect_to']; 37  } 38  wp_redirect($redirectUrl); 39 exit; 40  } 41  } 42  } 43 }

What happens here is that the authentication header is sent when needed, and once a user is provided by IIS we just log the user in to Wordpress and redirect him. The real “magic” is in this part:

1 // Checks if IIS provided a user, and if not, rejects the request with 401 2 // so that it can be authenticated3 if (iisauth_is_lan_user() && iisauth_using_ie() &&empty($_SERVER["REMOTE_USER"])) { 4  nocache_headers(); 5 header("HTTP/1.1 401 Unauthorized"); 6 ob_clean(); 7 exit(); 8 }

Which does exactly what I described before in this post…

## Download

Well of course, feel free to use this plugin! Here’s the source code: [iisauth.zip (1.44 kb)](/files/2011/5/iisauth.zip) **[update] Code for Wordpress 3.1+: **[IISAUTH.PHP (3.4KB)](/files/2014/03/iisauth.php)

**(**And big thanks to our marketing manager for allowing me to distribute this little plugin! Again proof for the no-nonsense spirit at [RealDolmen](http://www.realdolmen.com)!)
