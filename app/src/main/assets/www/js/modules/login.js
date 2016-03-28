var loginModule = function(mediator){

	var domElements={},
		password='',
		passwordOrder='';

	var startStructure = function(){
		mediator.dataStore.getStructureProduits(function(structureProduits){
			mediator.data.structureProduits = structureProduits;
			mediator.publish('structureProduitsChange');
			mediator.publish('refreshInventaires');
			mediator.publish('loginSuccess');					
		});
		mediator.dataStore.getListeProvenances(function(listeProvenances){
			mediator.data.listeProvenances = listeProvenances;
			mediator.publish('listeProvenancesChange');		
		});
	};
	
	var initialize = function(){
		requestDomElements();
		bindEvents();
		mediator.dataStore.getAppActive(function(isAppActive){
			if (isAppActive){
				mediator.dataStore.checkUtilisateurLogged(function(isLogged){
					if(isLogged) { 
						if(undefined === mediator.data.utilisateur)mediator.data.utilisateur={};
						mediator.data.utilisateur.login = isLogged;
						mediator.dataStore.getUtilisateur(mediator.data.utilisateur.login,function(utilisateur){			
		    				mediator.data.utilisateur = utilisateur;
		    				mediator.publish('utilisateurChange');		
						});	
						mediator.dataStore.getVersionConnue(mediator.data.utilisateur.login,function(versionConnue){
							startStructure();
						});
						$.mobile.changePage('#menu'); 
					} else {
						domElements.loginTextAvantCle.hide();
						domElements.loginTextApresCle.show();
					}
				});		
			}
			else{
				domElements.loginTextAvantCle.show();
				domElements.loginTextApresCle.hide();
			}
		});
	};
	
	var requestDomElements = function(){
		domElements = {
			pageLogin:$('#login'),
			loginInput: $('#login-input'),
			keyInput: $('#login-key-input'),
			loginSubmit: $('#login-submit'),
			changeUser: $('#password-change-user'),
			nomUtilisateur: $('#password-nom-utilisateur'),
			nomVendeur: $('#password-nom-vendeur'),
			passwordSubmit: $('#password-submit'),
			passwordReset: $('#password-reset'),
			passwordInput: $('#password-input'),
			passwordImagesBlock: $('#password-images'),
			loginTextAvantCle:$('#login-text-avant-cle'),
			loginTextApresCle:$('#login-text-apres-cle')
		}
	};
	
	var bindEvents = function(){
		domElements.loginSubmit.click(onLoginSubmitClick);
		domElements.changeUser.click(onChangeUserClick);
		domElements.passwordSubmit.click(onPasswordSubmitClick);
		domElements.passwordReset.click(onPasswordResetClick);
		mediator.subscribe('utilisateurChange',onUtilisateurChange);
		mediator.subscribe('deconnect',onChangeUserClick);
	};
	
	var onLoginSubmitClick = function(){
		mediator.data.isConnected = mediator.deviceHandler.isConnected();
		if(undefined === mediator.data.utilisateur)mediator.data.utilisateur={};
		if(domElements.loginInput.val().length >= 3){
			mediator.data.utilisateur.login = domElements.loginInput.val();
			var cle = domElements.keyInput.val();			
			mediator.publish('utilisateurChange');
			if(mediator.data.isConnected){
				var onSuccess = function(result){
					domElements.loginSubmit.removeClass('ui-disabled');	
					mediator.data.isConnected = true;				
					mediator.data.utilisateur.nomVendeur = result.nomVendeur;
					mediator.data.utilisateur.tabNumeros = result.tabNumeros;					
					mediator.data.token = result.token;					
					mediator.publish('utilisateurChange');
					
					initPassword(result.tabNumeros);
					
					$.mobile.changePage('#password');
					

					mediator.dataStore.storeAppActive();
				};				
				var onError = function(error){
					domElements.loginSubmit.removeClass('ui-disabled');
					if('not_connected' === error){
						mediator.data.isConnected = false;
					}
					else if(undefined !== error && undefined !== error.etat && '-3' === error.etat){
						domElements.keyInput.show();
					} else {
						mediator.publish('error',error)
					}
				};
				var params = {
					login:mediator.data.utilisateur.login,
					idDevice:mediator.deviceHandler.getIdDevice(),
					cleActivation:cle
				};
				domElements.loginSubmit.addClass('ui-disabled');
				mediator.services.call('login-step1',params,onSuccess,onError);
			}
			
			if(!mediator.data.isConnected){
				mediator.data.token = '';				
				mediator.dataStore.getUtilisateur(mediator.data.utilisateur.login,function(utilisateur){			
    				mediator.data.utilisateur = utilisateur;		
					mediator.publish('utilisateurChange');
					if(mediator.data.utilisateur){
						passwordHash = mediator.data.utilisateur.passwordHash;
						initPassword();
						$.mobile.changePage('#password');
					}else{
						mediator.publish('error','Aucune connexion détectée. Celle-ci est nécessaire pour la première identification.');
					}
				});		
			}
		} else {
			mediator.publish('error','Veuillez saisir un login valide');
		}
	};
	
	var onChangeUserClick = function(goToPassword){
		if(goToPassword === true){
			domElements.loginInput.val(mediator.data.utilisateur.login);
			domElements.loginSubmit.click();
		}else{
			domElements.loginInput.val('');
			mediator.data = mediator.defaultData;
			$.mobile.changePage('#login');
			mediator.publish('utilisateurChange');
			mediator.publish('structureProduitsChange');
			mediator.publish('listeProvenancesChange');
		}
	};
	
	var onPasswordSubmitClick = function(){
		if(mediator.data.isConnected){
			domElements.passwordSubmit.addClass('ui-disabled');
			mediator.dataStore.getVersionConnue(mediator.data.utilisateur.login,function(versionConnue){
				var onSuccess = function(result){
					domElements.passwordSubmit.removeClass('ui-disabled');
					
					mediator.data.utilisateur.estTTC = result.estTTC;
					mediator.data.utilisateur.hashPass = result.hashPass;
					mediator.data.utilisateur.civilite = result.civilite;
					mediator.data.utilisateur.nom = result.nom;
					mediator.data.utilisateur.idClient = result.idSite;//On utilisait idClient
                    mediator.data.utilisateur.modalitesPaiement = result.modalitesPaiement;
                    mediator.data.utilisateur.email = result.email;
                    mediator.data.utilisateur.idSite = result.idSite;
					
					mediator.data.listeProvenances = result.listeProvenances;
					mediator.data.structureProduits = result.structureProduits;
					
					mediator.data.versionStructure = result.versionStructure;					

					mediator.dataStore.storeStructureProduits(mediator.data.structureProduits);
					mediator.publish('structureProduitsChange');
					
					mediator.dataStore.storeUtilisateur(mediator.data.utilisateur);
					mediator.publish('utilisateurChange');								
					
					mediator.dataStore.storeListeProvenances(mediator.data.listeProvenances);
					mediator.publish('listeProvenancesChange');									
					
					mediator.dataStore.changeIdClient(mediator.data.utilisateur);
					
					mediator.publish('refreshInventaires');
					
					mediator.publish('loginSuccess');
				}
				
				var params = {
					login:mediator.data.utilisateur.login,
					password:passwordOrder,
					token:mediator.data.token,
					versionStructure:versionConnue
				};
				
				var onError = function(e){
					domElements.passwordSubmit.removeClass('ui-disabled');
					onPasswordResetClick();
					mediator.publish('error',e);
				};
				
				mediator.services.call('login-step2',params,onSuccess,onError);
			})
		} else {	
			if(MD5(password + 'df4SDF4Fxdfgf78') === mediator.data.utilisateur.hashPass){
				startStructure();
			} else {
				mediator.publish('error','Mot de passe incorrect');
			}
		}
		return false;
	};
	
	var onPasswordResetClick = function(){
		domElements.passwordInput.val('');
		password = '';
		passwordOrder = '';
	};	
	
	var onUtilisateurChange = function(){
		domElements.keyInput.val('').hide();
		if(undefined !== mediator.data.utilisateur){
			domElements.nomUtilisateur.text(mediator.data.utilisateur.login);
			domElements.nomVendeur.text(mediator.data.utilisateur.nomVendeur);
		} else {
			domElements.nomUtilisateur.text('');
			domElements.nomVendeur.text('');
		}
	}
	
	var initPassword = function(tabNumeros){
		onPasswordResetClick();
		if(undefined === tabNumeros){
			tabNumeros = [];
			var chiffre;
			while(tabNumeros.length < 10){
				chiffre = Math.floor((Math.random()*10)); 
				if (tabNumeros.lastIndexOf(chiffre) === -1){
					tabNumeros.push(chiffre);
				}
			}
		}
		
		$('#password-images img').remove();	
		
		for (var i=0;i<10;i++){
			domElements.passwordImagesBlock.append(
				$('<img>').attr('src','images/login/'+tabNumeros[i]+'.gif')
						.click(function(j){
								return function(){
									if(navigator.notification)
										navigator.notification.vibrate(200);
									domElements.passwordInput.val(domElements.passwordInput.val() + '*');
									passwordOrder = passwordOrder.concat(j);
									password = password.concat(tabNumeros[j]);
							}}(i))
			);
		}
	};
	
	return {
		initialize : initialize
	};
}(mediator);