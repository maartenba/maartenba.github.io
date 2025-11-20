---
layout: post
title: "Creating a generic Linq to SQL ModelBinder for the ASP.NET MVC framework"
pubDatetime: 2008-10-30T18:52:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
---
<p>
You are right! This is indeed my third post on ASP.NET MVC ModelBinders. The first one focussed on creating a <a href="/post/2008/09/01/using-the-aspnet-mvc-modelbinder-attribute.aspx" target="_blank">ModelBinder from scratch</a> in an older preview release, the second post did something similar trying to do <a href="/post/2008/10/02/using-the-aspnet-mvc-modelbinder-attribute-second-part.aspx" target="_blank">some dirty ViewState-like stuff</a>. Good news! There&#39;s more of this dirty stuff coming! 
</p>
<p>
How about this action method, using a <em>Person</em> class which is a Linq to SQL entity type: 
</p>
<p>
[code:c#] 
</p>
<p>
public ActionResult PersonDetails(Person id)<br />
{<br />
&nbsp;&nbsp;&nbsp; if (id == null)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return RedirectToAction(&quot;Index&quot;); 
</p>
<p>
&nbsp;&nbsp;&nbsp; return View(id);<br />
} 
</p>
<p>
[/code] 
</p>
<p>
This action method is called from a URL which looks like Home/PersonDetails/2. Nothing special about this? Read this whole post again, from the beginning! Yes, I said that the <em>Person</em> class is a Linq to SQL entity type, and yes, you are missing the <em>DataContext</em> here! The above method would normally look like this: 
</p>
<p>
[code:c#] 
</p>
<p>
public ActionResult PersonDetails(int id)<br />
{<br />
&nbsp;&nbsp;&nbsp; using (ApplicationDataContext context = new ApplicationDataContext())<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Person person = context.Persons.Where(p =&gt; p.Id == id).SingleOrDefault(); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (person == null)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return RedirectToAction(&quot;Index&quot;); 
</p>
<p>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return View(person);<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Using the ASP.NET MVC <em>ModelBinder</em> infrastructure, I am actually able to bind action method parameters to real objects, based on simple query string parameters like, in this case, id. A custom <em>ModelBinder</em> maps this string id to a real <em>Person</em> instance from my Linq to SQL <em>DataContext</em>. Let me show you how I&#39;ve created this <em>ModelBinder</em>. 
</p>
<h2>Registering the LinqToSqlBinder&lt;T&gt;</h2>
<p>
As with any custom <em>ModelBinder</em>, the <em>LinqToSqlBinder</em> should be registered with the <em>ModelBinder</em> infrastructure: 
</p>
<p>
[code:c#] 
</p>
<p>
protected void Application_Start()<br />
{<br />
&nbsp;&nbsp;&nbsp; // ... 
</p>
<p>
&nbsp;&nbsp;&nbsp; LinqToSqlBinder&lt;ApplicationDataContext&gt;.Register(ModelBinders.Binders);<br />
} 
</p>
<p>
[/code] 
</p>
<p>
The above piece of code registers every entity type (or table, whatever you like to call it) in my Linq to Sql data contextwith a new <em>LinqToSqlBinder&lt;ApplicationDataContext&gt;</em> instance. 
</p>
<p>
[code:c#] 
</p>
<p>
public static void Register(IDictionary&lt;Type, IModelBinder&gt; bindersDictionary)<br />
{<br />
&nbsp;&nbsp;&nbsp; using (T context = new T())<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach (var table in context.Mapping.GetTables())<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ModelBinders.Binders.Add(table.RowType.Type, new LinqToSqlBinder&lt;T&gt;());<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<h2>The LinqToSqlBinder&lt;T&gt; source code</h2>
<p>
The LinqToSqlBinder&lt;T&gt; will make use of a small utility class, <em>TableDefinition</em>, in which some information about the entity type&#39;s table will be stored. This class looks like the following: 
</p>
<p>
[code:c#] 
</p>
<p>
private class TableDefinition<br />
{<br />
&nbsp;&nbsp;&nbsp; public TableDefinition()<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ColumnNames = new List&lt;string&gt;();<br />
&nbsp;&nbsp;&nbsp; } 
</p>
<p>
&nbsp;&nbsp;&nbsp; public string TableName;<br />
&nbsp;&nbsp;&nbsp; public string PrimaryKeyFieldName;<br />
&nbsp;&nbsp;&nbsp; public List&lt;string&gt; ColumnNames { get; set; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
My <em>LinqToSqlBinder&lt;T&gt;</em> overloads ASP.NET MVC&#39;s <em>DefaultModelBinder</em> class, of which I&#39;ll override the BindModel method: 
</p>
<p>
[code:c#] 
</p>
<p>
public class LinqToSqlBinder&lt;T&gt; : DefaultModelBinder<br />
{<br />
&nbsp;&nbsp;&nbsp; public override ModelBinderResult BindModel(ModelBindingContext bindingContext)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; // ...<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
First of all, the <em>LinqToSqlBinder&lt;T&gt;</em> has to determine if it can actually perform binding for the requested model type. In this case, this is determined using the metadata my Linq to SQL data context provides. If it does not support mapping the requested type, model binding is further processed by the base class. 
</p>
<p>
[code:c#] 
</p>
<p>
// Check if bindingContext.ModelType can be delivered from T<br />
MetaTable metaTable = context.Mapping.GetTable(bindingContext.ModelType);<br />
if (metaTable == null)<br />
{<br />
&nbsp;&nbsp;&nbsp; return base.BindModel(bindingContext);<br />
} 
</p>
<p>
[/code] 
</p>
<p>
Next task for the model binder: checking whether a value is provided. For example, if my action method expects a parameter named &quot;id&quot; and I provide a parameter &quot;borat&quot; (whatever...) in the request, the model binder should not accept the task given. If everything succeeds, I should have an identity value which I can use in a query later on. 
</p>
<p>
[code:c#] 
</p>
<p>
// Get the object ID that is being passed in.<br />
ValueProviderResult valueProviderResult = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);<br />
if (valueProviderResult == null)<br />
{<br />
&nbsp;&nbsp;&nbsp; return base.BindModel(bindingContext);<br />
}<br />
string objectId = valueProviderResult.AttemptedValue; 
</p>
<p>
[/code] 
</p>
<p>
Speaking of queries... Now is a good time to start filling my <em>TableDefinition</em> instance, on which I can generate a SQL query which will later retrieve the requested object. Filling the <em>TableDefinition</em> object is really an easy task when using the meta data Linq to SQL provides. Each member (or column) can be looped and queried for specific information such as type, name, primary key, ... 
</p>
<p>
[code:c#] 
</p>
<p>
// Build table definition<br />
TableDefinition tableDefinition = new TableDefinition();<br />
tableDefinition.TableName = metaTable.TableName; 
</p>
<p>
foreach (MetaDataMember dm in metaTable.RowType.DataMembers)<br />
{<br />
&nbsp;&nbsp;&nbsp; if (dm.DbType != null)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; tableDefinition.ColumnNames.Add(dm.MappedName);<br />
&nbsp;&nbsp;&nbsp; }<br />
&nbsp;&nbsp;&nbsp; if (dm.IsPrimaryKey)<br />
&nbsp;&nbsp;&nbsp; {<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; tableDefinition.PrimaryKeyFieldName = dm.MappedName;<br />
&nbsp;&nbsp;&nbsp; }<br />
} 
</p>
<p>
[/code] 
</p>
<p>
With all this information in place, a SQL query can easily be built. 
</p>
<p>
[code:c#] 
</p>
<p>
// Build query<br />
StringBuilder queryBuffer = new StringBuilder();<br />
queryBuffer.Append(&quot;SELECT &quot;)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Append(string.Join(&quot;, &quot;, tableDefinition.ColumnNames.ToArray()))<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Append(&quot; FROM &quot;)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Append(tableDefinition.TableName)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Append(&quot; WHERE &quot;)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Append(tableDefinition.PrimaryKeyFieldName)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; .Append(&quot; = \&#39;&quot;).Append(objectId).Append(&quot;\&#39;&quot;); 
</p>
<p>
[/code] 
</p>
<p>
A nice looking query is generated using this code: <em>SELECT id, name, email FROM dbo.person WHERE id = &#39;2&#39;</em>. This query can now be executed on the Linq to SQL data context. The first result will be returned to the action method. 
</p>
<p>
[code:c#] 
</p>
<p>
// Execute query<br />
IEnumerable resultData = context.ExecuteQuery(bindingContext.ModelType,<br />
&nbsp;&nbsp;&nbsp; queryBuffer.ToString()); 
</p>
<p>
foreach (object result in resultData)<br />
{<br />
&nbsp;&nbsp;&nbsp; return new ModelBinderResult(result);<br />
} 
</p>
<p>
[/code] 
</p>
<h2>Download the code</h2>
<p>
Feel free to download a working example based on this blog post: <a rel="enclosure" href="/files/LinqModelBinderExample.zip">LinqModelBinderExample.zip (352.52 kb)</a>
</p>
<p>
<strong>Note that this code may be vulnerable to SQL injection! This is not production code!</strong> 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/10/30/Creating-a-generic-Linq-to-SQL-ModelBinder-for-the-ASPNET-MVC-framework.aspx&amp;title=Creating a generic Linq to SQL ModelBinder for the ASP.NET MVC framework">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/10/30/Creating-a-generic-Linq-to-SQL-ModelBinder-for-the-ASPNET-MVC-framework.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a>
</p>


{% include imported_disclaimer.html %}

