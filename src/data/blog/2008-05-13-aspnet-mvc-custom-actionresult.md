---
layout: post
title: "ASP.NET MVC custom ActionResult (ImageResult)"
pubDatetime: 2008-05-13T19:03:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Personal", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/05/13/asp-net-mvc-custom-actionresult-imageresult.html
---
<p>
The ASP.NET MVC framework introduces the concept of returning an <em>ActionResult</em> in <em>Controller</em>s since the &quot;preview preview&quot; <a href="http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=12640" target="_blank">release on CodePlex</a>. The purpose of this concept is to return a generic <em>ActionResult</em> object for each <em>Controller</em> method, allowing different child classes returning different results. 
</p>
<p>
An example ActionResult (built-in) is the <em>RenderViewResult</em>. Whenever you want to render a view, you can simply return an object of this class which will render a specific view in its <em>ExecuteResult</em> method. Another example is the <em>HttpRedirectResult</em> which will output an HTTP header (Location: /SomethingElse.aspx). 
</p>
<p>
In my opinion, this is a great concept, because it allows you to develop ASP.NET MVC applications more transparently. In this blog post, I will build a custom <em>ActionResult</em> class which will render an image to the HTTP response stream. 
</p>
<p>
<a href="/images/WindowsLiveWriter/ASP.NETMVCcustomActionResultImageResult_D717/image_6.png"><img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/ASP.NETMVCcustomActionResultImageResult_D717/image_thumb_2.png" border="0" alt="ASP.NET MVC Custom ActionResult" title="ASP.NET MVC Custom ActionResult" width="244" height="223" align="right" /></a>As an example, let&#39;s create a page which displays the current time as an image. 
</p>
<p>
One option for implementing this would be creating an ASP.NET HttpHandler which renders this image and can be used inline with a simple HTML tag: <em>&lt;img src=&quot;DisplayTime.ashx&quot; /&gt;</em> 
</p>
<p>
Wouldn&#39;t it be nice to be able to do something more ASP.NET MVC-like? Let&#39;s consider the following: <em>&lt;%=Html.Image&lt;HomeController&gt;(c =&gt; c.DisplayTime(), 200, 50, &quot;Current time&quot;)%&gt;</em> 
</p>
<h2>1. Creating the necessary HtmlHelper extension methods</h2>
<p>
The above example code is not available in standard ASP.NET MVC source code. We&#39;ll need an extension method for this, which will map a specific controller action, width, height and alternate text to a standard HTML image tag: 
</p>
<p>
[code:c#] 
</p>
<p>
public static class ImageResultHelper <br />
{ <br />
&nbsp;&nbsp;&nbsp; public static string Image&lt;T&gt;(this HtmlHelper helper, Expression&lt;Action&lt;T&gt;&gt; action, int width, int height) <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; where T : Controller <br />
&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return ImageResultHelper.Image&lt;T&gt;(helper, action, width, height, &quot;&quot;); <br />
&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; public static string Image&lt;T&gt;(this HtmlHelper helper, Expression&lt;Action&lt;T&gt;&gt; action, int width, int height, string alt) <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; where T : Controller <br />
&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string url = helper.BuildUrlFromExpression&lt;T&gt;(action); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return string.Format(&quot;&lt;img src=\&quot;{0}\&quot; width=\&quot;{1}\&quot; height=\&quot;{2}\&quot; alt=\&quot;{3}\&quot; /&gt;&quot;, url, width, height, alt); <br />
&nbsp;&nbsp;&nbsp; } <br />
}&nbsp; 
</p>
<p>
[/code] 
</p>
<h2>2. The custom ActionResult class</h2>
<p>
Our new <em>ImageResult</em> class will inherit the abstract class <em>ActionResult</em> and implement its <em>ExecuteResult</em> method. This method basically performs communication over the HTTP response stream. 
</p>
<p>
[code:c#] 
</p>
<p>
public class ImageResult : ActionResult <br />
{ <br />
&nbsp;&nbsp;&nbsp; public ImageResult() { } 
</p>
<p>
&nbsp;&nbsp;&nbsp; public Image Image { get; set; } <br />
&nbsp;&nbsp;&nbsp; public ImageFormat ImageFormat { get; set; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; public override void ExecuteResult(ControllerContext context) <br />
&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // verify properties <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (Image == null) <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; throw new ArgumentNullException(&quot;Image&quot;); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (ImageFormat == null) <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; throw new ArgumentNullException(&quot;ImageFormat&quot;); <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // output <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; context.HttpContext.Response.Clear(); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (ImageFormat.Equals(ImageFormat.Bmp)) context.HttpContext.Response.ContentType = &quot;image/bmp&quot;; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (ImageFormat.Equals(ImageFormat.Gif)) context.HttpContext.Response.ContentType = &quot;image/gif&quot;; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (ImageFormat.Equals(ImageFormat.Icon)) context.HttpContext.Response.ContentType = &quot;image/vnd.microsoft.icon&quot;; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (ImageFormat.Equals(ImageFormat.Jpeg)) context.HttpContext.Response.ContentType = &quot;image/jpeg&quot;; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (ImageFormat.Equals(ImageFormat.Png)) context.HttpContext.Response.ContentType = &quot;image/png&quot;; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (ImageFormat.Equals(ImageFormat.Tiff)) context.HttpContext.Response.ContentType = &quot;image/tiff&quot;; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (ImageFormat.Equals(ImageFormat.Wmf)) context.HttpContext.Response.ContentType = &quot;image/wmf&quot;; 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Image.Save(context.HttpContext.Response.OutputStream, ImageFormat); <br />
&nbsp;&nbsp;&nbsp; } <br />
} 
</p>
<p>
[/code] 
</p>
<h2>3. A &quot;DisplayTime&quot; action on the HomeController</h2>
<p>
We&#39;ll add a <em>DisplayTime</em> action on the <em>HomeController</em> class, which will return an instance of the newly created class <em>ImageResult</em>: 
</p>
<p>
[code:c#] 
</p>
<p>
public ActionResult DisplayTime() <br />
{ <br />
&nbsp;&nbsp;&nbsp; Bitmap bmp = new Bitmap(200, 50); <br />
&nbsp;&nbsp;&nbsp; Graphics g = Graphics.FromImage(bmp); 
</p>
<p>
&nbsp;&nbsp;&nbsp; g.FillRectangle(Brushes.White, 0, 0, 200, 50); <br />
&nbsp;&nbsp;&nbsp; g.DrawString(DateTime.Now.ToShortTimeString(), new Font(&quot;Arial&quot;, 32), Brushes.Red, new PointF(0, 0)); 
</p>
<p>
&nbsp;&nbsp;&nbsp; return new ImageResult { Image = bmp, ImageFormat = ImageFormat.Jpeg }; <br />
} 
</p>
<p>
[/code] 
</p>
<p>
And just to be complete, here&#39;s the markup of the index view on the <em>HomeController</em>: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;%@ Page Language=&quot;C#&quot; MasterPageFile=&quot;~/Views/Shared/Site.Master&quot; AutoEventWireup=&quot;true&quot; CodeBehind=&quot;Index.aspx.cs&quot; Inherits=&quot;MvcApplication1.Views.Home.Index&quot; %&gt; <br />
&lt;%@ Import Namespace=&quot;MvcApplication1.Code&quot; %&gt; <br />
&lt;%@ Import Namespace=&quot;MvcApplication1.Controllers&quot; %&gt; 
</p>
<p>
&lt;asp:Content ID=&quot;indexContent&quot; ContentPlaceHolderID=&quot;MainContent&quot; runat=&quot;server&quot;&gt; <br />
&nbsp;&nbsp;&nbsp; &lt;p&gt; <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.Image&lt;HomeController&gt;(c =&gt; c.DisplayTime(), 200, 50, &quot;Current time&quot;)%&gt; <br />
&nbsp;&nbsp;&nbsp; &lt;/p&gt; <br />
&lt;/asp:Content&gt; 
</p>
<p>
[/code] 
</p>
<p>
Want the source code? <a href="/files/MvcImageResult.zip">Download it here!</a> You can use it with the <a href="http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=12640" target="_blank">current ASP.NET MVC framework source code drop</a>. 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/05/ASPNET-MVC-custom-ActionResult.aspx&amp;title=ASP.NET%20MVC%20custom%20ActionResult%20%28ImageResult%29"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/05/ASPNET-MVC-custom-ActionResult.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>&nbsp; 
</p>




