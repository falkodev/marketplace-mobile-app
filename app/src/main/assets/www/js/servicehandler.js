function ServiceHandler(){
//	var url = 'http://www.agorastore.fr/webservices/agorastock/';
	//var url = 'http://preprod.agorastore.fr/webservices/agorastock/';
	var url = 'http://beta.agorastore.fr/webservices/agorastock/';
	var extension = '.ashx';
	this.call = function(service,params,onSuccess,onError,onChange){

		if('token' in params && !params.token){
			if(confirm('Pour utiliser les fonctionnalités connectées de l\'application, il est nécessaire de vous reconnecter.')){
				mediator.publish('deconnect',true);
			}else{
				onError('silent');
			}
			return;
		}
		$.ajax({
			xhr: function(){
				var xhr = new window.XMLHttpRequest();
				if('function' === typeof onChange){
					xhr.upload.addEventListener("progress", function(e){onChange('upload',e);}, false);
					xhr.addEventListener("progress", function(e){onChange('download',e);}, false);
				}
				return xhr;
			},
			url:url + service + extension,
			type:'POST',
			data:params,
			dataType:'JSON',
			error:function(result){
				onError('not_connected');
			},
			success:function(result){
				if(result instanceof Array && 1 === result.length){
					if(undefined === result[0].errors.etat || (0 < result[0].errors.etat)){
						onSuccess(result[0].data);
						return;
					}
					onError(result[0].errors);
					return;
				}
				onError(result);
			}
		});
	};
	
	this.uploadFile = function(service,path,options,onSuccess,onError){
		if(undefined !== FileTransfer){
			var ft = new FileTransfer();
			ft.upload(path, url + service + extension, function(result){			
				// bug de filetransfer : les caractères arrivent en ANSI
				result.response = result.response.replace(/Ã©/,'é');
				result.response = result.response.replace(/Ã /,'à');
				result.response = result.response.replace(/Ã¨/,'è');
				result.response = result.response.replace(/Ãª/,'ê');	
				result.response = result.response.replace(/Ã¢/,'â');
				result.response = result.response.replace(/Ã´/,'ô');
				result.response = result.response.replace(/Ã®/,'î');
				result.response = result.response.replace(/Ã»/,'û');
				result.response = result.response.replace(/Ã«/,'ë');
				result.response = result.response.replace(/Ã¯/,'ï');
				var response = JSON.parse(result.response);				
				if(response instanceof Array && 1 === response.length){
					if(undefined === response[0].errors.etat || (0 < response[0].errors.etat)){
						onSuccess(response[0].data);
						return;
					}
					onError(response[0].errors);
					return;
				}
				onError(result);
			}, onError, options);
		} else {
			onError('FileTransfer is undefined');
		}
	};
}