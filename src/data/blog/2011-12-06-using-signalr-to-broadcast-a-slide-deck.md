---
layout: post
title: "Using SignalR to broadcast a slide deck"
pubDatetime: 2011-12-06T13:08:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "JavaScript", "jQuery", "MVC", "NuGet", "Projects", "Scalability", "Silverlight"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/12/06/using-signalr-to-broadcast-a-slide-deck.html
---
[![](/images/image_thumb_124.png)](/images/image_157.png)Last week, I’ve discussed [Techniques for real-time client-server communication on the web (SignalR to the rescue)](/post/2011/11/29/Techniques-for-real-time-client-server-communication.aspx). We’ve seen that when building web applications, you often face the fact that HTTP, the foundation of the web, is a request/response protocol. A client issues a request, a server handles this request and sends back a response. All the time, with no relation between the first request and subsequent requests. Also, since it’s request-based, there is no way to send messages from the server to the client without having the client create a request first.

We’ve had a look at how to tackle this problem: using Ajax polling, Long polling an WebSockets. the conclusion was that each of these solutions has it pros and cons. [SignalR](https://github.com/SignalR/SignalR), an open source project led by some Microsoft developers, is an ASP.NET library which leverages the three techniques described before to create a seamless experience between client and server.

The main idea of SignalR is that the boundary between client and server should become easier to tackle. In this blog post, I will go deeper into how you can use SignalR to achieve real-time communication between client and server over HTTP.

## Meet DeckCast

DeckCast is a small sample which I’ve created for this blog post series on SignalR. You can download the source code here: [DeckCast.zip (291.58 kb)](/files/2011/12/DeckCast.zip)

The general idea of DeckCast is that a presenter can navigate to [http://example.org/Deck/Present/SomeDeck](http://example.org/Deck/Present/SomeDeck) and he can navigate through the slide deck with the arrow keys on his keyboard. One or more clients can then navigate to [http://example.org/Deck/View/SomeDeck](http://example.org/Deck/View/SomeDeck) and view the “presentation”. Note the idea is not to create something you can use to present slide decks over HTTP, instead I’m just showing how to use SignalR to communicate between client and server.

The presenter and viewers will navigate to their URLs:[![](/images/image_thumb_125.png)](/images/image_158.png)

The presenter will then navigate to a different slide using the arrow keys on his keyboard. All viewers will automatically navigate to the exact same slide at the same time. How much more real-time can it get?

[![](/images/image_thumb_126.png)](/images/image_159.png)

And just for fun… Wouldn’t it be great if one of these clients was a console application?

[![](/images/image_thumb_127.png)](/images/image_160.png)

Try doing this today on the web. Chances are you’ll get stuck in a maze of HTML, JavaScript and insanity. We’ll use [SignalR](https://github.com/SignalR/SignalR) to achieve this in a non-complex way, as well as [Deck.JS](http://imakewebthings.github.com/deck.js/) to create nice HTML 5 slides without me having to code too much. Fair deal.

## Connections and Hubs

SignalR is built around Connections and Hubs. A Connection is a persistent connection between a client and the server. It represents a communication channel between client and server (and vice-versa, of course). Hubs on the other hand offer an additional abstraction layer and can be used to provide “multicast” connections where multiple clients communicate with the Hub and the Hub can distribute data back to just one specific client or to a group of clients. Or to all, for that matter.

DeckCast would be a perfect example to create a SignalR Hub: clients will connect to the Hub, select the slide deck they want to view and receive slide contents and navigational actions for just that slide deck. The Hub will know which clients are viewing which slide deck and communicate changes and movements to only the intended group of clients.

One additional note: a Connection or a Hub are “transport agnostic”. This means that the SignalR framework will decide which transport is best for each client and server combination. Ajax polling? Long polling? Websockets? A hidden iframe? You don’t have to care about that. The raw connection details are abstracted by SignalR and you get to work with a nice Connection or Hub class. Which we’ll do: let’s create the server side using a Hub.

## Creating the server side

First of all: make sure you have NuGet installed and install the *SignalR *package. *Install-Package SignalR* will bring down two additional packages: *SignalR.Server*, the server implementation, and *SignalR.Js*, the JavaScript libraries for communicating with the server. If your server implementation will not host the JavaScript client as well, installing *SignalR.Server* will do as well.

We will make use of a SignalR Hub to distribute data between clients and server. A Hub has a type (the class that you create for it), a name (which is, by default, the same as the type) and inherits SignalR’s Hub class. The wireframe for our presentation Hub would look like this:

```

[HubName("presentation")]
public class PresentationHub
    : Hub
{
}

```

SignalR’s Hub class will do the heavy lifting for us. It will expose all public methods to any client connecting to the Hub, whether it’s a JavaScript, Console or Silverlight or even Windows Phone client. I see 4 methods for the *PresentationHub* class: *Join*, *GotoSlide*, *GotoCurrentSlide* and *GetDeckContents*. The first one serves as the starting point to identify a client is watching a specific slide deck. *GotoSlide* will be used by the presenter to navigate to slide 0, 1, 2 and so on. *GotoCurrentSlide* is one used by the viewer to go to the current slide selected by the presenter. *GetDeckContents* is one which returns the presentation structure to the client: the Title, all slides and their bullets. Let’s translate that to some C#:

```csharp
[HubName("presentation")]
public class PresentationHub
    : Hub
{
    static ConcurrentDictionary<string, int> CurrentSlide { get; set; }

    public void Join(string deckId)
    {
    }

    public void GotoSlide(int slideId)
    {
    }

    public void GotoCurrentSlide()
    {
    }

    public Deck GetDeckContents(string id)
    {
    }
}

```

The concurrent dictionary will be used to store which slide is currently being viewed for a specific presentation. All the rest are just standard C# methods. Let’s implement them.

```csharp
[HubName("presentation")]
public class PresentationHub
    : Hub
{
    static ConcurrentDictionary<string, int> DeckLocation { get; set; }

    static PresentationHub()
    {
        DeckLocation = new ConcurrentDictionary<string, int>();
    }

    public void Join(string deckId)
    {
        Caller.DeckId = deckId;

        AddToGroup(deckId);
    }

    public void GotoSlide(int slideId)
    {
        string deckId = Caller.DeckId;
        DeckLocation.AddOrUpdate(deckId, (k) => slideId, (k, v) => slideId);

        Clients[deckId].showSlide(slideId);
    }

    public void GotoCurrentSlide()
    {
        int slideId = 0;
        DeckLocation.TryGetValue(Caller.DeckId, out slideId);
        Caller.showSlide(slideId);
    }

    public Deck GetDeckContents(string id)
    {
        var deckRepository = new DeckRepository();
        return deckRepository.GetDeck(id);
    }
}

```

The code should be pretty straightforward, although there are some things I would like to mention about SignalR Hubs:

- The *Join* method does two things: it sets a property on the client calling into this method. That’s right: the *server* tells the *client* to set a specific property at the client side. It also adds the client to a group identified by the slide deck id. Reason for this is that we want to group clients based on the slide deck id so that we can broadcast to a group of clients instead of having to broadcast messages to all.
- The *GotoSlide* method will be called by the presenter to advance the slide deck. It calls into *Clients[deckId]*. Remember the grouping we just did? Well, this method returns me the group of clients viewing slide deck *deckId*. We’re calling the method *showSlide* n his group. *showSlide*? That’s a method we will define on the *client* side! Again, the server is calling the client(s) here.
- *GotoCurrentSlide* calls into one client’s *showSlide* method.
- *GetDeckContents* just fetches the Deck from a database and returns the complete object tree to the client.

Let’s continue with the web client side!

## Creating the web client side

Assuming you have installed *SignalR.JS* and that you have already referenced jQuery, add the following two script references to your view:

```xml
<script type="text/javascript" src="@Url.Content("~/Scripts/jquery.signalR.min.js")"></script>
<script type="text/javascript" src="/signalr/hubs"></script>

```

That first reference is just the SignalR client library. The second reference is a reference to SignalR’s metadata endpoint: it contains information about available Hubs on the server side. The client library will use that metadata to connect to a Hub and maintain the persistent connection between client and server.

The viewer of a presentation will then have to connect to the Hub on the server side. This is probably the easiest piece of code you’ve ever seen (next to Hello World):

```javascript
<script type="text/javascript">
    $(function () {
        // SignalR hub initialization
        var presentation = $.connection.presentation;
        $.connection.hub.start();
    });
</script>

```

We’ve just established a connection with the *PresentationHub* on the server side. We also start the hub connection (one call, even if you are connecting to multiple hubs at once). Of course, the code above will not do a lot. Let’s add some more body.

```javascript
<script type="text/javascript">
    $(function () {
        // SignalR hub initialization
        var presentation = $.connection.presentation;
        presentation.showSlide = function (slideId) {
            $.deck('go', slideId);
        };
    });
</script>

```

Remember the *showSlide* method we were calling from the server? This is the one. We’re allowing SignalR to call into the JavaScript method *showSlide* from the server side. This will call into Deck.JS and advance the presentation. The only thing left to do is tell the server which slide deck we are interested in. We do this immediately after the connection to the hub has been established using a callback function:

```javascript
<script type="text/javascript">
    $(function () {
        // SignalR hub initialization
        var presentation = $.connection.presentation;
        presentation.showSlide = function (slideId) {
            $.deck('go', slideId);
        };
        $.connection.hub.start(function () {
            // Deck initialization
            $.extend(true, $.deck.defaults, {
                keys: {
                    next: 0,
                    previous: 0,
                    goto: 0
                }
            });
            $.deck('.slide');

            // Join presentation
            presentation.join('@Model.DeckId', function () {
                presentation.gotoCurrentSlide();
            });
        });
    });
</script>

```

Cool, no? The presenter side of things is very similar, except that it also calls into the server’s *GotoSlide* method.

Let’s see if we can convert this JavaScript code into come C#as well.  I promised to add a Console application to the mix to show you SignalR is not just about web. It’s also about desktop apps, Silverlight apps and Windows Phone apps. And since it’s open source, I also expect someone to contribute client libraries for Android or iPhone. David, if you are reading this: you have work to do ;-)

## Creating the console client side

Install the NuGet package *SignalR.Client*. This will add the required client library for the console application. If you’re creating a Windows Phone client, *SignalR.WP71* will do (Mango).

The first thing to do would be connecting to SignalR’s Hub metadata and creating a proxy for the presentation Hub. Note that I am using the root URL this time (which is enough) and the full type name for the Hub (important!).

```csharp
var connection = new HubConnection("http://localhost:56285/");
var presentationHub = connection.CreateProxy("DeckCast.Hubs.PresentationHub");
dynamic presentation = presentationHub;

```

Note that I’m also using a *dynamic* representation of this proxy. It may facilitate the rest of my code later.

Next up: connecting our client to the server. SignalR makes extensive use of the Task Parallel Library (TPL) and there’s no escaping there for you. Start the connection and if something fails, let’s show the client:

```

connection.Start()
    .ContinueWith(task =>
      {
          if (task.IsFaulted)
          {
              System.Console.ForegroundColor = ConsoleColor.Red;
              System.Console.WriteLine("There was an error connecting to the DeckCast presentation hub.");
          }
      });

```

Just like with the JavaScript client, we have to join the presentation of our choice. Again, the TPL is used here but I’m explicitly telling it to *Wait* for the result before continuing my code.

```

presentationHub.Invoke("Join", deckId).Wait();

```

Because the console does not have any notion about the Deck class and its Slide objects, let’s fetch the slide contents into a dynamic object again. Here’s how:

```csharp
var getDeckContents = presentationHub.Invoke<dynamic>("GetDeckContents", deckId);
getDeckContents.Wait();

var deck = getDeckContents.Result;

```

We also want to respond to the *showSlide* method. Since there’s no means of defining that method on the client in C#in the same fashion as we did it on the JavaScript side, let’s simply use the *On* method exposed by the hub proxy. It subscribes to a server-side event (such as *showSlide*) and takes action whenever that occurs. Here’s the code:

```

presentationHub.On<int>("showSlide", slideId =>
{
    System.Console.Clear();
    System.Console.ForegroundColor = ConsoleColor.White;
    System.Console.WriteLine("");
    System.Console.WriteLine(deck.Slides[slideId].Title);
    System.Console.WriteLine("");

    if (deck.Slides[slideId].Bullets != null)
    {
        foreach (var bullet in deck.Slides[slideId].Bullets)
        {
            System.Console.WriteLine(" * {0}", bullet);
            System.Console.WriteLine("");
        }
    }

    if (deck.Slides[slideId].Quote != null)
    {
        System.Console.WriteLine(" \"{0}\"", deck.Slides[slideId].Quote);
    }
});

```

We also want to move to the current slide:

```

presentationHub.Invoke("GotoCurrentSlide").Wait();

```

There we go. The presenter can now switch between slides and all clients, both web and console will be informed and updated accordingly.

[![](/images/image_thumb_128.png)](/images/image_161.png)

## Conclusion

SignalR offers a relatively easy to use abstraction over various bidirectional connection paradigms introduced on the web. The fact that its open source and features clients for JavaScript, .NET, Silverlight and Windows Phone in my opinion makes it a viable alternative for applications where you typically use polling or a bidirectional WCF communication channel. Even WCF RIA Services should be a little bit afraid of SignalR as it’s lean and mean!

**[edit] There's the Objective-C client: [https://github.com/DyKnow/SignalR-ObjC](https://github.com/DyKnow/SignalR-ObjC)**

The sample code for this blog post can be downloaded here: [DeckCast.zip (291.58 kb)](/files/2011/12/DeckCast.zip)
