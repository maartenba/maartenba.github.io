---
layout: post
title: "Running Large Language Models locally – Your own ChatGPT-like AI in C#"
pubDatetime: 2023-06-15T03:44:05Z
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "AI", "LLM"]
author: Maarten Balliauw
redirect_from:
  - /post/2023/06/15/running-large-language-models-locally-your-own-chatgpt-like-ai-in-c.html
---

For the past few months, a lot of news in tech as well as mainstream media has been around [ChatGPT](https://openai.com/chatgpt), an Artificial Intelligence (AI) product by the folks at [OpenAI](https://www.openai.com).
ChatGPT is a Large Language Model (LLM) that is fine-tuned for conversation. While undervaluing the technology with this statement, it's a smart-looking chat bot that you can ask questions about a variety of domains.

Until recently, using these LLMs required relying on third-party services and cloud computing platforms.
To integrate any LLM into your own application, or simply to use one, you'd have to swipe your credit card with OpenAI, [Microsoft Azure](https://azure.microsoft.com/en-us/products/cognitive-services/openai-service), or others.

However, with advancements in hardware and software, it is now possible to run these models locally on your own machine and/or server.

In this post, we'll see how you can have your very own AI powered by a large language model running directly on your CPU!

## Towards open-source models and execution – A little bit of history...

A few months after OpenAI released ChatGPT, [Meta released LLaMA](https://ai.facebook.com/blog/large-language-model-llama-meta-ai/).
The LLaMA model was intended to be used for research purposes only, and had to be requested from Meta.

However, someone [leaked the weights of LLaMA](https://github.com/facebookresearch/llama/pull/73), and this has spurred a lot of activity on the Internet.
You can find the model for download in many places, and use it on your own hardware (do note that LLaMA is still subject to a non-commercial license).

In comes [Alpaca](https://crfm.stanford.edu/2023/03/13/alpaca.html), a fine-tuned LLaMA model by Standford.
And [Vicuna](https://lmsys.org/blog/2023-03-30-vicuna/), another fine-tuned LLaMA model.
And [WizardLM](https://arxiv.org/abs/2304.12244), and ...

You get the idea: LLaMA spit up (sorry for the pun) a bunch of other models that are readily available to use.

While part of the community was training new models, others were working on making it possible to run these LLMs on consumer hardware.
Georgi Gerganov [released `llama.cpp`](https://github.com/ggerganov/llama.cpp), a C++ implementation that can run the LLaMA model (and derivatives) on a CPU.
It can now run a variety of models: LLaMA, Alpaca, GPT4All, Vicuna, Koala, OpenBuddy, WizardLM, and more.

There are also wrappers for a number of languages:
* Python: [abetlen/llama-cpp-python](https://github.com/abetlen/llama-cpp-python)
* Go: [go-skynet/go-llama.cpp](https://github.com/go-skynet/go-llama.cpp)
* Node.js: [hlhr202/llama-node](https://github.com/hlhr202/llama-node)
* Ruby: [yoshoku/llama_cpp.rb](https://github.com/yoshoku/llama_cpp.rb)
* .NET (C#): [SciSharp/LLamaSharp](https://github.com/SciSharp/LLamaSharp)

Let's put the last one from that list to the test!

## Getting started with SciSharp/LLamaSharp

Have you heard about the [SciSharp Stack](https://scisharp.github.io/SciSharp/)?
Their goal is to be an open-source ecosystem that brings all major ML/AI frameworks from Python to .NET – including LLaMA (and friends) through [SciSharp/LLamaSharp](https://github.com/SciSharp/LLamaSharp).

LlamaSharp is a .NET binding of `llama.cpp` and provides APIs to work with the LLaMA models. It works on Windows and Linux, and does not require you to think about the underlying `llama.cpp`.
It does not support macOS at the time of writing.

Great! Now, what do you need to get started?

Since you'll need a model to work with, let's get that sorted first.

### 1. Download a model

LLamaSharp works with several models, but [the support depends on the version of LLamaSharp you use](https://github.com/SciSharp/LLamaSharp#installation).
Supported models are linked in the README, do go explore a bit.

For this blog post, we'll be using LLamaSharp version 0.3.0 (the latest at the time of writing).
We'll also use the [WizardLM](https://huggingface.co/TheBloke/wizardLM-7B-GGML/tree/main) model, more specifically the [`wizardLM-7B.ggmlv3.q4_1.bin`](https://huggingface.co/TheBloke/wizardLM-7B-GGML/resolve/main/wizardLM-7B.ggmlv3.q4_1.bin) model.
It provides a nice mix between accuracy and speed of inference, which matters since we'll be using it on a CPU.

There are [a number of more accurate models](https://huggingface.co/TheBloke/wizardLM-7B-GGML) (or faster, less accurate models), so do experiment a bit with what works best.
In any case, make sure you have 2.8 GB to 8 GB of disk space for the variants of this model, and up to 10 GB of memory.

### 2. Create a console application and install LLamaSharp

Using your favorite IDE, create a new console application and copy in the model you have just downloaded.
Next, install the `LLamaSharp` and `LLamaSharp.Backend.Cpu` packages. If you have a Cuda GPU, you can also use the Cuda backend packages.

Here's our project to start with:

![LocalLLM project in JetBrains Rider](/images/2023/06/local-llm-in-jetbrains-rider.png)

With that in place, we can start creating our own chat bot that runs locally and does not need OpenAI to run.

### 3. Initializing the LLaMA model and creating a chat session

In `Program.cs`, start with the following snippet of code to load the model that we just downloaded:

```csharp
using LLama;

var model = new LLamaModel(new LLamaParams(
    model: Path.Combine("..", "..", "..", "Models", "wizardLM-7B.ggmlv3.q4_1.bin"),
    n_ctx: 512,
    interactive: true,
    repeat_penalty: 1.0f,
    verbose_prompt: false));
```

This snippet loads the model from the directory where you stored your downloaded model in the previous step.
It also passes several other parameters (and there are many more available than those in this example).

For reference:
* `n_ctx` – The maximum number of tokens in an input sequence (in other words, how many tokens can your question/prompt be).
* `interactive` – Specifies you want to keep the context in between prompts, so you can build on previous results. This makes the model behave like a chat.
* `repeat_penalty` – Determines the [penalty for long responses](https://github.com/ggerganov/llama.cpp/issues/331) (and helps keep responses more to-the-point).
* `verbose_prompt` – Toggles the verbosity.

Again, there are many more parameters available, most of which are [explained in the `llama.cpp` repository](https://github.com/ggerganov/llama.cpp).

Next, we can use our model to start a chat session:

```csharp
var session = new ChatSession<LLamaModel>(model)
    .WithPrompt(...)
    .WithAntiprompt(...);
```

Of course, these `...` don't compile, but let's explain first what is needed for a chat session.

The `.WithPrompt()` (or `.WithPromptFile()`) method specifies the initial prompt for the model.
This can be left empty, but is usually a set of rules for the LLM.
Find some [example prompts in the `llama.cpp` repository](https://github.com/ggerganov/llama.cpp/tree/master/prompts), or write your own.

The `.WithAntiprompt()` method specifies the anti-prompt, which is the prompt the LLM will display when input from the user is expected.

Here's how to set up a chat session with an LLM that is Homer Simpson:

```csharp
var session = new ChatSession<LLamaModel>(model)
    .WithPrompt("""
        You are Homer Simpson, and respond to User with funny Homer Simpson-like comments.

        User:
        """)
    .WithAntiprompt(new[] { "User: " });
```

We'll see in a bit what results this Homer Simpson model gives, but generally you will want to be more detailed in what is expected from the LLM.
Here's an example chat session setup for a model called "LocalLLM" that is helpful as a pair programmer:

```csharp
var session = new ChatSession<LLamaModel>(model)
    .WithPrompt("""
        You are a polite and helpful pair programming assistant.
        You MUST reply in a polite and helpful manner.
        When asked for your name, you MUST reply that your name is 'LocalLLM'.
        You MUST use Markdown formatting in your replies when the content is a block of code.
        You MUST include the programming language name in any Markdown code blocks.
        Your code responses MUST be using C# language syntax.

        User:
        """)
    .WithAntiprompt(new[] { "User: " });
```

Now that we have our chat session, we can start interacting with it.
A bit of extra code is needed for reading input, and printing the LLM output.

```csharp
Console.WriteLine();
Console.Write("User: ");
while (true)
{
    Console.ForegroundColor = ConsoleColor.Green;
    var prompt = Console.ReadLine() + "\n";

    Console.ForegroundColor = ConsoleColor.White;
    foreach (var output in session.Chat(prompt, encoding: "UTF-8"))
    {
        Console.Write(output);
    }
}
```

That's pretty much it. The chat session in the `session` variable is prompted using its `.Chat()` method, and all outputs are returned token by token, like any generative model.

You want to see this in action, right? Here's the "Homer Simpson chat" in action:

![Homer Simpson local large language model](/images/2023/06/homer-simpson-as-large-language-model.png)

The more useful "C# pair programmer chat":

![Helpful C# programming bot large language model](/images/2023/06/llamasharp-pair-programing-chatbot.png)

Pretty nice, no?

On my Windows laptop (i7-10875H CPU @ 2.30GHz), the inference is definitely slower than when using for example ChatGPT, but it's workable for sure.

## Wrapping up

Because of the hardware needs, using LLMs has always required third-party services and cloud platforms like OpenAI's ChatGPT.

In this post, we've seen some of the history of open-source large language models, and how the models themselves as well as the surrounding community have made it possible to run these models locally.

I'm curious to hear what you will build using this approach!