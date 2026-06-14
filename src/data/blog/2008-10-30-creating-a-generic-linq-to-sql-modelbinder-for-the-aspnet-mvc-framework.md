---
layout: post
title: "Creating a generic Linq to SQL ModelBinder for the ASP.NET MVC framework"
pubDatetime: 2008-10-30T18:52:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/10/30/creating-a-generic-linq-to-sql-modelbinder-for-the-asp-net-mvc-framework.html
---
<p>
You are right! This is indeed my third post on ASP.NET MVC ModelBinders. The first one focussed on creating a <a href="/post/2008/09/01/using-the-aspnet-mvc-modelbinder-attribute.aspx" target="_blank">ModelBinder from scratch</a> in an older preview release, the second post did something similar trying to do <a href="/post/2008/10/02/using-the-aspnet-mvc-modelbinder-attribute-second-part.aspx" target="_blank">some dirty ViewState-like stuff</a>. Good news! There&#39;s more of this dirty stuff coming! 
</p>
<p>
How about this action method, using a <em>Person</em> class which is a Linq to SQL entity type: 
```csharp
public ActionResult PersonDetails(Person id)
{
    if (id == null)
        return RedirectToAction("Index");
    return View(id);
}
```

This action method is called from a URL which looks like Home/PersonDetails/2. Nothing special about this? Read this whole post again, from the beginning! Yes, I said that the <em>Person</em> class is a Linq to SQL entity type, and yes, you are missing the <em>DataContext</em> here! The above method would normally look like this: 
```csharp
public ActionResult PersonDetails(int id)
{
    using (ApplicationDataContext context = new ApplicationDataContext())
    {
        Person person = context.Persons.Where(p => p.Id == id).SingleOrDefault();
        if (person == null)
            return RedirectToAction("Index");
        return View(person);
    }
}
```

Using the ASP.NET MVC <em>ModelBinder</em> infrastructure, I am actually able to bind action method parameters to real objects, based on simple query string parameters like, in this case, id. A custom <em>ModelBinder</em> maps this string id to a real <em>Person</em> instance from my Linq to SQL <em>DataContext</em>. Let me show you how I&#39;ve created this <em>ModelBinder</em>. 
</p>
<h2>Registering the LinqToSqlBinder&lt;T&gt;</h2>
<p>
As with any custom <em>ModelBinder</em>, the <em>LinqToSqlBinder</em> should be registered with the <em>ModelBinder</em> infrastructure: 
```csharp
protected void Application_Start()
{
    // ...
    LinqToSqlBinder<ApplicationDataContext>.Register(ModelBinders.Binders);
}
```

The above piece of code registers every entity type (or table, whatever you like to call it) in my Linq to Sql data contextwith a new <em>LinqToSqlBinder&lt;ApplicationDataContext&gt;</em> instance. 
```csharp
public static void Register(IDictionary<Type, IModelBinder> bindersDictionary)
{
    using (T context = new T())
    {
        foreach (var table in context.Mapping.GetTables())
        {
            ModelBinders.Binders.Add(table.RowType.Type, new LinqToSqlBinder<T>());
        }
    }
}
```

<h2>The LinqToSqlBinder&lt;T&gt; source code</h2>
<p>
The LinqToSqlBinder&lt;T&gt; will make use of a small utility class, <em>TableDefinition</em>, in which some information about the entity type&#39;s table will be stored. This class looks like the following: 
```csharp
private class TableDefinition
{
    public TableDefinition()
    {
        ColumnNames = new List<string>();
    }
    public string TableName;
    public string PrimaryKeyFieldName;
    public List<string> ColumnNames { get; set; }
}
```

My <em>LinqToSqlBinder&lt;T&gt;</em> overloads ASP.NET MVC&#39;s <em>DefaultModelBinder</em> class, of which I&#39;ll override the BindModel method: 
```csharp
public class LinqToSqlBinder<T> : DefaultModelBinder
{
    public override ModelBinderResult BindModel(ModelBindingContext bindingContext)
    {
        // ...
    }
}
```

First of all, the <em>LinqToSqlBinder&lt;T&gt;</em> has to determine if it can actually perform binding for the requested model type. In this case, this is determined using the metadata my Linq to SQL data context provides. If it does not support mapping the requested type, model binding is further processed by the base class. 
```csharp
// Check if bindingContext.ModelType can be delivered from T
MetaTable metaTable = context.Mapping.GetTable(bindingContext.ModelType);
if (metaTable == null)
{
    return base.BindModel(bindingContext);
}
```

Next task for the model binder: checking whether a value is provided. For example, if my action method expects a parameter named &quot;id&quot; and I provide a parameter &quot;borat&quot; (whatever...) in the request, the model binder should not accept the task given. If everything succeeds, I should have an identity value which I can use in a query later on. 
```csharp
// Get the object ID that is being passed in.
ValueProviderResult valueProviderResult = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
if (valueProviderResult == null)
{
    return base.BindModel(bindingContext);
}
string objectId = valueProviderResult.AttemptedValue;
```

Speaking of queries... Now is a good time to start filling my <em>TableDefinition</em> instance, on which I can generate a SQL query which will later retrieve the requested object. Filling the <em>TableDefinition</em> object is really an easy task when using the meta data Linq to SQL provides. Each member (or column) can be looped and queried for specific information such as type, name, primary key, ... 
```csharp
// Build table definition
TableDefinition tableDefinition = new TableDefinition();
tableDefinition.TableName = metaTable.TableName;
foreach (MetaDataMember dm in metaTable.RowType.DataMembers)
{
    if (dm.DbType != null)
    {
        tableDefinition.ColumnNames.Add(dm.MappedName);
    }
    if (dm.IsPrimaryKey)
    {
        tableDefinition.PrimaryKeyFieldName = dm.MappedName;
    }
}
```

With all this information in place, a SQL query can easily be built. 
```csharp
// Build query
StringBuilder queryBuffer = new StringBuilder();
queryBuffer.Append("SELECT ")
                .Append(string.Join(", ", tableDefinition.ColumnNames.ToArray()))
           .Append(" FROM ")
                .Append(tableDefinition.TableName)
           .Append(" WHERE ")
                .Append(tableDefinition.PrimaryKeyFieldName)
                .Append(" = \'").Append(objectId).Append("\'");
```

A nice looking query is generated using this code: <em>SELECT id, name, email FROM dbo.person WHERE id = &#39;2&#39;</em>. This query can now be executed on the Linq to SQL data context. The first result will be returned to the action method. 
```csharp
// Execute query
IEnumerable resultData = context.ExecuteQuery(bindingContext.ModelType,
    queryBuffer.ToString());
foreach (object result in resultData)
{
    return new ModelBinderResult(result);
}
```

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


