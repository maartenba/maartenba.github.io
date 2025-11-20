---
layout: post
title: "Export Office 365 calendar events to JetBrains Space using the Microsoft Graph API, the JetBrains Space SDK, and automation"
pubDatetime: 2020-12-01T03:44:05Z
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", ".NET", "dotnet", ".NET Core"]
author: Maarten Balliauw
---

Chances are you keep a personal calendar, maybe a family calendar, and a work calendar.
Working from home, it's super important to keep these calendars more or less in sync.
Colleagues book meetings because your work calendar shows you're available, while in reality you've planned to do some errands or maybe pick up your kids from school.

{% include toc %}

Hands up if you have been in this situation! I know I have been. As a solution to this, I was creating entries in multiple calendars, shuffling these entries around when plans changed, and I got tired of doing this manually.
Nothing prevents a frustrated developer from automating things!

In this post, I'll cover a number of things. Use the table of contents to pick the topics you want to learn more about. Reading the entire post is much appreciated, of course :-)

## Required tools

Let's come up with a list of tools first. I would like to do a periodic one-way sync of my personal calendar (Office 365) to my work calendar ([JetBrains Space](https://jetbrains.com/space/)).

* Periodic - We will need a tool to schedule execution
* Office 365 - How to read entries from my personal calendar?
* JetBrains Space - How to create/remove entries in my work calendar?

For scheduling this task, I could use something like Azure Functions, but since I'll be pushing source code of this tool to a Space-hosted Git repository anyway, I can [use a Space automation task](https://blog.jetbrains.com/space/2020/10/08/space-automation-running-scripts-in-a-container/) for this.

