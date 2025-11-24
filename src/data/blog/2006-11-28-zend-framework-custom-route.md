---
layout: post
title: "Zend Framework custom route"
pubDatetime: 2006-11-28T18:56:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2006/11/28/zend-framework-custom-route.html
---
<p>Today, I was once again testing the Zed Framework. One of the things I was trying to do, is creating URL's in different languages. What I did was creating a controller 'user', with the action 'edit' (i.e. www.example.com/user/edit). Now, I want this to be available in Dutch too (i.e. www.example.com/gebruiker/bewerken). </p><p>The trick is to add custom routes, which map back to the real controller and action. In my case, adding the following in my index.php did the job:</p><pre>$router-&gt;addRoute('customroute1',<br>     new Zend_Controller_Router_Route('gebruiker/bewerken',<br>     array('controller' =&gt; 'user', 'action' =&gt; 'edit')) );</pre>
<p>Only bad thing is that you should add this for all your actions, otherwise not all routes succeed.<br>Another important note is that routes are matched in reverse order. Make sure your most generic routes are defined first, and more specific routes last.
</p>



