var errorModule = function(mediator){
	var initialize = function(){
		mediator.subscribe('error',onError);
	};
	
	var onError = function(error){
		var msg = error;
		
		if(undefined !== error && undefined !== error.etat && '-99' === error.etat){
			mediator.publish('deconnect');
		}
		if('not_connected' === error){
			msg = 'Erreur de connexion à Agorastore.';
			mediator.publish('connectivityChange');
		}
		if('silent' === error){
			return;
		}
		if('SQLError' === error.__proto__.constructor.name){
			msg = 'SQL Error ' + error.code + ' : ' + error.message;
		}
		if(undefined !== error.libelle){
			msg = error.libelle;
		}
		if(undefined === error){
			msg = 'Error !';
		}
		alert(msg);
	}
	
	return {
		initialize:initialize
	}
}(mediator);
