
$(function(){
	// prevent click event to fire twice
	
	var threshold = 10,
		timeout = 500,
		coords = [];

	function popCoords()
	{
		coords.splice(0, 1);
	}

	function wrap(fn)
	{
		return function(e) {
			for (var i in coords)
			{
				if (Math.abs(e.clientX - coords[i][0]) < threshold && Math.abs(e.clientY - coords[i][1]) < threshold)
				{
					//e.stopPropagation();
					//e.preventDefault();
					return;
				}
			}

			coords.push([e.clientX, e.clientY]);
			setTimeout(popCoords, timeout);

			return fn.apply(this, arguments);
		};
	}

	$.fn.click = function() {
		arguments[0] = wrap(arguments[0]);
        $.fn.tap.apply(this, arguments);
        $.fn.swipe.apply(this, arguments);
		return this;
	};
    $.event.special.swipe.horizontalDistanceThreshold = 1;
    
	$.extend($.expr[':'],{
	    inView: function(a) {
	        var st = (document.documentElement.scrollTop || document.body.scrollTop),
	            ot = $(a).offset().top,
	            wh = (window.innerHeight && window.innerHeight < $(window).height()) ? window.innerHeight : $(window).height();
	        return ot > st && ($(a).height() + ot) < (st + wh);
	    }
	});
	
	var initModules = function(){
			
		loginModule.initialize();
		$.mobile.defaultPageTransition='none';
		$.support.cors = true;
		$.mobile.allowCrossDomainPages = true;
		
		menuModule.initialize();	
		errorModule.initialize();	
		ajprod1Module.initialize();	
		ajprod2Module.initialize();
		ajprod3Module.initialize();
		ajprod4Module.initialize();
		ajprod5Module.initialize();
        inventairesModule.initialize();
        consultationModule.initialize();
	
		uploadModule.initialize();  	
		venteModule.initialize();
		statModule.initialize();
	
		$('form').submit(function(){return false;});
		$.mobile.changePage('#login');
	};
	if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
		document.addEventListener("deviceready", initModules, false);
	} else {
		initModules(); //this is the browser
	}
});