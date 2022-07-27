let progressStep = new ProgressStep( 'progressStep-container' );

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
        case 'loading':
          self.setLoading();
          break;
        default:
          self.clean();
          break;      
      }
    }
    return;
  }
  this.clean = function () {
    body.classList.remove( "success" );
    body.classList.remove( "error" );
    body.classList.remove( "loading" );
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

  this.next = function () {
    if ( current < circles.length ) {
      current++;
      update();
    }
    return;
  }
  this.clean = function () {
    current = 0;
    circles.forEach( function ( circle ) {
      circle.clean();
    });
    update();
    return;
  }
  this.setSeccess = function () {
    circles[current].setState( 'success' );
    return;
  }
  this.setError = function () {
    circles[current].setState( 'error' );
    return;
  }
  this.setLoading = function () {
    circles[current].setState( 'loading' );
    return;
  }
  function update () {
    let length = ( current / ( circles.length - 1 ) ) * 100;
    if ( length > 0 ) {
      length = length - 1;
    }
    line.style.width = length + "%";
    return;
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