---
layout: post
title: "Working with a private npm registry in Azure Web Apps"
date: 2015-10-13 10:33:00 +0200
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "ICT", "JavaScript", "Windows Azure"]
alias: ["/post/2015/10/13/Working-with-a-private-npm-registry-in-Azure-Web-Apps.aspx", "/post/2015/10/13/working-with-a-private-npm-registry-in-azure-web-apps.aspx"]
author: Maarten Balliauw
---
<p>Using <a href="https://azure.microsoft.com/en-us/documentation/services/app-service/web/">Azure Web Apps</a>, we can deploy and host Node applications quite easily. But what to do with packages the site depends on? Do we have to upload them manually to Azure Web Apps? Include them in our Git repository? None of that: we just have to make sure our app’s <em>package,json</em> is checked in so that Azure Web Apps can install them during deployment. Let’s see how.</p> <h2>Installing node modules during deployment</h2> <p>In this blog post, we’ll create a simple application using <a href="http://expressjs.com/">Express</a>. In its simplest form, an Express application will map incoming request paths to a function that generates the response. This makes Express quite interesting to work with: we can return a simple string or delegate work to a full-fledged MVC component if we want to. Here’s the simplest application I could think of, returning “Hello world!” whenever the root URL is requested. We can save it as <em>server.js</em> so we can deploy it later on.</p> <div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:207dd58b-e67a-4612-b180-21f4da61d57b" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 829px; height: 260px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #0000FF;">var</span><span style="color: #000000;"> express </span><span style="color: #000000;">=</span><span style="color: #000000;"> require(</span><span style="color: #000000;">"</span><span style="color: #000000;">express</span><span style="color: #000000;">"</span><span style="color: #000000;">);
</span><span style="color: #0000FF;">var</span><span style="color: #000000;"> app </span><span style="color: #000000;">=</span><span style="color: #000000;"> express();

app.get(</span><span style="color: #000000;">"</span><span style="color: #000000;">/</span><span style="color: #000000;">"</span><span style="color: #000000;">, </span><span style="color: #0000FF;">function</span><span style="color: #000000;">(req, res) {
    res.send(</span><span style="color: #000000;">"</span><span style="color: #000000;">Hello world!</span><span style="color: #000000;">"</span><span style="color: #000000;">);
});

console.log(</span><span style="color: #000000;">"</span><span style="color: #000000;">Web application starting...</span><span style="color: #000000;">"</span><span style="color: #000000;">);
app.listen(process.env.PORT);
console.log(</span><span style="color: #000000;">"</span><span style="color: #000000;">Web application started on port </span><span style="color: #000000;">"</span><span style="color: #000000;"> </span><span style="color: #000000;">+</span><span style="color: #000000;"> process.env.PORT);</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Of course, this will not work as-is. We need to ensure Express (and its dependencies) are installed as well. We can do this using npm, running the following commands:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:5a084f61-5741-4c73-85de-c66a9814971a" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 829px; height: 123px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008000;">#</span><span style="color: #008000;"> create package.json describing our project</span><span style="color: #008000;">
</span><span style="color: #000000;">npm init

</span><span style="color: #008000;">#</span><span style="color: #008000;"> install and save express as a dependency</span><span style="color: #008000;">
</span><span style="color: #000000;">npm install express </span><span style="color: #000000;">--</span><span style="color: #000000;">save
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>That’s pretty much it, running this is as simple as setting the PORT environment variable and running it using node.</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:7dbac673-ed29-4fd2-85b7-ad524167e19a" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 829px; height: 55px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">set PORT</span><span style="color: #000000;">=</span><span style="color: #000000;">1234</span><span style="color: #000000;">
node server.js</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>We can now commit our code, excluding the <em>node_modules</em> folder to our Azure Web App git repository. Ideally we create a <em>.gitignore </em>file that excludes this folder for once and for all. Once committed, Azure Web Apps starts a convention-based deployment process. One of the conventions is that for a Node application, all dependencies from <em>package.json</em> are installed. We can see this convention in action from the Azure portal.</p>
<p><a href="/images/image_360.png"><img width="800" height="510" title="Azure Deploy Node.JS" style="border-left-width: 0px; border-right-width: 0px; background-image: none; border-bottom-width: 0px; padding-top: 0px; padding-left: 0px; display: inline; padding-right: 0px; border-top-width: 0px" alt="Azure Deploy Node.JS" src="/images/image_thumb_320.png" border="0"></a></p>
<p>Great! Seems we have to do nothing special to get this to work. Except… What if we are using our <em>own, private npm modules</em>? How can we tell Azure Web Apps to make use of a different npm registry? Let’s see…</p>
<h2>Installing private node modules during deployment</h2>
<p>When building applications, we may be splitting parts of the application into separate node modules to make the application more componentized, make it easier to develop individual components and so on. We can use a <a href="http://www.myget.org/npm">private npm registry</a> to host these components, an example being <a href="http://www.myget.org">MyGet</a>. Using a private npm feed we can give our development team access to these components using “good old npm” while not throwing these components out on the public <a href="http://npmjs.org">npmjs.org</a>.</p>
<p>Imagine we have a module called <em>demo-site-pages</em> which contains some of the views our web application will be hosting. We can add a dependency to this module in our <em>package.json</em>:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:b1aeeefa-3c4b-40d1-a749-db9dba001dfb" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 829px; height: 328px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">{
  </span><span style="color: #000000;">"</span><span style="color: #000000;">name</span><span style="color: #000000;">"</span><span style="color: #000000;">: </span><span style="color: #000000;">"</span><span style="color: #000000;">demo-site</span><span style="color: #000000;">"</span><span style="color: #000000;">,
  </span><span style="color: #000000;">"</span><span style="color: #000000;">version</span><span style="color: #000000;">"</span><span style="color: #000000;">: </span><span style="color: #000000;">"</span><span style="color: #000000;">1.0.0</span><span style="color: #000000;">"</span><span style="color: #000000;">,
  </span><span style="color: #000000;">"</span><span style="color: #000000;">description</span><span style="color: #000000;">"</span><span style="color: #000000;">: </span><span style="color: #000000;">"</span><span style="color: #000000;">Demo site</span><span style="color: #000000;">"</span><span style="color: #000000;">,
  </span><span style="color: #000000;">"</span><span style="color: #000000;">main</span><span style="color: #000000;">"</span><span style="color: #000000;">: </span><span style="color: #000000;">"</span><span style="color: #000000;">index.js</span><span style="color: #000000;">"</span><span style="color: #000000;">,
  </span><span style="color: #000000;">"</span><span style="color: #000000;">scripts</span><span style="color: #000000;">"</span><span style="color: #000000;">: {
    </span><span style="color: #000000;">"</span><span style="color: #000000;">test</span><span style="color: #000000;">"</span><span style="color: #000000;">: </span><span style="color: #000000;">"</span><span style="color: #000000;">echo \"Error: no test specified\" &amp;&amp; exit 1</span><span style="color: #000000;">"</span><span style="color: #000000;">
  },
  </span><span style="color: #000000;">"</span><span style="color: #000000;">author</span><span style="color: #000000;">"</span><span style="color: #000000;">: </span><span style="color: #000000;">""</span><span style="color: #000000;">,
  </span><span style="color: #000000;">"</span><span style="color: #000000;">dependencies</span><span style="color: #000000;">"</span><span style="color: #000000;">: {
    </span><span style="color: #000000;">"</span><span style="color: #000000;">express</span><span style="color: #000000;">"</span><span style="color: #000000;">: </span><span style="color: #000000;">"</span><span style="color: #000000;">^4.13.3</span><span style="color: #000000;">"</span><span style="color: #000000;">,
    </span><span style="color: #000000;">"</span><span style="color: #000000;">demo-site-pages</span><span style="color: #000000;">"</span><span style="color: #000000;">: </span><span style="color: #000000;">"</span><span style="color: #000000;">*</span><span style="color: #000000;">"</span><span style="color: #000000;">
  }
}
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>Alternatively we could install this package using npm, specifying the registry directly:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:0df5c90d-957b-4659-8d3b-fdc996313b5b" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 829px; height: 30px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">npm install </span><span style="color: #000000;">--</span><span style="color: #000000;">save </span><span style="color: #000000;">--</span><span style="color: #000000;">registry https:</span><span style="color: #000000;">//</span><span style="color: #000000;">www.myget.org</span><span style="color: #000000;">/</span><span style="color: #000000;">F</span><span style="color: #000000;">/</span><span style="color: #000000;">demo</span><span style="color: #000000;">-</span><span style="color: #000000;">site</span><span style="color: #000000;">/</span><span style="color: #000000;">npm</span><span style="color: #000000;">/</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>But now comes the issue: if we push this out to Azure Web Apps, our private registry is not known!</p>
<h3></h3>
<h3>Generating a .npmrc file to work with a private npm registry in Azure Web Apps</h3>
<p>To be able to install node modules from a private npm registry during deployment on Azure Web Apps, we have to ship a <em>.npmrc</em> file with our code. Let’s see how we can do this.</p>

<blockquote>
<p>Since our application uses both npmjs.org as well as our private registry, we want to make sure MyGet proxies packages used from npmjs.org during installation. We can enable this from our feed’s <strong><em>Package Sources</em></strong> tab and edit the default <em>Npmjs.org</em> package source source. Ensure the <strong>Make all upstream packages available in clients<em> </em></strong>option is checked.</p>
</blockquote>

<p>Next, <a href="http://docs.myget.org/docs/walkthrough/getting-started-with-npm">register your MyGet NPM feed</a> (or another registry URL). The easiest way to do this is by running the following commands:</p>
<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:8c356a75-85c8-47a9-b79a-d8a5387b3c0d" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 829px; height: 73px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">npm config set registry https:</span><span style="color: #000000;">//</span><span style="color: #000000;">www.myget.org</span><span style="color: #000000;">/</span><span style="color: #000000;">F</span><span style="color: #000000;">/</span><span style="color: #000000;">your</span><span style="color: #000000;">-</span><span style="color: #000000;">feed</span><span style="color: #000000;">-</span><span style="color: #000000;">name</span><span style="color: #000000;">/</span><span style="color: #000000;">npm
npm login </span><span style="color: #000000;">--</span><span style="color: #000000;">registry</span><span style="color: #000000;">=</span><span style="color: #000000;">https:</span><span style="color: #000000;">//</span><span style="color: #000000;">www.myget.org</span><span style="color: #000000;">/</span><span style="color: #000000;">F</span><span style="color: #000000;">/</span><span style="color: #000000;">your</span><span style="color: #000000;">-</span><span style="color: #000000;">feed</span><span style="color: #000000;">-</span><span style="color: #000000;">name</span><span style="color: #000000;">/</span><span style="color: #000000;">npm
npm config set always</span><span style="color: #000000;">-</span><span style="color: #000000;">auth </span><span style="color: #0000FF;">true</span><span style="color: #000000;">
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>
<p>This generates a <em>.npmrc</em> file under our user profile folder. On Windows that would be something like C<em>:\Users\Username\.npmrc</em>. Copy this file into the application’s root folder and open it in an editor. Depending on the version of npm being used, we may have to set the <em>always-auth</em> setting to <em>true</em>:</p>

<div class="wlWriterEditableSmartContent" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:99756331-422e-44ba-8d1b-e0d5f98af610" style="float: none; padding-bottom: 0px; padding-top: 0px; padding-left: 0px; margin: 0px; display: inline; padding-right: 0px"><pre style=" width: 829px; height: 131px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #000000;">registry</span><span style="color: #000000;">=</span><span style="color: #000000;">https://www.myget.org/F/demo-site/npm
//www.myget.org/F/demo-site/:_password</span><span style="color: #000000;">=</span><span style="color: #000000;">"</span><span style="color: #000000;">BASE64ENCODEDPASSWORD</span><span style="color: #000000;">"</span><span style="color: #000000;">
//www.myget.org/F/demo-site/:username</span><span style="color: #000000;">=</span><span style="color: #000000;">maartenba
//www.myget.org/F/demo-site/:email</span><span style="color: #000000;">=</span><span style="color: #000000;">maarten@myget.org
//www.myget.org/F/demo-site/:always-auth</span><span style="color: #000000;">=</span><span style="color: #000000;">true
</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>If we now commit this file to our git repository, the next deployment on Azure Web Apps will install both packages from npmjs.org, in this case express, as well as packages from our private npm registry.</p>
<p><a href="/images/image_361.png"><img width="800" height="560" title="Installing node module from private npm registry" style="border-left-width: 0px; border-right-width: 0px; background-image: none; border-bottom-width: 0px; padding-top: 0px; padding-left: 0px; display: inline; padding-right: 0px; border-top-width: 0px" alt="Installing node module from private npm registry" src="/images/image_thumb_321.png" border="0"></a></p>
<p>
<p>Enjoy!</p>
{% include imported_disclaimer.html %}
