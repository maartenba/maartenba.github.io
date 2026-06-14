---
layout: post
title: "How we built TwitterMatic.net - Part 6: The back-end"
pubDatetime: 2009-07-02T14:06:00Z
comments: true
published: true
categories: ["post"]
tags: []
author: Maarten Balliauw
redirect_from:
  - /post/2009/07/02/how-we-built-twittermatic-net-part-6-the-back-end.html
---
<p><em><a href="http://www.twittermatic.net/" target="_blank"><img style="border-right-width: 0px; margin: 5px 0px 5px 5px; display: inline; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="TwitterMatic - Schedule your Twitter updates" src="/images/twittermatic1015%5B4%5D.png" border="0" alt="TwitterMatic - Schedule your Twitter updates" width="204" height="219" align="right" /></a></em><em>&ldquo;Now that the digital villagers could enter their messages in the application, another need arose: </em><em>knight Maarten The Brave Coffeedrinker would have to recruit a lot of slaves to tell all these messages to the great god of social networking, <a href="http://www.twitter.com" target="_blank">Twitter</a>. Being a peaceful person, our knight thought of some digital slaves, sent from the azure sky. And so he started crafting a worker role.&rdquo;</em></p>
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
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-6-The-back-end.aspx&amp;title=How we built TwitterMatic.net - Part 6: The back-end">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-6-The-back-end.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>
<h2>The back-end</h2>
<p>The worker role will monitor the table storage for scheduled Tweets. If it&rsquo;s time to send them, the Tweet will be added to a queue. This queue is then processed by another thread in the worker role, which will publish the Tweet to Twitter. Well be using two threads for this:</p>
<p><img style="border-right-width: 0px; margin: 5px auto; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="TwitterMatic worker role" src="/images/WorkerRole.png" border="0" alt="TwitterMatic worker role" width="350" height="232" /></p>
<p>We&rsquo;ll fire up these treads in the worker role&rsquo;s <em>Start</em> method:

```csharp
public class WorkerRole : RoleEntryPoint
{
    protected Thread enqueueingThread;
    protected Thread publishingThread;
    public override void Start()
    {
        RoleManager.WriteToLog("Information", "Started TwitterMatic worker process.");
        RoleManager.WriteToLog("Information", "Creating enqueueing thread...");
        enqueueingThread = new Thread(new ThreadStart(EnqueueUpdates));
        RoleManager.WriteToLog("Information", "Created enqueueing thread.");
        RoleManager.WriteToLog("Information", "Creating publishing thread...");
        publishingThread = new Thread(new ThreadStart(PublishUpdates));
        RoleManager.WriteToLog("Information", "Created publishing thread.");
        RoleManager.WriteToLog("Information", "Starting worker threads...");
        enqueueingThread.Start();
        publishingThread.Start();
        RoleManager.WriteToLog("Information", "Started worker threads.");
        enqueueingThread.Join();
        publishingThread.Join();
        RoleManager.WriteToLog("Information", "Stopped worker threads.");
        RoleManager.WriteToLog("Information", "Stopped TwitterMatic worker process.");
    }
    // ...

}
```

<p>Note that we are also logging events to the <em>RoleManager</em>, which is the logging infrastructure provided by Windows Azure. These logs can be viewed from the Windows Azure deployment interface.</p>
<h3>EnqueueUpdates Thread</h3>
<p>The steps EnqueueUpdates will take are simple:</p>
<p><img style="border-right-width: 0px; margin: 5px auto; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="EnqueueUpdates Thread" src="/images/T1.png" border="0" alt="EnqueueUpdates Thread" width="239" height="240" /></p>
<p>Here&rsquo;s how to do that in code:

```csharp
protected void EnqueueUpdates()
{
    StorageAccountInfo info = StorageAccountInfo.GetDefaultQueueStorageAccountFromConfiguration(true);
    QueueStorage queueStorage = QueueStorage.Create(info);
    MessageQueue updateQueue = queueStorage.GetQueue("updatequeue");
    if (!updateQueue.DoesQueueExist())
        updateQueue.CreateQueue();
    while (true)
    {
        RoleManager.WriteToLog("Information", "[Enqueue] Checking for due tweets...");
        List<TimedTweet> dueTweets = Repository.RetrieveDue(DateTime.Now.ToUniversalTime());
        if (dueTweets.Count > 0)
        {
            RoleManager.WriteToLog("Information", "[Enqueue] " + dueTweets.Count.ToString() + " due tweets.");
            foreach (var tweet in dueTweets)
            {
                if (tweet.SendStatus != "Pending delivery")
                {
                    updateQueue.PutMessage(new Message(tweet.RowKey));
                    tweet.SendStatus = "Pending delivery";
                    Repository.Update(tweet);
                    RoleManager.WriteToLog("Information", "[Enqueue] Enqueued tweet " + tweet.RowKey + " for publishing.");
                }
            }
            RoleManager.WriteToLog("Information", "[Enqueue] Finished processing due tweets.");
        }
        else
        {
            RoleManager.WriteToLog("Information", "[Enqueue] No due tweets.");
        }
        Thread.Sleep(120000);
    }
}
```

