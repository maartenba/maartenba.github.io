---
layout: post
title: "A phone call from the cloud: Windows Azure, SignalR & Twilio"
pubDatetime: 2012-11-12T13:52:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/11/12/a-phone-call-from-the-cloud-windows-azure-signalr-twilio.html
---
<p><i>Note: this blog post used to be an article for the Windows Azure Roadtrip website. Since that one no longer exists, I decided to post the articles on my blog as well. Find the source code for this post here: <a href="/files/2012/11/05+ConfirmPhoneNumberDemo.zip">05 ConfirmPhoneNumberDemo.zip (1.32 mb)</a>.     <br />It has been written earlier this year, some versions of packages used (like jQuery or SignalR) may be outdated in this post. Live with it.</i></p>  <p>In the <a href="/post/2012/11/12/Sending-e-mail-from-Windows-Azure.aspx">previous blog post</a> we saw how you can send e-mails from Windows Azure. Why not take communication a step further and make a phone call from Windows Azure? I’ve already mentioned that Windows Azure is a platform which will run your code, topped with some awesomesauce in the form of a large number of components that will speed up development. One of those components is the API provided by <a href="http://ahoy.twilio.com/azure">Twilio</a>, a third-party service.</p>  <p>Twilio is a telephony web-service API that lets you use your existing web languages and skills to build voice and SMS applications. Twilio Voice allows your applications to make and receive phone calls. Twilio SMS allows your applications to make and receive SMS messages. We’ll use Twilio Voice in conjunction with <a href="http://www.jquery.com">jQuery</a> and <a href="http://www.github.com/signalr/signalr">SignalR</a> to spice up a sign-up process.</p>  <h3>The scenario</h3>  <p>The idea is simple: we want users to sign up using a username and password. In addition, they’ll have to provide their phone number. The user will submit the sign-up form and will be displayed a confirmation code. In the background, the user will be called and asked to enter this confirmation code in order to validate his phone number. Once finished, the browser will automatically continue the sign-up process. Here’s a visual:</p>  <p><a href="/images/clip_image002_2.jpg"><img title="clip_image002" style="border-top: 0px; border-right: 0px; background-image: none; border-bottom: 0px; float: none; padding-top: 0px; padding-left: 0px; margin-left: auto; border-left: 0px; display: block; padding-right: 0px; margin-right: auto" border="0" alt="clip_image002" src="/images/clip_image002_thumb_1.jpg" width="484" height="363" /></a></p>  <p>Sounds too good to be true? Get ready, as it’s relatively simple using Windows Azure and Twilio.</p>  <h3>Let’s start…</h3>  <p>Before we begin, make sure you have a <a href="http://ahoy.twilio.com/azure">Twilio</a> account. Twilio offers some free credits, enough to test with. After registering, make sure that you <a href="https://www.twilio.com/user/account/international">enable international calls</a> and that your <a href="https://www.twilio.com/user/account/phone-numbers/verified">phone number is registered</a> as a developer. Twilio takes this step in order to ensure that their service isn’t misused for making abusive phone calls using free developer accounts.</p>  <p>Next, create a Windows Azure project containing an ASP.NET MVC 4 web role. Install the following NuGet packages in it (right-click, Library Package Manager, go wild):</p>  <ul>   <li>jQuery</li>    <li>jQuery.UI.Combined</li>    <li>jQuery.Validation</li>    <li>json2</li>    <li>Modernizr</li>    <li>SignalR</li>    <li>Twilio</li>    <li>Twilio.Mvc</li>    <li>Twilio.TwiML</li> </ul>  <p>It may also be useful to <a href="http://channel9.msdn.com/Events/TechDays/TechDays-2012-Belgium/246">develop some familiarity with the concepts behind SignalR</a>.</p>  <h3>The registration form</h3>  <p>Let’s create our form. Using a simple model class, <i>SignUpModel</i>, create the following action method:</p>  <div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:2ed01294-a973-416e-86b4-c2aca7913461" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 684px; height: 51px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #0000FF;">public</span><span style="color: #000000;"> ActionResult Index()
{
    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> View(</span><span style="color: #0000FF;">new</span><span style="color: #000000;"> SignUpModel());
}
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>This action method is accompanied with a view, a simple form requesting the required information from our user:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:d25a7f4a-f21e-4d16-8627-16bc8b7be27d" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 684px; height: 301px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">@using (Html.BeginForm(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">SignUp</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Home</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, FormMethod.Post)) {
    @Html.ValidationSummary(</span><span style="color: #0000FF;">true</span><span style="color: #000000;">)
 
    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">fieldset</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
        </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">legend</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">Sign Up </span><span style="color: #0000FF;">for</span><span style="color: #000000;"> </span><span style="color: #0000FF;">this</span><span style="color: #000000;"> awesome service</span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">legend</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
 
         @</span><span style="color: #000000;">*</span><span style="color: #000000;"> etc etc etc </span><span style="color: #000000;">*</span><span style="color: #000000;">@
 
        </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">div </span><span style="color: #0000FF;">class</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">editor-label</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
            @Html.LabelFor(model </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> model.Phone)
        </span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">div</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
        </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">div </span><span style="color: #0000FF;">class</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">editor-field</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
            @Html.EditorFor(model </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> model.Phone)
            @Html.ValidationMessageFor(model </span><span style="color: #000000;">=&gt;</span><span style="color: #000000;"> model.Phone)
        </span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">div</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
 
        </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">p</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
            </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">input type</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">submit</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> value</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Sign up!</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">/&gt;</span><span style="color: #000000;">
        </span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">p</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
    </span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">fieldset</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>We’ll spice up this form with a dialog first. Using jQuery UI, we can create a simple &lt;div&gt; element which will serve as the dialog’s content. Note the <i>ui-helper-hidden</i> class which is used to make it invisible to view.</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:8db07a2c-a79a-4e4a-8270-fdc7d5c9b197" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 684px; height: 89px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">&lt;</span><span style="color: #000000;">div id</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">phoneDialog</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">ui-helper-hidden</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">h1</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">Keep an eye on your phone...</span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">h1</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">p</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">Pick up the phone and follow the instructions.</span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">p</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">p</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">You will be asked to enter the following code:</span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">p</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">h2</span><span style="color: #000000;">&gt;</span><span style="color: #800080;">1743</span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">h2</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">div</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>This is a simple dialog in which we’ll show a hardcoded confirmation code which the user will have to provide when called using Twilio.</p>

<p>Next, let’s code our JavaScript logic which will spice up this form. First, add the required JavaScript libraries for SignalR (more on that later):</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:84741e61-65d7-4e45-b51e-aa885c028ac7" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 684px; height: 68px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">&lt;</span><span style="color: #000000;">script src</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">@Url.Content(</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">~/</span><span style="color: #000000;">Scripts</span><span style="color: #000000;">/</span><span style="color: #000000;">jquery.signalR</span><span style="color: #000000;">-</span><span style="color: #800080;">0.5</span><span style="color: #000000;">.</span><span style="color: #800080;">0</span><span style="color: #000000;">.min.js</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">)</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> type</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">text/javascript</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">&gt;&lt;/</span><span style="color: #000000;">script</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">script src</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">@Url.Content(</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">~/</span><span style="color: #000000;">signalr</span><span style="color: #000000;">/</span><span style="color: #000000;">hubs</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">)</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> type</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">text/javascript</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">&gt;&lt;/</span><span style="color: #000000;">script</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Next, capture the form’s <i>submit</i> event and, if the phone number has not been validated yet, cancel the submit event and show our dialog instead:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:da3ba3ff-378f-4d11-aeda-e36a597b580a" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 684px; height: 301px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">$(</span><span style="color: #000000;">'</span><span style="color: #000000;">form:first</span><span style="color: #000000;">'</span><span style="color: #000000;">).submit(</span><span style="color: #0000FF;">function</span><span style="color: #000000;"> (e) {
    </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> ($(</span><span style="color: #0000FF;">this</span><span style="color: #000000;">).valid() </span><span style="color: #000000;">&amp;&amp;</span><span style="color: #000000;"> $(</span><span style="color: #000000;">'</span><span style="color: #000000;">#Phone</span><span style="color: #000000;">'</span><span style="color: #000000;">).data(</span><span style="color: #000000;">'</span><span style="color: #000000;">validated</span><span style="color: #000000;">'</span><span style="color: #000000;">) </span><span style="color: #000000;">!=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">true</span><span style="color: #000000;">) {                
        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Show a dialog</span><span style="color: #008000;">
</span><span style="color: #000000;">        $(</span><span style="color: #000000;">'</span><span style="color: #000000;">#phoneDialog</span><span style="color: #000000;">'</span><span style="color: #000000;">).dialog({
            title: </span><span style="color: #000000;">''</span><span style="color: #000000;">,
            modal: </span><span style="color: #0000FF;">true</span><span style="color: #000000;">,
            width: </span><span style="color: #000000;">400</span><span style="color: #000000;">,
            height: </span><span style="color: #000000;">400</span><span style="color: #000000;">,
            resizable: </span><span style="color: #0000FF;">false</span><span style="color: #000000;">,
            beforeClose: </span><span style="color: #0000FF;">function</span><span style="color: #000000;"> () {
                </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> ($(</span><span style="color: #000000;">'</span><span style="color: #000000;">#Phone</span><span style="color: #000000;">'</span><span style="color: #000000;">).data(</span><span style="color: #000000;">'</span><span style="color: #000000;">validated</span><span style="color: #000000;">'</span><span style="color: #000000;">) </span><span style="color: #000000;">!=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">true</span><span style="color: #000000;">) {
                    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #0000FF;">false</span><span style="color: #000000;">;
                }
            }
        });
                
        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Don't submit. Yet.</span><span style="color: #008000;">
</span><span style="color: #000000;">        e.preventDefault();
    }
});
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Nothing fancy yet. If you now run this code, you’ll see that a dialog opens and remains open for eternity. Let’s craft some SignalR code now. SignalR uses a concept of <i>Hubs</i> to enable client-server communication, but also server-client communication. We’ll need the latter to inform our view whenever the user has confirmed his phone number. In the project, add the following class:</p>

