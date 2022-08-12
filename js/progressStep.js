const styleAwaitTime = 250;
function ProgressCircle ( id ) {
  let body  = document.getElementById( id );
  let state = 'empty';
  let self  = this;
  this.setSuccess = function () {   
    body.classList.add( "success" );
    body.innerHTML = '<i class="fa-solid fa-check"></i>';
    state = "seccess";
    return;
  }
  this.setError   = function () {
    body.classList.add( "error" );
    body.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    state = "error";
    return;
  }
  this.setWarning = function () {
    body.classList.add( "warning" );
    body.innerHTML = '<i class="fa-solid fa-question"></i>';
    state = "warning";
    return;
  }
  this.setLoading = function () {
    body.classList.add( "loading" );
    body.innerHTML = '<i class="fa-solid fa-spinner"></i>';
    state = "loading";
    return;
  }
  this.setState = function ( newState ) {
    if ( self.getState() != newState ) {
      self.clean();
      switch ( newState ) {
        case 'success':
          self.setSuccess();
          break;
        case 'error':
          self.setError();
          break;
        case 'warning':
          self.setWarning();
          break;  
        case 'loading':
          self.setLoading();
          break;
        default:
          break;      
      }
    }
    return;
  }
  this.clean = function () {
    body.classList.remove( "success" );
    body.classList.remove( "error" );
    body.classList.remove( "loading" );
    body.classList.remove( "warning" );
    body.innerHTML = '';
    state = "empty";
    return;
  }
  this.getState = function () {
    return state;
  }
  return;
}

function ProgressStep ( id ) {
  let self    = this;
  let current = 0;
  let circles = [];
  let line    = null;
  let body    = document.getElementById( id );

  this.next = async function () {
    return new Promise( async function ( resolve ) {
      if ( current < circles.length ) {
        current++;
        await update();
      }
      resolve();
    });
  }
  this.clean = async function () {
    return new Promise( async function ( resolve ) {
      current = 0;
      circles.forEach( function ( circle ) {
        circle.clean();
      });
      await update();
      resolve();
    });
    return;
  }
  this.setSeccess = async function () {
    return new Promise( async function ( resolve ) {
      circles[current].setState( 'success' );
      setTimeout( function () {
        resolve();
      }, styleAwaitTime );
    });
  }
  this.setError = async function () {
    return new Promise( async function ( resolve ) {
      circles[current].setState( 'error' );
      setTimeout( function () {
        resolve();
      }, styleAwaitTime );
    });
  }
  this.setWarning = async function () {
    return new Promise( async function ( resolve ) {
      circles[current].setState( 'warning' );
      setTimeout( function () {
        resolve();
      }, styleAwaitTime );
    });
  }
  this.setLoading = async function () {
    return new Promise( async function ( resolve ) {
      circles[current].setState( 'loading' );
      setTimeout( function () {
        resolve();
      }, styleAwaitTime );
    });
  }
  async function update () {
    return new Promise( async function ( resolve ) {
      let length = ( current / ( circles.length - 1 ) ) * 100;
      if ( length > 0 ) {
        length = length - 1;
      }
      line.style.width = length + "%";
      resolve();
    });
  }
  function init () {
    for ( var i=0; i<body.children.length; i++ ){
      if ( body.children[i].className == 'progress-stage' ) {
        for ( var j=0; j<body.children[i].children.length; j++ ) {
          if ( body.children[i].children[j].className == 'circle' ) {
            circles.push( new ProgressCircle( body.children[i].children[j].id ) );
          }
        }
      } else if ( body.children[i].className == 'progress' ) {
        line = document.getElementById( body.children[i].id );
      }
    };
    return;
  }
  init();
  return;
}
module.exports.ProgressStep = ProgressStep;