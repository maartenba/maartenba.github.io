---
layout: post
title: "SendMailControl for ASP.NET"
pubDatetime: 2007-05-05T15:03:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Personal"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/05/05/sendmailcontrol-for-asp-net.html
---
<p>
Have you ever used the ASP.NET PasswordRecovery control, or the CreateUserWizard? Probably, you used the mail capabilities of these controls too, and set up a MailDefinition to send an e-mail when the control did his job. Personally, I missed this functionality when wanting to send mails to users. 
</p>
<p>
Luckily, ASP.NET is very extensible. I decided to create my own control providing an easy and convenient way to sending templated e-mails. Just set the From, CC, Subject and Body properties in the designer, and use the Send() method from code. Not the cleanest implementation of catching SMTP errors, but it was sufficient for my use. If you need to catch SMTP errors, you still need to add that... Anyway, as a gift for anyone who needs it, please find my SendMailControl underneath:
```csharp
using System;
using System.Collections;
using System.ComponentModel;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Net.Mail;
namespace MaartenBalliauw.WebControls
{
    /// <summary>
    /// SendMailControl
    /// </summary>
    [ToolboxData("<{0}:SendMailControl runat=server></{0}:SendMailControl>")]
    public class SendMailControl : System.Web.UI.Control
    {
        #region Private members
        private MailDefinition _mailDefinition;
        #endregion
        #region Constructor
        public SendMailControl()
            : base()
        {
        }
        #endregion
        #region Public properties
        [NotifyParentProperty(true)]
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        [Category("Behavior")]
        [PersistenceMode(PersistenceMode.InnerProperty)]
        [Themeable(false)]
        [Localizable(true)]
        public MailDefinition MailDefinition
        {
            get
            {
                if (this._mailDefinition == null)
                {
                    this._mailDefinition = new MailDefinition();
                    if (base.IsTrackingViewState)
                    {
                        ((IStateManager)this._mailDefinition).TrackViewState();
                    }
                }
                return this._mailDefinition;
            }
        }
        #endregion
        #region Public methods
        public void Send(string recipient, IDictionary replacements)
        {
            try
            {
                MailMessage mail = MailDefinition.CreateMailMessage(recipient, replacements, this);
                SmtpClient c = new SmtpClient();
                c.Send(mail);
            } catch (Exception) {}
        }
        #endregion
    }
}
```


