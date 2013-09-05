
var ResultType = require('result-type')
var nextTick = require('next-tick')
var inherit = require('inherit')

module.exports = Result

/**
 * inherit from ResultType
 */

inherit(Result, ResultType)

/**
 * the result class
 */

function Result(){}

/**
 * default state
 * @type {String}
 */

Result.prototype.state = 'pending'

/**
 * give `this` its value
 *
 * @param {x} value
 * @return {this}
 */

Result.prototype.write = function(value){
	if (this.state == 'pending') {
		this.state = 'done'
		this.value = value
		run(this._onValue, value, this)
	}
	return this
}

/**
 * give `this` its reason for failure
 *
 * @param {x} reason
 * @return {this}
 */

Result.prototype.error = function(reason){
	if (this.state == 'pending') {
		this.state = 'fail'
		this.value = reason
		run(this._onError, reason, this)
	}
	return this
}

/**
 * dispatch to `runFn` on the type of `fns`
 *
 * @param {Function} fns
 * @param {Any} value
 * @param {ctx} Result
 * @api private
 */

function run(fns, value, ctx){
	if (!fns) return
	if (typeof fns == 'function') runFn(fns, value, ctx)
	else for (var i = 0, len = fns.length; i < len;) {
		runFn(fns[i++], value, ctx)
	}
}

/**
 * run `fn` and re-throw any errors with a clean
 * stack to ensure they aren't caught unwittingly.
 * since readers are sometimes run now and sometimes
 * later the following would be non-deterministic
 *
 *   try {
 *     result.read(function(){
 *       throw(new Error('boom'))
 *     })
 *   } catch (e) {
 *     // if result is "done" boom is caught, while
 *     // if result is "pending" it won't be caught
 *   }
 *
 * @param {Function} fn
 * @param {Any} value
 * @param {Result} ctx
 * @api private
 */

function runFn(fn, value, ctx){
	try { fn.call(ctx, value) }
	catch (e) { nextTick(function(){ throw e }) }
}

/**
 * access the result of `this`
 *
 * @param {Function} onValue
 * @param {Function} onError
 * @return {this}
 */

Result.prototype.read = function(onValue, onError){
	switch (this.state) {
		case 'pending':
			if (onValue) listen(this, '_onValue', onValue)
			if (onError) listen(this, '_onError', onError)
			break
		case 'done':
			onValue.call(this, this.value)
			break
		case 'fail':
			onError.call(this, this.value)
	}
	return this
}

/**
 * add a listener
 *
 * @param {Result} obj
 * @param {String} prop
 * @param {Function} fn
 * @api private
 */

function listen(obj, prop, fn){
	var fns = obj[prop]
	if (!fns) obj[prop] = fn
	else if (typeof fns == 'function') obj[prop] = [fns, fn]
	else obj[prop].push(fn)
}