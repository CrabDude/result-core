if (typeof window == 'undefined') require('future-node')

/**
 * Hydro configuration
 *
 * @param {Hydro} hydro
 */

module.exports = function(hydro) {
  hydro.set({
    suite: 'result-core',
    timeout: 500,
    plugins: [
      require('hydro-chai'),
      require('hydro-bdd')
    ],
    chai: {
      chai: require('chai'),
      plugins: [ require('chai-spies') ],
      styles: ['should'],
      stack: true
    },
    globals: {
      chai: require('chai')
    }
  })
}
