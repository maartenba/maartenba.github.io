---
layout: post
title: "Writing an Orchard widget: LatestTwitter"
pubDatetime: 2011-01-21T10:17:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/01/21/writing-an-orchard-widget-latesttwitter.html
---
Last week, Microsoft released [Orchard](http://www.orchardproject.net/), a new modular CMS system built on ASP.NET MVC and a lot of other, open source libraries available. I will not dive into the CMS itself, but after fiddling around with it I found a lot of things missing: there are only 40 modules and widgets available at the moment and the only way to have a more rich ecosystem of modules is: contributing!

And that’s what I did. Feel the need to add a list of recent tweets by a certain user to your Orchard website? Try my [LatestTwitter](http://www.orchardproject.net/gallery/Packages/Search?packageType=Modules&searchCategory=All+Categories&searchTerm=latesttwitter) widget. Here’s a screenshot of the widget in action:

[![](/images/image_thumb_68.png)](/images/image_98.png)

And here’s what the admin side looks like:

[![](/images/image_thumb_69.png)](/images/image_99.png)

It supports:

- Displaying a number of tweets for a certain user
- Specifying the number of tweets
- Caching the tweets for a configurable amount of minutes
- Specifying if you want to display the avatar image and post time

In this blog post, I’ll give you some pointers on how to create your own widget for Orchard. Download the code if you want to follow step by step: [LatestTwitter.zip (1.56 mb)](/files/2011/1/LatestTwitter.zip)

## Setting up your development environment

This one is probably the easy part. Fire up the [Web Platform Installer](http://microsoft.com/web) and install WebMatrix and the Orchard CMS to your machine. Why WebMatrix? Well, it’s the new cool kid on the block and you don’t want to load the complete Orchard website in your Visual Studio later on. I think WebMatrix is the way to go for this situation.

That’s it. Your local site should be up and running. It’s best to test the site and do some initial configuration. And another tip: make a backup of this initial site, it’s very easy to screw up later on (if you, like me, start fooling Orchard’s versioning system). In WebMatrix, you’ll find the path to where your site is located:

[![](/images/image_thumb_70.png)](/images/image_100.png)

## Creating the blueprints for your widget

I’ll be quick on this one, if you need the full-blown details refer to [Creating a module](http://www.orchardproject.net/docs/Creating-a-module-with-a-simple-text-editor.ashx) on the Orchard website.

Fire up a command prompt. “cd” to the root of your site, e.g. “C:\USB\_werk\Projects\AZUG\Azure User Group Belgium”. Execute the command “bin\orchard.exe”. After a few seconds, you’ll be in the command-line interface for Orchard. First of all, enable the code generation module, by executing the command:

```

feature enable Orchard.CodeGeneration

```

This module makes it easier to create new modules, widgets and themes. You can do all of that manually, but why go that route if this route allows you to be lazy? Let’s create the blueprints for our module:

```

codegen module LatestTwitter

```

There’s a new Visual Studio project waiting for you on your file system, in my case at “C:\USB\_werk\Projects\AZUG\Azure User Group Belgium\Modules\LatestTwitter”. Easy, no?

## Building the widget

In order to build a widget, you need:

- A model for your widget “part”
- A record in which this can be stored
- A database table in which the record can be stored

Let’s start top down: model first. The model that I’m talking about is not an ASP.NET MVC “View Model”, it’s really the domain object you are working with in the rest of your widget’s back-end. I will be doing something bad here: I’ll just expose the domain model to the ASP.NET MVC view later on, for sake of simplicity and because it’s only one small class I’m using. Here’s how my *TwitterWidgetPart* model is coded:

```

public class TwitterWidgetPart : ContentPart<TwitterWidgetRecord>
{
    [Required]
    public string Username
    {
        get { return Record.Username; }
        set { Record.Username = value; }
    }

    [Required]
    [DefaultValue("5")]
    [DisplayName("Number of Tweets to display")]
    public int Count
    {
        get { return Record.Count; }
        set { Record.Count = value; }
    }

    [Required]
    [DefaultValue("5")]
    [DisplayName("Time to cache Tweets (in minutes)")]
    public int CacheMinutes
    {
        get { return Record.CacheMinutes; }
        set { Record.CacheMinutes = value; }
    }

    public bool ShowAvatars
    {
        get { return Record.ShowAvatars; }
        set { Record.ShowAvatars = value; }
    }

    public bool ShowTimestamps
    {
        get { return Record.ShowTimestamps; }
        set { Record.ShowTimestamps = value; }
    }
}

```

Just some properties that represent my widget’s settings. Do note that these all depend on a *TwitterWidgetRecord*, which is the persistency class used by Orchard. I’ll give you the code for that one as well:

```

public class TwitterWidgetRecord : ContentPartRecord
{
    public virtual string Username { get; set; }
    public virtual int Count { get; set; }
    public virtual int CacheMinutes { get; set; }
    public virtual bool ShowAvatars { get; set; }
    public virtual bool ShowTimestamps { get; set; }
}

```

See these “virtual” properties everywere? Ever worked with NHibernate and have a feeling that this *may* just be similar? Well, it is! Orchard uses NHibernate below the covers. Reason for these virtuals is that a proxy for your class instance will be created on the fly, overriding your properties with persistence specific actions.

The last thing we need is a database table. This is done in a “migration” class, a class that is responsible for telling Orchard what your widget needs in terms of storage, content types and such. Return to your command prompt and run the following:

```

codegen datamigration LatestTwitter

```

A file called “Migrations.cs” will be created in your module’s directory. Just add it to your solution and have a look at it. The *Create()* method you see is called initially when your module is installed. It creates a database table to hold your *TwitterWidgetRecord*.

Note that once you have an install base of your widget, never tamper with this code again or people may get stuck upgrading your widget over time. Been there, done that during development and it’s no fun at all…

Because I started small, my Migrations.cs file looks a bit different:

```

public class Migrations : DataMigrationImpl {
    public int Create() {
        // Creating table TwitterWidgetRecord
        SchemaBuilder.CreateTable("TwitterWidgetRecord", table => table
            .ContentPartRecord()
            .Column("Username", DbType.String)
            .Column("Count", DbType.Int32)
        );

        ContentDefinitionManager.AlterPartDefinition(typeof(TwitterWidgetPart).Name,
            builder => builder.Attachable());

        return 1;
    }

    public int UpdateFrom1()
    {
        ContentDefinitionManager.AlterTypeDefinition("TwitterWidget", cfg => cfg
            .WithPart("TwitterWidgetPart")
            .WithPart("WidgetPart")
            .WithPart("CommonPart")
            .WithSetting("Stereotype", "Widget"));

        return 2;
    }

    public int UpdateFrom2()
    {
        SchemaBuilder.AlterTable("TwitterWidgetRecord", table => table
            .AddColumn("CacheMinutes", DbType.Int32)
        );

        return 3;
    }

    public int UpdateFrom3()
    {
        SchemaBuilder.AlterTable("TwitterWidgetRecord", table => table
            .AddColumn("ShowAvatars", DbType.Boolean)
        );
        SchemaBuilder.AlterTable("TwitterWidgetRecord", table => table
            .AddColumn("ShowTimestamps", DbType.Boolean)
        );

        return 4;
    }
}

```

You see these *UpdateFromX()* methods? These are “upgrades” to your module. Whenever ou deploy a new version to the Orchard Gallery and someone updates the widget in their Orchard site, these methods will be used to upgrade the database schema and other things, if needed. Because I started small, I have some upgrades there already…

The* UpdateFrom1()* is actually a required one (although I could have done this in the *Create()* method as well): I’m telling Orchard that my *TwitterWidget* is a new content type, that it contains a *TwitterWidgetPart*, is a *WidgetPart* and can be typed as a *Widget*. A lot of text, but basically I’m just telling Orchard to treat my *TwitterWidgetPart *as a widget rather than anything else.

## Drivers and handlers

We need a handler. It is a type comparable with ASP.NET MVC’s filters and is executed whenever content containing your widget is requested. Why do we need a handler? Easy: we need to tell Orchard that we’re actually making use of a persitence store for our widget. Here’s the code:

```

public class TwitterWidgetRecordHandler : ContentHandler
{
    public TwitterWidgetRecordHandler(IRepository<TwitterWidgetRecord> repository)
    {
        Filters.Add(StorageFilter.For(repository));
    }
}

```

There’s really no magic to this: it’s just telling Orchard to use a repository fo accessing *TwitterWidgetRecord* data.

Next, we need a driver. This is something that you can compare with an ASP.NET MVC controller. It’s used by Orchard to render administrative views, handle posts from the admin interface, … Here’s the code:

```

public class TwitterWidgetDriver
    : ContentPartDriver<TwitterWidgetPart>
{
    protected ITweetRetrievalService TweetRetrievalService { get; private set; }

    public TwitterWidgetDriver(ITweetRetrievalService tweetRetrievalService)
    {
        this.TweetRetrievalService = tweetRetrievalService;
    }

    // GET
    protected override DriverResult Display(
        TwitterWidgetPart part, string displayType, dynamic shapeHelper)
    {
        return ContentShape("Parts_TwitterWidget",
            () => shapeHelper.Parts_TwitterWidget(
                Username: part.Username ?? "",
                Tweets: TweetRetrievalService.GetTweetsFor(part),
                ShowAvatars: part.ShowAvatars,
                ShowTimestamps: part.ShowTimestamps));
    }

    // GET
    protected override DriverResult Editor(TwitterWidgetPart part, dynamic shapeHelper)
    {
        return ContentShape("Parts_TwitterWidget_Edit",
            () => shapeHelper.EditorTemplate(
                TemplateName: "Parts/TwitterWidget",
                Model: part,
                Prefix: Prefix));
    }

    // POST
    protected override DriverResult Editor(
        TwitterWidgetPart part, IUpdateModel updater, dynamic shapeHelper)
    {
        updater.TryUpdateModel(part, Prefix, null, null);
        return Editor(part, shapeHelper);
    }
}

```

What you see is a *Display()* method, used for really rendering my widget on the Orchard based website. What I do there is building a dynamic model consisting of the username, the list of tweets and some of the options that I have configured. There’s a view for this one as well, located in *Views/Parts/TwitterWidget.cshtml*:

```xml

```

The above is the actual view rendered on the page where you place the LatestTwitter widget. Note: don’t specify the *@model* here or it will crash. Simple because the model passed in to this view is nothing you’d expect: it’s a dynamic object.

Next, there’s the two *Editor()* implementations, one to render the “settings” and one to persist them. Prettyu standard code which you can just duplicate from any tutorial on Orchard modules. The view for this one is in *Views/EditorTemplates/Parts/TwitterWidget.cshtml*:

```xml
@model LatestTwitter.Models.TwitterWidgetPart

<fieldset>
  <legend>Latest Twitter</legend>


    @T("Twitter username"):


    @@@Html.TextBoxFor(model => model.Username)
    @Html.ValidationMessageFor(model => model.Username)


  <!-- ... -->
</fieldset>

```

Done! Or not? Wel, there’s still some logic left: querying Twitter and making sure we don’t whistle for the fail whale to come over by querying it too often.

## Implementing ITweetRetrievalService

Being prepared for change is injecting dependencies rather than hard-coding them. I’ve created a *ITweetRetrievalService* interface responsible for querying Twitter. The implementation will be injected by Orchard’s dependency injection infrastructure later on. Here’s the code:

```

public interface ITweetRetrievalService
    : IDependency
{
    List<TweetModel> GetTweetsFor(TwitterWidgetPart part);
}

```

See the *IDependency* interface I’m inheriting? That’s the way to tell Orchard to look for an implementation of this interface at runtime. Who said dependency injection was hard?

Next, the implementation. Let’s first look at the code:

```csharp
[UsedImplicitly]
public class CachedTweetRetrievalService
    : ITweetRetrievalService
{
    protected readonly string CacheKeyPrefix = "B74EDE32-86E4-4A58-850B-016E6F595CF9_";

    protected ICacheManager CacheManager { get; private set; }
    protected ISignals Signals { get; private set; }
    protected Timer Timer { get; private set; }

    public CachedTweetRetrievalService(ICacheManager cacheManager, ISignals signals)
    {
        this.CacheManager = cacheManager;
        this.Signals = signals;
    }

    public List<TweetModel> GetTweetsFor(TwitterWidgetPart part)
    {
        // Build cache key
        var cacheKey = CacheKeyPrefix + part.Username;

        return CacheManager.Get(cacheKey, ctx =>
        {
            ctx.Monitor(Signals.When(cacheKey));
            Timer = new Timer(t => Signals.Trigger(cacheKey), part, TimeSpan.FromMinutes(part.CacheMinutes), TimeSpan.FromMilliseconds(-1));
            return RetrieveTweetsFromTwitterFor(part);
        });
    }

    protected List<TweetModel> RetrieveTweetsFromTwitterFor(TwitterWidgetPart part)
    {
        // ... query Twitter here ...
    }

    protected string ToFriendlyDate(DateTime sourcedate)
    {
        // ... convert DateTime to "1 hour ago" ...
    }
}

```

I’ll leave the part wher I actually query Twitter for you to discover. I only want to focus on two little things here: caching and signaling. The constructor of the *CachedTweetRetrievalService* is accepting two parameters that will be injected at runtime: an *ICacheManager* used for caching the tweet list for a certain amount of time, and an *ISignals* which is used to fire messages through Orchard. In order to cache the list of tweets, I will have to combine both. Here’s the caching part:

```csharp
// Build cache key
var cacheKey = CacheKeyPrefix + part.Username;

return CacheManager.Get(cacheKey, ctx =>
{
    ctx.Monitor(Signals.When(cacheKey));
    Timer = new Timer(t => Signals.Trigger(cacheKey), part, TimeSpan.FromMinutes(part.CacheMinutes), TimeSpan.FromMilliseconds(-1));
    return RetrieveTweetsFromTwitterFor(part);
});

```

First, I’m building a cache key to uniquely identify the data for this particular widget’s Twitter stream by just basing it on the Twitter username. Next, I’m asking the cachemanager to get the data with that particular *cacheKey*. No data available? Well, in that case our lambda will be executed: a monitor is added for a signal with my cache key. Sounds complicated? I’m just telling Orchard to monitor for a particular message that can be triggered, and once it’s triggered, the cache will automatically expire.

I’m also starting a new timer thread, which I just ask to send a signal through the application at a specific point in time: the moment where I want my cache to expire. And last but not least: data is returned.

## Conclusion

To be honest: I have had to read quite some tutorials to get this up and running. But once you get the architecture and how components interact, Orchard is pretty sweet to develop against. And all I’m asking you now: go write some modules and widgets, and make Orchard a rich platform with a rich module ecosystem.

Want to explore my code? Here’s the download: [LatestTwitter.zip (1.56 mb)](/files/2011/1/LatestTwitter.zip)
Want to install the widget in your app? Just look for “LatestTwitter” in the modules.
