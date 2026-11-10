---
layout: post
title: "UTCP vs MCP: what happens to agent auth without a server in the middle?"
pubDatetime: 2026-11-10T08:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "AI", "security", "OAuth"]
description: "What MCP authorization looks like when AI agents call APIs directly, and whether agent auth still needs DCR or CIMD."
author: Maarten Balliauw
---

API owners are hearing the same request: "can we get an MCP server for this?" Customers of public SaaS APIs want to plug them into their agent of choice, and teams inside companies want their agents to reach internal systems. Usually that means building and hosting a small wrapper service in front of an API you already have, translating JSON-RPC into HTTP calls and figuring out authentication along the way. That works, but it's a fair amount of plumbing to tell an agent what an OpenAPI document often already describes.

The [Universal Tool Calling Protocol](https://www.utcp.io/) (UTCP) turns exposing an API to LLMs into a spec. Instead of running a wrapper server, you publish a "manual", a JSON document that describes your tools and tells the agent how to call them over HTTP, a CLI or even MCP. The agent reads the manual and then calls your API like any other client would.

UTCP is still a fairly small, community-driven open source project, without one of the big AI vendors behind it. There are SDKs in a few languages and community adapters for frameworks like [Strands Agents](https://strandsagents.com/docs/integrations/tools/utcp), LangChain and Pydantic AI, plus a modest [showcase](https://www.utcp.io/showcase) of early projects. MCP, by comparison, is supported by Anthropic, OpenAI, Google and Microsoft. [Rockford Lhotka looked at UTCP recently](https://blog.lhotka.net/2026/11/08/Does-RockBot-Need-UTCP) and decided it wasn't something he needed in his projects right now, while still liking the ideas.

So consider this post as me thinking out loud: what would change if this model caught on?

UTCP lets AI agents call existing APIs straight from a JSON manual, without an MCP server in between. Authentication reuses whatever the API already supports, like API keys or OAuth client credentials, so agents acting on behalf of a user would still need the building blocks MCP authorization uses today, such as CIMD and protected resource metadata.

## Manuals instead of wrapper servers

A UTCP manual looks a lot like a trimmed-down OpenAPI document with some agent-specific hints added. Here's the example from the UTCP docs:

```json
{
  "manual_version": "1.0.0",
  "utcp_version": "1.0.1",
  "tools": [{
    "name": "get_weather",
    "description": "Get current weather for a location",
    "inputs": {
      "type": "object",
      "properties": { "location": { "type": "string" } },
      "required": ["location"]
    },
    "tool_call_template": {
      "call_template_type": "http",
      "url": "https://api.example.com/weather",
      "http_method": "GET"
    }
  }],
  "auth": {
    "auth_type": "api_key",
    "api_key": "${WEATHER_API_KEY}",
    "var_name": "appid",
    "location": "query"
  }
}
```

The LLM sees the tool definition (name, description, input schema), and the client library uses the `tool_call_template` to make the actual call. In MCP, that second part is code in a server you have to write and host. In UTCP, it's a few lines of JSON.

The UTCP site sums up the philosophy as *"If a human can call your API, an AI agent should be able to call it too, with the same security and no additional infrastructure."* For many APIs, that's a reasonable position. Point a UTCP client at an existing `openapi.json` and it converts the spec into a manual on the fly. Nothing new gets deployed, and your existing rate limiting and logging keep working because the traffic looks like any other client's.

## UTCP vs MCP: is MCP dead?

I don't think so, and UTCP doesn't seem to be trying to kill it either (it even ships an MCP call template). The two solve slightly different problems.

MCP is a runtime protocol. Even though it's stateless, the server stays in the loop on every call, which gives it a place to run its own logic or ask the user for confirmation through elicitation. UTCP is just a description format. Once the agent has the manual, whoever published it is out of the picture and the agent talks straight to the API.

That makes UTCP a good fit when the thing you're exposing is already an API, and MCP a better fit when the "tool" is an application with its own logic that doesn't exist anywhere else. Plenty of MCP servers out there are thin, stateless shims around REST, and those are the ones UTCP would make unnecessary.

It also changes who can build the integration. You don't have to wait for the API vendor to ship an MCP server, because a UTCP manual is just a JSON file describing existing endpoints, and anyone can write one. That's practical, though it does raise the question of whether you should trust a manual someone else wrote (more on that later).

## UTCP vs WebMCP

[WebMCP](https://webmachinelearning.github.io/webmcp/) is closer to MCP than to UTCP, but it moves the server into the browser. It's a draft in the W3C Web Machine Learning Community Group, edited by people from Microsoft and Google, and Chrome has it in an [origin trial](https://developer.chrome.com/docs/ai/webmcp/imperative-api). A web page registers tools in JavaScript, and an agent running in the browser can call them:

```javascript
await document.modelContext.registerTool({
  name: "get_order_status",
  description: "Get the shipping status of an order",
  inputSchema: {
    type: "object",
    properties: { orderId: { type: "string" } },
    required: ["orderId"]
  },
  annotations: { readOnlyHint: true },
  async execute({ orderId }) {
    const response = await fetch(`/api/orders/${orderId}`);
    return await response.json();
  }
});
```

Like an MCP server, a WebMCP tool is code that runs on every call. The `execute` function can validate input, update the page, call several APIs or ask the user for confirmation, but it runs as the page's own JavaScript in a tab the user has open. A UTCP manual, on the other hand, is static data describing the API, so an agent running in your IDE or on a backend server can call the endpoints directly.

That also limits which agents can use a WebMCP tool. The spec covers how a page registers tools for an agent in the browser, meaning the browser's built-in assistant or an extension, and doesn't define how an agent running somewhere else connects. You can bridge the gap today with [Chrome DevTools MCP](https://developer.chrome.com/docs/devtools/agents/webmcp-debugging), which has an experimental option to list and run a page's WebMCP tools from Claude Code or similar agents, but that means the agent is driving a real browser with the page open. Chrome frames that bridge as a debugging tool, and I wouldn't build a production backend agent on top of it.

That difference shows up most clearly in auth. WebMCP mostly sidesteps the problem, because the tool runs in a tab where the user is already signed in, and the `fetch` call above simply carries the session cookie. You don't have to register an OAuth client or fetch a token. The catch is that your API only sees an ordinary request with the user's session cookie, with no way to tell whether the user clicked a button or an agent called a tool. That makes auditing, and giving agents different permissions than the user, a lot harder. WebMCP also only works while a browser tab is open, which rules out the headless and long-running agents where UTCP (and MCP) are aimed.

So I don't really see them competing. WebMCP is for an assistant helping someone in an open browser tab, while UTCP is for agents that call APIs on their own.

## How auth works in UTCP

UTCP's answer to auth is "use what the API already uses." The manual declares an `auth` block, at the manual level or per tool, and the client fills in the details. Today that means API keys, basic auth and OAuth client credentials:

```json
{
  "auth": {
    "auth_type": "oauth2",
    "client_id": "${CLIENT_ID}",
    "client_secret": "${CLIENT_SECRET}",
    "token_url": "https://auth.example.com/token",
    "scope": "tools:read tools:execute"
  }
}
```

The manual never contains the secret itself. The `${...}` placeholders tell the client which value to look up from its own configuration. That's a sensible design, and the [UTCP security guidance](https://www.utcp.io/security) adds some guardrails on top, such as requiring HTTPS except on loopback and never forwarding credentials to another origin on a redirect.

For those placeholders to resolve, though, someone had to go to a developer portal first, register an app, and copy a client ID and secret (or an API key) into the agent's configuration. If you're building an agent that talks to your own APIs, that's fine. We've been wiring up backend integrations like that for twenty years, and it works.

Where that breaks down is when the agent isn't yours. Picture a user installing an off-the-shelf agent that finds a tool its developer has never heard of, and wants to call it as that user. Nobody registered a client up front, so there's nothing to paste in. That's exactly the scenario that made MCP auth so painful in the first place (CIMD, which I get to below, is the industry's current answer).

## Client credentials don't represent the user

Client credentials give you a token for the *application*, which is the wrong identity for many agent use cases. If my coding agent opens a pull request, I want the API to know it was an agent acting for me, with my permissions, and not a shared service account that can see everyone's repositories.

In OAuth terms that's delegated access, with the authorization code flow, a user consent screen, and ideally something like token exchange when the agent hops between services (more on that below). UTCP doesn't cover that today. You can pass in your own token through a header and a placeholder, which moves the problem to "however the client got that token".

I don't see that as a flaw, since a tool description format has no business inventing its own auth protocol. Still, if an agent runs into an API for the first time and needs a user-scoped token, the manual alone won't get it there.

## Does UTCP need DCR or CIMD?

When MCP adopted OAuth, it ran straight into the client registration problem. An authorization server wants to know which client is asking for a token, but an MCP client like an IDE can't pre-register with every server on the planet. The first answer was [Dynamic Client Registration](https://datatracker.ietf.org/doc/html/rfc7591) (DCR), where the client POSTs some metadata to the authorization server and gets a client ID back. It works, but every authorization server then has to accept registrations from anyone, which most enterprise identity teams (rightly) find terrifying. You end up with thousands of throwaway clients and little idea who they belong to.

The newer answer, now recommended in the MCP authorization spec (which deprecated DCR in the 2026-07-28 revision), is [Client ID Metadata Documents](https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/) (CIMD). The client ID is an HTTPS URL, and the authorization server fetches a metadata document from that URL to learn the client's name and redirect URIs. There's no registration endpoint to run, and the client's identity is tied to a domain someone controls. Fetching the document only proves who published it, so the authorization server still has to decide which domains it trusts and what a client is allowed to ask for. The client ID also represents the agent software (like any public OAuth client), so if you and I use the same coding agent, we share its client ID while still signing in with our own accounts.

So what if UTCP catches on? As long as you stick to pre-configured credentials, it needs neither, because registration happens out of band the old-fashioned way. Once you want an agent to discover a manual and get a user-delegated token without a human copying secrets around, you hit the same wall MCP hit, since the agent needs a client identity at an authorization server it has never worked with.

If anything, direct calls make this matter more for UTCP than for MCP. An MCP server sits in the middle and can broker authentication, but a UTCP agent calls your resource server directly and has to be a proper OAuth client itself. CIMD seems the natural fit because it scales to any agent calling any API without every API owner opening up a registration endpoint. If you're on the side that issues the tokens, I wrote about [what an identity provider like IdentityServer does and when you need one](/posts/2026-06-11-what-is-identityserver-and-when-do-you-need-it/).

I could see a UTCP manual pointing to [OAuth Protected Resource Metadata](https://datatracker.ietf.org/doc/html/rfc9728) instead of hardcoding a `token_url`. The resource tells the agent which authorization server to use, the agent identifies itself with a CIMD URL, and the user consents in a browser. All of those pieces exist already, they just aren't wired into the manual format.

CIMD gets an unfamiliar agent in the door, but in a company the problem usually runs the other way too. An agent working for you might read from a document store, look something up in the CRM and post a summary to the chat tool, and with UTCP each of those is a direct call to a different vendor's API. Having you click through a consent screen for every one of them gets old fast, and people who see too many consent prompts learn to click "Allow" without reading. The [Identity Assertion JWT Authorization Grant](https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/) (ID-JAG) is aimed at this. The agent trades your sign-in at the company's identity provider for a short-lived assertion meant for one vendor, and that vendor's authorization server swaps it for its own access token. You get single sign-on across vendors, and the company's identity provider gets to apply policy before any of it happens. ID-JAG is still an IETF draft too, and it's another piece a UTCP manual could reference instead of defining its own flow.

## Who do you trust, the manual or the API?

A manual tells your agent where to send requests, and potentially where to send credentials. If I can get your agent to load my manual for "GitHub", I decide which URL your GitHub token goes to.

UTCP's reference clients already guard against the obvious variants, such as plain HTTP and credential forwarding across origins. Still, the trust model differs from MCP, where you at least installed a specific server on purpose. With UTCP, whether a manual was actually published by the API owner matters a lot. Serving it from the API's own origin, at a well-known path, goes a long way, and signed manuals would go further.

Binding tokens to an audience helps as well. If a token is restricted to one resource (using [resource indicators](https://datatracker.ietf.org/doc/html/rfc8707)) or sender-constrained with DPoP (the same idea behind [Device Bound Session Credentials](/posts/2026-09-16-device-bound-session-credentials-in-aspnet-core/) for browser cookies), a malicious manual that redirects calls elsewhere ends up with a token that's useless at the destination.

## Where this leaves us

Whether or not UTCP itself becomes widely used, I like its core idea. Plenty of APIs don't need a wrapper server to be useful to an agent, just a machine-readable description and a working auth story. UTCP covers the description well and reuses existing auth where it can.

What it doesn't have (yet?) is a big name behind it, and I suspect that will matter more for adoption than the merits of the format. MCP and WebMCP both have the large AI and browser vendors involved, and the standards around them have been moving quickly. MCP went stateless and moved from DCR to CIMD, and OAuth Protected Resource Metadata became an RFC. CIMD and ID-JAG are still IETF drafts, yet identity providers and agent platforms are already shipping support for them.

Those identity providers and platforms exist because companies need agents to act with the right user's permissions and leave an audit trail of who did what. If UTCP wants to work in that environment, its manuals will need to hook into those same OAuth standards.

