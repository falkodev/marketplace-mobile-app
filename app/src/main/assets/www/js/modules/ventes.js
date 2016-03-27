
var venteModule = function(mediator){
	var min=0;
	var max=5;
	var pas=10;
	var clearCache=true;
	var domElements={};
		
	var initialize = function(){
		requestDomElements();
		bindEvents();
	};
	
	var requestDomElements = function(){
		domElements = {
			pageVente:$('#ventes'),
			listeVentes:$('#ventes-listview'),
			plus:$('#ventes-plus'),
			editProduit:$('.ventes-edit-produit'),
			filterButton:$('#ventes-filter-button'),
			filter:$('#ventes-filter'),
			filterItems:$('#ventes-filter input.hasDatepicker, #ventes-filter select'),
			categorie:$('#ventes-categorie'),
			etat:$('#ventes-etat'),
			fin:$('#ventes-fin'),
			debut:$('#ventes-debut'),
			affichage:$('#ventes-affichage'),			
			reset:$('.ventes-reset')
		}
	};
	
	var bindEvents = function(){
		mediator.subscribe('structureProduitsChange',onStructureProduitsChange);
		domElements.pageVente.bind('pageshow',onShow);
		$(window).bind('scrollstop',onScroll);
		domElements.plus.click(onBoutonPlusProduitClick);
		domElements.filterButton.click(onFilterButtonClick);
		domElements.filterItems.change(onFilterChange);
		domElements.reset.click(onResetClick);
	};
	
	var onStructureProduitsChange = function(){		
		domElements.categorie.empty();
		$('<option>').attr('value','').text('').appendTo(domElements.categorie);
		if(undefined !== mediator.data.structureProduits){
			$.each(mediator.data.structureProduits,function(i,categorieParent){
				$('<option>').attr('value',categorieParent.id).text(categorieParent.libelle).appendTo(domElements.categorie);
			})
		}
		if(domElements.categorie.attr('tabindex') < 0) domElements.categorie.selectmenu('refresh');		
	}
	
	var getProduits = function(clearCache){
		var filtre = {};
		var val;
		if(val = domElements.etat.val())
			filtre.etatVente = val;
		if(val = domElements.fin.val())
			filtre.dateFinEnchere = val;
		if(val = domElements.debut.val())
			filtre.dateDebutEnchere = val;
		if(val = domElements.categorie.val())
			filtre.idCategorie = val;
		var params = {
			login: mediator.data.utilisateur.login,
			token: mediator.data.token,
			clearCache : clearCache,
			tabFiltre: filtre,
			limits: { valeurMin: min, valeurMax: max}
		};	                       
		mediator.services.call('get-produits',params,onGetProduitsSuccess,onError); 
	}
	
	var onShow = function(){
		domElements.plus.show();
		min=0;
		max=5;
		domElements.listeVentes.empty();
		getProduits(true);
	}
	
	var onBoutonPlusProduitClick = function(){
		min = max;
		max += pas;
		getProduits(false);
	}
	
	var onGetProduitsSuccess = function(response) {
		if(0 === response.listeProduits.length && 0 === domElements.listeVentes.find('li').length){
			domElements.listeVentes.html('<br/>&nbsp;&nbsp;Aucun produit.<br/><br/>');
		}
		for(i=0; i<response.listeProduits.length; i++){
			var p = response.listeProduits[i];
			var url = (p.urlImage ? ('http://' + p.urlImage ) : 'images/aucune_image_petit.gif');
			$('<li>').attr('data-idprod',p.id)
				.append($('<div class="ui-grid-b">')
					.append($('<div class="ui-block-a">')
						.append($('<img>').attr('src',url))
					)					
					.append($('<div class="ui-block-b">')
						.append($('<h3>').text(p.libelleProduit))
						.append($('<p>').text((p.prixActuel || 0) + ' €'))
						.append($('<p>').text('Fin de vente : ' + p.dateFinEnchere))
					)					
					.append($('<div class="ui-block-c">')
							.append($('<div data-role="controlgroup">')
								.append($('<a class="ventes-edit-produit" data-icon="arrow-r" data-mini="true">').text('Modifier').button().click(onEditProduitClick))
								.controlgroup()
							)
					)
					).appendTo(domElements.listeVentes);
		}
		if(response.listeProduits.length === 0){
			domElements.plus.hide();
		}
       	domElements.listeVentes.listview('refresh');
		onScroll();
	};	

	var onEditProduitClick = function(){
		var idProd = $(this).closest('li').attr('data-idprod');
		var params = {
			login: mediator.data.utilisateur.login,
			token: mediator.data.token,
			idProduit: idProd
		};	                       
	    mediator.services.call('get-produit',params,onGetProduitSuccess,onError);
	};
	
	var onGetProduitSuccess = function(retourWs){
		var parseDate = function(txt){
			var r = /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{1,2}):\d{1,2}$/.exec(txt);
			if(r)
				return new Date(r[3],r[2]-1,r[1],r[4],r[5]);
			return null;
		}
		retourWs.produit.idDistant = retourWs.produit.id;
		retourWs.produit.id = undefined;
		retourWs.produit.descriptifsCommuns.dateDebutEnchere = parseDate(retourWs.produit.descriptifsCommuns.dateDebutEnchere);
		retourWs.produit.descriptifsCommuns.dateFinEnchere =parseDate(retourWs.produit.descriptifsCommuns.dateFinEnchere);
		mediator.data.produitCourant = retourWs.produit;
		mediator.publish('produitCourantChange');
		$.mobile.changePage('#ajprod1');
	};
	
	var onScroll = function(){
		if(domElements.pageVente.is(':visible')){
			if(domElements.plus.is(':inView')){
				domElements.plus.click();
			}
		}
	}
	
	var onError = function(error) {
		domElements.plus.hide();
		mediator.publish('error',error);
	}
	
	var onFilterButtonClick = function(){
		domElements.filter.toggle();
	}
	var onFilterChange = function(){
		onShow();
	}
	var onResetClick = function(){
		$(this).parent().find('input').val('').change();
	}
	
	return {
		initialize : initialize
	};
	

	
}(mediator);
