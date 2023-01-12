---
layout: post
title: "Mastodon on your own domain without hosting a server"
date: 2022-11-05 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "Web", "Social media"]
author: Maarten Balliauw
---

Like many in the past week, I have been having a serious look at [Mastodon](https://joinmastodon.org/) as an alternative to Twitter.

Mastodon is a social network that is distributed across many servers that have their own smaller communities, and federate with other servers to provide a more "global" social network.

There are [many servers out there](https://joinmastodon.org/servers) that you can choose from.
Alternatively, you can also [self-host](https://docs.joinmastodon.org/admin/prerequisites/) your Mastodon server, or use [one of many hosted instances](https://joinfediverse.wiki/How_to_host_your_own_Fediverse_instance%3F), "Mastodon as a service".

In recent hours, I have seen many people wanting to host their own servers, which is great fun!
Self-hosting also has the added benefit of being able to have a Mastodon account on your own domain, and you own your data.

Now, I don't really care about that (_yet?_). I ran my own mail server back in the day and am very happy with someone running it for me now.
The same goes with Mastodon: I trust the folks at [Mastodon.online](https://mastodon.online), the server I joined, to do a much better job at this than I will ever do.

However, there is one thing I _would_ like my own server for: **discoverability**.
Much like with e-mail, I want folks to have an easy address to find me, and one that I can keep giving out to everyone even if later I switch to a different Mastodon server.
A bit like e-mail forwarding to your ISP's e-mail service.

The good news is: **you can use your own domain** and share it with other folks. It will link to your actual account.

Go on, try it. Search for `@maarten@balliauw.be`, and you will find my `@maartenballiauw@mastodon.social`.

## How to discover Mastodon account via custom domain

Reading ["how to implement a basic ActivityPub server"](https://blog.joinmastodon.org/2018/06/how-to-implement-a-basic-activitypub-server/),
there are a couple of things that stand out:

* Mastodon (and others) use [ActivityPub](https://activitypub.rocks/) as their protocol to communicate between "actors".
* Actors are discovered using [WebFinger](https://webfinger.net/), a way to attach information to an email address, or other online resource.

Since discovery is what I was after, WebFinger seemed like the only thing I would need to implement.

WebFinger lives on `/.well-known/webfinger` on a server. For Mastodon, your server will be queried for accounts using an endpoint that looks like this:

```http
GET /.well-known/webfinger?resource=acct:accountname@server
```

And indeed, if I look at my Mastodon server's `webfinger` for my account, I get a response back!

```http
GET https://mastodon.online/.well-known/webfinger?resource=acct:maartenballiauw@mastodon.online

{
  "subject": "acct:maartenballiauw@mastodon.online",
  "aliases": [
    "https://mastodon.online/@maartenballiauw",
    "https://mastodon.online/users/maartenballiauw"
  ],
  "links": [
    {
      "rel": "http://webfinger.net/rel/profile-page",
      "type": "text/html",
      "href": "https://mastodon.online/@maartenballiauw"
    },
    {
      "rel": "self",
      "type": "application/activity+json",
      "href": "https://mastodon.online/users/maartenballiauw"
    },
    {
      "rel": "http://ostatus.org/schema/1.0/subscribe",
      "template": "https://mastodon.online/authorize_interaction?uri={uri}"
    }
  ]
}
```

Sweet!

The next thing I tried was simply copy-pasting this JSON output to my own server under `.well-known/webfinger`, and things magically started working.

In other words, if you want to be discovered on Mastodon using your own domain, you can do so by copying the contents of `https://<your mastodon server>/.well-known/webfinger?resource=acct:<your account>@<your mastodon server>` to `https://<your domain>/.well-known/webfinger`.

One caveat: this approach works much like a catch-all e-mail address. `@anything@yourdomain.com` will match, unless you add a bit more scripting to only show a result for resources you want to be discoverable.

## Bonus: Discovering folks from Twitter

Discoverability, at this stage, is one of the things that matter to get a proper social graph going.
Over the past days, there were a couple of tools I found very useful in finding Twitter folks on Mastodon:

* [Twitodon](https://twitodon.com/) learns about which Twitter account matches a Mastodon account, from folks using this service.
* [Fedifinder](https://fedifinder.glitch.me/) and [Debirdify](https://pruvisto.org/debirdify/) scan Twitter accounts and checks if there is a Mastodon account in their profile data.
*
Do make sure to add your Mastodon address somewhere on your Twitter profile as well.

Good luck! And give `@maarten@balliauw.be` a follow if you make the jump to Mastodon.

**Edit:** Seems [there is a GitHub issue which requests custom domains](https://github.com/mastodon/mastodon/issues/2668) as well.

**Edit (15 Nov 2022):** Folks have been using the approach of serving up webfinger on a different domain through proxy setups, e.g. using CloudFlare.

**Edit (16 Nov 2022):** Jeff Handley [shared a PR demonstrating how to apply this to a Jekyll website](https://github.com/jeffhandley/jeffhandley.github.io/commit/cc1a82d384e1791e3b55b5e0a1fa16058d98ba99).

**Edit (8 Dec 2022):** In search, it looks like the custom alias is only found **when logged in to the server**. Searching for the alias while not logged in may not return a result.
