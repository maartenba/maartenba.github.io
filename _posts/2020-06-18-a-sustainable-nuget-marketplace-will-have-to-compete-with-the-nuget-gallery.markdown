---
layout: post
title: "A sustainable NuGet marketplace will have to compete with the NuGet gallery"
date: 2020-06-18 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", ".NET", "NuGet"]
author: Maarten Balliauw
---

Yesterday, [Aaron Stannard](https://twitter.com/Aaronontheweb) posted some **awesome news for the .NET community:
the [introduction of Sdkbin](https://www.aaronstannard.com/sdkbin-marketplace/)**. Sdkbin is targeted at solving
the OSS sustainability problem by automating the majority of the sales, fulfillment, licensing, and accounting
needed to sell libraries, frameworks, and support plans. **It's (roughly speaking) an App Store, delivered as a
NuGet feed.**

In this post, I wanted to **contribute some of my own thoughts** in this area, and end with a section about
why Sdkbin (or any solution in this space) **will have to compete head-on with NuGet.org**.

Before we grab our pitchforks, let's start with some thoughts.

## Why open source sustainability matters

For a while now, and if I come to think of it, ever since .NET was released, we've been struggling with open source projects.
Not with creating them - there are many, many, awesome projects out there in various areas and of various sizes.
We struggle with sustaining them.

Often, open source starts from a personal need of one or more developers, who then solve that need for themselves.
It will be useful for others, so let's publish a NuGet package and open source all code, take issues and contributions, and all that.

This is where sustainability comes in. How can core contributors sustain their interest in keeping the project going,
promoting it and getting others to use it, responding to bug reports, and all other things involved? What's their incentive for working
for free? This often starts with trying to build name and reputation, but that wears off. Their interest may fade over time.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Wanted!<br><br>10x rockstar developer 🔥<br><br>Responsibilities include:<br>* Merging PRs immediately<br>* Making new features on demand<br>* Fixing bugs right now<br><br>Compensation:<br>* Stars<br>* +1&#39;s<br>* Threats, general and specific<br>* Public shaming<br><br>Apply at OSS Inc today</p>&mdash; Ryan Chenkie (@ryanchenkie) <a href="https://twitter.com/ryanchenkie/status/1067801413974032385?ref_src=twsrc%5Etfw">November 28, 2018</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

How can open source contributors involve and interest others? How can they prevent burning out? Things happen, where the
project is no longer being maintained. Their users are disappointed and have to replace project A with project B.

Users expect project A to always work. They adopted it, spent time integrating it in their solutions. They expect the
authors to always be there to tackle questions and issues. And that is understandable. These users are often
companies, who look at continuity. Who expect continuity, for good reasons, as this open source project helps
them run their business processes.

## How to sustain open source?

There is zero guarantee that an open source project will be there forever, and that the core contributors will
always be there. This raises some questions and concerns:

* How can we ensure core contributors remain interested?
* How do we prevent them from burning out working on things they no longer care about?
* How can we make sure if their interest fades, the project is maintained?
* Is this hindering more adoption of open source, because companies may pick "company-backed projects" over random folks pushing code to GitHub?

Let's look at how we can answer these...

### Open source foundations / .NET Foundation

One attempt to fix some bullets from that list is in open source foundations, like [.NET Foundation](https://dotnetfoundation.org/).
From [their FAQ](https://dotnetfoundation.org/about/faq):

> We help projects stay focused on producing high-quality software without the legal and administrative
> distractions and overhead so they can focus on helping contributors and writing code.

Great! If we all move our projects under the .NET Foundation, our company-users can be reasonably sure
there is a good license in place, and projects get some help with certificates, legal, administration and so on.

Essentially, these foundations try to solve adoption of open source by other companies, and in some aspect
provide a means of picking up a project when core contributors left. There have not been such cases as far
as I know, so this may even turn out not to be the case.

Bottom line: does this solve the core question? How can we ensure core contributors remain interested?

### Sponsorship

In an earlier post, Aaron described that [creating sustainable open source projects will have to be done by treating them like proper businesses](https://www.aaronstannard.com/sustainable-open-source-software/).
He makes the point that an open source project has to be treated as a business. Contributors and consumers
come as a package deal. Commercial licenses help support the project, and help build trust with users.
Adding support packages on top helps support the project, and builds trust with users.

This is where many projects think *sponsorship* comes in. Many open source contributors today have
a [Patreon](https://www.patreon.com/) link, or have enabled [GitHub Sponsors](https://github.com/sponsors).

Let's look at the sponsors page of a friend of mine, [Tom Kerkhove](https://twitter.com/TomKerkhove).
He's a great person, and has spent countless hours on building out and maintaining [Promitor](https://github.com/tomkerkhove/promitor),
used widely by folks pushing Prometheus metrics into Azure Monitor.

[Tom has a sponsor button](https://github.com/sponsors/tomkerkhove), which tells me that I can sponsor him for
$5, $10, up to $500 per month. There's also a progress bar at the top, that tells me he's 30% on his way to
$50/month. That's a whopping $15 per month on the way to becoming a business!

You may not be using this project, but I know many are. How many are sponsoring Tom for his efforts? Very few.
Now, I know Tom has [Walmart labs](https://www.walmartlabs.com/) as a big user, and I learned they contribute
at least some of their time towards his project, but that was arranged on the side. Not through a GitHub
sponsors button.

Sponsorships are not going to cut it. I honestly hope they do, but I don't think they will be the way to
incentivize and encourage open source contributors, and make their projects sustainable.

So what can solve the sustainability issue?

## Another solution: a NuGet marketplace

Looking at foundations and sponsorships, there are a few things that make these solutions suboptimal for producers
and consumers.

Producers will have to make consumers aware that there are paid options. They have to direct them to the sponsor button,
and can say the open source foundation lawyers approve of the license.

As a consumer, you have to be aware of these options, and actively search for them. They are not "in your face"
in our IDE, where we consume most open source through the NuGet client. Which means consumers often have no idea
there is a sponsor button.

This is where https://sdkbin.com, and https://bytepack.io, and others come in. In fact, our community has been
dreaming this up for a long, long time.

Some recent calls for this:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">An idea.<br><br>A managed NuGet[org] alternative for selling your NuGet packages.<br><br>A web interface for discovering paid-for packages. After purchase, they are made available (forever) in a private feed.<br><br>Subscriptions and payment are managed by the platform.</p>&mdash; Paul Knopf (@pauldotknopf) <a href="https://twitter.com/pauldotknopf/status/1179129145235820544?ref_src=twsrc%5Etfw">October 1, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">We basically need to transform our NuGet, Npm, VSCode plugin marketplace whatever into AppStore. <br><br>If dual licensing is not supported out of the box it will never become mainstream solution for sustaining OSS <a href="https://t.co/oRllcH0qYA">https://t.co/oRllcH0qYA</a></p>&mdash; Krzysztof Cieślak @ #BlackLivesMatter (@k_cieslak) <a href="https://twitter.com/k_cieslak/status/1222217476051742720?ref_src=twsrc%5Etfw">January 28, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

I know when I was building [MyGet](https://www.myget.org/) with [Xavier](https://twitter.com/xavierdecoster),
we dreamt up something like a NuGet marketplace as well. Will have to check but I think I still have `nugetmarketplace.com`
somewhere...

The above is scientific proof a NuGet marketplace is needed!
Let's look at what a NuGet marketplace should help with.

### For producers: legal services

Open source projects can still be open source, but sell additional services. These could be:

* Dual-licensed open source
* Paid add-on packages
* Support services
* Consulting services

Dual-licensing will require a set of templates that projects can work with.
If the project uses Apache-2, MIT, GPL, or other open source licenses, what will a commercial dual-license
look like?

Paid add-on packages may be open or closed source, but they will still need a license. A NuGet marketplace
will require templates and guidance.

As Aaron mentioned in one of his tweets:

> There must be standard commercial licenses - because the people buying them will also need to trust that
> those license agreements won't come back to haunt them down the road.
> One of the big incentives for adopting OSS right now is the fact that most licenses are permissive
> - a hurdle we're going to have to overcome is making less permissive, proprietary licenses more palatable.

Support services and consulting services are harder. How will a NuGet marketplace assist with these?
Contract templates and guidance, again, may be of help here.

The legal aspect will be a bit like what the open source foundations offer:
help with protecting producers and consumers.

There is one additional aspect a NuGet marketplace will have to help with: establishing rules and preventing
their abuse. What if I have an MIT-licensed project, and someone sells it with a dual license on this
marketplace?

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">It will be perfectly legal and valid for someone to sell your MIT licence code. You expressly permitted that.</p>&mdash; Damian Hickey (@randompunter) <a href="https://twitter.com/randompunter/status/1273173878752370688?ref_src=twsrc%5Etfw">June 17, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Morally, this is "not done", but legally, this may happen. The marketplace will have to prevent this and have
rules and guidance on how to go about this. We want sustainability!

Another similarity with open source foundations is in the legality of purchasing packages.
A NuGet marketplace will have to make sure consumers who purchase here can trust their purchase is legal
and they can use the package without issue, now and in the future.

Others are GDPR (as a consumer, is my personal data safe?), and probably some more. Feel free to add them
in the comments and I will update the post.

### For producers: business services

Before we can sell packages, what's the legal status of an open source project? Is it a company? A non-profit?

A NuGet marketplace will probably be the legal entity where consumers purchase packages from.
Much like how [Fastspring](https://www.fastspring.com/) acts as a reseller ("Merchant of Record"), a NuGet marketplace will have to
do this as well.

A NuGet marketplace will have to act as a Merchant of Record, for several reasons:

* Consumers purchase from one legal entity, with one contract.
* Consumers can have e.g. a subscription that includes paid-for open source from multiple vendors, without dealing with all of them separately.
* Consumers will be in several locations - the marketplace will have to accomodate for Value Added Tax (VAT), the EU VAT MOSS, and all that.

If we want to make the step to sustainable open source, a NuGet marketplace will have to help
projects in doing so. Not simply by having a downloadable binary with a paywall, but by helping them out
with being a business.

### For producers and consumers: flexible licensing and purchasing options

A NuGet marketplace will need to support various purchasing options. Some examples:

* Trial versions (30 days of usage)
* Subscriptions (containing one or multiple packages)
* Licenses with # seats, ideally also where enterprises can manage who can consume packages
* Perpetual licenses
* Licenses that are valid for major versions of a package only, etc.

And as a consumer, can we pay by credit card only? Can we raise a purchase order and have NET90 payment terms?
Not for a $49 purchase, probably, but a marketplace that is out to help open source sustainability will have
to accommodate the bigger customers with lengthier processes, and take that out of the open source maintaner's hands.

### For producers: where does the money go?

Since many open source projects don't have a legal entity, where do funds go? As [Khalid Abuhakmeh](https://twitter.com/buhakmeh/) mentioned:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">I think the stickier topic is how are funds appropriated to contributors. At some point these projects grow passed their creators.</p>&mdash; Khalid (@buhakmeh) <a href="https://twitter.com/buhakmeh/status/1273220645346856960?ref_src=twsrc%5Etfw">June 17, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

When there are 4 core contributors, who gets the proceeds? This is one a NuGet marketplace could solve
by requiring all core contributors to link their account, and get an even portion of proceeds. But maybe a
marketplace should *not* try to solve this, because this will be different for each project. Let them figure
it out among themselves.

There will have to be guidance at least, around how to do this and how to resolve disputes. Issues over this
topic may erode sustainability and the trust consumers will put in the marketplace, so it is one to take into
account somehow.

### Intermezzo: "App Stores" live and die by their policies

In the legal part, I used the example of an MIT-licensed package being sold by a third-party. In the previous
section, we touched on curation and making sure there is at least guidance and policies around conflicts.

Guidance and policies will be super important for a NuGet marketplace. A NuGet marketplace has to help producers
and consumers here, and make it crystal clear what may happen with edge cases.

Something like [@DHH](https://twitter.com/DHH)'s story would be bad for an emerging NuGet marketplace:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Wow. I&#39;m literally stunned. Apple just doubled down on their rejection of HEY&#39;s ability to provide bug fixes and new features, unless we submit to their outrageous demand of 15-30% of our revenue. Even worse: We&#39;re told that unless we comply, they&#39;ll REMOVE THE APP.</p>&mdash; DHH (@dhh) <a href="https://twitter.com/dhh/status/1272968382329942017?ref_src=twsrc%5Etfw">June 16, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Policies matter, and enforcing them properly is equally important.

Another aspect is in curating what is made available on a NuGet marketplace. Is every package allowed? Or is there
a vetting process to filter out low quality or infringements? Or should there be a barrier of entry, such as an
onboarding fee for producers to be able to start publishing on a NuGet marketplace?

We all know how the Windows 8 Store went down... There was a race to the bottom, where everyone was encouraged
to publish low quality, inexpensive apps into the store to "hit the right number of apps".
Turns out app quality mattered after all, and even today with the Windows 10 Store, that perception of
quality is not where it could have been.

In short, a NuGet marketplace will have to think about vetting and curation, and where it applies.

### For third parties: can they sell value added services?

Having open source producers commercialize on a NuGet marketplace is one thing, but there can be more.
If this NuGet marketplace goes beyond just packages and licenses, others can sell value added services.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">An interesting case that I could see popping up: if I&#39;m an expert at a package, could I sell support for that package that specifies it can&#39;t guarantee code changes? I think there&#39;s a market for that and I could see myself applying as a vendor for that sort of thing...</p>&mdash; Sean Killeen (@sjkilleen) <a href="https://twitter.com/sjkilleen/status/1273252987788496897?ref_src=twsrc%5Etfw">June 17, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

While not a key component of this NuGet marketplace, it may be a good incentive for consumers to flock here
and find those services.

### For producers and consumers: reporting

As a producer, I will want to know who is using packages. How many downloads are there? What's the revenue our project is making?

As a consumer, I want to know who I'm purchasing from. I want invoices, reports on who of my staff are using which licenses, ...

### For producers and consumers: a solid platform

This NuGet marketplace will start off as a novel concept and will have to win hearts with producers and consumers.
Over time, it will have to build and maintain trust. As first impressions matter, it will have to be built
as a solid platform, from a technical point of view, UX point of view, and the aformentioned legal and business
services. A Minimum Viable Product (MVP) approach may help in building this solid platform with laser focus.

Speaking from experience building out [MyGet](https://www.myget.org/) in the past, this NuGet marketplace
will get hammered by users. NuGet attempts to retrieve every package installed from every configured feed,
so expect to serve up a lot of 404 not found responses. These, too, will require a solid platform.

A solid platform also means ease of use, and ease of discovery. One thing that could help here is providing
credential providers for [Visual Studio](https://docs.microsoft.com/en-us/nuget/reference/extensibility/nuget-credential-providers-for-visual-studio) and [JetBrains Rider](https://blog.jetbrains.com/dotnet/2018/03/06/credential-providers-private-nuget-feeds-rider-2018-1-eap/).
By extension, maybe also for the .NET command line tools. These will prompt the user to authenticate, and are an in-IDE
experience where payment detail updates and all that can be arranged. Discovery is key, and bringing
part of what this NuGet marketplace will offer in its web application into the IDE may help.

## A marketplace has two sides - getting traction

Marketplaces have two sides, producers and consumers. If a NuGet marketplace comes about, it will have
to accommodate both, and probably subsidize one side for a while until traction takes over.

So how can this NuGet marketplace get traction? There are a few things that can be considered.

### Getting consumers on board

The marketplace will need consumers, and folks with credit cards and purchase orders. What's their incentive to look
at this solution? I think the answer is in all of the topics above, where ease of use, legal and purchasing,
single point of contact come to mind. Making it easy for consumers to budget their spend, wihout having to revisit
this for every package or license they decide to purchase.

Getting support from IDE vendors may help as well, helping awareness. Ultimately, convincing consumers
will require producers. So how will this NuGet marketplace get producers?

### Getting the component vendors on board

There are commercial component vendors out there - think [Telerik](https://www.telerik.com), [DevExpress](https://www.devexpress.com/), and many more.

A large number of companies are using these components, and getting them on a NuGet marketplace will
help in convincing folks to configure a NuGet marketplace feed and start consuming packages.

These component vendors usually already have their own feed and are distributing components as packages,
so this is going to be mostly about convincing them to publish here as well.

These component vendors usually already have their own storefront, purchase agreement, license agreement, and so on.
How will that integrate with this NuGet marketplace?

Regardless of these issues, if consumers can get their components through a NuGet marketplace, at least
a portion will start using it because ease of use, one point of contact/sales, and all that.

### Getting open source projects on board

This NuGet marketplace will help in making open source sustainable, so it will need open source producers to
provide their packages here. I think many will do so, but there's an issue that comes to mind...

How will consumers find this NuGet marketplace, and thus, these producers?

If there are no consumers, we're back at the Gitub sponsor button and sustaining Tom with $15/month. That won't work.

So how to go about this?

## Compete head-on with the NuGet.org gallery

As we have seen so far, there are many, many considerations for building out a NuGet marketplace that thrives,
and makes open source thrive. This means it will need producers and consumers. We've seen there are ways to
grow both sides of the marketplace, but there's one that I have omitted up until now.

**A NuGet marketplace will have to compete with the NuGet.org gallery.**

Right now, there is one preconfigured feed on every .NET developer's machine: NuGet.org. That's a huge advantage
in the current world, but not for this NuGet marketplace. People have to configure its feed in their environment.
What's the incentive to do that?

### NuGet.org is too good to switch away from

The only incentive as a consumer I see, is being forced to start using a NuGet marketplace.
And that can only be done when NuGet.org becomes less valuable. If all of the open source packages I use,
whether free or paid, are on this NuGet marketplace, I will configure the feed to consume them. If NuGet.org keeps
giving me Automapper, Autofac, IdentityServer and all that, why should I bother with this NuGet marketplace as a consumer?

A NuGet marketplace will have to provide free open source packages as well. Much like in the JVM world folks
are using both [Maven Central](https://search.maven.org/) and [JCenter](https://bintray.com/bintray/jcenter)
for their projects, instead of just one central gallery. In the .NET world, we will have to move to a future
of multiple authoritative package registries, instead of just one.

### Competition will come anyway

Microsoft is in the money-making business, and that's good. They also own [NuGet.org](https://www.nuget.org/),
[npm](https://www.npmjs.org), and [GitHub](https://www.github.com/). If a NuGet marketplace is executed well
and proves there is value, the above platforms will come with their own marketplace. This is a given,
it will happen.

Having a competitor in the NuGet marketplace space means we're going back to fragmentation, and moving away
from the single point of contact/sales, open source and dual-licensed open source being in a central place,
and all that. What this will mean for the ecosystem, I can't tell. But since it will happen anyway, I would
like to see the first NuGet marketplace to compete head-on, and aggressively become the place where open source
sustainability thrives.

The alternative is not competing head-on, which will mean we end up in a fragmented world, where the NuGet
marketplace itself as a business may not be sustainable, and ultimately, hurt producer and consumer trust
in sustainable .NET open source.

## Conclusion

If all of these criteria (and probably more) are met, a NuGet marketplace can be a huge step towards
open source sustainability. A solid, trustworthy platform for consumers and producers, solving legal
and business issues.

As Aaron concluded, there are a lot of things to consider:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">This was one of the things the discussion yesterday made clear to me.<br><br>20% of the costs of this venture = actually delivering packages to customers<br>40% of the cost = dealing with accounting / tax / payments<br>40% of the cost = having to train / educate the market to transition</p>&mdash; Aaron Stannard (@Aaronontheweb) <a href="https://twitter.com/Aaronontheweb/status/1273250663900864516?ref_src=twsrc%5Etfw">June 17, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

I have no idea yet what [Sdkbin](https://sdkbin.com) will look like, and whether all of the above will be accounted for.
What I do know is that his and Petabridge's drive and passion for .NET open source are a guarantee that this project will
be delivered, in one form or another. Especially given their track record in making [Akka.NET a sustainable open source
project](https://petabridge.com/services/) by making it a business.


Whoever builds it out, whether Aaron and Petabridge or other parties, they will have to compete with the NuGet
gallery from day one. Doing so will matter more for sustainability of a NuGet marketplace as a whole,
than supporting 50 different subscription schemes. While that also matters, trust and sustainability are
key in this story.

Thanks, Aaron, for being the one who started building this out.