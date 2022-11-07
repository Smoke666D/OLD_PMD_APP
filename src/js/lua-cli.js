function LuaCli ( id ) {
  let cli     = document.getElementById( id );
  let current = null;
  this.newLine = ( text, style=null ) => {
    let p   = document.createElement( 'p' );
    current = p;
    p.innerText = text;
    p.className = style;
    cli.appendChild( p );
    return;
  }
  this.add = ( text, style=null ) => {
    current.innerText += text;
    current.className = style;
    return;
  }
  this.clean = () => {
    cli.innerHTML = '';
    return;
  }
}
module.exports.LuaCli = LuaCli;