var consultationModule = function(mediator){

	var domElements={};
	var loadingProduit = false; 
	
	var initialize = function(){
		requestDomElements();
		bindEvents();
	};
	
	var requestDomElements = function(){
		domElements = {
		    editButton:$('#consultation-edit'),
		    libelle:$('#consultation-libelle'),
            inventaire:$('#consultation-inventaire'),
            statut:$('#consultation-statut'),
            statutIcone:$('#consultation-statut-icone .ui-icon'),
            prixInitial:$('#consultation-prix-initial'),
            taxes:$('#consultation-taxes'),
            dateDebut:$('#consultation-date-debut'),
            dateFin:$('#consultation-date-fin'),
            descriptif:$('#consultation-descriptif'),
            modalitesPaiement:$('#consultation-modalites-paiement'),
            photosDiv:$('#consultation-photos'),
            photo:$('#consultation-photo'),
            miniatures:$('#consultation-miniatures'),
            infos:$('#consultation-infos')
		}
	};
	
	var bindEvents = function(){
	    domElements.editButton.click(onEditButtonClick);
		mediator.subscribe('produitCourantChange',onProduitCourantChange);
	};
    
    var onEditButtonClick = function(){
        $.mobile.changePage('#ajprod1');
    };
	
	var onProduitCourantChange = function(){
        
        domElements.libelle.text(mediator.data.produitCourant.descriptifsCommuns.libelle);
        
        domElements.inventaire.text(mediator.data.produitCourant.libelleInventaire);
        domElements.statut.text(mediator.data.statutsProduits[mediator.data.produitCourant.statutProduit]);
        domElements.statutIcone.addClass('ui-icon-' + mediator.data.produitCourant.statutProduit);

        
        var dateToString = function(d){
            if(d)
                return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
            return '';
        }
        domElements.prixInitial.text(mediator.data.produitCourant.descriptifsCommuns.prixInitial);
        domElements.taxes.text(mediator.data.utilisateur.estTTC?'TTC':'HT');
        domElements.dateDebut.text(dateToString(mediator.data.produitCourant.descriptifsCommuns.dateDebutEnchere));
        domElements.dateFin.text(dateToString(mediator.data.produitCourant.descriptifsCommuns.dateFinEnchere));
        
        domElements.descriptif.empty();
           
        var descriptifs = {};
        for(var i in mediator.data.structureProduits){        	
            var categorieParent = mediator.data.structureProduits[i];
            if(categorieParent.id == mediator.data.produitCourant.idCategorieParent){            	 
                for(var j in categorieParent.sousCategories){                	
                    var categorie = categorieParent.sousCategories[j];
                    if(categorie.id == mediator.data.produitCourant.idCategorie){
                        for(var k in categorie.descriptifs){                        	
                            var descriptif = categorie.descriptifs[k];
                            descriptifs[descriptif.id]=descriptif;
                        }
                    }
                }
            }
        }
        for(var i in mediator.data.produitCourant.descriptifsParticuliers){
            var descriptif = mediator.data.produitCourant.descriptifsParticuliers[i];            
            if(descriptif)
                domElements.descriptif.append($('<span>').text(descriptifs[descriptif.id].libelle + ' : ' + descriptif.valeur)).append($('<br>'));
        }
        domElements.modalitesPaiement.text(mediator.data.produitCourant.descriptifsCommuns.modalitePaiement);

        domElements.photosDiv.toggle(!!mediator.data.produitCourant.images.length);
        domElements.miniatures.empty();
        domElements.infos.toggleClass('full-width',!mediator.data.produitCourant.images.length);
        for(var i in mediator.data.produitCourant.images){
            var image = mediator.data.produitCourant.images[i];
			var path = image.path || image.url;
            if(0==i)
                domElements.photo.attr('src',path);
            domElements.miniatures.append($('<img>').attr('src',path).click(function(){
                domElements.photo.attr('src',this.src);
            }));
        }
	}
	
	return {
		initialize : initialize
	};
}(mediator);