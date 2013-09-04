
var ResultType = require('result-type')
var nextTick = require('next-tick')
var inherit = require('inherit')

module.exports = Result

inherit(Result, ResultType)

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
		var deps = this._onValue
		var i = 0
		if (deps) while (i < deps.length) {
			run(deps[i++], value)
		}
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
		this.reason = reason
		var deps = this._onError
		var i = 0
		if (deps) while (i < deps.length) {
			run(deps[i++], reason)
		}
	}
	return this
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
			if (onValue) listen.call(this, '_onValue', onValue)
			if (onError) listen.call(this, '_onError', onError)
			break
		case 'done':
			onValue(this.value)
			break
		case 'fail':
			onError(this.reason)
	}
	return this
}

/**
 * add a listener
 *
 * @param {String} prop
 * @param {Function} fn
 * @api private
 */

function listen(prop, fn){
	if (this[prop]) this[prop].push(fn)
	else this[prop] = [fn]
}

/**
 * run `fn` and ensure any errors it throws
 * aren't caught by anyone and therefore
 * cause the process to crash. Errors should
 * be caught _within_ handlers
 *
 * @param {Function} fn
 * @param {Any} value
 * @api private
 */

function run(fn, value){
	try { fn(value) }
	catch (e) {
		nextTick(function(e){ throw e })
	}
}