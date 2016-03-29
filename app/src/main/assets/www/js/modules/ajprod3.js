var ajprod3Module = function(mediator){
	var domElements={};
	var prefixe = '';
	
	var initialize = function(){
		requestDomElements();
		bindEvents();
		//window.appRootDirName = "AgoraStockPictures";
	};
	
	var requestDomElements = function(){
		domElements = {
			listPic: $('#ajprod3-images'),
			selectPic: $('#ajprod3-select-pic'),
			takePic: $('#ajprod3-take-pic'),
			imageDelete: $('.ajprod3-image-delete'),
			image: $('.ajprod3-image'),
			btsauvegarder:$('#ajprod3-enregistrer'),
            nextSteps:$('.ajprod3-next-steps')
		}
	};
	
	var bindEvents = function(){
		$('#ajprod3').bind('pageshow',onShow);
		domElements.selectPic.click(onSelectPic);
		domElements.takePic.click(onTakePic);
//		domElements.imageDelete.click(onImageDelete);
		mediator.subscribe('produitCourantChange',onProduitCourantChange);
        domElements.btsauvegarder.click(validFormAndSave);  
        domElements.nextSteps.click(save);  
	};

	var onProduitCourantChange = function() {
		$('.ajprod3-img').attr('src','images/vide.png');
		domElements.imageDelete.hide();
		if(undefined === mediator.data.produitCourant.images){
			mediator.data.produitCourant.images=[];
		}
		for(var i=0; i<mediator.data.produitCourant.images.length; i++){
			var image = mediator.data.produitCourant.images[i];
			var ordre = image.ordre || (i+1);
			var $image = $('.ajprod3-image[data-n-image='+ordre+']');
			$image.find('.ajprod3-img').attr('src',image.path || ('http://' + image.url));
			$image.find('.ajprod3-image-delete').show();
		}
        domElements.btsauvegarder.toggle(!!mediator.data.produitCourant.idDistant);
	};

	var showImage = function(number, imageId, imagePath) {
		var newLi = '<li>' +
			'<div class="ajprod3-image" data-n-image="'+ number +'">' +
				'<a id="' + imageId +'" class="ajprod3-image-delete ui-icon ui-btn-inner" data-role="button" data-icon="trash" data-iconpos="notext" data-inline="true"></a>' +
				'<div class="ajprod3-image-body">' +
					'<img class="ajprod3-img" src="' + imagePath + '">' +
				'</div>' +
			'</div>' +
		'</li>';
		$(newLi).appendTo(domElements.listPic);
	};

    var onShow = function() {
//    	console.log('affichage onShow prod3');
    	$(domElements.listPic).empty();
    	if(undefined === mediator.data.produitCourant.images){
			mediator.data.produitCourant.images=[];
		}
    	n = 1;
    	$.each(mediator.data.produitCourant.images, function(key,image){
//    		console.log('mediator image[' + key + ']  id:' + image['id'] + ' ordre:' + image['ordre'] + ' path:' + image['path']);
			showImage(n, image['id'], image['path']);
			n++;
    	});

    	$(domElements.listPic).on('click', '.ajprod3-image-delete', function(){
    		if ($(this).length) {
                onImageDelete($(this).attr('id'), $(this).closest('li'));
            }
		});
    	if(undefined===mediator.data.produitCourant.descriptifsCommuns)mediator.data.produitCourant.descriptifsCommuns={};
    	if(undefined==mediator.data.produitCourant.descriptifsCommuns.libelle)mediator.data.produitCourant.descriptifsCommuns.libelle='';
		prefixe = mediator.data.utilisateur.idClient + mediator.data.produitCourant.descriptifsCommuns.libelle.replace(/\W*/,"");
    }

    var getAndSaveImage = function(source){
    	var theFileEntry;
		var onGetPictureSuccess = function(imageURI) {
			//resolve file system for image
			window.resolveLocalFileSystemURI(imageURI, onResolveLocalFileSystemURISuccess,onError);
		};
		
		var onResolveLocalFileSystemURISuccess = function(fileEntry) {
			theFileEntry = fileEntry;
			// get file system to copy or move image file to
			window.requestFileSystem(LocalFileSystem.PERSISTENT,0, onRequestFileSystemSuccess, onError);
		};
			
		var onRequestFileSystemSuccess = function(fileSystem){
			var entry = fileSystem.root;//root of sdcard
			//Test the existance of directory or create it
			entry.getDirectory('AgoraStockPictures', {create: true, exclusive: false}, onGetDirectorySuccess, onError);                
	   };

		var onGetDirectorySuccess =  function (dir){
			// move the file into client directory
			var d = new Date();
			var n = d.getTime();
			
			theFileEntry.moveTo(dir, prefixe + n + '.jpg',onCopySuccess, onError);
		};

		var onCopySuccess = function(fileEntry){
			showImage(n, fileEntry.name, fileEntry.fullPath);

			if(undefined === mediator.data.produitCourant.images){
				mediator.data.produitCourant.images=[];
			}
						
			mediator.data.produitCourant.images.push({
				ordre:n,
				id:fileEntry.name,
				path:fileEntry.fullPath
			});
		};
	
        navigator.camera.getPicture(onGetPictureSuccess, onError, { quality:90,
        												targetWidth:800,
        												targetHeight:600,
        												encodingType:Camera.EncodingType.JPEG,
        												destinationType:Camera.DestinationType.FILE_URI,
        												sourceType: source,
        												saveToPhotoAlbum: false});
    }   

    var onError = function(error) {
		mediator.publish('error',error)
    };

	var onSelectPic = function(){
		getAndSaveImage(Camera.PictureSourceType.PHOTOLIBRARY);
	};
	
	var onTakePic = function(){
		getAndSaveImage(Camera.PictureSourceType.CAMERA);
	};

	var onImageDelete = function(idPictureToRemove, pictureToRemove){
		if (confirm('Voulez vous vraiment supprimer cette photo ?')){
			pictureToRemove.remove();
			if(undefined !== mediator.data.produitCourant.images) {
				var i = mediator.data.produitCourant.images.length;
				while(i--) {
					if(mediator.data.produitCourant.images[i]['id'] === idPictureToRemove && i >-1) {
						mediator.data.produitCourant.images.splice(i,1);
					}
				}
			}
		}
	};	
	
	var validFormAndSave = function(){		
		mediator.publish('produitCourantSauvegarde');					
	};
	
	var save = function(){
	    if(!mediator.data.produitCourant.idDistant)
	        mediator.publish('produitCourantSauvegarde',true);  
	};
	
	return {
		initialize : initialize
	};
	
}(mediator);