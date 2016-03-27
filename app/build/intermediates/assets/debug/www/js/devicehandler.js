function DeviceHandler(){
	this.onDevice = function(){
		return (undefined !== navigator.network);
	};
	
	this.isConnected = function(){
		if(this.onDevice()){
			return(Connection.NONE !== navigator.network.connection.type);
		}
		return true;
	}
	this.getIdDevice = function(){	
		if(this.onDevice()){			
			return device.uuid;
		}
		return '3e284fb8569a060';
	}
}