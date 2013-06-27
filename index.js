
var ResultType = require('result-type')
  , inherit = require('inherit')

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
			deps[i++](value)
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
			deps[i++](reason)
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
