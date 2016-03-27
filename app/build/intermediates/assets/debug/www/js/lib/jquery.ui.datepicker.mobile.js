/*
* jQuery Mobile Framework : temporary extension to port jQuery UI's datepicker for mobile
* Copyright (c) jQuery Project
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*/
(function($, undefined ) {

	//extend with some dom manipulation to update the markup for jQM
	//call immediately
    $.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
    $.datepicker._updateDatepicker = function(inst) {
        $.datepicker._updateDatepicker_original(inst);
        var afterShow = this._get(inst, 'afterShow');
        if (afterShow)
            afterShow.apply((inst.input ? inst.input[0] : null));  // trigger custom callback
    }
	function updateDatepicker(){
		$( ".ui-datepicker-header" ).addClass("ui-body-c ui-corner-top").removeClass("ui-corner-all");
		$( ".ui-datepicker-prev, .ui-datepicker-next" ).attr("href", "#");
		$( ".ui-datepicker-prev" ).buttonMarkup({iconpos: "notext", icon: "arrow-l", shadow: true, corners: true});
		$( ".ui-datepicker-next" ).buttonMarkup({iconpos: "notext", icon: "arrow-r", shadow: true, corners: true});
		$( ".ui-datepicker-calendar th" ).addClass("ui-bar-c");
		$( ".ui-datepicker-calendar td" ).addClass("ui-body-c");
		$( ".ui-datepicker-calendar a" ).buttonMarkup({corners: false, shadow: false}); 
		$( ".ui-datepicker-calendar a.ui-state-active" ).addClass("ui-btn-active"); // selected date
		$( ".ui-datepicker-calendar a.ui-state-highlight" ).addClass("ui-btn-up-e"); // today"s date
        $( ".ui-datepicker-calendar .ui-btn" ).each(function(){
			var el = $(this);
			// remove extra button markup - necessary for date value to be interpreted correctly
			el.html( el.find( ".ui-btn-text" ).text() ); 
        });
	};
	
	//bind to pagecreate to automatically enhance date inputs	
	$( ".ui-page" ).live( "pagecreate", function(){
		$( "input[data-type='date'], input:jqmData(type='date')" ).each(function(){
			var $this = $(this);
			if($this.next().hasClass('hasDatepicker'))return;
			
			var changing = true;
			$this.datepicker({
				afterShow:updateDatepicker,
				beforeShow:function(){$('select').hide();},
				onClose:function(){$('select').show();}
			}).textinput().attr('readonly',true);
		});	
	});
	$.mobile.page.prototype.options.degradeInputs.date = true;
})( jQuery );