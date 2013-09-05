
var ResultType = require('result-type')
var nextTick = require('next-tick')
var inherit = require('inherit')

module.exports = exports = Result
exports.addListener = listen

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
		this._onValue && run(this, this._onValue)
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
		this._onError && run(this, this._onError)
	}
	return this
}

/**
 * dispatch to `runFn` on the type of `fns`
 *
 * @param {Function} fns
 * @param {ctx} Result
 * @api private
 */

function run(ctx, fns){
	if (typeof fns == 'function') runFn(ctx, fns)
	else for (var i = 0, len = fns.length; i < len;) {
		runFn(ctx, fns[i++])
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
 * @param {Result} ctx
 * @api private
 */

function runFn(ctx, fn){
	try { fn.call(ctx, ctx.value) }
	catch (e) { nextTick(function(){ throw e}) }
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
			onValue && listen(this, '_onValue', onValue)
			onError && listen(this, '_onError', onError)
			break
		case 'done':
			onValue && runFn(this, onValue)
			break
		case 'fail':
			if (onError) runFn(this, onError)
			else thro(this.value)
			break
	}
	return this
}

function thro(error){
	nextTick(function(){ throw error })
}

/**
 * add a listener
 *
 * @param {Result} obj
 * @param {String} prop
 * @param {Function} fn
 * @api public
 */

function listen(obj, prop, fn){
	var fns = obj[prop]
	if (!fns) obj[prop] = fn
	else if (typeof fns == 'function') obj[prop] = [fns, fn]
	else obj[prop].push(fn)
}