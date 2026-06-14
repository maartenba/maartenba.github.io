---
layout: post
title: "A phone call from the cloud: Windows Azure, SignalR & Twilio"
pubDatetime: 2012-11-12T13:52:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/11/12/a-phone-call-from-the-cloud-windows-azure-signalr-twilio.html
---
*Note: this blog post used to be an article for the Windows Azure Roadtrip website. Since that one no longer exists, I decided to post the articles on my blog as well. Find the source code for this post here: [05 ConfirmPhoneNumberDemo.zip (1.32 mb)](/files/2012/11/05+ConfirmPhoneNumberDemo.zip).
It has been written earlier this year, some versions of packages used (like jQuery or SignalR) may be outdated in this post. Live with it.*


In the [previous blog post](/post/2012/11/12/Sending-e-mail-from-Windows-Azure.aspx) we saw how you can send e-mails from Windows Azure. Why not take communication a step further and make a phone call from Windows Azure? I’ve already mentioned that Windows Azure is a platform which will run your code, topped with some awesomesauce in the form of a large number of components that will speed up development. One of those components is the API provided by [Twilio](http://ahoy.twilio.com/azure), a third-party service.


Twilio is a telephony web-service API that lets you use your existing web languages and skills to build voice and SMS applications. Twilio Voice allows your applications to make and receive phone calls. Twilio SMS allows your applications to make and receive SMS messages. We’ll use Twilio Voice in conjunction with [jQuery](http://www.jquery.com) and [SignalR](http://www.github.com/signalr/signalr) to spice up a sign-up process.


### The scenario


The idea is simple: we want users to sign up using a username and password. In addition, they’ll have to provide their phone number. The user will submit the sign-up form and will be displayed a confirmation code. In the background, the user will be called and asked to enter this confirmation code in order to validate his phone number. Once finished, the browser will automatically continue the sign-up process. Here’s a visual:


[![](/images/clip_image002_thumb_1.jpg)](/images/clip_image002_2.jpg)


Sounds too good to be true? Get ready, as it’s relatively simple using Windows Azure and Twilio.


### Let’s start…


Before we begin, make sure you have a [Twilio](http://ahoy.twilio.com/azure) account. Twilio offers some free credits, enough to test with. After registering, make sure that you [enable international calls](https://www.twilio.com/user/account/international) and that your [phone number is registered](https://www.twilio.com/user/account/phone-numbers/verified) as a developer. Twilio takes this step in order to ensure that their service isn’t misused for making abusive phone calls using free developer accounts.


Next, create a Windows Azure project containing an ASP.NET MVC 4 web role. Install the following NuGet packages in it (right-click, Library Package Manager, go wild):


- jQuery
- jQuery.UI.Combined
- jQuery.Validation
- json2
- Modernizr
- SignalR
- Twilio
- Twilio.Mvc
- Twilio.TwiML


It may also be useful to [develop some familiarity with the concepts behind SignalR](http://channel9.msdn.com/Events/TechDays/TechDays-2012-Belgium/246).


### The registration form


Let’s create our form. Using a simple model class, *SignUpModel*, create the following action method:


```

public ActionResult Index()
{
    return View(new SignUpModel());
}

```

This action method is accompanied with a view, a simple form requesting the required information from our user:

```xml
@using (Html.BeginForm("SignUp", "Home", FormMethod.Post)) {
    @Html.ValidationSummary(true)

    <fieldset>
        <legend>Sign Up for this awesome service</legend>

         @* etc etc etc *@


            @Html.LabelFor(model => model.Phone)


            @Html.EditorFor(model => model.Phone)
            @Html.ValidationMessageFor(model => model.Phone)


<input type="submit" value="Sign up!" />

    </fieldset>
}

```

We’ll spice up this form with a dialog first. Using jQuery UI, we can create a simple <div> element which will serve as the dialog’s content. Note the *ui-helper-hidden* class which is used to make it invisible to view.

```xml


# Keep an eye on your phone...


Pick up the phone and follow the instructions.


You will be asked to enter the following code:


## 1743

```

This is a simple dialog in which we’ll show a hardcoded confirmation code which the user will have to provide when called using Twilio.

Next, let’s code our JavaScript logic which will spice up this form. First, add the required JavaScript libraries for SignalR (more on that later):

```xml
<script src="@Url.Content("~/Scripts/jquery.signalR-0.5.0.min.js")" type="text/javascript"></script>
<script src="@Url.Content("~/signalr/hubs")" type="text/javascript"></script>

```

Next, capture the form’s *submit* event and, if the phone number has not been validated yet, cancel the submit event and show our dialog instead:

```javascript
$('form:first').submit(function (e) {
    if ($(this).valid() && $('#Phone').data('validated') != true) {
        // Show a dialog
        $('#phoneDialog').dialog({
            title: '',
            modal: true,
            width: 400,
            height: 400,
            resizable: false,
            beforeClose: function () {
                if ($('#Phone').data('validated') != true) {
                    return false;
                }
            }
        });

        // Don't submit. Yet.
        e.preventDefault();
    }
});

```

Nothing fancy yet. If you now run this code, you’ll see that a dialog opens and remains open for eternity. Let’s craft some SignalR code now. SignalR uses a concept of *Hubs* to enable client-server communication, but also server-client communication. We’ll need the latter to inform our view whenever the user has confirmed his phone number. In the project, add the following class:

```csharp
[HubName("phonevalidator")]
public class PhoneValidatorHub
    : Hub
{
    public void StartValidation(string phoneNumber)
    {
    }
}

```


This class defines a service that the client can call. SignalR will also keep the connection with the client open so that this *PhoneValidatorHub* can later send a message to the client as well. Let’s connect our view to this hub. In the form submit event handler, add the following line of code:

```javascript
// Validate the phone number using Twilio
$.connection.phonevalidator.startValidation($('#Phone').val());

```

We’ve created a C# class with a *StartValidation* method and we’re calling the *startValidation* message from JavaScript. Coincidence? No. SignalR makes this possible. But we’re not finished yet. We can now call a method on the server side, but how would the server inform the client when the phone number has been validated? I’ll get to that point later. First, let’s make sure our JavaScript code can receive that call from the server. To do so, connect to the *PhoneValidator* hub and add a callback function to it:

```javascript
var validatorHub = $.connection.phonevalidator;
validatorHub.validated = function (phoneNumber) {
    if (phoneNumber == $('#Phone').val()) {
        $('#Phone').data('validated', true);
        $('#phoneDialog').dialog('destroy');
        $('form:first').trigger('submit');
    }
};
$.connection.hub.start();

```


What we’re doing here is adding a client-side function named *validated* to the SignalR hub. We can call this function, sitting at the client side, from our server-side code later on. The function itself is easy: it checks whether the phone number that was validated matches the one the user entered and, if so, it submits the form and completes the signup.

All that’s left is calling the user and, when the confirmation succeeds, we’ll have to inform our client by calling the *validated* message on the hub.

### Initiating a phone call

The phone call to our user will be initiated in the *PhoneValidatorHub*’s *StartValidation* method. Add the following code there:

```csharp
var twilioClient = new TwilioRestClient("api user", "api password");

string url = "http://mas.cloudapp.net/Home/TwilioValidationMessage?passcode=1743"
    + "&phoneNumber=" + HttpContext.Current.Server.UrlEncode(phoneNumber);

// Instantiate the call options that are passed to the outbound call
CallOptions options = new CallOptions();
options.From = "+14155992671"; // Twilio's developer number
options.To = phoneNumber;
options.Url = url;

// Make the call.
twilioClient.InitiateOutboundCall(options);

```

Using the *TwilioRestClient* class, we create a request to Twilio. We also pass on a URL which points to our application. Twilio uses TwiML, an XML format to instruct their phone services. When calling the *InitiateOutboundCall* method, Twilio will issue a request to the URL we are hosting ([http://.....cloudapp.net/Home/TwilioValidationMessage](http://.....cloudapp.net/Home/TwilioValidationMessage)) to fetch the TwiML which tells Twilio what to say, ask, record, gather, … on the phone.

Next up: implementing the *TwilioValidationMessage* action method.

```csharp
public ActionResult TwilioValidationMessage(string passcode, string phoneNumber)
{
    var response = new TwilioResponse();
    response.Say("Hi there, welcome to Maarten's Awesome Service.");
    response.Say("To validate your phone number, please enter the 4 digit"
        + " passcode displayed on your screen followed by the pound sign.");
    response.BeginGather(new {
        numDigits = 4,
        action = "http://mas.cloudapp.net/Home/TwilioValidationCallback?phoneNumber="
             + Server.UrlEncode(phoneNumber), method = "GET" });
    response.EndGather();

    return new TwiMLResult(response);
}

```

That’s right. We’re creating some [TwiML](https://www.twilio.com/docs/api/twiml) here. Our ASP.NET MVC action method is telling Twilio to say some text and to gather 4 digits from his phone pad. These 4 digits will be posted to the *TwilioValidationCallback* action method by the Twilio service. Which is the next method we’ll have to implement.

```csharp
public ActionResult TwilioValidationCallback(string phoneNumber)
{
    var hubContext = GlobalHost.ConnectionManager.GetHubContext

();
    hubContext.Clients.validated(phoneNumber);

    var response = new TwilioResponse();
    response.Say("Thank you! Your browser should automatically continue. Bye!");
    response.Hangup();

    return new TwiMLResult(response);
}

```

The *TwilioValidationCallback* action method does two things. First, it gets a reference to our SignalR hub and calls the *validated* function on it. As you may recall, we created this method on the hub’s client side, so in fact our ASP.NET MVC server application is calling a method on the client side. Doing this triggers the client to hide the validation dialog and complete the user sign-up process.

Another action we’re doing here is generating some more TwiML (it’s fun!). We thank the user for validating his phone number and, after that, we hang up the call.

You see? Working with voice (and text messages too, if you want) isn’t that hard. It enables additional scenarios that can make your application stand out from all the many others out there. Enjoy!

[05 ConfirmPhoneNumberDemo.zip (1.32 mb)](/files/2012/11/05+ConfirmPhoneNumberDemo.zip)
