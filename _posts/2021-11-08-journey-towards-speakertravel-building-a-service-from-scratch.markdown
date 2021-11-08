---
layout: post
title: "A journey towards SpeakerTravel - Building a service from scratch"
date: 2021-11-08 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "Travel", "Startup", "Conferences"]
author: Maarten Balliauw
---

For close to two years now, I've had [SpeakerTravel](https://speaker.travel/) up & running. It's a tool that helps conference organizers to book flights for speakers. You invite speakers, they pick their flight of choice (within a budget the organizer can specify), and the organizer can then approve and book the flight with a single click.

{% include toc %}

In this post, I want to go a bit into the process of building this tool. Why I started it in the first place, how it works, a look at it from the business side, and maybe a follow-up post that covers any questions you may have after reading.

There's also a table of contents, so brace yourself for a longread!

## Why I started building a travel booking tool

Before COVID threw a wrench in offline activities, our [user group](https://www.azug.be/) was organizing [CloudBrew](https://www.cloudbrew.be/), a 2-day conference with speakers from across the world (mostly Europe).

Every year, I was complaining on Twitter around the time travel for those speakers needed to be booked. Booking flights for a speaker would mean several e-mails back-and-forth about the ideal schedule, checking travel budgets, and then sending the travel confirmation. And because our user group is a legal entity, we'd need invoices for our accountant, which meant contacting the travel agency and more e-mails.

When we started, we did all of this for 5 speakers, which was doable. Then we grew, and in the end needed to do this for 19 speakers. Madness!

That got me thinking, and almost pleading for someone to come up with a solution:

<blockquote class="twitter-tweet" data-lang="en" data-dnt="true"><p lang="en" dir="ltr">Startup idea: &quot;Give travel site a bunch of e-mail addresses and budgets. Site lets those people select flights within that budget. I say yes/no and get billed.&quot; - Would love this for conference organizing!</p>&mdash; Maarten Balliauw (@maartenballiauw) <a href="https://twitter.com/maartenballiauw/status/1014515650902089731?ref_src=twsrc%5Etfw">July 4, 2018</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Alas, by the time we had that 19 speaker booking coming up, no such solution came about, and we were once again doing the manual process.

## How flight tickets work...

In the back of my mind, the idea stuck. Would it be possible to build a solution to this problem, and make booking travel for speakers at our conference an easier task?

Of course, building the app itself would be possible. It's what we all do for a living! But what about the heart of this solution... You know, actually booking a flight ticket in an automated way?

After researching and reading a lot, it seems that booking a flight ticket always consists of 4 steps:

* You search an inventory of available seats for a flight combination;
* For that flight combination, a price is requested;
* For that flight combination, a booking is created;
* For that booking, tickets are issued.

Book flights via any website, and you'll go through these steps. There's a reason for this:

* The flight inventory is really a big database with all seats on all (or at least, many) airlines. As far as I could find, airlines populate this database a coule of times a year. It does not contain prices, just seats and conditions to book seats.
* Pricing checks a given seat with the airline (or other party in between). Requesting a price means the airline can give an actual price for a seat. They can also track interest in a specific seat/group of seats, and price accordingly.
* Booking reserves the seat, and removes that seat from the big flight inventory database. Ideally, booking has to happen soon after pricing. If no tickets have been issued after a couple of hours, the seat is made available again.
* Issuing tickets confirms the seat, and gives you the actual ticket that can be used to board a plane. Having these two steps separate means that in between, a booking website can ask you for payment, and only when that is confirmed, issue tickets.

So in short, I needed something that could perform all of these steps somehow. More research!

### Global Distribution Service (GDS)

One of the first services that popped up were different Global Distribution Services (GDS) for air travel. The world has many of them. You may have heard of [Amadeus](https://www.amadeus.com/), [Sabre](https://www.sabre.com/) or [Travelport](https://www.travelport.com/), but there are others.

These GDS are an interoperability layer between inventories from airlines, travel agents, and more. They have software in place to handle interactions between all parties involved (airlines, travel agents, hotels, ...), and until a few years ago, were always involved in booking flights. Nowadays, airlines often sell their inventory directly, without these middle-men involved.

I explored various GDS', and quickly found that this was not the way to go. First, they expect certain volumes of sales. I contacted one of them, and essentially got laughed at when I said I wanted to book around 20 flights a year. Second, from a technical point of view, a lot of them had documentation available that talked about XML-over-SOAP, WS-* standards, and all that. Been there, done that, but prefer the more lightweight integrations of recent years.

### Flight search affiliate programs

There are a number of affiliate programs out there that provide an API that you can use to search flights (including an approximate price), and give you a link to the booking site. Examples are [Travelpayouts](https://www.travelpayouts.com/) and [SkyScanner](https://partners.skyscanner.net/affiliates/travel-apis).

The conditions for using these APIs were somewhat restrictive for my use case, but e-mailing one of them confirmed this use case was something that could fit.

Let the speaker search and request a flight, and then the organizer would click through and make the booking. This would still mean entering credit card details and invoice address a number of times, but it could work.

### Online Travel Agencies (OTA)

Somewhere in-between GDS and affiliate programs, there are the Online Travel Agencies (OTA) and the likes. These companies are travel agents, and have their contracts with zero, one or several GDS, airlines, and more.

Searching this space, I found a couple of them that had APIs available for the above 4 steps - which seemed promising as it would give full control over the booking process (including automation of sending the correct invoice details when purchasing a ticket):

* [AirHob](https://www.airhob.com/Developers)
* [Kiwi.com](https://docs.kiwi.com/)
* [Travelopro](https://www.travelopro.com/flight-api.php)
* [Travelomatic](http://www.travelomatix.com/)

After contacting them all, some responded only after a couple of weeks, others had requirements in terms of number of tickets sold (volume), and this got me disillusioned.

### A travel agent from Sweden

Having talked with a couple of folks about this idea and finding an API, a friend suggested I contact a travel agent they knew well as they could be able to help.

We had a long call about the idea, and they were very helpful in providing some additional insights into the world of flight booking. They were using the TravelPort GDS themselves, and were building their own API on top of that to power their own websites. Unfortunately, they weren't sure it would ever get completed, so this wasn't a viable solution.

Nevertheless, lesson learned: it never hurts to talk, even if it's just for sharing insights and learnings.

### AllMyles

Some weeks after my disillusion with OTAs, I was searching the Internet once more and found another service: [AllMyles.com](https://www.allmyles.com/).

I decided to get in touch with some questions about my use case and low volumes. With zero expectations: I considered this my last attempt before shelving the entire idea.

Responding in 3 days would have been a record, but these folks responded in 30 seconds (!). A good 10 minutes later I was on Skype with their founder. We chatted about the service I wanted to build, and he even gave some thoughts on how to implement certain parts and workflows.

On [their website](https://www.allmyles.com/), a 30-day trial of their staging environment was promoted, and their founder confirmed this was flexible if needed. So I decided to go with this and experiment with the API to see what was possible and what was not, and maybe finally start building this application!

## The business side...

With the AllMyles API docs in hand, I set out to writing some code and experimenting with their staging environment. All seemed to work well for my use case.

There was one thing in the way still... To get production access, a one-time certification fee of 3000 EUR would have to be paid. Definitely better than the volume requirements of other solutions, but still quite steep for booking 20 flights a year.

What if this tool would be something that can be used by any conference out there, and I charge a small fee per passenger to cover this certification fee and other costs?

Time to put on the business hat.

### CENTS

A couple of years ago, a friend recommended reading [The Millionaire Fastlane by MJ DeMarco](https://amzn.to/302838r). It's a good book with ideas on getting out of the rat race that controls many of us, and very opinionated. You may or may not like this book. There's one idea from the book that stuck in my head though: CENTS.

CENTS is an acronym for the five aspects on which any idea can be vetted for viability as a business. It's not a startup canvas or anything, just a simple way of checking if there is some viability:

* **C**ontrol - Do you control as many elements of the business as possible, or would something like a price or policy change with a vendor mess with your business?
* **E**ntry - How hard is entering this market? Can anyone do it in 10 minutes, or would they need a lot of time, money, and other resources?
* **N**eed - Does anyone actually need this thing you are thinking about?
* **T**ime - Will you be converting time into money, or can you decouple the two and also earn while you're asleep?
* **S**cale - Can you see this scale, are there pivots that would work, ...

Before diving into the deep and coughing up that certification fee (and building the tool), I wanted to check these...

For flight booking, **C**ontrol is never going to be the case. Someone is flying the airplane, someone handles booking. There are parties in between you and that flight, and there's no way around that. From my research, I knew if really needed I could find another OTA or GDS, and go with that, so I felt there was just enough control to give this aspect a green checkmark.

**E**ntry was steep enough: that certification fee, research, building the app. Something everyone could overcome, but definitely not something everyone would do. As an added bonus, I had to figure out some tricks to find the same flight twice: once by the speaker making the search, once by the conference organizer to confirm booking. Pricing and booking have to be close together (as in, 20-30 minutes), but for SpeakerTravel there could even be a few days between both parties doing this. In any case, it requires some proper magic to get this right and fine the same (or a very comparable) seat. So **E**ntry? Check!

The **N**eed aspect was easy. There are lots of conferences out there that are probably going through the same pain with booking flights. Check!

Same with **T**ime. This would be a software-as-a-service, that would allow folks to do self-service booking and payments, even when I'm not around. Check!

Finally, **S**cale. This solution could work for IT conferences, medical conferences, pretty much anything where a third party would pay for someone else's flights. Business travel could be a pivot, where employees could book and employers would pay. Another pivot could be handling travel for music festivals, etc. So definitely not a hurdle in the long run!

In short: it made ~~sense~~ CENTS!

### Legal requirements

Building a tool for our own conference is one thing, building it for third-party use is another. Could I sell flight tickets from my Belgian company?

Instead of trying to figure this out myself, I asked for advise here from a lawyer. The response came in (together with an invoice for their time researching), and for my Belgian company there were a few things to know about:

* Flights-only is fine. You're never *selling* flights, you are facilitating a transaction between the traveler and the airline.
* If you combine flights and hotels, flights and rental cars, etc., you're selling travel packages. Travel packages have stricter requirements.

Great! So I could go ahead with flights (and only flights), and start building the app!

### Payments

While building the app (more on that later), I also was thinking about how to handle flight ticket payments... I'd have a fee per traveler (fixed), and the flight fare itself (variable, and one I'd have to pay directly to AllMyles).

The two-step ticket issuing seemed like a perfect place to shove in a payment gateway, for example [Stripe](https://www.stripe.com/), and collect payment before making the actual booking through the API.

Unfortunately, none of the payment gateways I found let you do "risky business". All of them have different lists of business types that are not allowed, and travel is always on those lists. One payment gateway from The Netherlands confirmed they could support my scenario, but after requesting written confirmation that stance changed. In other words: credit cards were not an option.

For now, I decided to go with an upfront deposit, to ensure flight fares can be paid when someone confirms their booking.

## Building SpeakerTravel

With a good idea in mind, and a blank canvas in front of me, it was time for the excitement of creating a new project in the IDE!

The most important question: **Which project template to start with?**

### Attempt to a single-page application...

Since I'd already built some API integration with AllMyles in C#, at least part of the application would probably be ASP.NET Core. With close to no experience with single page applications at the time, I thought this would be a good learning experience!

So I went with an ASP.NET Core backend, [IdentityServer](https://duendesoftware.com/), and [React](https://reactjs.org/).

About an hour of cursing on a simple "Hello, World" later, React was replaced with [Vue.js](https://vuejs.org/) which seemed easier to get started with. I did have to replicate the [ASP.NET Core SPA development experience (blog post)](https://blog.maartenballiauw.be/post/2019/11/13/how-does-the-aspnetcore-spa-development-experience-work.html) to support Vue.js, but that was fun to do and write about.

What wasn't fun though, was the slow-going. New to Vue.js, a lot of things went very slow while building. After 2 weeks of spending evenings on just a login that worked smoothly, I started wondering...

*"Am I doing this to solve a problem, or to learn new tech?"*

Building this thing over the weekend and in the evening hours, I reconsidered the tech stack and started anew.

### ...replaced with boring technology

This time, I started with an ASP.NET MVC Core project. Individual user accounts using ASP.NET Core Identity, Entity Framework, and SQL Server. A familiar stack for me, and a stack in which I was immediately productive.

A few hours into development, I had the login/register/manage account pages customized. The layout page was converted to load a [Bootswatch UI theme](https://bootswatch.com/) (on top of [Bootstrap](https://getbootstrap.com/)), and was starting to get into building the flows of inviting speakers, searching flights (with 100% made up data), approving and rejecting flights, and all that. This was finished in a week or 6 and then another few weeks to properly integrate with AllMyles' staging environment.

While developing the app, a lot of new ideas and improvements popped up. I tried to be ruthless in asking myself *"do I really need this for version 1?"*, and log anything else in the issue tracker and pick it up in the future. This definitely helped with productivity.

Some fun was had implementing [tag helpers to show/hide HTML elements (blog post)](https://blog.maartenballiauw.be/post/2020/04/14/building-an-aspnet-core-tag-helper-to-show-hide-ui-elements-based-on-authorization.html), which realy works well to make certain parts of the UI available based on user permissions and roles.

The first version was ready near the end of August 2019, including a basic [product website](https://speaker,travel/) that is powered by a very simple Markdown-to-HTML script that seems to work well.

The [application itself](https://app.speaker.travel/) was built and deployed on the following stack:

* ASP.NET Core MVC + Razor pages for the scaffolded identity area, on .NET Core 2.1
* Bootstrap and Bootswatch for UI
* A sprinkle of jQuery
* [Hangfire](https://www.hangfire.io/) for background jobs (the actual bookingm, sending e-mails, anything that's async/retryable)
* SQL Server LocalDb for development, Azure SQL Database for production
* Azure Web Apps for the app and product website
* Private GitHub repository
* Azure DevOps to build and deploy
* SendGrid for sending e-mails

Overall, this was and is a very familiar stack for me, and as a result a stack in which I was immediately productive. Server-side rendering is fine 😉 And .NET is truly great!

When you have an idea you want to build out, I can highly recommend going with what you know - unless of course the goal is exploring another tech.

### The domain model

When I asked folks on Twitter for what they wanted to see in this post, [Cezary Piatek](https://twitter.com/cezary_piatek) wanted to know about the domain model.

From a high-level, the domain model of this application is simple. There's an `Event` that has `Traveler`s, and at some point, they will have a `Booking`.

For every traveler, the system keeps a `TravelerStatus` history, which represents state transitions. From `invited`, to `accepted`, to `bookingrequested`, to `confirmed`/`rejected`/`canceled`, to `ticketsissued`, and potentially back to the start where a `rejected` traveler goes to `accepted` again so they can make a new search.

The `TravelerStatus` history is evaluated for every traveler, and the system takes these into account. In fact, they are somewhat visible in the application UI as well (though some of these state transitions are combined for UX purposes).

When a `Traveler` requests a booking, some PII is stored. Passenger name, birth date, and whatever the airline requires to book a given seat. This data is stored as a JSON blob - the fields are dynamic and may differ depending on the airline. This data is always destroyed after tickets are issues, the booking request was rejected, or when the booking was still waiting for approval but the event has concluded 10 days ago.

For flight search and booking, the domain model is a 1:1 copy of what AllMyles has in their API. Looking at other APIs, it's roughly the standard model in the world of flights. A `Search` returns one or more `SearchResult`s. Each of those has one or more `Combination`s, typically flights that have the same conditions and price, but different times. E.g. a shuttle flight from Brussels to Frankfurt may return 3 combinations here - same price, and conditions, just 3 different times during the day. A `Combination` can also have upgrade and baggage option. The booking itself is essentially makign a call that passes a given `Combination` identifier (and what options are selected on top).

### Ready for take-off!

The app was deployed (targeting AllMyles staging), and I requested certification (coughing up the initial fee - no turning back now!). This process took a couple of days, but at some point I was given production access and SpeakerTravel was live!

This was right on time for our CloudBrew conference in 2019, and it was really exciting to see folks request flights, booking them via the API, and seeing actual flight tickets sent out by airlines. Not to mention, much easier in terms of workload and back-and-forth compared to the manual process that triggered this entire endeavour! And speakers themselves also enjoyed this workflow:

<blockquote class="twitter-tweet" data-dnt="true"><p lang="en" dir="ltr">Massive props to <a href="https://twitter.com/CloudBrewConf?ref_src=twsrc%5Etfw">@CloudBrewConf</a> - their travel booking system for the speakers has really raised the bar!</p>&mdash; Paul Stack (@stack72) <a href="https://twitter.com/stack72/status/1161543315218739201?ref_src=twsrc%5Etfw">August 14, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Thanks, Paul 🤗

Very quickly, a couple of organizer-friends jumped aboard as well. And for a conference I was attending myself, I used it to book a flight in my own name. Pretty cool!

<blockquote class="twitter-tweet" data-lang="en" data-dnt="true"><p lang="en" dir="ltr">First time taking a flight booked through my own <a href="https://twitter.com/SpeakerTravel_?ref_src=twsrc%5Etfw">@SpeakerTravel_</a> - pretty cool to fly on a ticket you issued yourself 😎</p>&mdash; Maarten Balliauw (@maartenballiauw) <a href="https://twitter.com/maartenballiauw/status/1217352024091766785?ref_src=twsrc%5Etfw">January 15, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

A couple of conferences later, some bugs were ironed out, some  feature requests were handled, and the certification fee was covered. Business-wise, and conveniently brushing aside time spent building this thing, SpeakerTravel was break-even!

### COVID-19 💊 and working on the backlog

And then, half a year after release, a pandemic hit the world. Conferences all went online, travel virtually halted, and no new conferences onboarded SpeakerTravel for a long time.

This was a bummer, but a good time to work on that backlog of features I wanted to add. Some technical debt got fixed, and thanks to fast release cadences in both the front-end and .NET world, I've been upgrading a lot of things, many times.

Today's tech stack:

* ASP.NET Core MVC + Razor pages for the scaffolded identity area, on .NET 6.0 RC2
* Bootstrap and Bootswatch
* A sprinkle of jQuery (that I want to replace with [HTMX](https://htmx.org/))
* [Hangfire](https://www.hangfire.io/) for background jobs (the actual bookingm, sending e-mails, anything that's async/retryable)
* SQL Server LocalDb for development, Azure SQL Database for production
* Product website and application are Docker images now, deployed to Azure Web Apps for Containers
* [JetBrains Space](https://www.jetbrains.com/space/) for Git, CI/CD, and container registry
* [Mailjet](https://www.mailjet.com/) for sending out e-mails. Smaller company, better support.

> **Note:** If you're interested in seeing CI/CD with Space, check [this Twitter thread](https://twitter.com/maartenballiauw/status/1440228410668716035/).

## What's next?

Good question! I think this question can be split as well...

## What's next on the technical side?

Let's start with this one. As in the past months, working on some items from the backlog and just keeping things up to date. Very high on my wishlist is ripping out jQuery and replacing the few bits that require client-side interactivity with [HTMX](https://htmx.org/).

One of the things I do want to try at some point is seeing if I can run the entire stack on Kubernetes, but that's purely out of personal interest.

Any other nerd snipes are welcome in the comments!

## What's next on the business side?

What's immediately next, is definitely uncertainty. We're still in a pandemic, and while parts of the world seem to be evolving into the right direction for SpeakerTravel, it's unsure when in-person conferences will pick up again.

Apart from infrastructure, there's no real cost to running the application, so I can be patient on that side and keep pitching it to anyone I meet, and provide good support for those who do sign up in the meanwhile.

Speaking of which, I'm super happy that since September 2021, a few conferences have been using the product for in-person travel!

### Why not pivot?

A question I got recently was: *Why not pivot to business travel?* - great idea!

Earlier in this post, I described the model where employees could search and pick travel options, and the company can approve and pay. This would indeed be a great pivot, but there are a couple of things holding me back on this:

* It's a very crowded market (with some big players like American Express). This is not a big issue though, it validates there is a market, but it would need quite some effort to get traction.
* I'd have to expand from flights into flights + hotels + cars. While possible in terms of APIs, it does require fulfilling some extra regulations.

Both of these would mean going bigger than what I currently want to handle.

## Conclusion and Takeaways

Sometimes, you have a story in you that you just want to write down. This was one of those.

Instead of sharing the event of having [SpeakerTravel](https://speaker.travel/) online, I wanted to share the story about the process that brought it about. Maybe we all focus on the event too much, and not enough on the process towards the event.

Social media consists of short bits, while blogs, articles and tutorials about the process have so much value. Leave breadcrumbs for those on a similar path like you in the future.

Speaking of that: if there's anything in this blog post you would like to see a follow-up on with more details, let me know via the comments.

Take care!
