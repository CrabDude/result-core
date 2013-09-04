
var onCrash = require('on-crash')
var chai = require('./chai')

module.exports = function(Result){
	describe('result-core', function(){
		var result
		var spy
		beforeEach(function(){
			result = new Result
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

			it('should not be affected by errors in readers', function(done){
				var title = this.test.title;
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

			it('should be affected by errors in readers', function(){
				var title = this.test.title;
				(function(){
					result.write(5).read(function(){
						throw new Error(title)
					})
				}).should.throw(title)
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

			it('should be affected by errors in readers', function(){
				var title = this.test.title;
				(function(){
					result.error(5).read(null, function(){
						throw new Error(title)
					})
				}).should.throw(title)
			})
		})
	})
}