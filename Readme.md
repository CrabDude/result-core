
# result-core

  JavaScript doesn't allow you to spawn new threads. Nore does it allow you to park a thread progamatically. Instead it uses an "event loop", which functions as a sort of work queue. It allows you to request an operation and register a function to be called when its completed. This function is called a "callback" and it provides all the synchronisation we need to compose computations however it leaves our control flow model FUBAR. Normally we think of values and errors as propagating up and down an implicit call stack. When a child computation completes it is returned to its parent frame where it can be passed into other computation frames or simply ignored and allowed to propagate up the stack. Meanwhile, in the "event loop" model values/errors are passed in to the callbacks as arguments which means both that they never become available in the parent context and that they can't just be allowed to propagate. Also without callstack's our error objects are mostly garbage.

  Results are an attempt to re-build the call stack conceptual model back on top of the callback model. The approach they take is to ask you to reify your asynchronous function calls with a Result instance. These instances model a stack frame in that it will eventually be either a successfully computed value or an error. Once you have reified your async function calls with runtime objects you can compose them together and recreate the computation tree that is normally implicit and maintained underneath the runtime. This implementation does nothing to improve the stack traces of your errors but that feature could be added.

## Installation

_With [component](//github.com/component/component), [packin](//github.com/jkroso/packin) or [npm](//github.com/isaacs/npm)_

	$ {package mananger} install jkroso/result-core

then in your app:

```js
var Result = require('result-core')
```

## API

### Result()

  A class for creating concrete representations of function calls which can be manipulated programmatically at run-time.

```js
function add(a, b){
	var result = new Result
	result.write(a + b)
	return result
}

add(1, 2).read(function(n){
	console.log('1 + 2 = %d', n)
})
```

### Result.write(value)

  give `this` its value

### Result.error(reason)

  give `this` its reason for failure

### Result.read([onValue], [onError])

  access the result of `this`

## Running the tests

Just run `make`. It will install and start a development server so all you then need to do is point your browser to `localhost:3000/test`. Likewise to run the Koans.
