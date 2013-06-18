
var Result = require('..')
var result
var spy

beforeEach(function(){
	result = new Result
	spy = chai.spy()
})

describe('making a Result', function () {
	it('its just another class', function () {
		new Result().should.be.an.instanceOf(Result)
	})

	it('should start out pending', function () {
		new Result().state.should.equal('pending')
	})
})

describe('manipulating a Results state', function(){
	describe('for better', function(){
		it('is just a matter of "writing" to it', function(){
			result.write(1)
		})

		it('should change its state', function(){
			result.state.should.equal('pending')
			result.write(1)
			result.state.should.equal('done')
		})
	})
	
	describe('for worse', function(){
		it('is just a matter of "erroring" it', function(){
			result.error(new Error('lame excuse'))
		})

		it('should change its state', function(){
			result.state.should.equal('pending')
			result.error('can be any value')
			result.state.should.equal('fail')
		})
	})
})

describe('reading a Result', function(){
	describe('thats ready to be read', function(){
		it('is done by sending it a function', function(){
			result.write(1)
			result.read(function(value){
				value.should.equal(1)
			})
		})

		it('errors are kept seperate', function(){
			result.error(new Error('fail'))
			result.read(null, function(error){
				error.should.have.property('message', 'fail')
			})
		})
	})

	describe('thats not ready to be read', function(){
		it('is just the same as one that is', function(done){
			result.read(function(value){
				value.should.equal(1)
				done()
			})
			result.write(1)
		})

		it('even order is maintained', function(){
			result.read(function(){
				spy.should.not.have.been.called(1)
				result.read(function(){
					spy.should.not.have.been.called(1)
				})
			}).read(spy)

			result.write()
			spy.should.have.been.called(1)

			result.read(function(){
				spy.should.have.been.called(1)
				result.read(function(){
					spy.should.have.been.called(1)
				})
			}).read(spy)

			spy.should.have.been.called(2)
		})
	})
})