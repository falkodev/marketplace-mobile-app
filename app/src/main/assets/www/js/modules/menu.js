var menuModule = function(mediator){

	var domElements={},
		structureProduits=[];
	
	var initialize = function(){
		requestDomElements();
		bindEvents();
	};
	
	var requestDomElements = function(){
		domElements = {
			ajoutProduit: $('#menu-ajouter-produit'),
			nomUtilisateur: $('#menu-nom-utilisateur'),
			deconnectButton: $('#menu-deconnect'),
			ajouterProduit: $('#menu-ajouter-produit'),
			disabledOffLine:$('#menu-ventes,#menu-statistiques')
		}
	};
	
	var bindEvents = function(){
		mediator.subscribe('loginSuccess',onLoginSuccess);
		mediator.subscribe('utilisateurChange',onUtilisateurChange);
		mediator.subscribe('connectivityChange',onConnectivityChange);
		document.addEventListener("online", onConnectivityChange, false);
		document.addEventListener("offline", onConnectivityChange, false);
		domElements.deconnectButton.click(onDeconnectButtonClick);
		domElements.ajouterProduit.click(onAjouterProduitClick);
		


		$(function(){
		    document.addEventListener("deviceready", function(){
			    document.addEventListener("backbutton", function(e){
			        e.preventDefault($.mobile.activePage.attr('id'));
			    	switch($.mobile.activePage.attr('id')){
			    	case 'login':
			    	case 'password':
			    	case 'menu':
			    		navigator.app.exitApp();
			    		break;
			    	case 'consultation':
                        $.mobile.changePage('#inventaires');
                        break;
                    case 'ajprod1':
			    	case 'ajprod2':
			    	case 'ajprod3':
			    	case 'ajprod4':
			    	case 'ajprod5':
			    		if(!confirm('Etes-vous sûr de vouloir quitter la page ?')) return false;
			    	default:
			    		$.mobile.changePage('#menu');
			    	}
			    }, false);
			}, false);
		});
	};
	
	var onConnectivityChange = function(){
		mediator.data.isConnected = mediator.deviceHandler.isConnected();
		domElements.disabledOffLine.toggleClass('ui-disabled',!mediator.data.isConnected);
	}
	
	var onLoginSuccess = function(){
		$.mobile.changePage('#menu');
		onConnectivityChange();
	};
	
	var onUtilisateurChange = function(){
		if(undefined !== mediator.data.utilisateur){
			domElements.nomUtilisateur.text(mediator.data.utilisateur.civilite + ' ' + mediator.data.utilisateur.nom);
		} else {
			domElements.nomUtilisateur.text('');
		}
	};
	
	var onDeconnectButtonClick = function(){
		mediator.dataStore.logoutUtilisateur();
		mediator.publish('deconnect');
	};
	
	var onAjouterProduitClick = function(){
		mediator.data.produitCourant = {};
		mediator.publish('produitCourantChange');
		$.mobile.changePage('#ajprod1');
	}
	
	return {
		initialize : initialize
	};
}(mediator);