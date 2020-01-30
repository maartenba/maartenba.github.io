---
layout: post
title: "Deserializing JSON into polymorphic classes with System.Text.Json"
date: 2020-01-29 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Web", ".NET", "JSON"]
author: Maarten Balliauw
---

While working on SpaceDotNet, a strong-typed client SDK to access the [JetBrains Space HTTP API](https://blog.jetbrains.com/space/2020/01/28/getting-started-with-the-space-http-api/), I came across a scenario to deserialize JSON into polymorphic classes. In this post, I'll explain how to write a custom `JsonConverter` for `System.Text.Json` to help with deserialization for such cases.

## Background

SpaceDotNet (not public yet) will be a strong-typed SDK to work with JetBrains Space. The HTTP API provides a [metadata endpoint that describes type hierarchy in the Space API](https://blog.jetbrains.com/space/2020/01/28/getting-started-with-the-space-http-api/#http-api-metadata), which can help with generating code to access the API. Think of it like a Swagger/OpenAPI description, but with a bit more metadata.

This metadata endpoint will return type descriptions like the following...

```
{
  "id": "atimezone",
  "name": "ATimeZone",
  "fields": [
    {
      "field": {
        "name": "id",
        "type": {
          "className": "HA_Type.Primitive",
          "primitive": "String",
          "nullable": false,
          "optional": false
        }
      }
    }
  ]
}
```

...which I could then convert into a .NET class like:

```
public class ATimeZone
{
    public string Id { get; set; }
}
```

The metadata may return various shapes of type information, which I then want to map into a .NET representation. I want to then be able to introspect that .NET type to generate a class like `ATimeZone` above.

Seems feasible! Note the `className` property in the above JSON, it gives me information about the concrete details I will be retrieving from the API!

Type information in that `className` property can be:

* `HA_Type.Array`, describing a generic array (with type information for its elements), which I would like to deserialize into `ApiFieldType.Array`
* `HA_Type.Dto`, describing a class with fields and their types, which I would like to deserialize into `ApiFieldType.Dto`
* `HA_Type.Enum`, describing an `enum`, which I would like to deserialize into `ApiFieldType.Enum`
* `HA_Type.Object`, describing an anonymous class with fields and their types, which I would like to deserialize into `ApiFieldType.Object`
* `HA_Type.Primitive`, describing an primitive value (like the `String` above), which I would like to deserialize into `ApiFieldType.Primitive`
* `HA_Type.Ref`, describing a reference to another object through an `id` property, which I would like to deserialize into `ApiFieldType.Ref`

The JSON that is returned by the HTTP API metdata endpoint will then be serialized into an object graph that represents the HTTP API structure Space provides, similar to:

```
public class ApiEndpoint
{
    [JsonPropertyName("method")]
    public ApiMethod Method { get; set; }
    
    [JsonPropertyName("path")]
    public string Path { get; set; }
    
    [JsonPropertyName("responseBody")]
    [JsonConverter(typeof(ApiFieldTypeConverter))]
    public ApiFieldType? ResponseBody { get; set; }
    
    // ...
}
```

`ApiEndpoint` here describes the HTTP method to use, the path to send a request to, and the `ApiFieldType` that will be returned (which can describe an array, a primitove value, an object, and so on).

Notice the line that says `[JsonConverter(typeof(ApiFieldTypeConverter))]`? That's what we want to create: a custom JSON converter for `System.Text.Json` that deserializes the JSON metadata into a concrete class.

## Building a custom `JsonConverter`

Kudos to the Microsoft Docs team for providing [an example of polymorphic deserialization](https://docs.microsoft.com/en-us/dotnet/standard/serialization/system-text-json-converters-how-to#support-polymorphic-deserialization)! This example supports deserializing a type hierarchy of `Customer|Employee : Person`. However, the example `JsonConverter` is really built around the shape of those `Customer` and `Employee` types. If a third child class needs to be supported, there's a lot of work that needs to happen...

Let's try something more generic! The custom `JsonConverter` will:

* contain a type map (a dictionary of supported types);
* support deserializing any type specified in that type map.

Before we start, a quick side note... Remember where I mentioned `className`, and that it holds the type information I can deserialize into? Allowing a JSON payload to specify its own type information is a [common source of vulnerabilities in web applications](https://www.owasp.org/images/d/d7/Marshaller_Deserialization_Attacks.pdf.pdf). In our case here, this doesn't really matter too much, as we own both the API code as well as the code generator, but if you are reading this blog post you may be in a different situation. Using a type map that lists just those types we want to allow deserializing into, will reduce the risk of unsafe deserialization. Don't blindly trust type information provided in the JSON payload!

With that out of the way, let's start. A `JsonConverter`, or more specifically, a `JsonConverter<T>`, should implement three methods:

```
// Can the typeToConvert be (de)serialized by this JsonConverter?
public abstract bool CanConvert(Type typeToConvert);

// Read JSON data into an object
public abstract T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options);

// Write an object into a JSON string
public abstract void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options);
```

The `ApiFieldTypeConverter` we want to build will look like this:

```
public class ApiFieldTypeConverter : JsonConverter<ApiFieldType>
{
    // Any child type of ApiFieldType can be deserialized
    public override bool CanConvert(Type objectType) => typeof(ApiFieldType).IsAssignableFrom(objectType);

    // We'll get to this one in a bit...
    public override ApiFieldType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // ...
    }

    public override void Write(Utf8JsonWriter writer, ApiFieldType value, JsonSerializerOptions options)
    {
        // No need for this one in our use case, but to just dump the object into JSON
        // (without having the className property!), we can do this:
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
    }
}
```

The interesting method for us will be `Read()`. In it, we want to do a couple of things:

* check for `null` values;
* read the `className` from our JSON document;
* see if that class can be deserialized or not;
* deserialize it.

Regarding *"see if that class can be deserialized or not"*: this is the type map I mentioned earlier. A simple dictionary which lists the mapping between `className` and the concrete type we want to deserialize into:

```
private static readonly Dictionary<string, Type> TypeMap = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase)
{
    { "HA_Type.Array", typeof(ApiFieldType.Array) },
    { "HA_Type.Dto", typeof(ApiFieldType.Dto) },
    { "HA_Type.Enum", typeof(ApiFieldType.Enum) },
    { "HA_Type.Object", typeof(ApiFieldType.Object) },
    { "HA_Type.Primitive", typeof(ApiFieldType.Primitive) },
    { "HA_Type.Ref", typeof(ApiFieldType.Ref) }
};
```

We can now build our `Read()` method:

```
public override ApiFieldType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
{
    // Check for null values
    if (reader.TokenType == JsonTokenType.Null) return null;
    
    // Copy the current state from reader (it's a struct)
    var readerAtStart = reader;

    // Read the `className` from our JSON document
    using var jsonDocument = JsonDocument.ParseValue(ref reader);
    var jsonObject = jsonDocument.RootElement;

    var className = jsonObject.GetStringValue("className");
    
    // See if that class can be deserialized or not
    if (!string.IsNullOrEmpty(className) && TypeMap.TryGetValue(className, out var targetType))
    {
        // Deserialize it
        return JsonSerializer.Deserialize(ref readerAtStart, targetType, options) as ApiFieldType;
    }
    
    throw new NotSupportedException($"{className ?? "<unknown>"} can not be deserialized");
}
```

As I mentioned, the example in the Microsoft docs is too complex for our scenario. We have type information, and the default JSON (de)serializer can deserialize objects for us. So, instead of manually deserializing every property, we can call into the `JsonSerializer.Deserialize()` method:

```
return JsonSerializer.Deserialize(ref readerAtStart, targetType, options) as ApiFieldType;
```

Now, you may be wondering why I'm using `readerAtStart` instead of `reader`... The `Utf8JsonReader` is consumed at some point: `JsonDocument.ParseValue(ref reader)` will change its inner state.

What's nice is that `Utf8JsonReader` is a struct (allocated on the stack), so assigning it to a new variable essentially copies its state at that point. We will be able to deserialize the entire JSON object from that copy.

## Testing a custom `JsonConverter`

We could write some tests for our custom `JsonConverter` as well, to see if our logic works. To do so, we will need to create a JSON string and try deserializing it using our newly created `ApiFieldTypeConverter`:

```
[Fact]
public void ReadKnownValuesTests()
{
    // Arrange
    var json = "{\"className\":\"HA_Type.Primitive\",\"primitive\":\"String\",\"nullable\":true,\"optional\":false}";
    var target = new ApiFieldTypeConverter();
    
    // Act
    ApiFieldType result = null;
    var utf8JsonBytes = Encoding.UTF8.GetBytes(json);
    var reader = new Utf8JsonReader(utf8JsonBytes, true, new JsonReaderState());
    while (reader.Read())
    {
        result = target.Read(ref reader, typeof(ApiFieldType), new JsonSerializerOptions());
    }
        
    // Assert
    Assert.IsType<ApiFieldType.Primitive>(result);
    
    var primitiveResult = result as ApiFieldType.Primitive;
    Assert.Equal("String", primitiveResult?.Type);
    Assert.True(primitiveResult?.Nullable);
    Assert.False(primitiveResult?.Optional);
}
```

And yes, it passes:

![JsonConverter test in Rider](/images/2020/01/rider-json-deserializer-test.png)

Enjoy!