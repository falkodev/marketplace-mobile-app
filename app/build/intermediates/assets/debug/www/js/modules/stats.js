
var statModule = function(mediator){
	
	var domElements={};
		
	var initialize = function(){
		requestDomElements();
		bindEvents();
	};
	
	var requestDomElements = function(){
		domElements = {
				pageStat:$('#stats'),
				tabStatsEC:$('#tab-stats-ec'),
				tabStatsTerm:$('#tab-stats-term'),
				chartStats:$('#chart-stats'),
				resultDivError:$('#ResultsDiv'),
		}
	};
	
	var displayPlot = function(data) {
		$('#chart-stats').css('height', $('#chart-stats').css('width'));
		$.jqplot('chart-stats', [data], {
	        gridPadding: {top:0, bottom:0, left:0, right:0},
	        seriesDefaults:{
	            renderer:$.jqplot.PieRenderer,
	            trendline:{ show:false },
	            rendererOptions: { padding: 8, showDataLabels: true, highlightMouseOver: false }
	        },
	        legend:{
	            show:true,
	            placement: 'inside',
	            location: 'ne',
	            marginTop: '15px',
	            border: '0'
	        },
	        grid:{
	        	background: "#FFF",
	        	drawBorder: false,
	        	shadow: false
	        }
	    });
	}
	
	var onShow = function(){
		mediator.data.dataStat = {};
		$(window).bind('resize',onResize);
		
		domElements.tabStatsEC.children().each(function() {$(this).children().last().empty()});
		domElements.tabStatsTerm.children().each(function() {$(this).children().last().empty()});
		domElements.chartStats.empty();
		
		var params = {
	               login: mediator.data.utilisateur.login,
	               token: mediator.data.token,
	               };
	    mediator.services.call('statistiques',params,onSuccess,GetChildrenFailed);
	}
	
	var onResize = function(){
		if(domElements.pageStat.is(':visible')){
			domElements.chartStats.empty();
		    var plot = displayPlot(mediator.data.dataStat);
		}
	}
	
	function onSuccess(response) {
		var resStat = response.statistiques;
		
		domElements.tabStatsEC.children().children('#nbVentesEnCours').append(resStat['nbVentesEnCours']);
		domElements.tabStatsEC.children().children('#nbEncheres').append(resStat['nbEncheres']);
		domElements.tabStatsEC.children().children('#nbPdtsEncheris').append(resStat['nbPdtsEncheris']);
		domElements.tabStatsEC.children().children('#prixPdtsEncheris').append(number_format(resStat['prixPdtsEncheris'],2,',',' ')+" &euro;");
		
		domElements.tabStatsTerm.children().children('#nbPdtsVendus').append(resStat['nbPdtsVendus']);
		domElements.tabStatsTerm.children().children('#nbEncheresPdtsVendus').append(resStat['nbEncheresPdtsVendus']);
		domElements.tabStatsTerm.children().children('#prixPdtsVendus').append(number_format(resStat['prixPdtsVendus'],2,',',' ')+" &euro;");
		
		var strCat = resStat['libellesCat'];
		var strPourc = resStat['pourcentage'];
		if (null !== strCat){
			var tabCat = strCat.split(',');
			var tabPourc = strPourc.split(',');
			mediator.data.dataStat = new Array();
			for (var i = 0; i < tabPourc.length; i ++) {
				mediator.data.dataStat.push([tabCat[i],parseInt(tabPourc[i])]);
			}
		    var plot = displayPlot(mediator.data.dataStat);
		}
	}
	
	function GetChildrenFailed(error) {
		domElements.resultDivError.innerHTML = "Erreur, veuillez renouveller votre action";
	} 
	
	var bindEvents = function(){
		domElements.pageStat.bind('pageshow',onShow);
	};
	
	
	return {
		initialize : initialize
	};
	

	
}(mediator);
