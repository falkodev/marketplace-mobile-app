var customModule = function(mediator){

	var domElements={};
	
	var initialize = function(){
		requestDomElements();
		bindEvents();
	};
	
	var requestDomElements = function(){
		domElements = {
			//element: $('#element-id')
		}
	};
	
	var bindEvents = function(){
		//mediator.subscribe('event',onMediatorEvent);
		//domElements.element.click(onDomEvent)
	};
	
	/*var onMediatorEvent = function(){
	};
	
	var onDomEvent = function(){
		mediator.publish('otherEvent');
	};*/
	
	return {
		initialize : initialize
	};
}(mediator);