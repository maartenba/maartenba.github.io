---
layout: post
title: "How we built TwitterMatic.net - Part 3: Store data in the cloud"
date: 2009-07-02 14:03:00 +0000
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC", "Projects"]
alias: ["/post/2009/07/02/How-we-built-TwitterMaticnet-Part-3-Store-data-in-the-cloud.aspx", "/post/2009/07/02/how-we-built-twittermaticnet-part-3-store-data-in-the-cloud.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2009/07/02/How-we-built-TwitterMaticnet-Part-3-Store-data-in-the-cloud.aspx.html
 - /post/2009/07/02/how-we-built-twittermaticnet-part-3-store-data-in-the-cloud.aspx.html
---
<p><em><a href="http://www.twittermatic.net/" target="_blank"><img style="border-right-width: 0px; margin: 5px 0px 5px 5px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="TwitterMatic - Schedule your Twitter updates" src="/images/twittermatic10.png" border="0" alt="TwitterMatic - Schedule your Twitter updates" width="204" height="219" align="right" /></a> &ldquo;After setting up his workplace, knight Maarten The Brave Coffeedrinker thought of something else: if a farmer wants to keep a lot of hay, he needs a barn, right? Since the cloudy application would also need to keep things that can be used by the digital villagers, our knight needs a barn in the clouds. Looking at the azure sky, an idea popped into the knight&rsquo;s head: why not use Windows Azure storage service? It&rsquo;s a barn that&rsquo;s always there, a barn that can catch fire and will still have its stored items located in a second barn (and a third). Knight Maarten The Brave Coffeedrinker jumped on his horse and went on a quest, a quest in the clouds.</em><em>&rdquo;</em></p>
<p>This post is part of a series on how we built <a href="http://www.twittermatic.net/" target="_blank">TwitterMatic.net</a>. Other parts:</p>
<ul>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-1-introduction.aspx">Part 1: Introduction </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-2-creating-an-azure-project.aspx">Part 2: Creating an Azure project </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-3-store-data-in-the-cloud.aspx">Part 3: Store data in the cloud </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-4-authentication-and-membership.aspx">Part 4: Authentication and membership </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-5-the-front-end.aspx">Part 5: The front end </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-6-the-back-end.aspx">Part 6: The back-end </a></li>
<li><a href="/post/2009/07/02/how-we-built-twittermaticnet-part-7-deploying-to-the-cloud.aspx">Part 7: Deploying to the cloud </a></li>
</ul>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-3-Store-data-in-the-cloud.aspx&amp;title=How we built TwitterMatic.net - Part 3: Store data in the cloud">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-3-Store-data-in-the-cloud.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<h2>Store data in the cloud</h2>
<p><a href="http://www.azure.com">Windows Azure</a> offers 3 types of cloud storage: <a href="http://msdn.microsoft.com/en-us/library/dd135733.aspx">blobs</a>, <a href="http://msdn.microsoft.com/en-us/library/dd179423.aspx">tables</a> and <a href="http://msdn.microsoft.com/en-us/library/dd179363.aspx">queues</a>. Blob Storage stores sets of binary data, organized in containers of your storage account. Table Storage offers structured storage in the form of tables. The Queue service stores an unlimited number of messages, each of which can be up to 8 KB in size.</p>
<p>Let&rsquo;s look back at the <a href="/post/2009/07/02/how-we-built-twittermaticnet-part-1-introduction.aspx">Twitter<em>Matic</em> architecture</a>:</p>

<blockquote>
<p>&ldquo;The worker role will monitor the table storage for scheduled Tweets. If it&rsquo;s time to send them, the Tweet will be added to a queue. This queue is then processed by another thread in the worker role, which will publish the Tweet to Twitter. &rdquo;</p>

</blockquote>

<p>This means we&rsquo;ll be using two out of three storage types: Table Storage and Queue Storage. Problem: these services are offered as a RESTful service, somewhere in the cloud. Solution to that: use the StorageClient project located in the <a href="http://www.microsoft.com/downloads/details.aspx?familyid=11B451C4-7A7B-4537-A769-E1D157BAD8C6&amp;displaylang=en" target="_blank">Windows Azure SDK</a>&rsquo;s samples directory!</p>
<p>The <em>StorageClient</em> project contains .NET API&rsquo;s that work with the blob, table and queue storage services provided by Windows Azure. For Table Storage, <em>StorageClient</em> provides an extension on top of Astoria (ADO.NET Data Services Framework, but I still say Astoria because it&rsquo;s easier to type and say&hellip;). This makes it easier for you as a developer to use existing knowledge, from LINQ to SQL or Entity Framework or Astoria, to develop Windows Azure applications.</p>
<h2>Setting up StorageClient</h2>
<p>Add a reference to the StorageClient project to your WebRole project. Next, add some settings to the <em>ServiceConfiguration.cscfg</em> file:</p>
<p>[code:xml]</p>
<p>
&lt;?xml version="1.0"?&gt;
<br />&lt;ServiceConfiguration serviceName="TwitterMatic" xmlns="http://schemas.microsoft.com/ServiceHosting/2008/10/ServiceConfiguration"&gt;
<br />&nbsp; &lt;Role name="WebRole"&gt;
<br />&nbsp;&nbsp;&nbsp; &lt;Instances count="1"/&gt;
<br />&nbsp;&nbsp;&nbsp; &lt;ConfigurationSettings&gt;
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="AccountName" value="twittermatic"/&gt;
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="AccountSharedKey" value=&rdquo;..."/&gt;
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="BlobStorageEndpoint" value="http://blob.core.windows.net"/&gt; 
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="QueueStorageEndpoint" value = "http://queue.core.windows.net"/&gt; 
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="TableStorageEndpoint" value="http://table.core.windows.net"/&gt; 
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="allowInsecureRemoteEndpoints" value="true"/&gt;
<br />&nbsp;&nbsp;&nbsp; &lt;/ConfigurationSettings&gt;
<br />&nbsp; &lt;/Role&gt;
<br />&nbsp; &lt;Role name="WorkerRole"&gt;
<br />&nbsp;&nbsp;&nbsp; &lt;Instances count="1"/&gt;
<br />&nbsp;&nbsp;&nbsp; &lt;ConfigurationSettings&gt;
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="AccountName" value="twittermatic"/&gt;
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="AccountSharedKey" value=&rdquo;..."/&gt;
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="BlobStorageEndpoint" value="http://blob.core.windows.net"/&gt; 
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="QueueStorageEndpoint" value = "http://queue.core.windows.net"/&gt; 
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="TableStorageEndpoint" value="http://table.core.windows.net"/&gt; 
<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &lt;Setting name="allowInsecureRemoteEndpoints" value="true"/&gt;
<br />&nbsp;&nbsp;&nbsp; &lt;/ConfigurationSettings&gt;
<br />&nbsp; &lt;/Role&gt;
<br />&lt;/ServiceConfiguration&gt;
</p>
<p>[/code]</p>
<p>This way, both the web and worker role know where to find their data (URI) and how to authenticate (account name and shared key).</p>
<h2>Working with tables</h2>
<p>We&rsquo;ll only be using one domain class in our entire project: <em>TimedTweet</em>. This class represents a scheduled Twitter update, containing information required to schedule the update. Here&rsquo;s a list of properties:</p>
<ul>
<li><em>Token</em>: A token used to authenticate against Twitter </li>
<li><em>TokenSecret</em>: A second token used to authenticate against Twitter </li>
<li><em>ScreenName</em>: Twitter screen name of the user. </li>
<li><em>Status</em>: The message to publish on Twitter. </li>
<li><em>SendOn</em>: Time to send the message. </li>
<li><em>SentOn</em>: Time the message was sent. </li>
<li><em>SendStatus</em>: A status message (pending, in progress, published, &hellip;) </li>
<li><em>RetriesLeft</em>: How many retries left before giving up on the Twitter update. </li>
<li><em>Archived</em>: Yes/no if the message is archived. </li>
</ul>
<p>Here&rsquo;s the code:</p>
<p>[code:c#]</p>
<p>public class TimedTweet : TableStorageEntity, IComparable <br />{ <br />&nbsp;&nbsp;&nbsp; public string Token { get; set; } <br />&nbsp;&nbsp;&nbsp; public string TokenSecret { get; set; } <br />&nbsp;&nbsp;&nbsp; public string ScreenName { get; set; } <br />&nbsp;&nbsp;&nbsp; public string Status { get; set; } <br />&nbsp;&nbsp;&nbsp; public DateTime SendOn { get; set; } <br />&nbsp;&nbsp;&nbsp; public DateTime SentOn { get; set; } <br />&nbsp;&nbsp;&nbsp; public string SendStatus { get; set; } <br />&nbsp;&nbsp;&nbsp; public int RetriesLeft { get; set; } <br />&nbsp;&nbsp;&nbsp; public bool Archived { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; public TimedTweet() <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : base() <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SendOn = DateTime.Now.ToUniversalTime(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Timestamp = DateTime.Now; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RowKey = Guid.NewGuid().ToString(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SendStatus = "Scheduled"; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RetriesLeft = 3; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public TimedTweet(string partitionKey, string rowKey) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : base(partitionKey, rowKey) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SendOn = DateTime.Now.ToUniversalTime(); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SendStatus = "Scheduled"; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RetriesLeft = 3; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public int CompareTo(object obj) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; TimedTweet target = obj as TimedTweet; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (target != null) { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return this.SendOn.CompareTo(target.SendOn); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return 0; <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>Note that our <em>TimedTweet</em> is inheriting <em>TableStorageEntity</em>. This class provides some base functionality for Windows Azure Table Storage.</p>
<p>We&rsquo;ll also need to work with this class against table Storage. For that, we can use <em>TableStorage</em> and <em>TableStorageDataServiceContext</em> class, like this:</p>
<p>[code:c#]</p>
<p>public List&lt;TimedTweet&gt; RetrieveAllForUser(string screenName) { <br />&nbsp;&nbsp;&nbsp; StorageAccountInfo info = StorageAccountInfo.GetDefaultTableStorageAccountFromConfiguration(true); <br />&nbsp;&nbsp;&nbsp; TableStorage storage = TableStorage.Create(info);</p>
<p>&nbsp;&nbsp;&nbsp; storage.TryCreateTable("TimedTweet");</p>
<p>&nbsp;&nbsp;&nbsp; TableStorageDataServiceContext svc = storage.GetDataServiceContext(); <br />&nbsp;&nbsp;&nbsp; svc.IgnoreMissingProperties = true;</p>
<p>&nbsp;&nbsp;&nbsp; List&lt;TimedTweet&gt; result = svc.CreateQuery&lt;TimedTweet&gt;("TimedTweet").Where(t =&gt; t.ScreenName ==&nbsp;&nbsp;&nbsp;&nbsp; screenName).ToList(); <br />&nbsp;&nbsp;&nbsp; foreach (var item in result) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; svc.Detach(item); <br />&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp; return result; <br />}</p>
<p>[/code]</p>
<p>Using this, we can build a repository class based on ITimedtweetRepository and implemented against Table Storage:</p>
<p>[code:c#]</p>
<p>public interface ITimedTweetRepository <br />{ <br />&nbsp;&nbsp;&nbsp; void Delete(string screenName, TimedTweet tweet); <br />&nbsp;&nbsp;&nbsp; void Archive(string screenName, TimedTweet tweet); <br />&nbsp;&nbsp;&nbsp; void Insert(string screenName, TimedTweet tweet); <br />&nbsp;&nbsp;&nbsp; void Update(TimedTweet tweet); <br />&nbsp;&nbsp;&nbsp; List&lt;TimedTweet&gt; RetrieveAll(string screenName); <br />&nbsp;&nbsp;&nbsp; List&lt;TimedTweet&gt; RetrieveDue(DateTime dueDate); <br />&nbsp;&nbsp;&nbsp; TimedTweet RetrieveById(string screenName, string id); <br />}</p>
<p>[/code]</p>
<h2>Working with queues</h2>
<p>Queues are slightly easier to work with: you can enqueue messages and dequeue messages, and that&rsquo;s about it. Here&rsquo;s an example snippet:</p>
<p>[code:c#]</p>
<p>public void EnqueueMessage(string message) { <br />&nbsp;&nbsp;&nbsp; StorageAccountInfo info = StorageAccountInfo.GetDefaultTableStorageAccountFromConfiguration(true);</p>
<p>&nbsp;&nbsp;&nbsp; QueueStorage queueStorage = QueueStorage.Create(info); <br />&nbsp;&nbsp;&nbsp; MessageQueue updateQueue = queueStorage.GetQueue("updatequeue"); <br />&nbsp;&nbsp;&nbsp; if (!updateQueue.DoesQueueExist()) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; updateQueue.CreateQueue();</p>
<p>&nbsp;&nbsp;&nbsp; updateQueue.PutMessage(new Message(message)); <br />}</p>
<h2>Conclusion</h2>
<p>[/code]</p>
<p>We now know how to use StorageClient and have a location in the cloud to store our data.</p>
<p>In the next part of this series, we&rsquo;ll have a look at how we can leverage Twitter&rsquo;s OAuth authentication mechanism in our own Twiter<em>Matic </em>application and make use of some other utilities packed in the Windows Azure SDK.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-3-Store-data-in-the-cloud.aspx&amp;title=How we built TwitterMatic.net - Part 3: Store data in the cloud">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-3-Store-data-in-the-cloud.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
{% include imported_disclaimer.html %}
