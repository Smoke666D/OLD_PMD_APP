const pullingTimeout = 100;
async function poolUntil ( target, getter ) {
  return new Promise( function ( resolve ) {
    setTimeout( async function () {
      if ( target == getter() ) {
        resolve();
      } else {
        resolve( await poolUntil( target, getter ) );
      }
    }, pullingTimeout );
  });
}
module.exports.poolUntil = poolUntil;