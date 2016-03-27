var mediator = function(){
    var subscribe = function(channel, fn){
        if (!mediator.channels[channel]) mediator.channels[channel] = [];
        mediator.channels[channel].push({ context: this, callback: fn });
        return this;
    },
 
    publish = function(channel){
        if (!mediator.channels[channel]) return false;
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = mediator.channels[channel].length; i < l; i++) {
            var subscription = mediator.channels[channel][i];
            subscription.callback.apply(subscription.context, args);
        }
        return this;
    };
    var defaultData = {
            statutsProduits:{
                brouillon:'Brouillon',
                adetruire:'Mise au rebut',
                adonner:'A donner',
                areaffecter:'A réaffecter',
                utilises:'Actuellement utilisé',
                prepvente:'Préparation de vente',
                avendre:'A vendre',
        }
    };
    return {
        channels: {},
        publish: publish,
        subscribe: subscribe,
        installTo: function(obj){
            obj.subscribe = subscribe;
            obj.publish = publish;
        },
        
		services: new ServiceHandler(),
		dataStore: new DataStore(),
		deviceHandler: new DeviceHandler(),
        data:defaultData,
        defaultData:defaultData
    };
}();