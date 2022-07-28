function LuaCli ( id ) {
  let cli = document.getElementById( id );
  this.add = function ( text ) {
    let p = document.createElement( 'p' );
    p.innerText = '>>' + text;
    cli.appendChild( p );
    return;
  }
  this.clean = function () {
    cli.innerHTML = '';
    return;
  }
}
module.exports.LuaCli = LuaCli;