
# result-core

  Minimal function call reification. This library is designed both to be useful in simple cases and serve as a specification for how alternative implementations should behave. See [result](//github.com/jkroso/result) and [lazy-result](//github.com/jkroso/lazy-result) for examples. Note how they inherit from this class, making them easy to distinguish from other types. No duck typing required. This makes general purpose utilities such as [when](//github.com/jkroso/when) much easier to write.

## Installation

_With [component](//github.com/component/component), [packin](//github.com/jkroso/packin) or [npm](//github.com/isaacs/npm)_  

	$ {package mananger} install jkroso/result-core

then in your app:

```js
var Result = require('result-core')
```

## API

- [Result()](#result)

### Result()

  A class for creating concrete representations of function calls which can be manipulated programmatically at run-time.

```js
function add(a, b){
	var result = new Result
	result.write(a + b)
	return result
}

add(1, 2).read(function(three){
	console.log('1 + 2 = %d', three)
})
```

## FAQ

__Q:__ How the fuck is that useful?  
__A:__ async programming  

## Running the tests

Just run `make`. It will install and start a development server so all you then need to do is point your browser to `localhost:3000/test`. Likewise to run the Koans.