<p>
  <div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b7bb21fe-42e8-4f4a-91e3-4d743d39699b" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 684px; height: 134px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">[HubName(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">phonevalidator</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">)]
</span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> PhoneValidatorHub
    : Hub
{
    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> StartValidation(</span><span style="color: #0000FF;">string</span><span style="color: #000000;"> phoneNumber)
    {
    }
}
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

  <br />This class defines a service that the client can call. SignalR will also keep the connection with the client open so that this <i>PhoneValidatorHub</i> can later send a message to the client as well. Let’s connect our view to this hub. In the form submit event handler, add the following line of code:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f8f1c9fe-1ac5-4452-9091-0b578880f094" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 684px; height: 46px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008000;">//</span><span style="color: #008000;"> Validate the phone number using Twilio</span><span style="color: #008000;">
</span><span style="color: #000000;">$.connection.phonevalidator.startValidation($(</span><span style="color: #800000;">'</span><span style="color: #800000;">#Phone</span><span style="color: #800000;">'</span><span style="color: #000000;">).val());
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>We’ve created a C# class with a <i>StartValidation</i> method and we’re calling the <i>startValidation</i> message from JavaScript. Coincidence? No. SignalR makes this possible. But we’re not finished yet. We can now call a method on the server side, but how would the server inform the client when the phone number has been validated? I’ll get to that point later. First, let’s make sure our JavaScript code can receive that call from the server. To do so, connect to the <i>PhoneValidator</i> hub and add a callback function to it:</p>

