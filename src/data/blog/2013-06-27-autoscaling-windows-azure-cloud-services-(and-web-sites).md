---
layout: post
title: "Autoscaling Windows Azure Cloud Services (and web sites)"
pubDatetime: 2013-06-27T18:05:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "Azure"]
author: Maarten Balliauw
---
<p>At the Build conference, Microsoft today announced that Windows Azure Cloud Services now support autoscaling. And they do! From the Windows Azure Management Portal, we can use the newly introduced <em>SCALE</em> tab to configure autoscaling. That&rsquo;s right: some configuration and we can select the range of instances we want to have. Windows Azure does the rest. And this is true for both Cloud Services and Standard Web Sites (formerly known as Reserved instances).</p>
<p><a href="/images/image_292.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto 6px; display: block; padding-right: 0px; border: 0px;" title="Automatic scaling Windows Azure" src="/images/image_thumb_253.png" alt="Automatic scaling Windows Azure" width="640" height="206" border="0" /></a></p>
<p>We can add various rules in the autoscaler:</p>
<ul>
<li>The trigger for scaling: do we want to base scaling decisions on CPU usage or on the length of a given queue?</li>
<li>The scale up and scale down rules: do we scale by one instance or add / remove 5 at a time?</li>
<li>The interval: how long do we want to not touch the number of instances running after the previous scale operation?</li>
<li>The range: what&rsquo;s the minimum and maximum required instances we want to have running?</li>
</ul>
<p><a href="/images/image_293.png"><img style="background-image: none; float: none; padding-top: 0px; padding-left: 0px; margin: 5px auto; display: block; padding-right: 0px; border: 0px;" title="Automatically increase instances under load" src="/images/image_thumb_254.png" alt="Automatically increase instances under load" width="640" height="410" border="0" /></a></p>
<p>A long awaited feature is there! I'll enable this for some services and see how it goes...</p>



