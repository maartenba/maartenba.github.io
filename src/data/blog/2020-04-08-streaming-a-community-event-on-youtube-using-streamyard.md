---
layout: post
title: "Streaming a Community Event on YouTube Using StreamYard"
pubDatetime: 2020-04-08T03:44:05Z
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Community"]
author: Maarten Balliauw
redirect_from:
  - /post/2020/04/08/streaming-a-community-event-on-youtube-using-streamyard.html
---

Last week, I wrote ~~a blog post~~ a book about [Streaming a Community Event on YouTube - Sharing the Technologies and Learnings from Virtual Azure Community Day](/post/2020/04/02/streaming-a-community-event-on-youtube-sharing-the-technologies-and-learnings-from-virtual-azure-community-day.html). I ended that post with an appendix of things I've looked into but have no experience with.

That... changed! Our [Azure User Group](https://www.azug.be/) held its first virtual session yesterday. The social aspect of hanging out with a group of peers was definitely amiss, but the streaming went well! This ime, we streamed on YouTube, with the help of StreamYard. I'll write some observations and thoughts that [build on the previous blog post](/post/2020/04/02/streaming-a-community-event-on-youtube-sharing-the-technologies-and-learnings-from-virtual-azure-community-day.html).

## What is StreamYard?

[StreamYard (affiliate link that gets you $10 in credit)](https://streamyard.com?pal=5957151634227200) / [StreamYard (non-affiliate link)](https://streamyard.com/) is, in broad strokes, what Google Hangouts on Air once was. It lets you join a virtual meeting with up to 10 people, the meeting owner can pick whose webcam or screen is being broadcast, and stream to one or multiple RTMP services like YouTube, Facebook, Twitch, and others.

Check them out! They have a free version (one stream & their logo is being shown on screen), and a US $20 per month version to lift those restrictions.

If you do at least one stream per month, for which you would normally run that Azure VM from my previous post, their paid plan is priced correctly. Streaming costs resources, and US $20 for infrastructure & tooling is not bad at all!

Anyway, enough with the intro - let's talk shop!

## Event/Meetup Setup and First Steps

A few days before our event/meetup, we created an event directly from the StreamYard dashboard. We linked it to YouTube and Facebook, added a title & description, and then scheduled it for yesterday.

![Schedule an event on StreamYard](/images/2020/04/schedule-event-on-streamyard.png)

In the next step, you can customize this for separate targets if you are streaming to multiple services.

Right before you enter your broadcast studio, you'll have to enter your name and pick the microphone and webcam to use. This is the real benefit of StreamYard to me: no setup with Skype, NDI sources, configuration. Open the browser, pick microphone & webcam, and go.

![Pick webcam and microphone](/images/2020/04/pick-webcam.png)

Once in the studio, you can start setting up the look-and-feel of your stream. The paid version of StreamYard lets you add backgrounds, overlays, banners, ... Here's me, preparing a stream of this blog post!

![StreamYard broadcast studio](/images/2020/04/streamyard-broadcast-studio.png)

Once all that is done, you can invite guests. Guest speakers can join the studio by opening one link, not having to install any tools on their system. Open browser, paste link, go.

I'll not go into too much detail here, as branding etc. is something you'll have to set up yourself, but jus o give you an idea about the first steps.

## Streaming Experience

Let's talk about the streaming experience itself. For our user group, we typically have one or two hosts who thank our sponsors, introduce the speakers & help everyone feel comfortable. There are also two sessions per meetup, so we replicated that with two online sessions (and three speakers).

### 15 Minutes Before Stream Start

At 15 minutes before stream start, we had speakers join the broadcast studio. Be aware that in order to hear everyone, you'll need to add everyone to the active scene. There's a private chat window you can use to communicate in writing, but if you want voice before going live, add everyone to the scene.

We used this time to try screen sharing, and a bit of general chit chat to ease presenter nerves.

### Start the Stream!

At some point, you can go live. If you **Start Broadcast** in StreamYard, broadcast will also start on YouTube & other targets you may have set up.

We went live with everyone on screen, to make attendees feel comfortable & see all faces.

![See all faces!](/images/2020/04/all-faces-online.png)

We then introduced the first speaker, and removed everyone else from the scene.

This is what the broadcast studio looked like during the first session:

![Multiple speakers in the broadcast studio](/images/2020/04/broadcasting-studio-with-multiple-speakers.png)

Things to note:

* The screen you see in the StreamYard studio is what is being broadcast. No production mode like OBS Studio where you can stage the scene and then push it live.
* Grayed-out participants at the bottom are not visible, but also not audible. If you have a host & a speaker, or two speakers at once, make sure to make them all visible in order to also make them audible.
* Just below the scene that is being broadcast, there are a couple of scenes to choose from. Pick webcam view of one speaker, multiple speakers, speaker & screen, etc.

During the sessions, we switched scenes every once in a while, putting emphasis on the speaker, their screen, or both.

Between the two sessions, we had a break. We put up a still slide, and removed everyone from the scene. This is good & bad! We could clearly show attendees we were switching speakers, but speakers could not communicate in voice because that would mean putting them on the scene & broadcasting the switch.

For future live streams, we may keep talking during the session switch and not make it a real "break". Yes, attendees may want a quick break, but those who stay around have a still image for a while.

### Questions and Comments

One thing StreamYard does really well, is aggregating questions & comments. We were streaming on YouTube and Facebook, and their UI showed questions, comments, and remarks from all channels. We could even show them on screen, to engage both audience & speaker!

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">I turn on the TV and apparently we have a new channel <a href="https://twitter.com/hashtag/AZUGTV?src=hash&amp;ref_src=twsrc%5Etfw">#AZUGTV</a> complete with its year 2000 sms chatbox. <a href="https://t.co/rdU1sw2pmY">pic.twitter.com/rdU1sw2pmY</a></p>&mdash; Jordi Borghers (@JordiBorghers) <a href="https://twitter.com/JordiBorghers/status/1247565806067748865?ref_src=twsrc%5Etfw">April 7, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Like with the OBS Streaming, we found that seeding the conversation a bit helps with interactivity. If you're ever joining a live stream, use the chat, as it's the only connection speakers have with the audience other than their own image in the reflection of their webcam!

## Conclusion

A lot of the conclusions from [that previous post](/post/2020/04/02/streaming-a-community-event-on-youtube-sharing-the-technologies-and-learnings-from-virtual-azure-community-day.html) hold true with StreamYard as well. So I'll focus on the good & bad of our experience yesterday.

In no particular order...

**StreamYard is super easy to use!** Have speakers join with their browser, and go live. No need for a beefy cloud machine to run OBS Studio, just open your browser & be done.

**Go live and stream delays are something to be aware of.** There is a ~10 second delay between speaking and your voice being heard on YouTube. If you ask people and expect a response in chat, be wary of this delay (and a potential typing delay). There is also a lag between starting the stream in StreamYard, and when it is actually live on YouTube. This can catch you out if you start speaking too soon after going live in StreamYard. Wait 5 seconds after going live before you start speaking, and be aware that stopping the stream also has a bit of a delay. Don't go swearing immediately after ending the stream, there is a chance it will still be live.

**Scene customization is a bit limited compared to OBS Studio**, but I personally don't think this is a big issue. Unless every streamer uses StreamYard & the same scenes, it all looks interesting enough if you add a custom background & brand color.

**Screen sharing resolution could be better.** If there's one thing I hope StreamYard is focusing on (apart from scaling in these times, I would guess), it's the screen sharing resolution. The stream is 720p, which means 1280x720 pixels. Many applications we use as developers are either unusable or butt ugly in those dimensions.

We went up to 1366x768 for one of the demo's, which is a bit more comfortable to work in, and still legible enough in the broadcast. However, [it looks just a bit too blurry](https://youtu.be/RzMPdlIDzfM?t=3095) for my liking, especially [compared with last week's VACD stream at 1080p](https://youtu.be/aARogFIeQHw?t=1121).

The resolution & encoding is fine for slides, but for screen sharing demo's it could be better. It's workable, but I hope this gets some attention.

**We would use StreamYard again!** Despite the screen resolution issue, we'd use it again. The ease-of-use for both hosts & speakers is great! OBS Studio and that custom setup are much more customizable, but as a user group our goal is to share knowledge & experiences, and StreamYard is a great tool to do that.