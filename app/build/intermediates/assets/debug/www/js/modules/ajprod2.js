var ajprod2Module = function(mediator){

	var domElements={};
	
	var initialize = function(){
		requestDomElements();
		bindEvents();
	};
	
	var requestDomElements = function(){
		domElements = {
			libelle:$('#ajprod2-libelle'),
			descriptifs:$('#ajprod2-descriptifs'),
			nextSteps:$('.ajprod2-next-steps'),
			btsauvegarder:$('#ajprod2-enregistrer'),
			formStep2:$("#ajprod2-form")
		}
	};
	
	var bindEvents = function(){
		mediator.subscribe('categorieChange',onCategorieChange);
		mediator.subscribe('produitCourantChange',onProduitCourantChange);
		domElements.libelle.change(onLibelleChange);
		domElements.nextSteps.bind('click',validForm);
		domElements.btsauvegarder.click(validFormAndSave);		
	};
	
	var onCategorieChange = function(){
		domElements.descriptifs.empty();
		if(undefined !== mediator.data.produitCourant.idCategorie){
			$.each(mediator.data.structureProduits,function(i,categorieParent){
				if(categorieParent.id == mediator.data.produitCourant.idCategorieParent){
					$.each(categorieParent.sousCategories,function(j,categorie){
						if(categorie.id == mediator.data.produitCourant.idCategorie){
							$.each(categorie.descriptifs,function(k,descriptif){
								addDescriptif(descriptif);
							});
						}
					})
				}
			})
		}
		domElements.descriptifs.find('input').textinput();
	};
	
	var addDescriptif = function(descriptif){
		var $l = $('<label>')
			.text(descriptif.libelle)
			.attr('data-inline','true')
			.addClass('ui-block-a')
			.appendTo(domElements.descriptifs);
		var $i = $('<input>')
			.attr('data-iddes',descriptif.id)
			.attr('data-mini','true')
			.addClass('ui-block-b')
			.change(function(){
				onDescriptifChange(descriptif.id,this.value);
			})
			.attr('data-inline','true')
			.appendTo(domElements.descriptifs);
		if(descriptif.estObligatoire === "True"){
			$l.text($l.text() + ' *');
			$i.addClass('required');
			$i.addClass('validate[required]');
			$i.attr("data-prompt-position",'bottomLeft:20,5');
		}
	};
	
	var onProduitCourantChange = function(){
		if(undefined === mediator.data.produitCourant.descriptifsCommuns){
			mediator.data.produitCourant.descriptifsCommuns = {};
		}
		if(undefined == mediator.data.produitCourant.descriptifsParticuliers){
			mediator.data.produitCourant.descriptifsParticuliers = [];
		}
		domElements.libelle.val(mediator.data.produitCourant.descriptifsCommuns.libelle);
		for(var i=0; i<mediator.data.produitCourant.descriptifsParticuliers.length; i++){
			var dp = mediator.data.produitCourant.descriptifsParticuliers[i];
			$('#ajprod2 input[data-iddes='+dp.id+']').val(dp.valeur);
		}
		domElements.btsauvegarder.toggle(!!mediator.data.produitCourant.idDistant);
	};
	
	var onLibelleChange = function(){
		if(undefined === mediator.data.produitCourant.descriptifsCommuns){
			mediator.data.produitCourant.descriptifsCommuns={};
		}
		mediator.data.produitCourant.descriptifsCommuns.libelle = domElements.libelle.val();
	};
	
	var onDescriptifChange = function(id,valeur){
		if(undefined === mediator.data.produitCourant.descriptifsParticuliers){
			mediator.data.produitCourant.descriptifsParticuliers=[];
		}
		var found = false;
		for(var i = 0; i < mediator.data.produitCourant.descriptifsParticuliers.length; i++){
			var desc = mediator.data.produitCourant.descriptifsParticuliers[i];
			if(desc.id == id){
				desc.valeur = valeur;
				found = true;
			}
		}
		if(! found){
			mediator.data.produitCourant.descriptifsParticuliers.push({
				id:id,
				valeur:valeur
			});
		}
	};
	
	var validForm = function(){
	    if(!mediator.data.produitCourant.idDistant)
	        mediator.publish('produitCourantSauvegarde',true);
	    
		var valid = domElements.formStep2.validationEngine({scroll:false}).validationEngine('validate');
        if(valid == true){
            $.mobile.changePage( "#ajprod3");
        }else{
            return false;
        }
	}
	
	var validFormAndSave = function(){
		var valid = domElements.formStep2.validationEngine({scroll:false}).validationEngine('validate');
		if (valid)
		{
			mediator.publish('produitCourantSauvegarde');			
		}
	}
	
	return {
		initialize : initialize
	};
}(mediator);