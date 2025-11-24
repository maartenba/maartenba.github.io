---
layout: post
title: "Preview Word files (docx) in HTML using ASP.NET, OpenXML and LINQ to XML"
pubDatetime: 2008-01-11T15:12:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "LINQ", "OpenXML", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/01/11/preview-word-files-docx-in-html-using-asp-net-openxml-and-linq-to-xml.html
---
<p>Since an image (or even an example) tells&nbsp;more than any text will ever do, here's what I've created in the past few evening hours:</p>
<p style="text-align: center;"><img style="border: 0px;" src="/images/WindowsLiveWriter/PreviewWordfilesd.NETOpenXMLandLINQtoXML_C70E/image_3.png" border="0" alt="image" width="660" height="238" /></p>
<p>Live examples:</p>
<ul>
<li><span style="text-decoration: line-through;"><a href="http://examples.maartenballiauw.be/WordVisualizer/Documents/test.docx" target="_blank">Test document 1</a></span>&nbsp;(examples offline)</li>
<li><span style="text-decoration: line-through;"><a href="http://examples.maartenballiauw.be/WordVisualizer/Documents/test2.docx" target="_blank">Test document 2</a></span>&nbsp;(examples offline)</li>
<li><span style="text-decoration: line-through;"><a href="http://examples.maartenballiauw.be/WordVisualizer/Documents/test3.docx" target="_blank">Test document 3 (with image)</a></span>&nbsp;(examples offline)</li>
</ul>
<p>Want the source code? Download it here: <a href="/files/2012/11/WordVisualizer.zip">WordVisualizer.zip (357.01 kb)</a></p>
<h2>Want to know how?</h2>
<p>If you want to know how I did this, let me first tell you why I created this. After searching Google for something similar, I found a <a href="http://blog.thekid.me.uk/archive/2007/10/20/creating-a-docx-html-preview-handler-for-sharepoint.aspx" target="_blank">Sharepoint blogger who did the same</a> using a Sharepoint XSL transformation document called <em>DocX2Html.xsl</em>. Great, but this document can not be distributed without a Sharepoint license. The only option for me was to do something similar myself.</p>
<h2>ASP.NET handlers</h2>
<p>The main idea of this project was to be able to type in a URL ending in ".docx", which would then render a preview of the underlying Word document. Luckily, ASP.NET provides a system of creating <em>HttpHandler</em>s. A <em>HttpHandler</em> is the class instance which is called by the .NET runtime to process an incoming request for a specific extension. So let's trick ASP.NET into believing ".docx" is an extension which should be handled by a custom class...</p>
<h3>Creating a custom handler</h3>
<p>A custom handler can be created quite easily. Just create a new class, and make it implement the <em>IHttpHandler</em> interface:</p>
<p>[code:c#]</p>
<p>/// &lt;summary&gt;<br /> /// Word document HTTP handler<br /> /// &lt;/summary&gt;</p>
<p>public class WordDocumentHandler : IHttpHandler<br /> {<br /> &nbsp;&nbsp;&nbsp; #region IHttpHandler Members</p>
<p>&nbsp;&nbsp;&nbsp; /// &lt;summary&gt;<br /> &nbsp;&nbsp;&nbsp; /// Is the handler reusable?<br /> &nbsp;&nbsp;&nbsp; /// &lt;/summary&gt;</p>
<p>&nbsp;&nbsp;&nbsp; public bool IsReusable<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get { return true; }<br /> &nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; /// &lt;summary&gt;<br /> &nbsp;&nbsp;&nbsp; /// Process request<br /> &nbsp;&nbsp;&nbsp; /// &lt;/summary&gt;<br /> &nbsp;&nbsp;&nbsp; /// &lt;param name="context"&gt;Current http context&lt;/param&gt;</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp; public void ProcessRequest(HttpContext context)<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Todo...</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; context.Response.Write("Hello world!");<br /> &nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; #endregion<br /> }</p>
<p>[/code]</p>
<h3>Registering a custom handler</h3>
<p>For ASP.NET to recognise our newly created handler, we must register it in Web.config:</p>
<p><img style="border: 0px;" src="/images/WindowsLiveWriter/PreviewWordfilesd.NETOpenXMLandLINQtoXML_C70E/image_6.png" border="0" alt="image" width="710" height="218" /></p>
<p>Now if you are using IIS6, you should also register this extension to be handled by the .NET runtime:</p>
<p><a href="/images/WindowsLiveWriter/PreviewWordfilesd.NETOpenXMLandLINQtoXML_C70E/image_8.png"><img style="border: 0px;" src="/images/WindowsLiveWriter/PreviewWordfilesd.NETOpenXMLandLINQtoXML_C70E/image_thumb_2.png" border="0" alt="image" width="568" height="525" /></a></p>
<p>In the application configuration, add the extension ".docx" and make it point to the following executable: <em>C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\aspnet_isapi.dll</em></p>
<p>This should be it. Fire up your browser, browse to your web site and type <em>anything.docx</em>. You should see "Hello world!" appearing in a nice, white page.</p>
<h2>OpenXML</h2>
<p>As you may already know, Word 2007 files are <a href="http://en.wikipedia.org/wiki/Office_Open_XML" target="_blank">OpenXML</a> packages containg WordprocessingML markup. A .docx file can be opened using the <em>System.IO.Packaging.Package</em> class (which is available after adding a project reference to WindowsBase.dll).</p>
<p>The <em>Package</em> class is created for accessing any OpenXML package. This includes all Office 2007 file formats, but also custom OpenXML formats which you can implement for yourself. Unfortunately, if you want to use <em>Package</em> to access an Office 2007 file, you'll have to implement a lot of utility functions to get the right parts from the OpenXML container.</p>
<p>Luckily, Microsoft released an <a href="http://www.microsoft.com/downloads/details.aspx?familyid=ad0b72fb-4a1d-4c52-bdb5-7dd7e816d046&amp;displaylang=en" target="_blank">OpenXML SDK (CTP)</a>, which I also used in order to create this Word preview handler.</p>
<h2>LINQ to XML</h2>
<p>As you know, the latest <a href="http://www.microsoft.com/downloads/details.aspx?FamilyID=333325FD-AE52-4E35-B531-508D977D32A6&amp;displaylang=en" target="_blank">.NET 3.5</a> release brought us something new &amp; extremely handy: <a href="http://msdn2.microsoft.com/en-us/netframework/aa904594.aspx" target="_blank">LINQ</a> (Language Integrated Query). On <a href="http://blogs.msdn.com/dmahugh/archive/2007/12/11/linq-to-xml-code-samples.aspx" target="_blank">Doug's blog</a>, I read about <a href="http://blogs.msdn.com/ericwhite/archive/2007/12/11/Using-LINQ-to-XML-with-Open-XML-Documents.aspx" target="_blank">Eric White's attempts</a> to use LINQ to XML on OpenXML.</p>
<h3>LINQ to OpenXML</h3>
<p>For implementing my handler, I basically used similar code to Eric's to run query's on a Word document's contents. Here's an example which fetches all paragraphs in a Word document:</p>
<p>[code:c#]</p>
<p>using (WordprocessingDocument document = WordprocessingDocument.Open("test.docx", false))<br /> {<br /> &nbsp;&nbsp;&nbsp; // Register namespace</p>
<p>&nbsp;&nbsp;&nbsp; XNamespace w = "<a href="http://schemas.openxmlformats.org/wordprocessingml/2006/main&quot;;">http://schemas.openxmlformats.org/wordprocessingml/2006/main";</a></p>
<p>&nbsp;&nbsp;&nbsp; // Element shortcuts</p>
<p>&nbsp;&nbsp;&nbsp; XName w_r = w + "r";<br /> &nbsp;&nbsp;&nbsp; XName w_ins = w + "ins";<br /> &nbsp;&nbsp;&nbsp; XName w_hyperlink = w + "hyperlink";</p>
<p>&nbsp;&nbsp;&nbsp; // Load document's MainDocumentPart (document.xml) in XDocument</p>
<p>&nbsp;&nbsp;&nbsp; XDocument xDoc = XDocument.Load(<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; XmlReader.Create(<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new StreamReader(document.MainDocumentPart.GetStream())<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )<br /> &nbsp;&nbsp;&nbsp; );</p>
<p>&nbsp;&nbsp;&nbsp; // Fetch paragraphs</p>
<p>&nbsp;&nbsp;&nbsp; var paragraphs = from l_paragraph in xDoc<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Root<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Element(w + "body")<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Descendants(w + "p")<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; select new<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; TextRuns = l_paragraph.Elements().Where(z =&gt; z.Name == w_r || z.Name == w_ins || z.Name == w_hyperlink)<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; };</p>
<p>&nbsp;&nbsp;&nbsp; // Write paragraphs</p>
<p>&nbsp;&nbsp;&nbsp; foreach (var paragraph in paragraphs)<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Fetch runs</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; var runs = from l_run in paragraph.Runs<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; select new<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Text = l_run.Descendants(w + "t").StringConcatenate(element =&gt; (string)element)<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; };</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Write runs</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach (var run in runs)<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // Use run.Text to fetch a text string</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Console.Write(run.Text);<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br /> &nbsp;&nbsp;&nbsp; }<br /> }</p>
<p>[/code]</p>
<p>Now if you run this code, you will notice a compilation error... This is due to the fact that I used an <a href="http://www.developer.com/net/csharp/article.php/3592216" target="_blank">extension method</a> <em>StringConcatenate</em>.</p>
<h3>Extension methods</h3>
<p>In the above example, I used an extension method named <em>StringConcatenate</em>. An extension method is, as the name implies, an "extension" to a known class. In the following example, find the extension for all <em>IEnumerable&lt;T&gt;</em> instances:</p>
<p>[code:c#]</p>
<p>public static class IEnumerableExtensions<br /> {<br /> &nbsp;&nbsp;&nbsp; /// &lt;summary&gt;<br /> &nbsp;&nbsp;&nbsp; /// Concatenate strings<br /> &nbsp;&nbsp;&nbsp; /// &lt;/summary&gt;<br /> &nbsp;&nbsp;&nbsp; /// &lt;typeparam name="T"&gt;Type&lt;/typeparam&gt;<br /> &nbsp;&nbsp;&nbsp; /// &lt;param name="source"&gt;Source&lt;/param&gt;<br /> &nbsp;&nbsp;&nbsp; /// &lt;param name="func"&gt;Function delegate&lt;/param&gt;<br /> &nbsp;&nbsp;&nbsp; /// &lt;returns&gt;Concatenated string&lt;/returns&gt;</p>
<p>&nbsp;&nbsp;&nbsp; public static string StringConcatenate&lt;T&gt;(this IEnumerable&lt;T&gt; source, Func&lt;T, string&gt; func)<br /> &nbsp;&nbsp;&nbsp; {<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; StringBuilder sb = new StringBuilder();<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach (T item in source)<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sb.Append(func(item));<br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return sb.ToString();<br /> &nbsp;&nbsp;&nbsp; }<br /> }</p>
<p>[/code]</p>
<h3>Lambda expressions</h3>
<p>Another thing you may have noticed in my example code, is a <a href="http://weblogs.asp.net/scottgu/archive/2007/04/08/new-orcas-language-feature-lambda-expressions.aspx" target="_blank">lambda expression</a>:</p>
<p>[code:c#]</p>
<p>z =&gt; z.Name == w_r || z.Name == w_ins || z.Name == w_hyperlink.</p>
<p>[/code]</p>
<p>A lambda expression is actually an anonymous method, which is called by the <em>StringConcatenate</em> extension method. Lambda expressions always accept a parameter, and return true/false. In this case, <em>z</em> is instantiated as an <em>XNode</em>, returning true/false depending on its Name property.</p>
<h2>Wrapping things up...</h2>
<p>If you read this whole blog post, you may have noticed that I extensively used C# 3.5's new language features. I combined these with OpenXML and ASP.NET to create a useful Word document preview handler. If you want the full source code, download it here: <a href="/files/2012/11/WordVisualizer.zip">WordVisualizer.zip (357.01 kb)</a>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2008/01/Preview-Word-files-(docx)-in-HTML-using-ASPNET-OpenXML-and-LINQ-to-XML.aspx&amp;title=Preview Word files (docx) in HTML using ASP.NET, OpenXML and LINQ to XML"> <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/01/Preview-Word-files-(docx)-in-HTML-using-ASPNET-OpenXML-and-LINQ-to-XML.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>



