var ajprod4Module = function(mediator){

	var domElements={};
	
	var initialize = function(){
		requestDomElements();
		bindEvents();
		initValues();
	};
	
	var requestDomElements = function(){
		domElements = {
			statutProduit:$('#ajprod4-statutProduit'),	
			prixInitial:$('#ajprod4-prixInitial'),	
			pasEnchere:$('#ajprod4-pasEnchere'),
			tauxTVA:$('#ajprod4-tauxTVA'),
			dateDebutEnchere:$('#ajprod4-dateDebutEnchere'),
			dateFinEnchere:$('#ajprod4-dateFinEnchere'),
			heureDebutEnchere:$('#ajprod4-heureDebutEnchere'),
			heureFinEnchere:$('#ajprod4-heureFinEnchere'),
			minDebutEnchere:$('#ajprod4-minDebutEnchere'),
			minFinEnchere:$('#ajprod4-minFinEnchere'),
			contactProduit:$('#ajprod4-contactProduit'),
			contactRetrait:$('#ajprod4-contactRetrait'),
			modaliteRetrait:$('#ajprod4-modaliteRetrait'),
			modalitePaiement:$('#ajprod4-modalitePaiement'),
			idProvenance:$('#ajprod4-idProvenance'),
			nextSteps:$('.ajprod4-next-steps'),
			formStep4:$("#ajprod4-form"),
			btsauvegarder:$('#ajprod4-enregistrer'),
			ttcHt:$('#ajprod4-ttc-ht')
		}
	};
	
	var bindEvents = function(){			
		mediator.subscribe('produitCourantChange',onProduitCourantChange);
		mediator.subscribe('listeProvenancesChange',onListeProvenancesChange);
		$('#ajprod4').bind('pageshow',onShow);
		domElements.statutProduit.change(onStatutProduitChange);
		domElements.prixInitial.change(onPrixInitialChange);
		domElements.pasEnchere.change(onPasEnchereChange);
		domElements.tauxTVA.change(onTauxTVAChange);
		domElements.dateDebutEnchere.change(onDateDebutEnchereChange);
		domElements.dateFinEnchere.change(onDateFinEnchereChange);
		domElements.heureDebutEnchere.change(onDateDebutEnchereChange);
		domElements.heureFinEnchere.change(onDateFinEnchereChange);
		domElements.minDebutEnchere.change(onDateDebutEnchereChange);
		domElements.minFinEnchere.change(onDateFinEnchereChange);
		domElements.contactProduit.change(onContactProduitChange);
		domElements.contactRetrait.change(onContactRetraitChange);
		domElements.modaliteRetrait.change(onModaliteRetraitChange);
		domElements.modalitePaiement.change(onModalitePaiementChange);
		domElements.idProvenance.change(onIdProvenanceChange);
		domElements.nextSteps.bind('click',validFormProd4);
		domElements.btsauvegarder.click(validFormAndSave);	
		domElements.dateDebutEnchere.data('validate',validateDateDebutEnchere);
		domElements.dateFinEnchere.data('validate',validateDateFinEnchere);
	};
 
    

    var validFormProd4 = function(){
        if(!mediator.data.produitCourant.idDistant)
            mediator.publish('produitCourantSauvegarde',true);
        
        var res = ('avendre' !== domElements.statutProduit.val()) || (domElements.formStep4.validationEngine({scroll:false,focusFirstField:false}).validationEngine('validate'));
        domElements.formStep4.validationEngine('detach');
        return res;
    }
	
	var initValues = function(){
		domElements.tauxTVA.selectIndex = 0;
		
		domElements.heureDebutEnchere.empty();
		domElements.heureFinEnchere.empty();
		domElements.minDebutEnchere.empty();
		domElements.minFinEnchere.empty();
		for (i=0;i<24;i++)
		{			
			$('<option>').attr('value',i).text(i).appendTo(domElements.heureDebutEnchere);
			$('<option>').attr('value',i).text(i).appendTo(domElements.heureFinEnchere);
		}
		for (j=0;j<60;j=j+5)
		{
			$('<option>').attr('value',j).text(j).appendTo(domElements.minDebutEnchere);
			$('<option>').attr('value',j).text(j).appendTo(domElements.minFinEnchere);
		}
		
	};
	
	var onShow = function(){
    	domElements.formStep4.validationEngine().validationEngine('hideAll').validationEngine('detach');
		if(undefined === mediator.data.produitCourant){
			mediator.data.produitCourant = {}
		}
		if(undefined === mediator.data.produitCourant.descriptifsCommuns){
			mediator.data.produitCourant.descriptifsCommuns = {}
		}
		// forcer les appels à onChange pour initialiser produitCourant avec les valeurs par défaut des select et de modalite de paiement
		$('select','#ajprod4').change();
		domElements.modalitePaiement.change();
		domElements.ttcHt.text(mediator.data.utilisateur.estTTC ? 'TTC' : 'HT');
	}
	
	var onListeProvenancesChange = function(){
		domElements.idProvenance.empty();
		if (undefined !== mediator.data.listeProvenances)
		{
			for(var i=0; i<mediator.data.listeProvenances.length;i++){ 
				var provenance = mediator.data.listeProvenances[i];
				$('<option>').attr('value',provenance.id).text(provenance.libelle).appendTo(domElements.idProvenance);
			}
		}
		if(domElements.idProvenance.attr('tabindex') < 0)domElements.idProvenance.selectmenu('refresh');
	};
	
	var onStatutProduitChange = function(){
		mediator.data.produitCourant.statutProduit = domElements.statutProduit.val();
		disabled = (mediator.data.produitCourant.statutProduit === 'brouillon') || 
			(mediator.data.produitCourant.statutProduit === 'adetruire')||
			(mediator.data.produitCourant.statutProduit === 'adonner')||
			(mediator.data.produitCourant.statutProduit === 'areaffecter')||
			(mediator.data.produitCourant.statutProduit === 'utilises');
			
		required = (mediator.data.produitCourant.statutProduit === 'avendre');
		$('input','#ajprod4').textinput().textinput(disabled ? 'disable' : 'enable');
		$('textarea','#ajprod4').textinput().textinput(disabled ? 'disable' : 'enable').css("height", 30).keyup();
		$('select:not(#ajprod4-statutProduit)','#ajprod4').toggleClass('ui-disabled',disabled).selectmenu().selectmenu('refresh');
		$('.required-star','#ajprod4').toggle(required);
	};
	
	var onPrixInitialChange = function(){
		mediator.data.produitCourant.descriptifsCommuns.prixInitial = domElements.prixInitial.val();
	};
			
	var onPasEnchereChange = function(){	
		mediator.data.produitCourant.descriptifsCommuns.pasEnchere = domElements.pasEnchere.val();
	};
	
	var onTauxTVAChange = function(){	
		mediator.data.produitCourant.descriptifsCommuns.tauxTVA = domElements.tauxTVA.val();
	};
	
	var onDateDebutEnchereChange = function(){	
		mediator.data.produitCourant.descriptifsCommuns.dateDebutEnchere = parseDate(domElements.dateDebutEnchere.val(),domElements.heureDebutEnchere.val(),domElements.minDebutEnchere.val());
	};
	
	var onDateFinEnchereChange = function(){				
		mediator.data.produitCourant.descriptifsCommuns.dateFinEnchere = parseDate(domElements.dateFinEnchere.val(),domElements.heureFinEnchere.val(),domElements.minFinEnchere.val());
	};
		
	var onContactProduitChange = function(){	
		mediator.data.produitCourant.descriptifsCommuns.contactProduit = domElements.contactProduit.val();
	};
	
	var onContactRetraitChange = function(){	
		mediator.data.produitCourant.descriptifsCommuns.contactRetrait = domElements.contactRetrait.val();
	};
	
	var onModaliteRetraitChange = function(){	
		mediator.data.produitCourant.descriptifsCommuns.modaliteRetrait = domElements.modaliteRetrait.val();
	};
	
	var onModalitePaiementChange = function(){	
		mediator.data.produitCourant.descriptifsCommuns.modalitePaiement = domElements.modalitePaiement.val();
	};
	
	var onIdProvenanceChange = function(){	
		mediator.data.produitCourant.descriptifsCommuns.idProvenance = domElements.idProvenance.val();
	};
	
	var onProduitCourantChange = function(){
		if(undefined !== mediator.data.produitCourant.idDistant){
			mediator.data.produitCourant.statutProduit = 'avendre';
		}
		if(!mediator.data.produitCourant.descriptifsCommuns.modalitePaiement)
			mediator.data.produitCourant.descriptifsCommuns.modalitePaiement = mediator.data.utilisateur.modalitesPaiement;
		
		domElements.statutProduit.val(mediator.data.produitCourant.statutProduit);
		domElements.prixInitial.val(mediator.data.produitCourant.descriptifsCommuns.prixInitial);
		domElements.pasEnchere.val(mediator.data.produitCourant.descriptifsCommuns.pasEnchere);
		domElements.tauxTVA.val(mediator.data.produitCourant.descriptifsCommuns.tauxTVA);
		domElements.contactProduit.val(mediator.data.produitCourant.descriptifsCommuns.contactProduit);
		domElements.contactRetrait.val(mediator.data.produitCourant.descriptifsCommuns.contactRetrait);
		domElements.modaliteRetrait.val(mediator.data.produitCourant.descriptifsCommuns.modaliteRetrait);
		domElements.modalitePaiement.val(mediator.data.produitCourant.descriptifsCommuns.modalitePaiement);
		domElements.idProvenance.val(mediator.data.produitCourant.descriptifsCommuns.idProvenance);
		
		var debut = mediator.data.produitCourant.descriptifsCommuns.dateDebutEnchere;
		if(debut){
			domElements.dateDebutEnchere.val(debut.getDate() + '/' + (debut.getMonth()+1) + '/' + debut.getFullYear());
			domElements.heureDebutEnchere.val(debut.getHours());
			domElements.minDebutEnchere.val(debut.getMinutes());
		}else{
			domElements.dateDebutEnchere.val('');
			domElements.heureDebutEnchere.val('0');
			domElements.minDebutEnchere.val('0');
		}
		var fin = mediator.data.produitCourant.descriptifsCommuns.dateFinEnchere;
		if(fin){
			domElements.dateFinEnchere.val(fin.getDate() + '/' + (fin.getMonth()+1) + '/' + fin.getFullYear());
			domElements.heureFinEnchere.val(fin.getHours());
			domElements.minFinEnchere.val(fin.getMinutes());
		}else{
			domElements.dateFinEnchere.val('');
			domElements.heureFinEnchere.val('0');
			domElements.minFinEnchere.val('0');
		}
		domElements.heureDebutEnchere.selectmenu().selectmenu('refresh');
		domElements.heureFinEnchere.selectmenu().selectmenu('refresh');
		domElements.minDebutEnchere.selectmenu().selectmenu('refresh');
		domElements.minFinEnchere.selectmenu().selectmenu('refresh');
		domElements.modaliteRetrait.css("height", 30).keyup();
		domElements.modalitePaiement.css("height", 30).keyup();
		
        domElements.btsauvegarder.toggle(!!mediator.data.produitCourant.idDistant);
	};
	
	var parseDate = function(d,h,m){
		var r = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(d);
		if(r && h && m)
			return new Date(r[3],r[2]-1,r[1],h,m);
		if(r)
			return new Date(r[3],r[2]-1,r[1]);
		return null;
	}
	
	var validFormAndSave = function(){
		var valid = domElements.formStep4.validationEngine({scroll:false,focusFirstField:false}).validationEngine('validate');
        var res = ('avendre' !== domElements.statutProduit.val()) || valid;
        
		if (res ){
			mediator.publish('produitCourantSauvegarde');
		}
	}

	var validateDateDebutEnchere = function(field, rules, i, options){
		var debut = domElements.dateDebutEnchere.datepicker('getDate');
		debut.setDate(debut.getDate()+1);
		if(debut){
			debut.setHours(0);
			debut.setMinutes(0);
		}
		
		if(debut && debut < new Date()){
			return 'La date de début d\'enchère doit être dans le futur';
		}
	};
	var validateDateFinEnchere = function(field, rules, i, options){
		var debut = domElements.dateDebutEnchere.datepicker('getDate');
		if(debut){
			debut.setHours(domElements.heureDebutEnchere.val());
			debut.setMinutes(domElements.minDebutEnchere.val());
		}
		var fin = domElements.dateFinEnchere.datepicker('getDate');
		if(fin){
			fin.setHours(domElements.heureFinEnchere.val());
			fin.setMinutes(domElements.minFinEnchere.val());
		}
		
		if(fin < debut){
			return 'La date de fin d\'enchère doit être postérieure à la date de début';
		}
	};
		
	return {
		initialize : initialize
	};
}(mediator);