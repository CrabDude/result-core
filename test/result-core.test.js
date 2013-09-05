
var onCrash = require('on-crash')
var chai = require('./chai')
var Result = require('..')

describe('Result-core', function(){
	var result
	var spy
	var failed
	var value
	var error
	var test = 1

	beforeEach(function(){
		result = new Result
		error = new Error('from test #' + test++)
		failed = new Result
		failed.state = 'fail'
		failed.value = error
		value = new Result
		value.state = 'done'
		value.value = 1
		spy = chai.spy()
	})

	describe('pending state', function(){
		it('should deliver its eventual value to readers', function(){
			result.read(function(val){
				val.should.equal(5)
				spy()
			}).write(5)
			spy.should.have.been.called(1)
		})

		it('should deliver its eventual rejection to readers', function(){
			var title = this.test.title
			result.read(null, function(e){
				e.should.have.property('message', title)
				spy()
			}).error(new Error(title))
			spy.should.have.been.called(1)
		})

		it('should call readers in the order they were added', function(){
			var calls = 0
			result.read(function(val){
				(calls++).should.equal(0)
				val.should.equal(5)
			}).read(function(val){
				(calls++).should.equal(1)
				val.should.equal(5)
			}).write(5)
			calls.should.equal(2)
		})

		it('should call readers added from within a reader immediatly', function(){
			result.read(function(){
				spy.should.not.have.been.called(1)
				result.read(function(){
					spy.should.not.have.been.called(1)
				})
			}).read(spy)

			result.write()
			spy.should.have.been.called(1)
		})

		it('should call functions in the correct context', function(done){
			result.read(function(){
				result.should.equal(this)
				var fail = new Result
				fail.read(null, function(){
					fail.should.equal(this)
					done()
				}).error(error)
			}).write(1)
		})

		it('should not be affected by errors in readers', function(done){
			var title = this.test.title
			onCrash(done)
			result.read(function(){
				spy.should.not.have.been.called()
				spy()
				throw new Error(title)
			}).read(spy).write()
			spy.should.have.been.called(2)
		})
	})

	describe('done state', function(){
		it('should deliver its cached value to readers', function(){
			result.write(5).read(function(val){
				val.should.equal(5)
				spy()
			})
			spy.should.have.been.called(1)
		})

		it('should call functions in the correct context', function(done){
			value.read(function(){
				value.should.equal(this)
				done()
			})
		})

		it('should not be affected by errors in readers', function(done){
			onCrash(done)
			var title = this.test.title
			try {
				value.read(function(){
					throw new Error(title)
				})
			} catch (e) {
				done(new Error('should not throw sync'))
			}
		})
	})

	describe('fail state', function(){
		it('should deliver its cached reason to readers', function(){
			result.error(5).read(null, function(reason){
				reason.should.equal(5)
				spy()
			})
			spy.should.have.been.called(1)
		})

		it('should call functions in the correct context', function(done){
			failed.read(null, function(){
				failed.should.equal(this)
				done()
			})
		})

		it('should not be affected by errors in readers', function(done){
			var title = this.test.title
			onCrash(done)
			try {
				result.error(5).read(null, function(){
					throw new Error(title)
				})
			} catch (e) {
				done(new Error('should not throw sync'))
			}
		})
	})
})