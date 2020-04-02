---
layout: post
title: "Streaming a Community Event on YouTube - Sharing the Technologies and Learnings from Virtual Azure Community Day"
date: 2020-04-02 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Community"]
author: Maarten Balliauw
---

Earlier this week, [our Belgian Azure User Group](https://www.azug.be/) has been part of the [Virtual Azure Community Day (VACD)](https://azureday.community/). An online event hosted by user groups from Belgium, the Netherlands, France and Bulgaria. All online and streamed to YouTube, and organized and executed in ~2 weeks.

Many have asked how we have done the YouTube streaming, and that's what I want to share in this blog post, together with our learnings and things we would do different for future events.

Before I start, a **big thank you goes to [Henk Boelman](https://www.henkboelman.com/)**, who has done most (if not all) of the initial technical investigations and [shared those on his blog](https://www.henkboelman.com/articles/online-meetups-with-obs-and-skype/). In fact, part of this blog post will be a rehash of parts of his blog post, so [do check it out](https://www.henkboelman.com/articles/online-meetups-with-obs-and-skype/). Also, thank you Nick Trogh, Floor Drees, Sjoukje Zaal, Suzanne Daniels & many others in making this event reality on such short notice.

{% include toc %}

## Setting the Stage - Requirements

Let's start with setting the stage. For VACD, we would need a way to:

* Push 8 hours of sessions into one live stream on YouTube
* Have 2-3 hosts with voice and webcam in that stream
* Have 1 speaker with voice, webcam and screen share in that stream (and cycle through 8 speakers throughout the entire stream)
* Ideally at 1920x1080 (1080p / Full HD) so that presentation and code are crisp and visible on the stream

All the above times 4, as VACD would be hosting 4 tracks as separate streams.

Keep these 4 bullets in mind, as they matter for the setup we landed on. If you have different requirements, you may not need the full setup that we went with.

## Initial Exploration of Technology

How would you go about meeting these requirements? Let's look at our attempts!

> *Note: If you're not interested in what did not work, feel free to skip this section.*

### Attempt 1: Run a stream from my laptop

When I started asking around, many folks who are streaming to Twitch, YouTube and the likes mentioned "[OBS Studio](https://obsproject.com/) is the answer", however not many seemed to be able to come up with a good way of satisfying the above list of requirements.

Following the advice of the many, I experimented with [OBS Studio](https://obsproject.com/), [StreamLabs OBS](https://streamlabs.com/), and [XSplit Broadcaster](https://www.xsplit.com/). And in all fairness: I was able to stream my own screen and webcam out to YouTube without too much effort! There are god getting started guides out there for all of these.

Unfortunately, things started to break down quickly... My laptop runs a native 4k resolution (3840x2160 pixels) that have to be downscaled to Full HD (1920x1080 pixels). And my webcam does the same! That's great because in its native resolution you can count my beard hairs, but not so great because my laptop would have to downscale those two inputs, then mix in the audio, and then push it out to YouTube.

My laptop can run several instances of [my favourite IDE](https://www.jetbrains.com/rider/), a Docker swarm, and 3 virtual machines all at the same time, but just sharing my screen and webcam to YouTube seemed impossible without it melting through the floor at a whopping (and stuttering) 10 frames per second on the resulting stream. Not great!

Especially if you take into account the requirements, my laptop seemed to not have enough power to mix several streams. It may work on yours, if you have a beefy CPU and GPU in there. Not on mine.

An additional consideration would be bandwidth. Usually [my ISP](https://www.telenet.be/) provides me with enough bandwidth in all directions (230/30), but it's a risk factor to run multiple streams on that.

Now what?

### Attempt 2: Azure Virtual Machine and Google Meet

The second attempt involved setting up a virtual machine in [Azure](https://www.azure.com/), installing OBS Studio, and then capturing a browser window in which a Google Meet would be used to loop in speakers & their screen share.

In OBS Studio, I set up a scene (more on all of this later) hat captured the browser's video and audio, and tried streaming it to YouTube. Let's say it worked, but it was not ideal:

* Audio seemed to have varied quality over time. Sometimes it would be good, sometimes it would be like a very old landline phone.
* Stream quality was only 720p (1280x720 pixels) because that's what Google Meet does, and due to the slightly lossy encoding of both Google Meet and OBS Studio, code on screen would not be readable.

The above, combined with the fact that this was on a 6 CPU/56 GB RAM/NVidia GPU coming in at +1000 EUR per month which still ran at 90% of its capacity, this seemed not the avenue to pursue. Now what?

### Attempt 3: A bigger VM!

The same as attempt 2, but on a bigger VM! (12 CPU/112 GB RAM/NVidia GPU, the [Azure Standard_NV12 series](https://docs.microsoft.com/en-us/azure/virtual-machines/nv-series))

Results were similar. Audio was a bit better, video was the same, and cost went x2. Not ideal!

### Intermezzo: Maarten Typing All Caps

THIS IS GETTING FRUSTRATING!

(the above attempts wasted a good 8 hours to properly try & test, frustration was building)

### Attempt 4: Success!

After getting some input from the various other user groups and organizers involved in VACD, [Henk Boelman came with the solution: use Skype!](https://www.henkboelman.com/articles/online-meetups-with-obs-and-skype/)

Testing that setup, it seemed Henk was on to something. And in the end, it's roughly what all the 4 VACD tracks used to stream this event out.

## Before the event: Setting up OBS Studio, Skype, and an Azure Virtual Machine

After our exploration, thanks to Henk, we landed on a [feasible setup for streaming a community event with OBS Studio, Skype, and an Azure Virtual Machine](https://www.henkboelman.com/articles/online-meetups-with-obs-and-skype/).

I'll do a TL;DR of the setup, more details in the blog post that I already linked a number of times.

### Overview of our Setup

Remember the requirements? We mapped them into the following setup:

![Schematic Overview - Streaming a Community Event with OBS Studio, Skype, and an Azure Virtual Machine](/images/2020/04/streaming-schematic-overview.png)

We would use an Azure VM ([Azure Standard_NV12 series](https://docs.microsoft.com/en-us/azure/virtual-machines/nv-series)) that would run:

* Windows 10 ([install GPU drivers on the VM](https://docs.microsoft.com/en-us/azure/virtual-machines/extensions/hpccompute-gpu-windows))
* OBS Studio ([download](https://obsproject.com/download))
* Skype ([download](https://www.skype.com/en/get-skype/)) with [NDI](https://www.ndi.tv/) enabled\
  (Settings \| Calling \| Advanced \| Allow NDI usage)
* The NDI runtime ([download](http://new.tk/NDIRedistV4))
* NDI support for OBS Studio ([download](https://github.com/Palakis/obs-ndi/releases))

In Skype on the VM, also make sure to turn off audio notifications in the settings, so those don't end up on the stream.

Reboot the VM once after installing the above, to make sure all drivers are picked up correctly.

> *Note: [NDI](https://www.ndi.tv/) is a technology that acts like a virtual video cable. All of the webcam, audio and screen sharing feeds from Skype will come in as an "NDI virtual cable" which we can plug into OBS Studio later. OBS will then be our television control room where we can switch between incoming streams.*

### Skype Accounts

To make sure the host(s) and speakers can connect to our setup, all of them will need a Skype account. Next to that, the Skype running on our VM will need its own account, as this is where everything comes together.

> *Tip: Because in OBS Studio we will later on configure the "video feeds" to use the correct input, it's handy to have a pool of preconfigured Skype accounts instead of host/speakers personal accounts.*

Accounts needed:

* One for OBS
* One per host (if not using their personal ones)
* Three that will be pooled for speakers (if not using their personal ones)

Hosts and speakers will need to install Skype (on Windows, make sure to use Skype for Windows, and not the Windows Store app!)

> *Note: We first created pooled Skype accounts on new Microsoft Accounts. Unfortunately those seem to get blocked quickly after a couple of sign-ins from different locations, which we obviously encountered. If you plan on using this setup, create the accounts a couple of days before your event, as they might get locked after 24 hours. Unlocking is possible, but there may be lockout periods of 24h involved, so you will want to account for that!*

### Connecting to your Azure VM

When connecting to your Azure VM, there are a couple of things to be aware of.

First: remote audio. Since the Skype instance in our VM will need some form of audio, verify you are playing audio "on this computer". Also disable microphone recording, no need for that.

![Remote desktop connection audio settings](/images/2020/04/rdp-remote-audio.png)

This is merely a workaround to have a virtual audio driver loaded on the VM. We now also created an annoying situation, where we could inflict an audio feedback loop between the Skype that will run on our machine & the one running remotely! To fix that, on you local machine, mute the VM's audio.

![Mute the VM's RDP audio - avoid audio feedback](/images/2020/04/rdp-ensure-no-audio-feedback.png)

Lastly: display settings. My laptop runs a native 4k resolution, and when connecting an RDP session those settings would propagate to the VM. Let's say OBS Studio is not very 4k friendly, and you will suffer eye strain from small UI elements. I just set the RDP resolution to 1920x1080 (1080p) as a higher resolution would not help anyway, and doing 4k means we'd be sending 4x the pixels over the wire for our RDP session. 1920x1080 is good enough!

![Remote desktop connection display settings](/images/2020/04/rdp-display-settings-for-obs.png)

### OBS Studio Scene Setup

For our stream, we decided to create 4 scenes in OBS Studio:

* a logo image with no audio to display at the start of the event;
* an intro where we would have two host webcams + speaker webcam + audio for all;
* a session where with speaker webcam and screen share + audio;
* another logo to show in between sessions.

Henk has gone out of his way to create a couple of backgrounds that we would use in the stream. On those backgrounds, he created some spots where the speaker webcam, host webcam, screen share, etc. would become visible. To give you an idea:

![OBS Scene backgrounds](/images/2020/04/obs-studio-scene-backgrounds.png)

If you want to position different video feeds in one place, this type of backgrounds are a godsend! Dimensions and positions of elements are annotated on the image, so it's easy to place them in OBS Studio.

> *Tip: Have a list of video dimensions at hand. In the 16:9 format, which is also the 1080p / 1920x1080 resolution for our YouTube stream. `16 / 9 = 1.777777777777778`, so if you want to place an element that is 454 pixels wide, it will have to be `454 / 1.777777777777778 = 255` pixels high o have the proper aspect ratio. More on aspect ratio's later!*

Anyway, scene setup! We created 4 scenes with the above backgrounds, and added the necessary elements on top.

![OBS Studio Scene Setup](/images/2020/04/obs-studio-setup.png)

On the Azure VM, start a Skype call with yourself, and start webcam + screen sharing. This gives you some visual input to place the elements, instead of just the red bounding box you se on the screenshot above.

> *Tip: In OBS Studio, when adding an NDI Source for one of the host/speaker webcams, make sure to transform it the right way. [Read this Skype FAQ](https://support.skype.com/en/faq/FA34853/what-is-skype-for-content-creators) for more info. We have used OBS Studio as StreamLabs OBS does not seem to have this setting and often randomly resizes the stream - something you do not want to have in the final stream!*

While setting up the scenes, make sure to lock everything in place once things are in position, to prevent accidentally messing up your scene once the event runs.

> *Tip: While all the Skype video feeds come in as a different NDI stream, the audio of all streams is replicated on all streams. If you have multiple Skype NDI sources on your scene, make sure to mute all except one! If you don't, there will be a very annoying echo effect in your livestream!*
>
> *Adding to that, since for VACD we would be cycling through multiple speakers and hiding/showing them on the scenes during production, we added an extra Skype NDI source for the "Active Speaker" on the scene, and positioned it off-screen. This way it would not be visible, but we could keep his as the one and only audio source. Why? Well, if we would hide a speaker, their audio would also disappear. Hence, a source that would always be there.*

One more thing about audio sources: since there would be one long ongoing call in Skype, and all the audio would be in the outgoing stream, make sure that:

* Every speaker mutes their own microphone in Skype when joining, and only activate it when session starts.
* Every host mutes their own microphone in Skype when not speaking, to prevent echo, coughs, sniffs and random noises.

Again: one audio feed for Skype in OBS Studio, so there is no way to disable a specific source! (apart from using the Skype instance running in the VM and muting participants - the producer can do this if needed)

Make sure to also configure the YouTube stream key, so that when you start broadcasting there is data visible on YouTube.

### Setting up YouTube

On YouTube, make sure you have an account and a channel. Next, in the top toolbar, click the camera icon and select "Go Live". This will enter YouTube's broadcasting setup.

There are two types of streams you can create:

* Webcam based
* Stream based

For VACD and OBS Studio, we need stream based.

> *Note: [Virtual Global Azure](https://virtual.globalazure.net/) folks may land here as well (as some requested to share this story). Or you may want to just stream yourself & a screen share.*
>
> *Different requirements, for sure, and you may not need our elaborate setup! Unless you want to do a panel session of some kind.*
>
> *If this is you: combine the knowledge from [Scott's post here](https://www.hanselman.com/blog/TakeRemoteWorkerEducatorWebcamVideoCallsToTheNextLevelWithOBSNDIToolsAndElgatoStreamDeck.aspx) with this blog post to set up OBS with just two scenes. For streaming, either stream the OBS virtual webcam, or use the stream based option. I would go with the latter (less transcoding steps in the entire process, so probably better screen sharing quality), but both approaches could work.*

Anyway, onward!

In YouTube, we created a new scheduled live stream event. Make sure to add a proper title, description, and all that, and schedule it for the time you want to stream. This will help announce on YouTube, and you will also get the YouTube video URL that can be shared with potential viewers.

![YouTube Live setup](/images/2020/04/youtube-live-setup.png)

From this screen, we'll need the stream key, which we can set in OBS Studio's streaming settings.

### Ready to Rock! Or are we?

In theory, we are now all set to start the virtual event. Click "start streaming" in OBS Studio, bring in speakers, and then go live on YouTube.

> *Tip: In that YouTube stream management page, check the small preview after starting in OBS Studio. If the preview shows your OBS Studio output, you can **click the big GO LIVE button** in YouTube. Don't forget, or you'll be streaming from OBS Studio into the void.*

If you want to go live on multiple channels at once, check a service like [Restream](https://restream.io/). This lets you add Twitch/Facebook/Twitter/... as secondary targets of your stream.

> *Tip: I **highly recommend doing a few test streams**. You can create these on YouTube and make them unlisted or private. Test streams will hep build confidence and smooth out kinks. Don't use the "real" event that is already scheduled, create new test events and use their stream keys.*
>
> *I want to thank my colleagues to help me test this setup with very interesting streams discussing taco's vs. burrito's, a session on how Gatsby is both amazing and awful, a rant on random things, and more. Those videos have all been deleted, but they very much helped build experience. Thanks, all!*

## The Event Itself: Running and Producing a Virtual Event on YouTube

D-Day for [Virtual Azure Community Day](https://azureday.community/) was March 31, 2020! 4 tracks, 4 streams, and our user group was hosting one track.

### One Day Before the Event Start

Make sure the audience knows where to go! Tweet the event's video URL, e-mail it, promote, promote, promote!

Inform hosts and speakers on how the can connect into the Skype meeting that we will broadcast. We did this one day before the event. Since we pulled this off in less than 14 days, so one day before the event is not that bad I guess...

We informed hosts and speakers by sending meeting invites for their session slot. Here's the template of what our invite looked like:

    Hi,

    Thank you accepting to speak at {event}. We are happy to have you!

    The technical part
    For the live event we are using Skype. The only thing you must do is install skype on your computer, login and share your camera, audio and screen.

    Step 1 – Download and install Skype:
    You can download Skype here:  https://www.skype.com/en/get-skype/.
    We have tested with Skype for Windows, and Skype for Mac.

    Step 2 – Login
    You don’t need to create an account, you can login with the credentials below.
    We need you to login with these credentials because we have our scenes in OBS pre-configured.

    Login time from: {15 minutes before session start time}
    Credentials:
        {one of the pooled Skype accounts username + password}

    Notes
    * You can join the call 15 minutes before your speaking slot.
    * Don't join the call outside your slot.
    * Always join the call muted, (when joining, your audio is directly in the stream) .
    * Always sign-out of Skype when you don't use the account.
    * Turn your notifications off. We use the chat in Skype and that should not be shared in the stream when you share your screen.
    * Sharing your screen is the easiest with 2 monitors. (Share one monitor, other monitor you have skype & chat).
    * Please set your desktop resolution to 1920x1080.

(Thanks [Nick](https://twitter.com/nicktrog) for sending these out!)

### One Hour Before the Event Start

One hour before the event, the three hosts on our track started a final test stream to check if all was set up correctly:

1. Create a new test event on YouTube.
2. Update OBS Studio to stream to this test event.
3. Start stream and go live.
4. Talk, move, screen share, switch through all scenes.
5. Stop streaming, watch the recording, check for any missing things.
6. **Set the REAL EVENT stream key in OBS Studio**.
7. Set OBS Studio in Studio Mode. This has the benefit of being able to stage what will be on screen next, without streaming it out yet. This prevents accidental scene switches, and helps to verify things look good before pushing them live.

All of that succeeded, so we discussed who would be introducing which speaker. One, to be sure who would need their webcam and audio on when, and two, to make sure we set the correct people to be visible in the OBS Studio scenes.

### 15 Minutes Before the Event Start

15 minutes to go! Double-check time, as well as go live time.

1. **Set the REAL EVENT stream key in OBS Studio**.
2. Set OBS Studio in Studio Mode.
3. Start streaming in OBS Studio.
4. Dial in the hosts and first speaker.
5. 5 minutes before the event, click **GO LIVE** in YouTube. The stream is now up, and switching a scene in OBS Studio will be visible (but that's what we're after, right!)

### Event Start and During the Event

I'll give this as a check list again.

* Switch to the scene that has two hosts and speaker. Introduce the speaker.
* Switch scenes in OBS Studio to show their screen/webcam/... and cycle through everything as needed by the situation.
* Verify Twitter, the chat on YouTube (tip: you can pop it out into a separate window), handle Q&A and discussion.
* Thank the speaker, switch to an "in between sessions" scene that has no audio.
* Dial in second speaker, and start this again.

Here's the first session with Sammy, as seen from OBS Studio:

![Sammy Deprez in OBS Studio](/images/2020/04/obs-sammy.png)

Handling YouTube, OBS Studio and checking comments and questions in the YouTube chat, while also staying in touch with the other hosts needs screen real estate!

![Screens, screens, screens!](/images/2020/04/screens-screens-screens.png)

(note the spare batteries for my wireless headset in case needed - be prepared!)

Once finished with all sessions, end the stream on YouTube, and then Skype and all can be closed. Congratulations! Time to decompress.

### After the Event: Publishing Session Recordings

After the event, we downloaded the full 8h30min livestream video from YouTube (the MP4 can be downloaded). It may take a couple of hours after the event before this is available, so maybe doing this the day after is a good idea.

For track 2, we used [Camtasia](https://www.techsmith.com/camtasia/) to cut that long video into separate sessions we could upload to YouTube.

The fact that we had a ~15 minute break between sessions where there is no audio on the stream is very visible in Camtasia's editor.

* [Use markers](https://support.techsmith.com/hc/en-us/articles/360023730532-Add-Markers) to quickly annotate the start and end of each session.
* In the **Edit** menu, split media at all markers and drop the breaks.
* Render each part individually for upload to YouTube.

![Camtasia editing](/images/2020/04/camtasia-editing.png)

Camtasia can also touch up the audio if needed, but we found this good enough so rendered all parts "as is" and pushed them out to YouTube.

Check [the recordings for Track 2 of VACD](https://www.azug.be/videos/2020/03/31/virtual-azure-community-day) to see the result of this.

## Lessons Learned and Random Tips and Tricks

All in all, I think this was a very successful event. In this section of this blog post, I'll collect some reflections, lessons learned and random tips and tricks that may be of use for you as well.

### Have Multiple Hosts

Have at least 2 hosts for your stream. There are a couple of "ongoing tasks" while it's running, and you want to make sure you have the bandwidth between the two of you to handle those.

* Content moderation on Twitter/YouTube Live Chat/other channels.
* Introducing the speaker.
* Switching OBS Scenes at the start, at the end, and during a presentation - for example from full-screen demo to slides + speaker webcam and back.

It's doable on your own, I think, but having 2 hosts seems a sensible thing to do.

### Have Hosts, Speakers and some Accomplices in YouTube Chat

Ideally, there is a level of interactivity for your stream. Encourage the use of the chat for comments & questions, have the host ask the questions to the speaker while on air.

After the session, the speaker can hang out in the chat as well, for extra questions.

It's hard to have the "hallway conversations" with a virtual event, the live chat is a partial substitute for it. Use it, because if there is no interactivity going you might as well record all sessions instead of doing a livestream.

### Have a Full Screen Scene in OBS Studio for Demos and Code

While a branded background with both slides and webcam video is cool, things get less ideal when the speaker is doing demos.

Our scene with the speaker provided 1023x575 pixels for their screen share. That's not a lot when the outer bounds of the stream are 1920x1080!

In track 2 we added a full screen scene on the go, showing demo's in full 1920x1080 resolution. Track 1 solved this by making the speaker webcam smaller and the screen share larger, while still showing a bit of the background.

There are many solutions to this, but ideally: **during demos, show the shared screen as large as possible**.

The need for two hosts comes up again: you'll need to watch the presentation and make scene switches between presentation and demo scenes. You could use full screen all the time, but it sure looks more professional when cycling between both!

### Be Familiar with Aspect Ratios

We were streaming in 16:9, which means ideally speakers would be using any of the following resolutions:

* 1920x1080
* 2560x1600
* 3840x2160
* 1280x720 (not recommended because lower than the outgoing stream - quality is nice to have!)

And then, **a speaker with a 16:10 desktop resolution joins**!

If the backgrounds in OBS Studio are all built for 16:9, that means the shared screen will have to have borders around it, probably on the left and right. Because the 16:10 aspect ratio is higher than 16:9, this means it must be resized to fit the bounding box, resulting in empty borders.

![16:10 in 16:9 - resizes and will show borders left and right](/images/2020/04/aspect-ratios-1.png)

Not much you can do there, as there may be information in that extra bit of screen real estate. One solution could be to have both 16:9 and 16:10 scenes.

This gets more interesting, though! If you have 16:9 backgrounds, a 16:10 desktop joins which is presenting in 16:9 PowerPoint, there will be borders on all sides!

![16:9 in 16:10 in 16:9 - resizes and will show borders everywhere](/images/2020/04/aspect-ratios-2.png)

Luckily, there is a setting in OBS Studio where we can fix this one on the fly: instead of scaling to bounds, we'll scale to width. This results in all borders being snipped off and shows the correct size.

![Change bounds size](/images/2020/04/change-bounds-size.png)

We've done this twice throughout the day, and managed to make this work for most speakers.

> *Tip: Speaking of bounding boxes, [read this Skype FAQ](https://support.skype.com/en/faq/FA34853/what-is-skype-for-content-creators) to make sure Skype webcam video streams are sized correctly!. *

### Do I Need that Azure VM or can I Stream from my Laptop/Desktop?

"It depends" - for our requirements with many incoming streams, CPU, GPU and bandwidth mattered.

Sharing your screen & webcam to YouTube may just work directly from your machine, without the need for Skype and an Azure VM.

Try it out before your stream happens, see if the YouTube reports your stream as healthy. If your machine manages to stream in the desired resolution, with a decent frame rate, you're good!

### How Much does that Azure VM Cost?

The [Azure Standard_NV12 series](https://docs.microsoft.com/en-us/azure/virtual-machines/nv-series) machine would cost US $ 2,328.75 per month.

There is a "promo" version of this VM size now, which comes in at ~US $ 1,599.43 per month.

Wowzers! Do remember that for a event like VACD, we would perhaps need it for ~16 hours to set up OBS Studio and host the event. Outside that time, we can shut it down (and thus not incur cost). At a per hour rate of US $ 2.191, this would mean VACD cost ~US $ 35.06 per track.

Remember to shut it down, and things are not so bad! Use auto-shutdown to assist you with that. Except...

### Disable Azure VM Auto-Shutdown

Given the virtual machine we used was quite beefy, and would get expensive if it would run for long periods after the event, I enabled auto-shutdown on it.

Auto-shutdown is great, but disable it during the event. I had it set for 8 PM, and with the event running until 9 PM this would have been very annoying.

* Disable the Azure VM auto-shutdown.
* Postpone Windows Updates, just in case that one kicks in with a reboot while you're streaming...

## Conclusion

That was the longest blog post I ever wrote, I think. At this point, you have read close to 5000 words!

Virtual events and live streaming are something interesting, and fun. I really enjoyed hosting VACD as a host, and on the technical side. I learned a lot (and not only from the sessions we hosted), and in this post I hope I managed to dump most of those learnings. Let me know if you find it useful!

Next up is an appendix of things I've looked into but have no experience with. Feel free to explore those on your own.

## Appendix: alternative streaming solutions

The protocol that powers all live streaming platforms out there is the [Real-Time Messaging Protocol (RTMP)](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol) - including YouTube. This means that if you find a solution that can publish to RTMP, you may want to explore it!

Some solutions out there:

* [Zoom](https://zoom.us/), in its paid plans, lets you publish a meeting to an RTMP stream. This might be an easy solution to stream a virtual event or meetup. There are many rumours out there around Zoom privacy & security issues, so *use your own judgement*.
* [Jitsi Meet](https://meet.jit.si/), based on the open source [Jitsi.org](https://meet.jit.si/) has an RTMP sink as well, from a Teams/Google Meet/...-like interface. Looks like an interesting alternative to Zoom.
* [StreamYard](https://streamyard.com/) seems similar to what Google Hangouts on Air once was. Join a meeting with up to 10 people, have a virtual camera person, and stream to an RTMP service. Free (with their logo overlay) or at US $20 per month if you don't want their logo displayed, it's also less expensive than the Azure VM we have been using here - provided you run at least one event per month. One downside seems to be it's a 720p stream (1280x720 pixels), which for screen sharing seems a bit less ideal. But that might not be an issue for you, so go try it out.

Google Meet, as well as Microsoft Teams, have their own streaming services as well. I have tried Google Meet, and that one needs authentication in your organization for those who want to view. Teams has something similar, with similar constraints.

If you want to code a new service, explore the world of WebRTC (the technology backing most browser-based online meeting systems). Create your own virtual meeting space, host a headless browser that uses FFMpeg to push RTMP streams, and write a huge blog post about those adventures!

**Anything I missed? Add your comments & let's crowd-source alternatives!**
