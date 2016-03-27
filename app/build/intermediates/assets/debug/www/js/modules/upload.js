var uploadModule = function(mediator){
	var progress = 0;
	var onClose;
	
	var domElements={
	};
	
	var initialize = function(){
		requestDomElements();
		bindEvents();
	};
	
	var requestDomElements = function(){
		domElements = {
			popup:$('#upload-popup'),
			progress:$('#upload-progress'),
			progressValue:$('#upload-progress-value'),
			info:$('#upload-info')
		}
	};
	
	var bindEvents = function(){
		mediator.subscribe('uploadProduit',onUploadProduit);
		mediator.subscribe('uploadPlusieursProduits',onUploadPlusieursProduits);
		domElements.popup.bind('pagehide', onHide);
	};
	
	var onHide = function() {
		if(onClose) onClose();
		onClose = null;
	};

	var setProgressValue = function(v){
		progress = v;
		domElements.progressValue.css('width',progress+'%');
	}
	var addToProgressValue = function(v){
		progress += v;
		domElements.progressValue.css('width',progress+'%');
	};

	var clearInfoText = function(txt){
		domElements.info.empty();
	};
	var addLineToInfo = function(txt){
		domElements.info.append('<br>').append(txt);
	};
	
	var onUploadProduit = function(params){
		var imagesUploadees = 0;
		var images = [];
		var tempsUpload;
		var tempsProduit;
		var tempsImage;
		var max = params.max || 1;
		onClose = params.onClose;
	    $.mobile.changePage(domElements.popup, {role:'dialog',transition:'none'});
	    
	    if(!params.keepLogs){
	    	clearInfoText();
			setProgressValue(0);
	    }
	    
		// params à modifier si voulu
		var ratioProduit = 1;
		var ratioImage = 1;	
		
		var dateToService = function(d){
			if(d)
				return d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
			return '';
		};
		
		// preparation du produit
		params.produit.idLocal = undefined;
		params.produit.id = 0;
		params.produit.idInventaire = undefined;
		params.produit.idCategorieParent = undefined;
		params.produit.statutProduit = undefined;
		if(undefined !== params.produit.idDistant){
			params.produit.id = params.produit.idDistant;
			params.produit.idDistant = undefined;
		}
		if(undefined == params.produit.descriptifsCommuns){
			params.produit.descriptifsCommuns = {};
		}
		params.produit.descriptifsCommuns.dateDebutEnchere = dateToService(params.produit.descriptifsCommuns.dateDebutEnchere);
		params.produit.descriptifsCommuns.dateFinEnchere = dateToService(params.produit.descriptifsCommuns.dateFinEnchere);
		
		// preparation des images
		if(undefined === params.produit.images){
			params.produit.images = [];
		}
		for(var i=0; i<params.produit.images.length; i++){
			var image = params.produit.images[i];
			if(undefined !== image.path){
				images.push({
					id:image.id,
					path:image.path,
					ordre:image.ordre
				});
				image.libelle = image.id.substr(0,image.id.length-4);
				image.url = '';
				image.id = -1;
				image.path = undefined;
			}
		}
		var uploadProduitParams = {
           login: mediator.data.utilisateur.login,
           token: mediator.data.token,
		   produit: JSON.stringify(params.produit)
		};
		

		

		var onUploadProduitSuccess = function(res){
			params.produit.id = res.idProduit;
			addToProgressValue(tempsProduit);
			launchImageUpload();
		};
		
		var launchImageUpload = function(){
			if(imagesUploadees < images.length){
				var image = images[imagesUploadees];
				
				var fileUploadOptions = new FileUploadOptions();
				fileUploadOptions.fileKey='fileData';
				fileUploadOptions.fileName=image.id;
				fileUploadOptions.params = {
	               login: mediator.data.utilisateur.login,
	               token: mediator.data.token,
	               idproduit:params.produit.id,
	               lastPicture:(imagesUploadees == (images.length - 1))
				};
				
				mediator.services.uploadFile('upload-photo',image.path,fileUploadOptions,onUploadImageSuccess,onError);
				addLineToInfo('Chargement de la photo ' + image.ordre);
			}else{
				addLineToInfo('Chargement du produit terminé');
				if(params.onSuccess)params.onSuccess();
			}
		};
		
		var onUploadImageSuccess = function(r){
			addToProgressValue(tempsImage);
			imagesUploadees ++;
			launchImageUpload();
		};
		
		var onError = function(error){
			var msg = error.libelle || 'Une erreur est survenue';
			addLineToInfo(msg);
			if(params.onError)params.onError();
		};
		
		// params à ne pas modifier
		tempsUpload = 100 / max;
		tempsProduit = tempsUpload * ratioProduit / (ratioImage * images.length + ratioProduit);
		tempsImage = tempsUpload * ratioImage / (ratioImage * images.length + ratioProduit);
		
		
		// envoi du produit
				// TODO : progress ? implémenté das servicehandler, inutile pour l'instant
		mediator.services.call('upload-produit',uploadProduitParams,onUploadProduitSuccess,onError);
		addLineToInfo('Chargement du produit ' + params.produit.descriptifsCommuns.libelle);
	};
	
	var onUploadPlusieursProduits = function(params){
		var produits = params.produits;
		var keepLogs = false;
		var max = produits.length;
		var launchProduit = function(){
			var produit = produits.shift();
			if(produit){
				var id = produit.idLocal
				var params2 = {
					produit:produit,
					keepLogs:keepLogs,
					max:max,
					onSuccess:function(){
						if(params.onProduitSuccess)params.onProduitSuccess(id);
						launchProduit();
					},
					onError:function(){
						if(params.onProduitError)params.onProduitError(id);
						launchProduit();
					}
				};
				onUploadProduit(params2);
			}else{
				if(params.onSuccess)params.onSuccess();
			}
		};
		launchProduit();
		keepLogs = true;
	}
	
	return {
		initialize : initialize
	};
}(mediator);