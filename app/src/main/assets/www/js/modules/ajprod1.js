var ajprod1Module = function(mediator){

	var domElements={};
	var loadingProduit = false; 
	
	var initialize = function(){
		requestDomElements();
		bindEvents();
		domElements.header.html($('#header-prod').html());
	};
	
	var requestDomElements = function(){
		domElements = {
			categorieParent:$('#ajprod1-categorie-parent'),
			categorieDiv:$('#ajprod1-categorie-div'),
			categorie:$('#ajprod1-categorie'),
			nextSteps:$('.ajprod1-next-steps'),
			btNext:$('#ajprod1-next'),
			divBtnext:$('#ajprod1-div-next'),
			nextSteps:$('.ajprod1-next-steps'),
			title:$('.ajprod .ui-title h3'),
			header:$('#header-prod1'),
		}
	};
	
	var bindEvents = function(){
		mediator.subscribe('structureProduitsChange',onStructureProduitsChange);
		mediator.subscribe('produitCourantChange',onProduitCourantChange);	
		domElements.categorieParent.change(onCategorieParentChange);
		domElements.categorie.change(onCategorieChange);		
	};
	
	var onStructureProduitsChange = function(){
		domElements.categorieParent.empty();
		$('<option>').attr('value','').text('').appendTo(domElements.categorieParent);
		if(undefined !== mediator.data.structureProduits){
			$.each(mediator.data.structureProduits,function(i,categorieParent){
				$('<option>').attr('value',categorieParent.id).text(categorieParent.libelle).appendTo(domElements.categorieParent);
			})
		}
		if(domElements.categorieParent.attr('tabindex') < 0) domElements.categorieParent.selectmenu('refresh');
		domElements.categorieParent.change();
	}
	
	var onCategorieParentChange = function(){
		domElements.categorie.empty();
		$('<option>').attr('value','').text('').appendTo(domElements.categorie);
		if(undefined !== mediator.data.structureProduits){
			$.each(mediator.data.structureProduits,function(i,categorieParent){
				if(categorieParent.id == domElements.categorieParent.val()){
					$.each(categorieParent.sousCategories,function(i,categorie){
						$('<option>').attr('value',categorie.id).text(categorie.libelle).appendTo(domElements.categorie);
					})
				}
			})
		}
		if(domElements.categorie.attr('tabindex') < 0) domElements.categorie.selectmenu('refresh');
		if(! loadingProduit){
			mediator.data.produitCourant = {};
		}
		mediator.data.produitCourant.idCategorieParent = domElements.categorieParent.val();
		if(mediator.data.produitCourant.idCategorieParent){
			domElements.categorieDiv.show();
		} else {
			domElements.categorieDiv.hide();
		}
		if(! loadingProduit){
			domElements.categorie.change();
		}
	}
	
	var onCategorieChange = function(){
		if(domElements.categorie.val()!==''){
			mediator.data.produitCourant.idCategorie = domElements.categorie.val();
		} else {
			mediator.data.produitCourant.idCategorie = undefined;
		}
		domElements.nextSteps.toggleClass('ui-disabled',! mediator.data.produitCourant.idCategorie)
		mediator.publish('categorieChange');
	}
	
	var onProduitCourantChange = function(){
		if (undefined === mediator.data.produitCourant.idCategorie){
			domElements.title.html('Ajouter un produit');
		} else {
	        domElements.title.html('Modifier un produit');
		}
		loadingProduit = true;
		if(undefined === mediator.data.produitCourant.idCategorieParent){
			for(i=0; i<mediator.data.structureProduits.length; i++){
				var categorieParent = mediator.data.structureProduits[i];
				for(j=0; j<categorieParent.sousCategories.length; j++ ){
					var categorie = categorieParent.sousCategories[j];
					if(categorie.id == mediator.data.produitCourant.idCategorie){
						mediator.data.produitCourant.idCategorieParent = categorieParent.id;
					}
				}
			}
		}
		domElements.categorieParent.val(mediator.data.produitCourant.idCategorieParent);
		domElements.categorieParent.change();
		domElements.categorie.val(mediator.data.produitCourant.idCategorie);
		domElements.categorie.change();
		loadingProduit = false;
	};
	return {
		initialize : initialize
	};
}(mediator);