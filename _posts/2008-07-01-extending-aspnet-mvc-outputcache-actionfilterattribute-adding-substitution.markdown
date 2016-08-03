---
layout: post
title: "Extending ASP.NET MVC OutputCache ActionFilterAttribute - Adding substitution"
date: 2008-07-01 07:30:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2008/07/01/Extending-ASPNET-MVC-OutputCache-ActionFilterAttribute-Adding-substitution.aspx", "/post/2008/07/01/extending-aspnet-mvc-outputcache-actionfilterattribute-adding-substitution.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2008/07/01/Extending-ASPNET-MVC-OutputCache-ActionFilterAttribute-Adding-substitution.aspx
 - /post/2008/07/01/extending-aspnet-mvc-outputcache-actionfilterattribute-adding-substitution.aspx
---
<p>
In my <a href="/post/2008/06/Creating-an-ASPNET-MVC-OutputCache-ActionFilterAttribute.aspx" target="_blank">previous blog post on ASP.NET MVC OutputCache</a>, not all aspects of &quot;classic&quot; ASP.NET output caching were covered. For instance, substitution of cached pages. Allow me to explain... 
</p>
<p>
When using output caching you might want to have everything cached, except, for example, a user&#39;s login name or a time stamp. When caching a full HTTP response, it is not really possible to inject dynamic data. ASP.NET introduced the <em>Substitution</em> control, which allows parts of a cached response to be dynamic. The contents of the Substitution control are dynamically injected after retrieving cached data, by calling a certain static method which returns string data. Now let&#39;s build this into my <em><a href="/post/2008/06/Creating-an-ASPNET-MVC-OutputCache-ActionFilterAttribute.aspx" target="_blank">OutputCache ActionFilterAttribute</a></em>... 
</p>
<p>
<strong>UPDATE:</strong> Also check Phil Haack&#39;s approach to this: <a href="http://haacked.com/archive/2008/11/05/donut-caching-in-asp.net-mvc.aspx">http://haacked.com/archive/2008/11/05/donut-caching-in-asp.net-mvc.aspx</a>
</p>
<h2>1. But... how?</h2>
<p>
Schematically, the substitution process would look like this: 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/Cre.NETMVCOutputCacheActionFilterAttribu_90EE/image_3.png" border="0" alt="ASP.NET MVC OutputCache" width="613" height="360" /> 
</p>
<p>
When te view is rendered, it outputs a special substitution tag (well, special... just a HTML comment which will be recognized by the OutputCache). The OutputCache will look for these substitution tags and call the relevant methods to provide contents. A substitution tag will look like <em>&lt;!--SUBSTITUTION:CLASSNAME:METHODNAME--&gt;</em>. 
</p>
<p>
One side note: this will only work with server-side caching (duh!). Client-side could also be realized, but that would involve some Ajax calls. 
</p>
<h2>2. Creating a HtmlHelper extension method</h2>
<p>
Every developer loves easy-to-use syntax, so instead of writing an error-prone HTML comment like <em>&lt;!--SUBSTITUTION:CLASSNAME:METHODNAME--&gt;</em>. myself, let&#39;s do that using an extension method which allows syntax like &lt;%=Html.Substitution&lt;MvcCaching.Views.Home.Index&gt;(&quot;SubstituteDate&quot;)%&gt;. Here&#39;s an example view: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;%@ Page Language=&quot;C#&quot; MasterPageFile=&quot;~/Views/Shared/Site.Master&quot;<br />
&nbsp;&nbsp;&nbsp; AutoEventWireup=&quot;true&quot; CodeBehind=&quot;Index.aspx.cs&quot;<br />
&nbsp;&nbsp;&nbsp; Inherits=&quot;MvcCaching.Views.Home.Index&quot; %&gt;<br />
&lt;%@ Import Namespace=&quot;MaartenBalliauw.Mvc.Extensions&quot; %&gt; 
</p>
<p>
&lt;asp:Content ID=&quot;indexContent&quot; ContentPlaceHolderID=&quot;MainContent&quot; runat=&quot;server&quot;&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;h2&gt;&lt;%= Html.Encode(ViewData[&quot;Message&quot;]) %&gt;&lt;/h2&gt; 
</p>
<p>
&nbsp;&nbsp;&nbsp; &lt;p&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Cached timestamp: &lt;%=Html.Encode(DateTime.Now.ToString())%&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/p&gt; 
</p>
<p>
&nbsp;&nbsp;&nbsp; &lt;p&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Uncached timestamp (substitution):<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.Substitution&lt;MvcCaching.Views.Home.Index&gt;(&quot;SubstituteDate&quot;)%&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;/p&gt;<br />
&lt;/asp:Content&gt; 
</p>
<p>
[/code] 
</p>
<p>
The extension method for this will look quite easy. Create a new static class containing this static method: 
</p>
<p>
[code:c#] 
</p>
<p>
public static class CacheExtensions<br />
{<br />
&nbsp;&nbsp;&nbsp; public static string Substitution&lt;T&gt;(this HtmlHelper helper, string method)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Check input<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (typeof(T).GetMethod(method, BindingFlags.Static | BindingFlags.Public) == null)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; throw new ArgumentException(<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string.Format(&quot;Type {0} does not implement a static method named {1}.&quot;,<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; typeof(T).FullName, method),<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &quot;method&quot;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Write output<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; StringBuilder sb = new StringBuilder(); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sb.Append(&quot;&lt;!--&quot;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sb.Append(&quot;SUBSTITUTION:&quot;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sb.Append(typeof(T).FullName);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sb.Append(&quot;:&quot;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sb.Append(method);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sb.Append(&quot;--&gt;&quot;); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return sb.ToString();<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
What happens is basically checking for the existance of the specified class and method, and rendering the appropriate HTML comment. Our example above will output <em>&lt;!--SUBSTITUTION:MvcCaching.Views.Home.Index:SubstituteDate--&gt;</em>. 
</p>
<p>
One thing to do before substituting data though: defining the <em>SubstituteDate</em> method on the MvcCaching.Views.Home.Index: view codebehind. The signature of this method should be static, returning a string and accepting a <em>ControllerContext</em> parameter. In developer language: <em>static string MyMethod(ControllerContext context);</em> 
</p>
<p>
Here&#39;s an example: 
</p>
<p>
[code:c#] 
</p>
<p>
public partial class Index : ViewPage<br />
{<br />
&nbsp;&nbsp;&nbsp; public static string SubstituteDate(ControllerContext context)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return DateTime.Now.ToString();<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<h2>3. Extending the OutputCache ActionFilterAttribute</h2>
<p>
<a href="/post/2008/06/Creating-an-ASPNET-MVC-OutputCache-ActionFilterAttribute.aspx" target="_blank">Previously</a>, we did server-side output caching by implementing 2 overrides of the ActionFilterAttribute, namely <em>OnResultExecuting</em> and <em>OnResultExecuted</em>. To provide substitution support, we&#39;ll have to modify these 2 overloads a little. Basically, just pass all output through the <em>ResolveSubstitutions</em> method. Here&#39;s the updated <em>OnResultExecuted</em> overload: 
</p>
<p>
[code:c#] 
</p>
<p>
public override void OnResultExecuted(ResultExecutedContext filterContext)<br />
{<br />
&nbsp;&nbsp;&nbsp; // Server-side caching?<br />
&nbsp;&nbsp;&nbsp; if (CachePolicy == CachePolicy.Server || CachePolicy == CachePolicy.ClientAndServer)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (!cacheHit)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Fetch output<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string output = writer.ToString(); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Restore the old context<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; System.Web.HttpContext.Current = existingContext; 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Fix substitutions<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; output = ResolveSubstitutions(filterContext, output); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Return rendered data<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; existingContext.Response.Write(output); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Add data to cache<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cache.Add(<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; GenerateKey(filterContext),<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; writer.ToString(),<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; null,<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DateTime.Now.AddSeconds(Duration),<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Cache.NoSlidingExpiration,<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CacheItemPriority.Normal,<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; null);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Now how about this <em>ResolveSubstitutions</em> method? This method is passed the <em>ControllerContext</em> and the unmodified HTML output. If no substitution tags are found, it returns immediately. Otherwise, a regular expression is fired off which will perform replaces depending on the contents of this substitution variable. 
</p>
<p>
<em>One thing to note here is that this is actually a nice security hole! Be sure to <strong>ALWAYS</strong> Html.Encode() dynamic data, as users can inject these substitution tags easily in your dynamic pages and possibly receive useful error messages with context information...</em> 
</p>
<p>
[code:c#] 
</p>
<p>
private string ResolveSubstitutions(ControllerContext filterContext, string source)<br />
{<br />
&nbsp;&nbsp;&nbsp; // Any substitutions?<br />
&nbsp;&nbsp;&nbsp; if (source.IndexOf(&quot;&lt;!--SUBSTITUTION:&quot;) == -1)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return source;<br />
&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; // Setup regular expressions engine<br />
&nbsp;&nbsp;&nbsp; MatchEvaluator replaceCallback = new MatchEvaluator(<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; matchToHandle =&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Replacements<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string tag = matchToHandle.Value; 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Parts<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string[] parts = tag.Split(&#39;:&#39;);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string className = parts[1];<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string methodName = parts[2].Replace(&quot;--&gt;&quot;, &quot;&quot;); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Execute method<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Type targetType = Type.GetType(className);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; MethodInfo targetMethod = targetType.GetMethod(methodName, BindingFlags.Static | BindingFlags.Public);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return (string)targetMethod.Invoke(null, new object[] { filterContext });<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; );<br />
&nbsp;&nbsp;&nbsp; Regex templatePattern = new Regex(@&quot;&lt;!--SUBSTITUTION:[A-Za-z_\.]+:[A-Za-z_\.]+--&gt;&quot;, RegexOptions.Multiline); 
</p>
<p>
&nbsp;&nbsp;&nbsp; // Fire up replacement engine!<br />
&nbsp;&nbsp;&nbsp; return templatePattern.Replace(source, replaceCallback);<br />
} 
</p>
<p>
[/code] 
</p>
<p>
How easy was all that? You can <a href="http://examples.maartenballiauw.be/AspNetMvcOutputCache/MvcCaching.zip" target="_blank">download the full soure and an example here</a>. 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/07/Extending-ASPNET-MVC-OutputCache-ActionFilterAttribute---Adding-substitution.aspx&amp;title=Extending ASP.NET MVC OutputCache ActionFilterAttribute - Adding substitution"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/07/Extending-ASPNET-MVC-OutputCache-ActionFilterAttribute---Adding-substitution.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>

{% include imported_disclaimer.html %}
