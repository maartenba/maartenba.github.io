---
layout: post
title: "Using the ASP.NET MVC ModelBinder attribute - Second part"
pubDatetime: 2008-10-02T17:54:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
---
<p>
Just after the ASP.NET MVC preview 5 was released, I made <a href="/post/2008/09/01/using-the-aspnet-mvc-modelbinder-attribute.aspx" target="_blank">a quick attempt to using the ModelBinder attribute</a>. In short, a <em>ModelBinder</em> allows you to use complex objects as action method parameters, instead of just basic types like strings and integers. While my aproach was correct, it did not really cover the whole picture. So here it is: the full picture. 
</p>
<p>
First of all, what are these model binders all about? By default, an action method would look like this: 
</p>
<p>
[code:c#] 
</p>
<p>
public ActionResult Edit(int personId) {<br />
&nbsp;&nbsp;&nbsp; // ... fetch Person and do stuff<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Now wouldn&#39;t it be nice to pass this Person object completely as a parameter, rather than obliging the controller&#39;s action method to process an id? Think of this: 
</p>
<p>
[code:c#] 
</p>
<p>
public ActionResult Edit(Person person) {<br />
&nbsp;&nbsp;&nbsp; // ... do stuff<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Some advantages I see: 
</p>
<ul>
	<li>More testable code!</li>
	<li>Easy to work with!</li>
	<li>Some sort of viewstate-thing which just passes a complete object back and forth. Yes, I know, ViewState is BAD! But I recently had a question about how to manage concurrency, and using a version id as an hidden HTML field or a complete object as a hidden HTML field should not be that bad, no?</li>
</ul>
<p>
Just one thing to do: implementing a <em>ModelBinder</em> which converts HTML serialized Persons into real Persons (well, objects, not &quot;real&quot; real persons...) 
</p>
<h2>How to implement it...</h2>
<h3>Utility functions</h3>
<p>
No comments, just two utility functions which serialize and deserialize an object to a string an vice-versa. 
</p>
<p>
[code:c#] 
</p>
<p>
using System;<br />
using System.IO;<br />
using System.Runtime.Serialization.Formatters.Binary; 
</p>
<p>
namespace ModelBinderDemo.Util<br />
{<br />
&nbsp;&nbsp;&nbsp; public static class Serializer<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; public static string Serialize(object subject)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; MemoryStream ms = new MemoryStream();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; BinaryFormatter bf = new BinaryFormatter();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; bf.Serialize(ms, subject); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return Convert.ToBase64String(ms.ToArray());<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; public static object Deserialize(string subject)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; MemoryStream ms = new MemoryStream(Convert.FromBase64String(subject));<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; BinaryFormatter bf = new BinaryFormatter();<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return bf.Deserialize(ms);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<h3>Creating a ModelBinder</h3>
<p>
The ModelBinder itself should be quite simple to do. Just create a class which inherits <em>DefaultModelBinder</em> and have it ocnvert a string into an object. Beware! The passed in value might also be an array of strings, so make sure to verify that in code. 
</p>
<p>
[code:c#] 
</p>
<p>
using System;<br />
using System.Globalization;<br />
using System.Web.Mvc;<br />
using ModelBinderDemo.Models;<br />
using ModelBinderDemo.Util; 
</p>
<p>
namespace ModelBinderDemo.Binders<br />
{<br />
&nbsp;&nbsp;&nbsp; public class PersonBinder : DefaultModelBinder<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; protected override object ConvertType(CultureInfo culture, object value, Type destinationType)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Only accept Person objects for conversion<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (destinationType != typeof(Person))<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return base.ConvertType(culture, value, destinationType);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Get the serialized Person that is being passed in.<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; string serializedPerson = value as string;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (serializedPerson == null &amp;&amp; value is string[])<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; serializedPerson = ((string[])value)[0];<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Convert to Person<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return Serializer.Deserialize(serializedPerson);<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
In order to use this ModelBinder, you&#39;ll have to register it in Global.asax.cs: 
</p>
<p>
[code:c#] 
</p>
<p>
// Register model binders<br />
ModelBinders.Binders.Add(typeof(Person), new PersonBinder()); 
</p>
<p>
[/code] 
</p>
<h3>Great View!</h3>
<p>
Nothing strange in the View: just a HTML form which generates a table to edit a Person&#39;s details and a submit button. 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;%@ Page Language=&quot;C#&quot; MasterPageFile=&quot;~/Views/Shared/Site.Master&quot; AutoEventWireup=&quot;true&quot; CodeBehind=&quot;Index.aspx.cs&quot; Inherits=&quot;ModelBinderDemo.Views.Home.Index&quot; %&gt;<br />
&lt;%@ Import Namespace=&quot;ModelBinderDemo.Models&quot; %&gt; 
</p>
<p>
&lt;asp:Content ID=&quot;indexContent&quot; ContentPlaceHolderID=&quot;MainContent&quot; runat=&quot;server&quot;&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;h2&gt;Edit person&lt;/h2&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;% using (Html.Form(&quot;Home&quot;, &quot;Index&quot;, FormMethod.Post)) { %&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.Hidden(&quot;person&quot;, ViewData[&quot;Person&quot;]) %&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;%=Html.ValidationSummary()%&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;table border=&quot;0&quot; cellpadding=&quot;2&quot; cellspacing=&quot;0&quot;&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;Name:&lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&lt;%=Html.TextBox(&quot;Name&quot;, ViewData.Model.Name)%&gt;&lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;E-mail:&lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&lt;%=Html.TextBox(&quot;Email&quot;, ViewData.Model.Email)%&gt;&lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&amp;nbsp;&lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;td&gt;&lt;%=Html.SubmitButton(&quot;saveButton&quot;, &quot;Save&quot;)%&gt;&lt;/td&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/tr&gt;<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;/table&gt;<br />
&nbsp;&nbsp;&nbsp; &lt;% } %&gt;<br />
&lt;/asp:Content&gt; 
</p>
<p>
[/code] 
</p>
<p>
Wait! One thing to notice here! The <em>&lt;%=Html.Hidden(&quot;person&quot;, ViewData[&quot;Person&quot;]) %&gt;</em> actually renders a hidden HTML field, containing a serialized version of my Person. Which might look like this: 
</p>
<p>
[code:c#] 
</p>
<p>
&lt;input Length=&quot;340&quot; id=&quot;person&quot; name=&quot;person&quot; type=&quot;hidden&quot; value=&quot;AAEAAAD/////AQAAAAAAAAAMAgAAAEZNb2RlbEJpbmRlckRlbW8<br />
sIFZlcnNpb249MS4wLjAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1udWxsBQEAAAAdTW9kZWxCaW5kZXJEZW1vLk1v<br />
ZGVscy5QZXJzb24DAAAAEzxJZD5rX19CYWNraW5nRmllbGQVPE5hbWU+a19fQmFja2luZ0ZpZWxkFjxFbWFpbD5rX19CYWNraW5nRmllb<br />
GQAAQEIAgAAAAEAAAAGAwAAAAdNYWFydGVuBgQAAAAabWFhcnRlbkBtYWFydGVuYmFsbGlhdXcuYmUL&quot; /&gt; 
</p>
<p>
[/code] 
</p>
<h3>Creating the action method</h3>
<p>
All preparations are done, it&#39;s time for some action (method)! Just accept a HTTP POST, accept a <em>Person</em> object in a variable named person, and Bob&#39;s your uncle! The person variable will contain a real <em>Person</em> instance, which has been converted from <em>AAEAAD....</em> into a real instance. Thank you, ModelBinder! 
</p>
<p>
[code:c#] 
</p>
<p>
[AcceptVerbs(&quot;POST&quot;)]<br />
public ActionResult Index(Person person, FormCollection form)<br />
{<br />
&nbsp;&nbsp;&nbsp; if (string.IsNullOrEmpty(person.Name))<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ViewData.ModelState.AddModelError(&quot;Name&quot;, person.Name, &quot;Plese enter a name.&quot;);<br />
&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; if (string.IsNullOrEmpty(person.Email))<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ViewData.ModelState.AddModelError(&quot;Name&quot;, person.Name, &quot;Plese enter a name.&quot;);<br />
&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; return View(&quot;Index&quot;, person);<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Make sure to download the full source and see it in action! <a rel="enclosure" href="/files/ModelBinderDemo2.zip">ModelBinderDemo2.zip (239.87 kb)</a> 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/10/02/Using-the-ASPNET-MVC-ModelBinder-attribute-Second-part.aspx&amp;title=Using the ASP.NET MVC ModelBinder attribute - Second part"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/10/02/Using-the-ASPNET-MVC-ModelBinder-attribute-Second-part.aspx.html" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>




