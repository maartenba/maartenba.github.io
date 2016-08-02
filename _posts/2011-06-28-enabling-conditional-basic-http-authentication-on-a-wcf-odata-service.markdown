---
layout: post
title: "Enabling conditional Basic HTTP authentication on a WCF OData service"
date: 2011-06-28 12:24:12 +0200
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
alias: ["/post/2011/06/28/Enabling-conditional-Basic-HTTP-authentication-on-a-WCF-OData-service.aspx", "/post/2011/06/28/enabling-conditional-basic-http-authentication-on-a-wcf-odata-service.aspx"]
author: Maarten Balliauw
---
<p><a href="/images/image_121.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 0px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; border-top: 0px; border-right: 0px; padding-top: 0px" title="image" border="0" alt="image" align="right" src="/images/image_thumb_91.png" width="244" height="167" /></a>Yes, a long title, but also something I was not able to find too easily using <a href="http://www.bing.com" target="_blank">Google</a>. Here’s the situation: for <a href="http://www.myget.org" target="_blank">MyGet</a>, we are implementing basic authentication to the OData feed serving available NuGet packages. If you recall my post <a href="/post/2011/05/09/Using-dynamic-WCF-service-routes.aspx">Using dynamic WCF service routes</a>, you may have deducted that MyGet uses that technique to have one WCF OData service serving the feeds of all our users. It’s just convenient! Unless you want basic HTTP authentication for some feeds and not for others…</p>  <p>After doing some research, I thought the easiest way to resolve this was to use WCF intercepting. Convenient, but how would you go about this? And moreover: how to make it extensible so we can use this for other WCF OData (or WebAPi) services in the future?</p>  <p>The solution to this was to create a message inspector (<em>IDispatchMessageInspector). </em>Here’s the implementation we created for MyGet: (<strong>disclaimer</strong>: this will only work for OData services and WebApi!)</p>  <p>&#160;</p>  <div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:93496891-4174-47cb-8ae1-a27cab490ffa" class="wlWriterEditableSmartContent"><pre style=" width: 719px; height: 524px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> ConditionalBasicAuthenticationMessageInspector : IDispatchMessageInspector
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> IBasicAuthenticationCondition Condition { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> IBasicAuthenticationProvider Provider { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> ConditionalBasicAuthenticationMessageInspector(
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">        IBasicAuthenticationCondition condition, IBasicAuthenticationProvider provider)
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        Condition </span><span style="color: #000000;">=</span><span style="color: #000000;"> condition;
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        Provider </span><span style="color: #000000;">=</span><span style="color: #000000;"> provider;
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">12</span> <span style="color: #000000;">
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">object</span><span style="color: #000000;"> AfterReceiveRequest(</span><span style="color: #0000FF;">ref</span><span style="color: #000000;"> Message request, IClientChannel channel, InstanceContext instanceContext)
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">15</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Determine HttpContextBase</span><span style="color: #008000;">
</span><span style="color: #008080;">16</span> <span style="color: #008000;"></span><span style="color: #000000;">        </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (HttpContext.Current </span><span style="color: #000000;">==</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">)
</span><span style="color: #008080;">17</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">18</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">;
</span><span style="color: #008080;">19</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">20</span> <span style="color: #000000;">        HttpContextBase httpContext </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> HttpContextWrapper(HttpContext.Current);
</span><span style="color: #008080;">21</span> <span style="color: #000000;">
</span><span style="color: #008080;">22</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Is basic authentication required?</span><span style="color: #008000;">
</span><span style="color: #008080;">23</span> <span style="color: #008000;"></span><span style="color: #000000;">        </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (Condition.Evaluate(httpContext))
</span><span style="color: #008080;">24</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">25</span> <span style="color: #000000;">            </span><span style="color: #008000;">//</span><span style="color: #008000;"> Extract credentials</span><span style="color: #008000;">
</span><span style="color: #008080;">26</span> <span style="color: #008000;"></span><span style="color: #000000;">            </span><span style="color: #0000FF;">string</span><span style="color: #000000;">[] credentials </span><span style="color: #000000;">=</span><span style="color: #000000;"> ExtractCredentials(request);
</span><span style="color: #008080;">27</span> <span style="color: #000000;">
</span><span style="color: #008080;">28</span> <span style="color: #000000;">            </span><span style="color: #008000;">//</span><span style="color: #008000;"> Are credentials present? If so, is the user authenticated?</span><span style="color: #008000;">
</span><span style="color: #008080;">29</span> <span style="color: #008000;"></span><span style="color: #000000;">            </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (credentials.Length </span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> </span><span style="color: #800080;">0</span><span style="color: #000000;"> </span><span style="color: #000000;">&amp;&amp;</span><span style="color: #000000;"> Provider.Authenticate(httpContext, credentials[</span><span style="color: #800080;">0</span><span style="color: #000000;">], credentials[</span><span style="color: #800080;">1</span><span style="color: #000000;">]))
</span><span style="color: #008080;">30</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">31</span> <span style="color: #000000;">                httpContext.User </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> GenericPrincipal(
</span><span style="color: #008080;">32</span> <span style="color: #000000;">                    </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> GenericIdentity(credentials[</span><span style="color: #800080;">0</span><span style="color: #000000;">]), </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;">[] { });
</span><span style="color: #008080;">33</span> <span style="color: #000000;">                </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">;
</span><span style="color: #008080;">34</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">35</span> <span style="color: #000000;">
</span><span style="color: #008080;">36</span> <span style="color: #000000;">            </span><span style="color: #008000;">//</span><span style="color: #008000;"> Require authentication</span><span style="color: #008000;">
</span><span style="color: #008080;">37</span> <span style="color: #008000;"></span><span style="color: #000000;">            HttpContext.Current.Response.StatusCode </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800080;">401</span><span style="color: #000000;">;
</span><span style="color: #008080;">38</span> <span style="color: #000000;">            HttpContext.Current.Response.StatusDescription </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Unauthorized</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">;
</span><span style="color: #008080;">39</span> <span style="color: #000000;">            HttpContext.Current.Response.Headers.Add(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">WWW-Authenticate</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, </span><span style="color: #0000FF;">string</span><span style="color: #000000;">.Format(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Basic realm=\&quot;{0}\&quot;</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">, Provider.Realm));
</span><span style="color: #008080;">40</span> <span style="color: #000000;">            HttpContext.Current.Response.End();
</span><span style="color: #008080;">41</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">42</span> <span style="color: #000000;">
</span><span style="color: #008080;">43</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;">;
</span><span style="color: #008080;">44</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">45</span> <span style="color: #000000;">
</span><span style="color: #008080;">46</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> BeforeSendReply(</span><span style="color: #0000FF;">ref</span><span style="color: #000000;"> Message reply, </span><span style="color: #0000FF;">object</span><span style="color: #000000;"> correlationState)
</span><span style="color: #008080;">47</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">48</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Noop</span><span style="color: #008000;">
</span><span style="color: #008080;">49</span> <span style="color: #008000;"></span><span style="color: #000000;">    }
</span><span style="color: #008080;">50</span> <span style="color: #000000;">
</span><span style="color: #008080;">51</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;">[] ExtractCredentials(Message requestMessage)
</span><span style="color: #008080;">52</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">53</span> <span style="color: #000000;">        HttpRequestMessageProperty request </span><span style="color: #000000;">=</span><span style="color: #000000;"> (HttpRequestMessageProperty)requestMessage.Properties[HttpRequestMessageProperty.Name];
</span><span style="color: #008080;">54</span> <span style="color: #000000;">
</span><span style="color: #008080;">55</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> authHeader </span><span style="color: #000000;">=</span><span style="color: #000000;"> request.Headers[</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Authorization</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">];
</span><span style="color: #008080;">56</span> <span style="color: #000000;">
</span><span style="color: #008080;">57</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">if</span><span style="color: #000000;"> (authHeader </span><span style="color: #000000;">!=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">null</span><span style="color: #000000;"> </span><span style="color: #000000;">&amp;&amp;</span><span style="color: #000000;"> authHeader.StartsWith(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">Basic</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">))
</span><span style="color: #008080;">58</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">59</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> encodedUserPass </span><span style="color: #000000;">=</span><span style="color: #000000;"> authHeader.Substring(</span><span style="color: #800080;">6</span><span style="color: #000000;">).Trim();
</span><span style="color: #008080;">60</span> <span style="color: #000000;">
</span><span style="color: #008080;">61</span> <span style="color: #000000;">            Encoding encoding </span><span style="color: #000000;">=</span><span style="color: #000000;"> Encoding.GetEncoding(</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">iso-8859-1</span><span style="color: #800000;">&quot;</span><span style="color: #000000;">);
</span><span style="color: #008080;">62</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">string</span><span style="color: #000000;"> userPass </span><span style="color: #000000;">=</span><span style="color: #000000;"> encoding.GetString(Convert.FromBase64String(encodedUserPass));
</span><span style="color: #008080;">63</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">int</span><span style="color: #000000;"> separator </span><span style="color: #000000;">=</span><span style="color: #000000;"> userPass.IndexOf(</span><span style="color: #800000;">'</span><span style="color: #800000;">:</span><span style="color: #800000;">'</span><span style="color: #000000;">);
</span><span style="color: #008080;">64</span> <span style="color: #000000;">
</span><span style="color: #008080;">65</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">string</span><span style="color: #000000;">[] credentials </span><span style="color: #000000;">=</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;">[</span><span style="color: #800080;">2</span><span style="color: #000000;">];
</span><span style="color: #008080;">66</span> <span style="color: #000000;">            credentials[</span><span style="color: #800080;">0</span><span style="color: #000000;">] </span><span style="color: #000000;">=</span><span style="color: #000000;"> userPass.Substring(</span><span style="color: #800080;">0</span><span style="color: #000000;">, separator);
</span><span style="color: #008080;">67</span> <span style="color: #000000;">            credentials[</span><span style="color: #800080;">1</span><span style="color: #000000;">] </span><span style="color: #000000;">=</span><span style="color: #000000;"> userPass.Substring(separator </span><span style="color: #000000;">+</span><span style="color: #000000;"> </span><span style="color: #800080;">1</span><span style="color: #000000;">);
</span><span style="color: #008080;">68</span> <span style="color: #000000;">
</span><span style="color: #008080;">69</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> credentials;
</span><span style="color: #008080;">70</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">71</span> <span style="color: #000000;">
</span><span style="color: #008080;">72</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> </span><span style="color: #0000FF;">string</span><span style="color: #000000;">[] { };
</span><span style="color: #008080;">73</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">74</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Our <em>ConditionalBasicAuthenticationMessageInspector</em> implements a WCF message inspector that, once a request has been received, checks the HTTP authentication headers to check for a basic username/password. One extra there: since we wanted conditional authentication, we have also implemented an <em>IBasicAuthenticationCondition </em>interface which we have to implement. This interface decides whether to invoke authentication or not. The authentication itself is done by calling into our <em>IBasicAuthenticationProvider</em>. Implementations of these can be found on our <a href="http://myget.codeplex.com" target="_blank">CodePlex</a> site.</p>

<p>If you are getting optimistic: great! But how do you apply this message inspector to a WCF service? No worries: you can create a behavior for that. All you have to do is create a new <em>Attribute</em> and implement <em>IServiceBehavior</em>. In this implementation, you can register the <em>ConditionalBasicAuthenticationMessageInspector</em> on the service endpoint. Here’s the implementation:</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:a90f0772-22da-4fb8-9dba-fe5c8e6b2979" class="wlWriterEditableSmartContent"><pre style=" width: 719px; height: 524px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">[AttributeUsage(AttributeTargets.Class)]
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;"></span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> ConditionalBasicAuthenticationInspectionBehaviorAttribute
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    : Attribute, IServiceBehavior
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> IBasicAuthenticationCondition Condition { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> IBasicAuthenticationProvider Provider { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> ConditionalBasicAuthenticationInspectionBehaviorAttribute(
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        IBasicAuthenticationCondition condition, IBasicAuthenticationProvider provider)
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        Condition </span><span style="color: #000000;">=</span><span style="color: #000000;"> condition;
</span><span style="color: #008080;">12</span> <span style="color: #000000;">        Provider </span><span style="color: #000000;">=</span><span style="color: #000000;"> provider;
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">14</span> <span style="color: #000000;">
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> ConditionalBasicAuthenticationInspectionBehaviorAttribute(
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        Type condition, Type provider)
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">18</span> <span style="color: #000000;">        Condition </span><span style="color: #000000;">=</span><span style="color: #000000;"> Activator.CreateInstance(condition) </span><span style="color: #0000FF;">as</span><span style="color: #000000;"> IBasicAuthenticationCondition;
</span><span style="color: #008080;">19</span> <span style="color: #000000;">        Provider </span><span style="color: #000000;">=</span><span style="color: #000000;"> Activator.CreateInstance(provider) </span><span style="color: #0000FF;">as</span><span style="color: #000000;"> IBasicAuthenticationProvider;
</span><span style="color: #008080;">20</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">21</span> <span style="color: #000000;">
</span><span style="color: #008080;">22</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> AddBindingParameters(ServiceDescription serviceDescription, ServiceHostBase serviceHostBase, Collection</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">ServiceEndpoint</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> endpoints, BindingParameterCollection bindingParameters)
</span><span style="color: #008080;">23</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">24</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Noop </span><span style="color: #008000;">
</span><span style="color: #008080;">25</span> <span style="color: #008000;"></span><span style="color: #000000;">    }
</span><span style="color: #008080;">26</span> <span style="color: #000000;">
</span><span style="color: #008080;">27</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> ApplyDispatchBehavior(ServiceDescription serviceDescription, ServiceHostBase serviceHostBase)
</span><span style="color: #008080;">28</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">29</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">foreach</span><span style="color: #000000;"> (ChannelDispatcher channelDispatcher </span><span style="color: #0000FF;">in</span><span style="color: #000000;"> serviceHostBase.ChannelDispatchers)
</span><span style="color: #008080;">30</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">31</span> <span style="color: #000000;">            </span><span style="color: #0000FF;">foreach</span><span style="color: #000000;"> (EndpointDispatcher endpointDispatcher </span><span style="color: #0000FF;">in</span><span style="color: #000000;"> channelDispatcher.Endpoints)
</span><span style="color: #008080;">32</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">33</span> <span style="color: #000000;">                endpointDispatcher.DispatchRuntime.MessageInspectors.Add(
</span><span style="color: #008080;">34</span> <span style="color: #000000;">                    </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> ConditionalBasicAuthenticationMessageInspector(Condition, Provider));
</span><span style="color: #008080;">35</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">36</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">37</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">38</span> <span style="color: #000000;">
</span><span style="color: #008080;">39</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">void</span><span style="color: #000000;"> Validate(ServiceDescription serviceDescription, ServiceHostBase serviceHostBase)
</span><span style="color: #008080;">40</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">41</span> <span style="color: #000000;">        </span><span style="color: #008000;">//</span><span style="color: #008000;"> Noop </span><span style="color: #008000;">
</span><span style="color: #008080;">42</span> <span style="color: #008000;"></span><span style="color: #000000;">    }
</span><span style="color: #008080;">43</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>One step to do: apply this service behavior to our OData service. Easy! Just add an attribute to the service class and you’re done! Note that we specify the <em>IBasicAuthenticationCondition</em> and <em>IBasicAuthenticationProvider</em> on the attribute.</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:945f2b1c-cad1-4545-b4f5-8216d1e61334" class="wlWriterEditableSmartContent"><pre style=" width: 719px; height: 114px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;">1</span> <span style="color: #000000;">[ConditionalBasicAuthenticationInspectionBehavior(
</span><span style="color: #008080;">2</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">typeof</span><span style="color: #000000;">(MyGetBasicAuthenticationCondition),
</span><span style="color: #008080;">3</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">typeof</span><span style="color: #000000;">(MyGetBasicAuthenticationProvider))]
</span><span style="color: #008080;">4</span> <span style="color: #000000;"></span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> PackageFeedHandler
</span><span style="color: #008080;">5</span> <span style="color: #000000;">    : DataService</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">PackageEntities</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">,
</span><span style="color: #008080;">6</span> <span style="color: #000000;">      IDataServiceStreamProvider, 
</span><span style="color: #008080;">7</span> <span style="color: #000000;">      IServiceProvider
</span><span style="color: #008080;">8</span> <span style="color: #000000;">{
</span><span style="color: #008080;">9</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Enjoy!</p>
{% include imported_disclaimer.html %}