<p>
  <div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:404fd771-b7dd-4b02-bfad-cbc0729ec9f1" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 684px; height: 142px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">var validatorHub </span><span style="color: #000000;">=</span><span style="color: #000000;"> $.connection.phonevalidator;
validatorHub.validated </span><span style="color: #000000;">=</span><span style="color: #000000;"> function (phoneNumber) {
    </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (phoneNumber </span><span style="color: #000000;">==</span><span style="color: #000000;"> $(</span><span style="color: #800000;">'</span><span style="color: #800000;">#Phone</span><span style="color: #800000;">'</span><span style="color: #000000;">).val()) {
        $(</span><span style="color: #800000;">'</span><span style="color: #800000;">#Phone</span><span style="color: #800000;">'</span><span style="color: #000000;">).data(</span><span style="color: #800000;">'</span><span style="color: #800000;">validated</span><span style="color: #800000;">'</span><span style="color: #000000;">, </span><span style="color: #0000FF;">true</span><span style="color: #000000;">);
        $(</span><span style="color: #800000;">'</span><span style="color: #800000;">#phoneDialog</span><span style="color: #800000;">'</span><span style="color: #000000;">).dialog(</span><span style="color: #800000;">'</span><span style="color: #800000;">destroy</span><span style="color: #800000;">'</span><span style="color: #000000;">);
        $(</span><span style="color: #800000;">'</span><span style="color: #800000;">form:first</span><span style="color: #800000;">'</span><span style="color: #000000;">).trigger(</span><span style="color: #800000;">'</span><span style="color: #800000;">submit</span><span style="color: #800000;">'</span><span style="color: #000000;">);
    }
};
$.connection.hub.start();
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

  <br /></p>

<p>What we’re doing here is adding a client-side function named <i>validated</i> to the SignalR hub. We can call this function, sitting at the client side, from our server-side code later on. The function itself is easy: it checks whether the phone number that was validated matches the one the user entered and, if so, it submits the form and completes the signup.</p>

<p>All that’s left is calling the user and, when the confirmation succeeds, we’ll have to inform our client by calling the <i>validated</i> message on the hub.</p>

<h3>Initiating a phone call</h3>

