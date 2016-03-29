var inventairesModule = function(mediator){

	var domElements={};
	var produits;
	
	var initialize = function(){
		requestDomElements();
		bindEvents();
	};
	
	var requestDomElements = function(){
		domElements = {
			filtre:$('#inventaires-filtre'),
			filtreStatut:$('#inventaires-filtre-statut'),
			listeProduits:$('#inventaires-liste-produits'),
			uploadProduit:$('.inventaires-upload-produit'),
			deleteTous:$('#inventaires-delete-tous'),
            uploadTous:$('#inventaires-upload-tous'),
            exportTous:$('#inventaires-export-tous')
		}
	};
	
	var bindEvents = function(){
		$('#inventaires').bind('pageshow',onShow);
		domElements.filtre.change(onFiltreChange);
		domElements.filtreStatut.change(onFiltreStatutChange);
		domElements.deleteTous.click(onDeleteTousClick);
        domElements.uploadTous.click(onUploadTousClick);
        domElements.exportTous.click(onExportTousClick);
	};
	
	var onShow = function(event,ui){
		if(undefined !== mediator.data.utilisateur.idClient && (undefined == ui || ui.prevPage.attr('id') !== 'consultation')){
			domElements.filtre.empty();
			domElements.listeProduits.empty();
	        domElements.filtreStatut.val('*').selectmenu('refresh');
			var onSuccess = function(inventaires,_produits){
				domElements.uploadTous.addClass('ui-disabled');
				produits = _produits;
				$('<option>').attr('value','*')
					.text('Tous les inventaires')
					.appendTo(domElements.filtre);
				for(i=0; i<inventaires.length; i++){
					var inv = inventaires[i];
					
					$('<option>').attr('value',inv.id)
						.text(inv.libelle)
						.appendTo(domElements.filtre);
				}
				domElements.filtre.selectmenu('refresh');
				if(produits.length === 0){
					domElements.deleteTous.addClass('ui-disabled');
	                domElements.exportTous.addClass('ui-disabled');
					domElements.listeProduits.html('<br/>&nbsp;&nbsp;Il n\'y a pas de produit dans les inventaires.<br/><br/>');
				}else{
					domElements.deleteTous.removeClass('ui-disabled');
	                domElements.exportTous.removeClass('ui-disabled');
				}
				for(i=0; i<produits.length; i++){
					var p = produits[i];
					
					statut = mediator.data.statutsProduits[p.statutProduit];
					if(p.statutProduit == 'avendre')
						domElements.uploadTous.removeClass('ui-disabled');

					var chargerEnLigneKO = (!mediator.data.isConnected || 'avendre' !== p.statutProduit);
					$('<li data-icon="false">').attr('data-idprod',p.id)
						.attr('data-idinv',p.idInventaire)
						.attr('data-statut',p.statutProduit)
						.append($('<a href="#" class="ui-grid-b">')
							.append($('<div class="ui-block-a">')								
								.append($('<img>').attr('src',p.image || 'images/aucune_image_petit.gif')).click(onItemClick)
							)
							.append($('<div class="ui-block-b">')							
								.append($('<h3 class="libelleProd">').text(p.libelle)).click(onItemClick)
								.append($('<p>').text(p.prixInitial + ' €').toggle((p.prixInitial != null)))
								.append($('<p>').text('Statut : ' + statut))
								.append($('<p>').text('Inventaire : ' + p.libelleInventaire))
							)
							.append($('<div class="ui-block-c inventaire-block-c">')
								.append($('<select class="action"><option value="*">Actions</option><option value="Supprimer">Supprimer</option><option value="Modifier">Modifier</option><option value="Dupliquer">Dupliquer le produit</option>').change(onActionChange))
								.append($('<a class="inventaires-upload-produit" data-role="button" data-inline="true" data-icon="arrow-u" style="display:block; float:left;">').text('Charger').toggleClass('ui-disabled',chargerEnLigneKO).button().click(onUploadProduitClick))
							)
						)
						.appendTo(domElements.listeProduits);					
				}
		       	domElements.listeProduits.listview('refresh');
		       	$('.action').selectmenu();
		       	$('div.inventaire-block-c div.ui-select').css('float','left');
			};
			mediator.dataStore.getInventairesAvecProduits(mediator.data.utilisateur.idClient,onSuccess);
		}
	};
	
	var onFiltreChange = function(){
		domElements.listeProduits.find('li').each(function(i,li){
			var $li = $(li);
			if('*' === domElements.filtre.val() || $li.attr('data-idinv') === domElements.filtre.val()){
				$li.removeClass('ui-screen-hidden');
			} else {
				$li.addClass('ui-screen-hidden');
			}
		});
	};
	
	var onFiltreStatutChange = function(){
		domElements.listeProduits.find('li').each(function(i,li){
			var $li = $(li);
			if('*' === domElements.filtreStatut.val() || $li.attr('data-statut') === domElements.filtreStatut.val()){
				$li.removeClass('ui-screen-hidden');
			} else {
				$li.addClass('ui-screen-hidden');
			}
		});
	};
	
	var onActionChange = function(){
		var idProduit = $(this).closest('li').attr('data-idprod');
		var choix = $(this).closest('select').val();
		var libelleProduit = $(this).closest('li').find('h3').text();
		if(choix=='Dupliquer')
			onDuplicateClick(idProduit,libelleProduit);
		else if(choix=='Supprimer')
			onDeleteProduitClick(idProduit);
		else if(choix=='Modifier')
			onEditProduitClick(idProduit);
	};
	
	var onDuplicateClick = function(idProduit,libelleProduit){
		var occurrence = prompt("Duplication du produit : \""+libelleProduit+"\"\nNombre de duplication :", "1");
		if(occurrence!=null)
		{
			mediator.dataStore.duplicateProduit(idProduit,occurrence,onShow);
			mediator.publish('refreshInventaires');
		}
		else
			$('.action').val('*');
	}
		
	var onEditProduitClick = function(idProduit){
		var onSuccess = function(produit){
			mediator.data.produitCourant = produit;
			mediator.publish('produitCourantChange');
			$.mobile.changePage('#ajprod1');
		}
		mediator.dataStore.getProduit(idProduit,onSuccess);
	}
	
    var onItemClick = function(){
        var idProduit = $(this).closest('li').attr('data-idprod');
        var onSuccess = function(produit){
            mediator.data.produitCourant = produit;
            mediator.publish('produitCourantChange');
            $.mobile.changePage('#consultation');
        }
        mediator.dataStore.getProduit(idProduit,onSuccess);
    }
	
	var onDeleteProduitClick = function(idProduit){
		if(confirm('Voulez-vous supprimer ce produit ?')){
			mediator.dataStore.deleteProduit(idProduit,onShow);
			mediator.publish('refreshInventaires');
		}
		else
			$('.action').val('*');
	}
	
	var onUploadProduitClick = function(){
		var idProduit = $(this).closest('li').attr('data-idprod');
		var onGetProduitSuccess = function(produit){
			mediator.publish('uploadProduit',{
				produit:produit,
				onSuccess:function(){
					mediator.dataStore.deleteProduit(idProduit);
					mediator.publish('refreshInventaires');
				}
			});
		}
		if(confirm('Voulez-vous charger ce produit sur Agorastore.fr ?'))
		mediator.dataStore.getProduit(idProduit,onGetProduitSuccess);
	}
	
	var onDeleteTousClick = function(){
		var idInventaire = domElements.filtre.val();
		var libelle = 'de ' + domElements.filtre.find('option:selected').text()
		switch(idInventaire){
		case '-1':
			libelle = 'sans inventaire';
			break;
		case '*':
			libelle = 'de tous les inventaires';
			break;
		}
		if(confirm('Voulez-vous supprimer tous les produits ' + libelle + ' ?')){
			mediator.dataStore.deleteTousProduits(mediator.data.utilisateur.idClient,idInventaire,function(){
				onShow();
				mediator.publish('refreshInventaires');
			});
		}
	}
	
	var onUploadTousClick = function(){
		var idInventaire = domElements.filtre.val();
		var libelle = 'de ' + domElements.filtre.find('option:selected').text()
		switch(idInventaire){
		case '-1':
			libelle = 'sans inventaire';
			break;
		case '*':
			libelle = 'de tous les inventaires';
			break;
		}
		if(confirm('Voulez-vous transférer sur Agorastore.fr tous les produits ' + libelle + ' ?')){
			var onGetProduitsSuccess = function(_produits){
				mediator.publish('uploadPlusieursProduits',{
					produits:_produits,
					onProduitSuccess:function(id){
						mediator.dataStore.deleteProduit(id);
					},
					onSuccess:function(){
						mediator.publish('refreshInventaires');
					}
				});
			}
			mediator.dataStore.getProduitsByInventaire(mediator.data.utilisateur.idClient,idInventaire,'avendre',onGetProduitsSuccess);
		}
	}
	
	onExportTousClick = function(){
        var idInventaire = domElements.filtre.val();
        var libelle = 'de ' + domElements.filtre.find('option:selected').text()
        switch(idInventaire){
        case '-1':
            libelle = 'sans inventaire';
            break;
        case '*':
            libelle = 'de tous les inventaires';
            break;
        }
        
	    var onGetProduitsSuccess = function(produits){
	        var categories = [];
	        
	        for(var i in produits){
	            var produit = produits[i];
	            var laCategorie;

                for(var i in mediator.data.structureProduits){
                    var categorieParent = mediator.data.structureProduits[i];
                    for(var j in categorieParent.sousCategories){
                        var categorie = categorieParent.sousCategories[j];
                        if(categorie.id == produit.idCategorie){
                            laCategorie = categorie;
                            break;
                        }
                    }
                    if(laCategorie)break;
                }
                if(!laCategorie){
                    onError('Catégorie du produit ' + produit.descriptifsCommuns.libelle + ' incorrecte');
                    return;
                }
	            if(undefined === categories[laCategorie.id]){
	                categories[laCategorie.id] = {nomCategorie:laCategorie.libelle,produits:[]};
	            }
	            var argProduit = [];
	            var ajouterInfo = function(champ,valeur){
	                argProduit.push({champ:champ,valeur:valeur||''});
	            }

                var intToHour = function(i){if(i>9) return i; return '0' + i;};
	            var dateToString = function(d){
	                if(d)
	                    return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + ' ' + intToHour(d.getHours()) + ':' + intToHour(d.getMinutes());
	                return '';
	            }

                ajouterInfo('Statut',mediator.data.statutsProduits[produit.statutProduit]);
                ajouterInfo('Inventaire',produit.libelleInventaire);
                ajouterInfo('Libellé du produit',produit.descriptifsCommuns.libelle);
                ajouterInfo('Devise', '€');
                ajouterInfo('Mise à prix ('+(mediator.data.utilisateur.estTTC ? 'TTC':'HT')+')',produit.descriptifsCommuns.prixInitial);
                ajouterInfo('Date début enchère',dateToString(produit.descriptifsCommuns.dateDebutEnchere));
                ajouterInfo('Date fin enchère',dateToString(produit.descriptifsCommuns.dateFinEnchere));
                ajouterInfo('Pas de l\'enchère',produit.descriptifsCommuns.pasEnchere);
                ajouterInfo('Taux de TVA',produit.descriptifsCommuns.tauxTVA);
                ajouterInfo('Modalités de paiement',produit.descriptifsCommuns.modalitePaiement);
                ajouterInfo('Modalités de retrait',produit.descriptifsCommuns.modaliteRetrait);
                ajouterInfo('Contact produit',produit.descriptifsCommuns.contactProduit);
                ajouterInfo('Contact retrait',produit.descriptifsCommuns.contactRetrait);
                ajouterInfo('Provenance',produit.descriptifsCommuns.libelleProvenance);
                ajouterInfo('Image 1','');
                ajouterInfo('Image 2','');
                ajouterInfo('Image 3','');
                ajouterInfo('Image 4','');
                ajouterInfo('Image 5','');
                ajouterInfo('Document 1','');
                ajouterInfo('Document 2','');
                ajouterInfo('Document 3','');
                ajouterInfo('Document 4','');
                ajouterInfo('Document 5','');
                ajouterInfo('Vidéo','');
                
                for(var k in laCategorie.descriptifs){
                    var descriptif = laCategorie.descriptifs[k];
                    var val = '';
                    for(var l in produit.descriptifsParticuliers){
                        var pdp = produit.descriptifsParticuliers[l];
                        if(pdp.id == descriptif.id)
                            val = pdp.valeur;
                    }
                    ajouterInfo(descriptif.libelle,val);
                }
	            categories[laCategorie.id].produits.push(argProduit);
	            argProduit = null;
	        }
	        
	        var argsExport = [];
	        for(var i in categories){
	            argsExport.push(categories[i]);
	        }
	        var d = new Date();
	        var $option = $('#inventaires-filtre option:selected');
	        var subject = ($option.attr('value') == '*') ? ('des inventaires') : ('inventaire "'+$option.text()+'"');
	        var argsMail = {
	                fileName:'agorastock_' + $option.text().replace(/[^a-z0-9]+/ig,'-') + '_' + intToHour(d.getDate()) + '-' + intToHour(d.getMonth()+1) + '-' + d.getFullYear() + '_' + intToHour(d.getHours()) + '-' + intToHour(d.getMinutes()) + '.xls',
	                email:mediator.data.utilisateur.email || '',
	                subject:'[Agorastock] Export ' + subject,
	                text:'Bonjour '+mediator.data.utilisateur.civilite + ' ' + mediator.data.utilisateur.nom+',\n\nVeuillez trouver l’export en pièce jointe de cet email.\nInventaire exporté : « '+$option.text()+' »\n\nCordialement,\n\nL\'équipe AgoraStore'
	        };
	        
	        if(cordova.exec)
	            cordova.exec(onExportSuccess,onError,'PluginExport','exportXls',[argsMail,argsExport]);
	        else{
	            console.log([argsMail,argsExport]);
	        }
        };

        var onExportSuccess = function(path){
            
        };
        var onError = function(error){mediator.publish('error',error)};
        
        mediator.dataStore.getProduitsByInventaire(mediator.data.utilisateur.idClient,idInventaire,
                domElements.filtreStatut.val(),onGetProduitsSuccess);
	}
	
	return {
		initialize : initialize
	};
}(mediator);