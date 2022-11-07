const pullingTimeout = 100;
async function poolUntil ( target, getter ) {
  return new Promise( ( resolve ) => {
    setTimeout( async () => {
      if ( target == getter() ) {
        resolve();
      } else {
        resolve( await poolUntil( target, getter ) );
      }
      return;
    }, pullingTimeout );
    return;
  });
}
module.exports.poolUntil = poolUntil;