<p>The phone call to our user will be initiated in the <i>PhoneValidatorHub</i>’s <i>StartValidation</i> method. Add the following code there:</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:9e866f26-9c05-443d-8726-221521d8e8aa" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 684px; height: 142px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">var twilioClient </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> TwilioRestClient(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">api user</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">api password</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
 
</span><span style="color: #0000FF;">string</span><span style="color: #000000;"> url </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">http://mas.cloudapp.net/Home/TwilioValidationMessage?passcode=1743</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">
    </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">&amp;phoneNumber=</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> HttpContext.Current.Server.UrlEncode(phoneNumber);
 
</span><span style="color: #008000;">//</span><span style="color: #008000;"> Instantiate the call options that are passed to the outbound call</span><span style="color: #008000;">
</span><span style="color: #000000;">CallOptions options </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> CallOptions();
options.From </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">+14155992671</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">; </span><span style="color: #008000;">//</span><span style="color: #008000;"> Twilio's developer number </span><span style="color: #008000;">
</span><span style="color: #000000;">options.To </span><span style="color: #000000;">=</span><span style="color: #000000;"> phoneNumber;
options.Url </span><span style="color: #000000;">=</span><span style="color: #000000;"> url;
 
</span><span style="color: #008000;">//</span><span style="color: #008000;"> Make the call.</span><span style="color: #008000;">
</span><span style="color: #000000;">twilioClient.InitiateOutboundCall(options);
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Using the <i>TwilioRestClient</i> class, we create a request to Twilio. We also pass on a URL which points to our application. Twilio uses TwiML, an XML format to instruct their phone services. When calling the <i>InitiateOutboundCall</i> method, Twilio will issue a request to the URL we are hosting (<a href="http://.....cloudapp.net/Home/TwilioValidationMessage">http://.....cloudapp.net/Home/TwilioValidationMessage</a>) to fetch the TwiML which tells Twilio what to say, ask, record, gather, … on the phone.</p>

<p>Next up: implementing the <i>TwilioValidationMessage</i> action method.</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:1f4fbdd0-0a45-4c6b-ae16-8f379e57e6e1" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 684px; height: 142px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #0000FF;">public</span><span style="color: #000000;"> ActionResult TwilioValidationMessage(</span><span style="color: #0000FF;">string</span><span style="color: #000000;"> passcode, </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> phoneNumber)
{
    var response </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> TwilioResponse();
    response.Say(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Hi there, welcome to Maarten's Awesome Service.</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
    response.Say(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">To validate your phone number, please enter the 4 digit</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">
        </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;"> passcode displayed on your screen followed by the pound sign.</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
    response.BeginGather(</span><span style="color: #0000FF;">new</span><span style="color: #000000;"> {
        numDigits </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">4</span><span style="color: #000000;">,
        action </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">http://mas.cloudapp.net/Home/TwilioValidationCallback?phoneNumber=</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">
             </span><span style="color: #000000;">+</span><span style="color: #000000;"> Server.UrlEncode(phoneNumber), method </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">GET</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> });
    response.EndGather();
 
    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> TwiMLResult(response);
}
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>That’s right. We’re creating some <a href="https://www.twilio.com/docs/api/twiml">TwiML</a> here. Our ASP.NET MVC action method is telling Twilio to say some text and to gather 4 digits from his phone pad. These 4 digits will be posted to the <i>TwilioValidationCallback</i> action method by the Twilio service. Which is the next method we’ll have to implement.</p>

<div id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:18324b19-8111-48a4-bfc6-0f839f444352" class="wlWriterEditableSmartContent" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 684px; height: 142px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #0000FF;">public</span><span style="color: #000000;"> ActionResult TwilioValidationCallback(</span><span style="color: #0000FF;">string</span><span style="color: #000000;"> phoneNumber)
{
    var hubContext </span><span style="color: #000000;">=</span><span style="color: #000000;"> GlobalHost.ConnectionManager.GetHubContext</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">PhoneValidatorHub</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">();
    hubContext.Clients.validated(phoneNumber);
 
    var response </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> TwilioResponse();
    response.Say(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Thank you! Your browser should automatically continue. Bye!</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
    response.Hangup();
 
    </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> TwiMLResult(response);
}
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>The <i>TwilioValidationCallback</i> action method does two things. First, it gets a reference to our SignalR hub and calls the <i>validated</i> function on it. As you may recall, we created this method on the hub’s client side, so in fact our ASP.NET MVC server application is calling a method on the client side. Doing this triggers the client to hide the validation dialog and complete the user sign-up process.</p>

<p>Another action we’re doing here is generating some more TwiML (it’s fun!). We thank the user for validating his phone number and, after that, we hang up the call.</p>

<p>You see? Working with voice (and text messages too, if you want) isn’t that hard. It enables additional scenarios that can make your application stand out from all the many others out there. Enjoy!</p><p><a href="/files/2012/11/05+ConfirmPhoneNumberDemo.zip">05 ConfirmPhoneNumberDemo.zip (1.32 mb)</a></p>



