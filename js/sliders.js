function sliderInit() {
	var i=0;
	selectors  = document.getElementsByClassName( 'custom-select' );
	checkboxes = document.getElementsByClassName( 'check-input' );
	s_sinputs  = document.getElementsByClassName( 's-sinput' );
	s_sliders  = document.getElementsByClassName( 's-slider' );

	for ( i=0; i<s_sliders.length; i++ ) {
		s_sinputs[i].disabled = true;
		noUiSlider.create( s_sliders[i], {
			start: [20],
			keyboardSupport: false,
			tooltips: true,
			connect: [true, false],
			padding: 0,
			range: {
				'min': 0,
				'max': 100
			},
		})
		s_sliders[i].noUiSlider.on( 'update', ( function() {
			var j=i;
			return function() {
				s_sinputs[j].value = parseFloat( s_sliders[j].noUiSlider.get() ).toFixed( calcFracLength( s_sinputs[j].step ) );
			}
		})() );
		s_sinputs[i].addEventListener( 'change', ( function() {
			var j = i;
			return function() {
	    	s_sliders[j].noUiSlider.set( [s_sinputs[j].value] );
			}
		})());
		s_sliders[i].setAttribute( 'disabled', false );
	}
	return;
}