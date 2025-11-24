---
layout: post
title: "ASP.NET 2.0 Event Validation"
pubDatetime: 2007-04-23T19:01:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/04/23/asp-net-2-0-event-validation.html
---
<p>
Event Validation is a new feature in ASP.NET 2.0 which provides an additional level of checks on postback actions. It verifies whether a postback from a control on client-side is really from that control and not from a malicious person trying to break your application. 
</p>
<p>
Even if you forget to add security checks of your own, ASP.NET provides this functionality, because this feature is enabled by default. Sometimes, it is safe to turn this of, but Microsoft tries to have developers turn this of when they know what they are doing. 
</p>
<p>
Unfortunately: I came across Event Validation&hellip; A user control on a master page convinced ASP.NET that a postback within that same user control was unsafe, resulting in the following error:
</p>
<pre>
&quot;Invalid postback or callback argument.&nbsp; Event validation is
enabled using &lt;pages enableEventValidation=&quot;true&quot;/&gt; in
configuration or &lt;%@ Page EnableEventValidation=&quot;true&quot; %&gt;
in a page.&nbsp;For security purposes, this feature verifies that
arguments to postback or callback events originate from
the server control that originally rendered them.
If the data is valid and expected, use the
ClientScriptManager.RegisterForEventValidation method
in order to register the postback or callback data for validation.&quot;
</pre>
<p>
There are some options to overcome this&hellip; One is to add a EnableEventValidation=&quot;false&quot; in your @Page directive, another is to globally disable this in your Web.config (don&rsquo;t!). The best solution, however, is telling ASP.NET to allow events from your user control&rsquo;s inner controls, by adding the following snippet of code in the user control:
</p>
<p>
[code:c#]
</p>
<p>
protected override void Render(HtmlTextWriter writer)<br />
{<br />
&nbsp;&nbsp;&nbsp; // Register controls for event validation<br />
&nbsp;&nbsp;&nbsp; foreach (Control c in this.Controls)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.Page.ClientScript.RegisterForEventValidation(<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; c.UniqueID.ToString()<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; );<br />
&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; base.Render(writer);<br />
}
</p>
<p>
[/code] 
</p>




