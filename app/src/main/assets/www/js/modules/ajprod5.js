var ajprod5Module = function(mediator){

	var domElements={};
	
	var initialize = function(){
		requestDomElements();
		bindEvents();
	};
	
	var requestDomElements = function(){
		domElements = {
			inventaire:$('#ajprod5-inventaire'),
			btnTerminer:$('.ajprod5-end'),
			nouvelInventaire:$('#ajprod5-nouvelInventaire'),
			nouvelInventairePopup:$('#ajprod5-nouvelInventairePopup'),
			nouvelInventaireLibelle:$('#ajprod5-nouvelInventaireLibelle'),
			nouvelInventaireValider:$('#ajprod5-nouvelInventaireValider'),
			nouvelInventaireAnnuler:$('#ajprod5-nouvelInventaireAnnuler')
		}
	};
	
	var bindEvents = function(){
		mediator.subscribe('refreshInventaires',onRefreshInventaires);
		mediator.subscribe('produitCourantChange',onProduitCourantChange);
		mediator.subscribe('produitCourantSauvegarde',onTerminerSubmitClick);
		domElements.inventaire.change(onInventaireChange);
		domElements.nouvelInventaireValider.click(onNouvelInventaireValiderClick);
		domElements.nouvelInventaireAnnuler.click(nouvelInventaireHide);
		domElements.btnTerminer.click(onTerminerSubmitClick);
		domElements.nouvelInventaire.click(nouvelInventaireShow);
		$('#ajprod5').bind('pageshow',nouvelInventaireHide);
	};
		
	var nouvelInventaireShow = function(){
		domElements.nouvelInventaireLibelle.val('');
	    domElements.nouvelInventairePopup.show();				
	}
	
	var nouvelInventaireHide = function(){			
	    domElements.nouvelInventairePopup.hide();				
	}
		
	var onRefreshInventaires = function(){
		var onGetInventairesSuccess = function(inventaires){
			domElements.inventaire.empty();
			$('<option>').attr('value','-1').text('Pas d\'inventaire').appendTo(domElements.inventaire);
			for(var i=0; i<inventaires.length; i++){
				var inventaire = inventaires[i];
				$('<option>').attr('value',inventaire.id).text(inventaire.libelle).appendTo(domElements.inventaire);
			}
			domElements.inventaire.selectmenu().selectmenu('refresh');
		}
		mediator.dataStore.getInventaires(mediator.data.utilisateur.idClient,onGetInventairesSuccess);
	};
	
	var onProduitCourantChange = function(){
		if(undefined === mediator.data.produitCourant.idDistant){
			if(mediator.data.produitCourant.idInventaire){
				domElements.inventaire.val(mediator.data.produitCourant.idInventaire);
			}
			domElements.inventaire.removeClass('ui-disabled').selectmenu().selectmenu('refresh');
			domElements.nouvelInventaire.removeClass('ui-disabled');
		} else {
			domElements.inventaire.val('-1').addClass('ui-disabled').selectmenu().selectmenu('refresh');
			domElements.nouvelInventaire.addClass('ui-disabled');
		}
	}
	
	var onInventaireChange = function(){
		var val = domElements.inventaire.val()
		if(val === '-1'){
			mediator.data.produitCourant.idInventaire = null;
		}else{
			mediator.data.produitCourant.idInventaire = val;
		}
	};
	
	var onNouvelInventaireValiderClick = function(){
		var libelle = domElements.nouvelInventaireLibelle.val();
		var onAddInventaireSuccess = function(id){
			//domElements.nouvelInventairePopup.popup('close');
			domElements.nouvelInventairePopup.hide();
			$('<option>').attr('value',id).text(libelle).appendTo(domElements.inventaire);
			domElements.inventaire.val(id);
			domElements.inventaire.selectmenu('refresh');
			onInventaireChange();
		};
		mediator.dataStore.addInventaire(libelle,mediator.data.utilisateur.idClient,onAddInventaireSuccess);
	};
	
	var onTerminerSubmitClick = function(discrete){
	    if(discrete === true){
	        mediator.dataStore.storeProduit(mediator.data.produitCourant);
	        return;
	    }
		if(undefined === mediator.data.produitCourant.idDistant){
			if(undefined === mediator.data.produitCourant.idLocal){
				mediator.dataStore.storeProduit(mediator.data.produitCourant,function(){
					alert('Le produit a été enregistré');
					$.mobile.changePage('#menu');
				});
			} else {
				mediator.dataStore.storeProduit(mediator.data.produitCourant,function(){
					alert('Le produit a été enregistré');
					$.mobile.changePage('#inventaires');
				});
			}
		}
		else{
			mediator.publish('uploadProduit',{
				produit:mediator.data.produitCourant,
				onClose:function(){
					$.mobile.changePage('#ventes');
				}
			});
		}
	};
	var dateToService = function(d){
	    if(d)
	        return d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
	    return "";
	};
	
	return {
		initialize : initialize
	};
}(mediator);