For Office 365 calendar access, there is the [calendar API](https://docs.microsoft.com/en-us/graph/outlook-calendar-concept-overview) and the [Microsoft.Graph package on NuGet](https://www.nuget.org/packages/Microsoft.Graph/).

Lastly, [the Space HTTP API](https://www.jetbrains.com/help/space/api.html) gives access to pretty much everything in Space, and there's the [.NET SDK for JetBrains Space](https://www.nuget.org/packages?q=JetBrains.Space) written by yours truly.

With that, you have an idea of what will be covered in the remainder of this post, so let's go!

## Reading calendar items from Office 365 using the Microsoft Graph

First things first. The data source will be my personal calendar in Office 365, so let's see how we can access it.

If you are using Office 365, you can make use of the Microsoft Graph to get access to a calendar. There are a few steps to make this work...

### 1. Register an application and enable calendar access

This agenda sync application will run as a standalone "daemon", so make yourself familiar with the [authentication flows for background applications](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-daemon-overview).

For this to work, you will need to [register an application in your Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-daemon-app-registration) first. In the [app registrations](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps), create a new application:

* Name - This can be anything, I used "SpaceAgenda"
* Supported account types - Make it a single-tenant application, so only users in your Azure AD can make use of it.
* Redirect URI - Not needed.

Once created, gather the following keys:

* Application (client) ID
* Directory (tenant) ID
* An access token - this can be created in the **Certificates & secrets** blade, as [decribed here](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-daemon-app-registration#add-a-client-secret-or-certificate).

Almost there! In the **API permissions** blade, you will need to enable the `Calendars.Read` permission as an _application permission_, so that our application can actually read calendar data:

![Microsoft Graph permissions](/images/2020/12/azure-ad-microsoft-graph-calendar-permissions.png)

That's it. it should now be possible to access calendar data. Let's see how!

### 2. Read calendar data from Office 365 / Microsoft Graph using .NET

In a new .NET 5 console application, add the following NuGet packages:

* [`Microsoft.Graph`](https://www.nuget.org/packages/Microsoft.Graph/)
* [`Microsoft.Identity.Client`](https://www.nuget.org/packages/Microsoft.Identity.Client/)

With those two packages available, we can get to work. The first thing you need is a way to access the calendar.
This can be done by creating a new `GraphServiceClient` that uses the application id, tenant id and client secret that you created earlier:

```csharp
var confidentialClientApplication = ConfidentialClientApplicationBuilder
    .Create("application-id-goes-here")
    .WithTenantId("tenant-id-goes-here")
    .WithClientSecret("client-secret-goes-here")
    .Build();

var authProvider = new ClientCredentialProvider(confidentialClientApplication);
var graphClient = new GraphServiceClient(authProvider);
```

You will need the primary e-mail address for the account to read calendar info, and the calendar name.
In the following example, I replaced mine with "user@yourdirectory.onmicrosoft.com", depending on your Azure AD this may be a proper domain name instead of the default "onmicrosoft.com".
I'm really a boring person, and my primary calendar is named "Calendar".

```csharp
const string? mailid = "user@yourdirectory.onmicrosoft.com";
const string? calendarName = "Calendar";
```

Using the `GraphServiceClient` and these two new variables, you can now access calendar info.
Let's print calendar events for the next 5 days!

You fetch the list of calendars for a specific account, get the proper one, and then query for events.

```csharp
var calendars = await graphClient.Users[mailid].Calendars.Request().GetAsync();

var startingAfter = DateTime.UtcNow;
var endingBefore = DateTime.UtcNow.AddDays(5);

// Define the time span for the calendar view.
var options = new List<QueryOption>();
options.Add(new("startDateTime", startingAfter.ToString("o")));
options.Add(new("endDateTime", endingBefore.ToString("o")));

var calendar = calendars.First(it => it.Name == calendarName);
var events = await graphClient.Users[mailid].Calendars[$"{calendar.Id}"].CalendarView.Request(options).GetAsync();

foreach (var current in events)
{
    Console.WriteLine($"Start pubDatetime: {current.Start.DateTime} Subject: {current.Subject}");
}
```

Note that I have used target-typed `new` expressions in C# 9 to add query options.

### 3. Which events to synchronize?

Most probably, you don't want to export _all_  calendar items. In my case, I decided to not export weekends, and to use a category to decide whether an event should be exported:

```csharp
// Filter weekends
office365Meetings = office365Meetings.Where(
    it => it.Start.ToDateTimeOffset().DayOfWeek != DayOfWeek.Saturday &&
          it.Start.ToDateTimeOffset().DayOfWeek != DayOfWeek.Sunday).ToList();

// Filter categories
office365Meetings = office365Meetings.Where(
    it => it.Categories.Any(category => category == "Export")).ToList();
```

The Microsoft Graph gives you access to all properties of a calendar event, so you can create your own filters based on any property.

## Creating (and removing) calendar items in JetBrains Space

On the [JetBrains Space](https://www.jetbrains.com/space/) side, steps are similar.

### 1. Create a personal token

I'm synchronizing events with _my_ calendar in Space, so the application can use my account as well.
You can [create a personal token](https://www.jetbrains.com/help/space/personal-tokens.html) for this, and give it the permissions it needs:

* `ViewProfile`, which will be used to get my profile identifier
* `ManageMeetings`, which will be used to create and remove meetings from my calendar

![Create Space personal token](/images/2020/12/create-space-token.png)

Note the token that was created, you will need it in the next step.

### 2. Access your Space calendar using .NET

Add the [`JetBrains.Space.Client`](https://www.nuget.org/packages/JetBrains.Space.Client/) NuGet package to your project.
This is the main entry point for the .NET SDK for JetBrains Space, and gives access to pretty much all data that is in Space.

We can now get to work. You will need a `Connection` to Space. Use your Space organization URL and the personal token that you created before:

```csharp
var spaceConnection = new BearerTokenConnection(
  new Uri("https://your-organization.jetbrains.space/"),
  new AuthenticationTokens("personal-token-here"));
```

Using this connection, you can then get your user profile...

```csharp
var spaceTeamDirectory = new TeamDirectoryClient(spaceConnection);
var spaceProfile = await spaceTeamDirectory.Profiles.GetProfileAsync(ProfileIdentifier.Me);
```

...and use the profile id to read calendar items:

```csharp
var spaceCalendar = new CalendarClient(spaceConnection);
var spaceMeetings = await spaceCalendar.Meetings.GetAllMeetingsAsyncEnumerable(
    profiles: new List<string> { spaceProfile.Id },
    includePrivate: true,
    includeArchived: false,
    includeMeetingInstances: true,
    startingAfter: startingAfter,
    endingBefore: endingBefore, partial: _ => _
        .WithId()
        .WithSummary()
        .WithDescription()
        .WithOrganizer()
        .WithOccurrenceRule(occurrence => occurrence
            .WithStart()
            .WithEnd()
            .WithIsAllDay()
            .WithTimezone(timezone => timezone.WithAllFieldsWildcard()))
        .WithProfiles(profile => profile
            .WithId()
            .WithUsername()
            .WithName(name => name.WithAllFieldsWildcard()))
        .WithVisibility()
        .WithModificationPreference()
        .WithCanModify()
        .WithCanDelete()
        .WithConferenceLink()).ToListAsync();
```

This snippet queries for all meetings and retrieves them as an `IAsyncEnumerable`. The `partial` parameter, that holds all those `.With...()` methods, describes the data to retrieve from Space. It's similar to how GraphQL lets you query only specific fields in a remote HTTP API.

You can now use the `spaceMeetings` variable and compare it with meetings from Office 365 we retrieved earlier. The meetings that have not been exported yet, can now be created in my Space calendar:

```csharp
foreach (var office365Meeting in office365Meetings)
{
    Console.WriteLine("Creating meeting in Space: " + office365Meeting.Subject);

    await spaceCalendar.Meetings.CreateMeetingAsync(
        summary: office365Meeting.Subject,
        description: "Synchronized from [Office365 calendar](" + office365Meeting.WebLink + ")",
        occurrenceRule: new CalendarEventSpec
        {
            Start = office365Meeting.Start.ToDateTimeOffset().UtcDateTime,
            End = office365Meeting.End.ToDateTimeOffset().UtcDateTime,
            Timezone = new ATimeZone { Id = "UTC" },
            BusyStatus = office365Meeting.ShowAs == FreeBusyStatus.Busy || office365Meeting.ShowAs == FreeBusyStatus.Oof
                ? BusyStatus.Busy
                : BusyStatus.Free,
            IsAllDay = false
        },
        profiles: new List<string>
        {
            spaceProfile.Id
        },
        visibility: MeetingVisibility.PARTICIPANTS,
        modificationPreference: MeetingModificationPreference.ORGANIZER,
        joiningPreference: MeetingJoiningPreference.NOBODY,

        notifyOnExport: false,
        organizer: spaceProfile.Id
    );
}
```

A couple of things to note about this snippet:

* I'm creating events as "private" (`visibility: MeetingVisibility.PARTICIPANTS`) so only I can see their details.
* The `CalendarEventSpec` needs a time zone. Since UTC information is available in Office 365, I'm using this as the time zone for Space, too.

## Periodically running an agenda synchronization with Space automation

Almost there! All that is needed now is to run the full application on a schedule, e.g. once day.

I'm hosting the source code of this example in a Git repository, in Space. So while I could create a deployment pipeline and, for example, run this job in an Azure Function, using [Space Automation](https://blog.jetbrains.com/space/2020/09/17/space-automation-is-available-for-everyone/) seems like a logical choice.

In the root of the repository, add a file named `.space.kts`. In this script, you can use the [Space Automation DSL](https://www.jetbrains.com/help/space/automation-getting-started.html) to define:

* A `job` that runs on a schedule (e.g. every day at 8 AM)
* A step inside that job that creates a new Docker container from the [.NET 5 SDK image - `mcr.microsoft.com/dotnet/sdk:5.0`](https://hub.docker.com/_/microsoft-dotnet-sdk)
* A shell script that runs `dotnet restore`, `dotnet build`, and then `dotnet run --project SpaceAgenda` to run the application.

Here's the full snippet, that also uses [secrets and parameters](https://www.jetbrains.com/help/space/secrets-and-parameters.html) so I can keep all secrets separate from the source code of this calendar synchronization tool.

```kotlin
job("Synchronize agenda") {
    startOn {
        gitPush { enabled = false } // disable the default gitPush trigger
        schedule { cron("0 8 * * *") } // run on schedule instead
    }

    container("mcr.microsoft.com/dotnet/sdk:5.0") {
        resources {
            cpu = 2048
            memory = 2048
        }

        env.set("JB_SPACE_URL", Params("spaceagenda_space_url"))
        env.set("JB_SPACE_TOKEN", Secrets("spaceagenda_space_token"))

        env.set("O365_USERNAME", Params("spaceagenda_o365_username"))
        env.set("O365_CALENDAR", Params("spaceagenda_o365_calendar"))

        env.set("O365_CLIENT_ID", Params("spaceagenda_o365_client_id"))
        env.set("O365_TENANT_ID", Params("spaceagenda_o365_tenant_id"))
        env.set("O365_CLIENT_SECRET", Secrets("spaceagenda_o365_client_secret"))

        shellScript {
            content = """
            	dotnet restore
            	dotnet build
            	dotnet run --project SpaceAgenda
            """
        }
    }
}
```

When this job runs, you can inspect the full build log and see the synchronized items in the build output:

![Build log output](/images/2020/12/build-output.png)

And every morning, my Space agenda is now updated with entries from my personal calendar:

![Agendas are in sync now](/images/2020/12/agendas-in-sync.png)

Done! Gone are the meetings that are booked in my work calendar while I have a personal thing to attend to.

## Conclusion

This particular example may or may not be what you are after. I hope you can take away some pointers about how to consume your calendar using Microsoft Graph, how to use the JetBrains Space SDK, and how you can use automation there to run tasks on a schedule.

Enjoy!