<h3>PublishUpdates Thread</h3>
<p>The steps PublishUpdates will take are simple:</p>
<p><img style="border-right-width: 0px; margin: 5px auto; display: block; float: none; border-top-width: 0px; border-bottom-width: 0px; border-left-width: 0px" title="PublishUpdates Thread" src="/images/T2.png" border="0" alt="PublishUpdates Thread" width="239" height="240" /></p>
<p>Here&rsquo;s how to do that in code:

```csharp
protected void PublishUpdates()
{
    StorageAccountInfo info = StorageAccountInfo.GetDefaultQueueStorageAccountFromConfiguration(true);
    QueueStorage queueStorage = QueueStorage.Create(info);
    MessageQueue updateQueue = queueStorage.GetQueue("updatequeue");
    if (!updateQueue.DoesQueueExist())
        updateQueue.CreateQueue();
    while (true)
    {
        RoleManager.WriteToLog("Information", "[Publish] Checking for pending tweets...");
        while (updateQueue.PeekMessage() != null)
        {
            Message queueItem = updateQueue.GetMessage(120);
            RoleManager.WriteToLog("Information", "[Publish] Preparing to send pending message " + queueItem.ContentAsString() + "...");
            TimedTweet tweet = null;
            try
            {
        tweet = Repository.RetrieveById("", queueItem.ContentAsString());
            }
            finally
            {
                if (tweet == null)
                {
                    RoleManager.WriteToLog("Information", "[Publish] Pending message " + queueItem.ContentAsString() + " has been deleted. Cancelling publish...");
                    updateQueue.DeleteMessage(queueItem);
                }
            }
            if (tweet == null)
                continue;
            IOAuthTwitter oAuthTwitter = new OAuthTwitter();
            oAuthTwitter.OAuthConsumerKey = Configuration.ReadSetting("OAuthConsumerKey");
            oAuthTwitter.OAuthConsumerSecret = Configuration.ReadSetting("OAuthConsumerSecret");
            oAuthTwitter.OAuthToken = tweet.Token;
            oAuthTwitter.OAuthTokenSecret = tweet.TokenSecret;
            TwitterContext ctx = new TwitterContext(oAuthTwitter);
            if (!string.IsNullOrEmpty(ctx.UpdateStatus(tweet.Status).ID))
            {
                RoleManager.WriteToLog("Information", "[Publish] Published tweet " + tweet.RowKey + ".");
                tweet.SentOn = DateTime.Now;
                tweet.SendStatus = "Published";
                tweet.RetriesLeft = 0;
                updateQueue.DeleteMessage(queueItem);
                Repository.Update(tweet);
            }
            else
            {
                tweet.RetriesLeft--;
                if (tweet.RetriesLeft > 0)
                {
                    tweet.SendStatus = "Retrying";
                    RoleManager.WriteToLog("Information", "[Publish] Error publishing tweet " + tweet.RowKey + ". Retries left: " + tweet.RetriesLeft.ToString());
                }
                else
                {
                    tweet.RetriesLeft = 0;
                    tweet.SendStatus = "Failed";
                    RoleManager.WriteToLog("Information", "[Publish] Error publishing tweet " + tweet.RowKey + ". Out of retries.");
                }
                updateQueue.DeleteMessage(queueItem);
                Repository.Update(tweet);
            }
        }
        Thread.Sleep(60000);
    }
}
```

<h2>Conclusion</h2>
<p>We now have an overview of worker roles, and how they can be leveraged to perform background tasks in a Windows Azure application.</p>
<p>In the next part of this series, we&rsquo;ll have a look at the deployment of Twitter<em>Matic</em>.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-6-The-back-end.aspx&amp;title=How we built TwitterMatic.net - Part 6: The back-end">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2009/07/02/How-we-built-TwitterMaticnet-Part-6-The-back-end.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a></p>


