const styleAwaitTime = 250;
function ProgressCircle ( id ) {
  let body  = document.getElementById( id );
  let state = 'empty';
  let self  = this;
  this.setSuccess = () => {   
    body.classList.add( 'success' );
    body.innerHTML = '<i class="fa-solid fa-check"></i>';
    state = 'seccess';
    return;
  }
  this.setError   = () => {
    body.classList.add( 'error' );
    body.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    state = 'error';
    return;
  }
  this.setWarning = () => {
    body.classList.add( 'warning' );
    body.innerHTML = '<i class="fa-solid fa-question"></i>';
    state = 'warning';
    return;
  }
  this.setLoading = () => {
    body.classList.add( 'loading' );
    body.innerHTML = '<i class="fa-solid fa-spinner"></i>';
    state = 'loading';
    return;
  }
  this.setState = ( newState ) => {
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
  this.clean = () => {
    body.classList.remove( 'success' );
    body.classList.remove( 'error' );
    body.classList.remove( 'loading' );
    body.classList.remove( 'warning' );
    body.innerHTML = '';
    state = 'empty';
    return;
  }
  this.getState = () => {
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
  this.next = async () => {
    return new Promise( async ( resolve ) => {
      if ( current < circles.length ) {
        current++;
        await update();
        resolve();
      } else {
        resolve();
      }
    });
  }
  this.clean = async () => {
    return new Promise( async ( resolve ) => {
      current = 0;
      circles.forEach( ( circle ) => {
        circle.clean();
      });
      await update();
      resolve();
    });
    return;
  }
  this.setSeccess = async () => {
    return new Promise( async ( resolve ) => {
      circles[current].setState( 'success' );
      setTimeout( () => {
        resolve();
      }, styleAwaitTime );
    });
  }
  this.setError = async () => {
    return new Promise( async ( resolve ) => {
      circles[current].setState( 'error' );
      setTimeout( () => {
        resolve();
      }, styleAwaitTime );
    });
  }
  this.setWarning = async () => {
    return new Promise( async ( resolve ) => {
      circles[current].setState( 'warning' );
      setTimeout( () => {
        resolve();
      }, styleAwaitTime );
    });
  }
  this.setLoading = async () => {
    return new Promise( async ( resolve ) => {
      circles[current].setState( 'loading' );
      setTimeout( () => {
        resolve();
      }, styleAwaitTime );
    });
  }
  async function update () {
    return new Promise( async ( resolve ) => {
      let length = ( current / ( circles.length - 1 ) ) * 100;
      if ( length > 0 ) {
        length = length - 1;
      }
      line.style.width = length + '%';
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