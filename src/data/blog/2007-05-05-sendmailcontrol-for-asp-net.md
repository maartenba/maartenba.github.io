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
</p>
<p>
[code:c#]
</p>
using System;<br />
using System.Collections;<br />
using System.ComponentModel;<br />
using System.Text;<br />
using System.Web;<br />
using System.Web.UI;<br />
using System.Web.UI.WebControls;<br />
using System.Net.Mail;<br />
<br />
namespace MaartenBalliauw.WebControls<br />
{<br />
    /// &lt;summary&gt;<br />
    /// SendMailControl<br />
    /// &lt;/summary&gt;<br />
    [ToolboxData(&quot;&lt;{0}:SendMailControl runat=server&gt;&lt;/{0}:SendMailControl&gt;&quot;)]<br />
    public class SendMailControl : System.Web.UI.Control<br />
    {<br />
<br />
        #region Private members<br />
<br />
        private MailDefinition _mailDefinition;<br />
<br />
        #endregion<br />
<br />
        #region Constructor<br />
<br />
        public SendMailControl()<br />
            : base()<br />
        {<br />
        }<br />
<br />
        #endregion<br />
<br />
        #region Public properties<br />
<br />
        [NotifyParentProperty(true)]<br />
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]<br />
        [Category(&quot;Behavior&quot;)]<br />
        [PersistenceMode(PersistenceMode.InnerProperty)]<br />
        [Themeable(false)]<br />
        [Localizable(true)]<br />
        public MailDefinition MailDefinition<br />
        {<br />
            get<br />
            {<br />
                if (this._mailDefinition == null)<br />
                {<br />
                    this._mailDefinition = new MailDefinition();<br />
                    if (base.IsTrackingViewState)<br />
                    {<br />
                        ((IStateManager)this._mailDefinition).TrackViewState();<br />
                    }<br />
                }<br />
                return this._mailDefinition;<br />
            }<br />
        }<br />
<br />
        #endregion<br />
        <br />
        #region Public methods<br />
<br />
        public void Send(string recipient, IDictionary replacements)<br />
        {<br />
            try<br />
            {<br />
                MailMessage mail = MailDefinition.CreateMailMessage(recipient, replacements, this);<br />
                SmtpClient c = new SmtpClient();<br />
                c.Send(mail);<br />
            } catch (Exception) {}<br />
        }<br />
<br />
        #endregion<br />
<br />
    }<br />
}
<p>
[/code]
</p>




