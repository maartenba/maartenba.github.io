---
layout: post
title: "Monitoring Twitter with Azure LogicApps and JetBrains Space"
date: 2020-03-09 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Azure", "Space"]
author: Maarten Balliauw
---

In the [.NET team at JetBrains](https://www.jetbrains.com/dotnet/), we try to be as responsive as possible on Twitter when there are mentions of ReSharper, Rider, or any of the profiling tools. Many of our developer advocates, as well as the development team, QA and marketing, are active on Twitter and keep an eye on what's being talked about, to try and help out wherever and whenever they can.

But not everyone is equally active on Twitter! I don't know [where I fit](https://twitter.com/maartenballiauw/), but folks like [Khalid](https://twitter.com/buhakmeh/) seem to have a Twitter brain implant that is connected 24/7, while [Rachel](https://twitter.com/RachelAppel/), [Matt](https://twitter.com/citizenmatt/) and [Matthias](https://twitter.com/matkoch87/) are active throughout the day but take healthy breaks to focus on other things.

**How do we keep track of Twitter with a big team** and a variety of usage patterns, responding to as many tweets as possible? **We post them into a [Space](https://www.jetbrains.com/space) chat!**

![The Rider-Mentions channel in Space](/images/2020/03/monitoring-twitter-with-azure-logicapps-and-jetbrains-space.png)

From this chat, team members can navigate to the tweet directly and chime in. We can also mention specific team members and ask for their expertise on a given subject, so that the first responder is very often the developer working on a given feature or the person with the broadest knowledge about the subject at hand.

You're probably not here to read about our Twitter habits, though. My guess is it was the title... **Monitoring Twitter with Azure LogicApps and [JetBrains Space](https://www.jetbrains.com/space)** - that's also a big spoiler on the tools we use to make our Twitter workflow happen. So let's cut to chase and see **how to set up an Azure LogicApp that sends messages to Space**.

## Prerequisites

Of course, we'll need an Azure subscription, as well as a [JetBrains Space](https://www.jetbrains.com/space) organization.

With those in place, let's start creating our LogicApp. After selecting the resource group, deployment location and giving it a name, we can start building our flow.

## Configuring the Twitter trigger

In Azure LogicApps, a workflow will typically be started with a triger. This can be an HTTP request coming in, a file being created somewhere, an e-mail being received, or... a Twitter search! Since we want to monitor Twitter, let's use this as the trigger for our flow. Pick *When a new tweet is posted...* as the trigger.

The Azure portal will then ask us to authenticate with Twitter. We can use any account here, the only reason it's required is to be abe to use the Twitter API's under the hood.

Next, we'll have to specify a search query. I'll set up a new flow to keep track of [@JetBrains_Space](https://twitter.com/jetbrains_space), so the search query will be:

```
(from:@JetBrains_Space) OR (to:@JetBrains_Space) OR (@JetBrains_Space)
```

Whenever new tweets are available that are from or to `@JetBrains_Space`, or mention it in the message, we want to trigger our flow.

![Twitter search query](/images/2020/03/logicapps-search-twitter.png)

Let's run our LogicApp every 5 minutes, and go on to the next step.

## Authenticating with JetBrains Space

The next step in our flow will be authenticating with JetBrains Space. To do that, we'll need to set up an application that will be posting messages into chat. Under **Administration \| Applications**, we can create a new application of type `Service Account`, and give it a name. There's no need to edit application rights - posting to a chat is always possible.

![Create an application in JetBrains Space](/images/2020/03/create-application-in-space.png)

Once created, make note of the `Client ID` and `Client secret` - we'll need this in a second.

Back on the Azure LogicApps side of things, we want to authenticate. The docs mention we will have to use [the Client Credentials Flow](https://www.jetbrains.com/help/space/client-credentials.html), which means we'll be making a `POST` to Space in order to retrieve a token we can use to send a chat message later. So let's do that!

Add an **HTTP** step, and specify the following:

* Method: `POST`
* URI: `https://{your-org}.jetbrains.space/oauth/token`
* Headers: `Content-Type` - `application/x-www-form-urlencoded`
* Body: `grant_type=client_credentials&scope=**`
* Authentication: `Basic`, and add the Client ID as a username, and the Client secret as a password.

Visually (with some blurred fields so you don't post into our Space):

![JetBrains Space authentication from Azure LogicApps](/images/2020/03/http-step-authenticate-oauth-space.png)

If that succeeds, we should get back credentials and can finally post a message to the chat!

## Sending a message to a chat channel

To post a message to a chat channel, we can use the Space API! Under **Administration \| HTTP API Playground**, find **Send message** to get the documentation on how to send a chat message.

We'll need to create another HTTP step in our Azure LogicApp, and specify the following:

* Method: `POST`
* URI: `https://{your-org}.jetbrains.space/api/http/chats/channels/{channel-id}/messages`\
  (grab the channel ID from the URL shown in the browser when using the Space chat channel)
* Headers:
  * `Accept` - `application/json`
  * `Content-Type` - `application/json`
* Body:
  ```  
  {
    "text": "https://twitter.com/@{triggerBody()?['UserDetails']?['UserName']}/status/@{triggerBody()?['TweetId']}"
  }
  ```
* Authentication: `Raw`, and set `Bearer @{body('Authorize')['access_token']}`

The body of our HTTP request will be the full URL to the tweet we collected in the trigger to our Azure LogicApp. Space will unfurl its contents for us, so re-creating the Twitter URL is enough here.

For authentication, we'll use the `access_token` we retrieved in the previous step. Azure LogicApps takes care of deserializing the JSON body and providing the data to us.

Visually, this step looks like the following:

![Post chat message to JetBrains Space](/images/2020/03/post-chat-message-to-jetbrains-space.png)

From the screenshot, the HTTP body and authorization header look a bit more clear in terms of where the values for the tweet text and the `access_token` come from.

## We're done!

That's it, really! We can now save our Azure LogicApp and wait for tweets to come in.