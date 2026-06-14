---
layout: post
title: "Generic arrays in PHP"
pubDatetime: 2007-10-22T01:03:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", "PHP"]
author: Maarten Balliauw
redirect_from:
  - /post/2007/10/22/generic-arrays-in-php.html
---
Assuming everyone knows what [generics](http://en.wikipedia.org/wiki/Generic_programming) are, let's get down to business right away. PHP does not support generics or something similar, though it could be very useful in PHP development.  Luckily, using some standard OO-practises, a semi-generic array can easily be created, even in multiple ways! Here's the road to PHP generics.

# The hard way...

![](/images/20071022-generics-hardway.png)

One of the roads to PHP generics is some simple inheritance and type hinting. Let's have a look at PHP's [ArrayObject](http://nl2.php.net/manual/en/function.ArrayObject-construct.php). This class has 2 interesting methods, namely offsetSet() and append(). This would mean I can simply create a new class which inherits from ArrayObject, and uses type hinting to restrict some additions:

```php
// Example class
class Example {
  public $SomeProperty;
}
// Example class generic ArrayObject
class ExampleArrayObject extends ArrayObject {
  public function append(Example $value) {
    parent::append($value);
  }

  public function offsetSet($index, Example $value) {
    parent::offsetSet($index, $value);
  }
}

// Example additions
$myArray = new ExampleArrayObject();
$myArray->append( new Example() ); // Works fine
$myArray->append( "Some data..." ); // Will throw an Exception!

```

# The flexible way

![](/images/20071022-generics-flexibleway.png) There are some disadvantages to the above solution. For a start, you can't create a generic "string" array unless you encapsulate strings in a specific object type. Same goes for other primitive types. Let's counter this problem! Here's the same code as above using a "GenericArrayObject":

```php
// Example class
class Example {
  public $SomeProperty;
}

// Validation function
function is_class_example($value) {
  return $value instanceof Example;
}

/**
 * Class GenericArrayObject
 *
 * Contains overrides for ArrayObject methods providing generics-like functionality.
 *
 * @author    Maarten Balliauw
 */
class GenericArrayObject extends ArrayObject {
    /**
     * Validation function
     *
     * @var     string
     * @access    private
     */
    private $_validationFunction = '';

    /**
     * Set validation function
     *
     * @param     string    $functionName    Validation function
     * @throws     Exception
     * @access    public
     */
    public function setValidationFunction($functionName = 'is_string') {
        if ($this->_validationFunction == '') {
            $this->_validationFunction = $functionName;
            return;
        }

        $iterator = $this->getIterator();
        while ($iterator->valid()) {
            if (!call_user_func_array($functionName, array($iterator->current()))) {
                throw new Exception("Switching from " . $this->_validationFunction . " to " . $functionName . " is not possible for all elements.");
            }

            $iterator->next();
        }

        $this->_validationFunction = $functionName;
    }

    /**
     * Append
     *
     * @param     mixed    $value
     * @throws     Exception
     * @access    public
     */
    public function append($value) {
        if ($this->_validationFunction == '') {
            throw new Exception("No validation function has been set.");
        }

        if (call_user_func_array($this->_validationFunction, array($value))) {
            parent::append($value);
        } else {
            throw new Exception("Appended type does not meet constraint " . $this->_validationFunction);
        }
    }

    /**
     * offsetSet
     *
     * @param     mixed    $index
     * @param     string    $newval
     * @throws     Exception
     * @access    public
     */
    public function offsetSet($index, $newval) {
        if ($this->_validationFunction == '') {
            throw new Exception("No validation function has been set.");
        }

        if (call_user_func_array($this->_validationFunction, array($newval))) {
            parent::offsetSet($index, $newval);
        } else {
            throw new Exception("Appended type does not meet constraint " . $this->_validationFunction);
        }
    }
}

// Example additions
$myArray = new GenericArrayObject();
$myArray->setValidationFunction('is_class_example');
$myArray->append( new Example() ); // Works fine
$myArray->append( "Some data..." ); // Will throw an Exception!

```

Using this flexible class, you can set a validation function on the GenericArrayObject, which enables you to use PHP's built-in functions like is_string (string-only ArrayObject), is_int, ... You can even write a small validation function which matches a string against a regular expression and for example create an e-mail address ArrayObject rejecting any string that does not match this regular expression.
