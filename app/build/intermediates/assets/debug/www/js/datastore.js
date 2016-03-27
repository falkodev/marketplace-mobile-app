function DataStore(){

	var db;
	//***************************************************************
	//Création de la base et des table si elles n'existent pas
	//***************************************************************
	this.open = function() {
		if(undefined !== db) return;
		
		var dbSize = 5 * 1024 * 1024; // 5MB
		db =  window.openDatabase("Agorastock", "1.0", "Agorastock", dbSize);
		db.transaction(function(tx){
			/*tx.executeSql('DROP TABLE IF EXISTS UTILISATEURS',[]);
			tx.executeSql('DROP TABLE IF EXISTS CLIENTS',[]);
			tx.executeSql('DROP TABLE IF EXISTS LISTE_PROVENANCES',[]);
			tx.executeSql('DROP TABLE IF EXISTS SOUS_CATEGORIES',[]);
			tx.executeSql('DROP TABLE IF EXISTS CATEGORIES_PARENTS',[]);
			tx.executeSql('DROP TABLE IF EXISTS CATEGORIES',[]);
			tx.executeSql('DROP TABLE IF EXISTS DESCRIPTIFS',[]);
			tx.executeSql('DROP TABLE IF EXISTS INVENTAIRES',[]);
			tx.executeSql('DROP TABLE IF EXISTS PRODUITS',[]);
			tx.executeSql('DROP TABLE IF EXISTS CHAMPS_PRODUITS',[]);
			tx.executeSql('DROP TABLE IF EXISTS IMAGES_PRODUITS',[]);
			tx.executeSql('DROP TABLE IF EXISTS APP_ACTIVE',[]);*/
			
			tx.executeSql('CREATE TABLE IF NOT EXISTS UTILISATEURS (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, login, civilite, nom, nomVendeur, estTTC, tabNumeros, hashPass,idClient INTEGER NOT NULL, logged INTEGER NOT NULL)',[]);
			tx.executeSql('CREATE TABLE IF NOT EXISTS CLIENTS (id INTEGER NOT NULL PRIMARY KEY, modalite_paiement, version_structure)',[]); 
			tx.executeSql('CREATE TABLE IF NOT EXISTS LISTE_PROVENANCES (id INTEGER, id_client INTEGER NOT NULL, libelle)',[]);
			tx.executeSql('CREATE TABLE IF NOT EXISTS CATEGORIES_PARENTS (id INTEGER NOT NULL, id_client INTEGER NOT NULL, libelle, ordre INTEGER, PRIMARY KEY(id,id_client))',[]);		            				
			tx.executeSql('CREATE TABLE IF NOT EXISTS CATEGORIES (id INTEGER NOT NULL, id_client INTEGER NOT NULL, id_categorie_parent INTEGER, libelle, ordre INTEGER, PRIMARY KEY(id,id_client) )',[]);		            			
			tx.executeSql('CREATE TABLE IF NOT EXISTS DESCRIPTIFS (id INTEGER NOT NULL, id_client INTEGER NOT NULL, id_categorie INTEGER NOT NULL, libelle, estObligatoire, ordre INTEGER, PRIMARY KEY(id,id_categorie,id_client))',[]);
			
			tx.executeSql('CREATE TABLE IF NOT EXISTS INVENTAIRES (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, libelle TEXT UNIQUE,id_client INTEGER NOT NULL)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS PRODUITS (id INTEGER NOT NULL PRIMARY KEY, id_client INTEGER, id_categorie INTEGER, libelle, prixInitial, pasEnchere, tauxTVA, dateDebutEnchere, dateFinEnchere, contactProduit, contactRetrait, modaliteRetrait, modalitePaiement, statutProduit,idProvenance, id_inventaire INTEGER)',[]);
			tx.executeSql('CREATE TABLE IF NOT EXISTS CHAMPS_PRODUITS (id_produit INTEGER NOT NULL, id_champ INTEGER NOT NULL, valeur)',[]);
			tx.executeSql('CREATE TABLE IF NOT EXISTS IMAGES_PRODUITS (id_produit INTEGER NOT NULL, id_image NOT NULL, path, ordre INTEGER)',[]);
			
			tx.executeSql('CREATE TABLE IF NOT EXISTS APP_ACTIVE (is_active INTEGER NOT NULL DEFAULT 0)',[]);
									
		},onError,successCB);			 
	}
	
	//***************************************************************
	//Mise a jour de la base de données, Id Client devient Id Site
	//***************************************************************	
	this.changeIdClient = function(utilisateur){
		this.open();
		
		db.transaction(function(tx){	 					
			var oldClientIdArray = new Array();				 
			var isMAJBDDToDo = 0;			
			//On fait un test pour savoir si on met a jour ou non la base de données.		   		
			tx.executeSql('SELECT * FROM UTILISATEURS',[],function (tx,res){
	   			for(var c = 0; c < res.rows.length; c++){
	   				var row = res.rows.item(c);
	   				oldClientIdArray.push(row['idClient']);
	   				if (row['idClient'] != utilisateur.idClient)
	   					isMAJBDDToDo = 1;	   			
	   			}		    			
	   		        						
				if(isMAJBDDToDo == 1){					
			   		tx.executeSql('SELECT * FROM UTILISATEURS',[],function (tx,res){					   			
			   			if (res.rows.length != 0){			    				
			   				tx.executeSql('UPDATE UTILISATEURS SET idClient=?',[utilisateur.idClient]);		   				
			   			}
			   		},onError);
			       
			   		tx.executeSql('SELECT * FROM LISTE_PROVENANCES',[],function (tx,res){
			   			if (res.rows.length != 0){				   				
			   				tx.executeSql('DELETE FROM LISTE_PROVENANCES WHERE id_client !=?',[oldClientIdArray[0]]);
			   				tx.executeSql('UPDATE LISTE_PROVENANCES SET id_client=?',[utilisateur.idClient]);
			   			}
			   		},onError);			       
					
			   		tx.executeSql('SELECT * FROM INVENTAIRES',[],function (tx,res){			   			
			   			if (res.rows.length != 0){			    						    				
			   				tx.executeSql('UPDATE INVENTAIRES SET id_client=?',[utilisateur.idClient]);		   				
			   			}
			   		},onError);
			       
			   		tx.executeSql('SELECT * FROM PRODUITS',[],function (tx,res){		   						   			
			   			if (res.rows.length != 0){		   				
			   				tx.executeSql('UPDATE PRODUITS SET id_client=?',[utilisateur.idClient]);		   				
			   			}
			   		},onError);
			       
			   		tx.executeSql('SELECT * FROM DESCRIPTIFS',[],function (tx,res){
			   			if (res.rows.length != 0){	
			   				tx.executeSql('DELETE FROM DESCRIPTIFS WHERE id_client !=?',[oldClientIdArray[0]]);
			   				tx.executeSql('UPDATE DESCRIPTIFS SET id_client=?',[utilisateur.idClient]);
			   			}
			   		},onError);
			       
			   		tx.executeSql('SELECT * FROM CATEGORIES',[],function (tx,res){
			   			if (res.rows.length != 0){	
			   				tx.executeSql('DELETE FROM CATEGORIES WHERE id_client !=?',[oldClientIdArray[0]]);
			   				tx.executeSql('UPDATE CATEGORIES SET id_client=?',[utilisateur.idClient]);
			   			}
			   		},onError);
			       
			   		tx.executeSql('SELECT * FROM CATEGORIES_PARENTS',[],function (tx,res){
			   			if (res.rows.length != 0){	
			   				tx.executeSql('DELETE FROM CATEGORIES_PARENTS WHERE id_client !=?',[oldClientIdArray[0]]);
			   				tx.executeSql('UPDATE CATEGORIES_PARENTS SET id_client=?',[utilisateur.idClient]);
			   			}
			   		},onError);
			       
			   		tx.executeSql('SELECT * FROM CLIENTS',[],function (tx,res){
			   			if (res.rows.length != 0){	
			   				tx.executeSql('DELETE FROM CLIENTS WHERE id !=?',[oldClientIdArray[0]]);
			   				tx.executeSql('UPDATE CLIENTS SET id=?',[utilisateur.idClient]);
			   			}
			   		},onError);	
				}//end if
			},onError);	 
		},onError,successCB);			 
	}
	
	//***************************************************************
	//Récupération de l'utilisateur connecté en mode déconnecté
	//***************************************************************
	this.getUtilisateur = function(login,callback){					
		this.open();		
		db.transaction(function(tx){			
	    	tx.executeSql('SELECT u.*, c.modalite_paiement FROM UTILISATEURS u INNER JOIN CLIENTS c ON c.id = u.idClient WHERE u.login = ?',[login],	    			
	    		function(tx, rs){ 	    			
	    			if (rs.rows.length > 0)
	    			{	    			
	    				var row = rs.rows.item(0);	   	   
	    				callback({
  	    	        	  login: row['login'],
	    	        	  nomVendeur: row['nomVendeur'],
	    	        	  civilite:row['civilite'],
	    	        	  nom: row['nom'],
	    	  			  tabNumeros:row['tabNumeros'],
	    	  			  hashPass:row['hashPass'],
	    	          	  estTTC:row['estTTC'],
	    	          	  idClient:row['idClient'],
	    	          	  modalitesPaiement:row['modalite_paiement']
	    	          	});
	    				return;
	    			}
	    			callback();
	    			return;
	    	      }, 
	    	      onError
	    	      );							
	    	});				    		
		}
	
	//***************************************************************
	//Insertion modification de l'utilisateur courant en base de donnée
	//***************************************************************
	this.storeUtilisateur = function(utilisateur){		
		this.open();		
		db.transaction(function(tx){
	    		tx.executeSql('SELECT * FROM UTILISATEURS WHERE login = ?',[utilisateur.login],function (tx,res){
	    			tx.executeSql('UPDATE UTILISATEURS SET logged = 0',[]);
	    			if (res.rows.length == 0){
	    				tx.executeSql('INSERT INTO UTILISATEURS (login, civilite, nom, nomVendeur, estTTC, tabNumeros, hashPass, idClient, logged) VALUES ( ? ,? ,? ,? ,? ,? ,?, ?, ? )',[utilisateur.login,utilisateur.civilite,utilisateur.nom,utilisateur.nomVendeur,utilisateur.estTTC,utilisateur.tabNumeros,utilisateur.hashPass,utilisateur.idClient,1]);	    					    				
	    			}else{
	    				tx.executeSql('UPDATE UTILISATEURS SET civilite=?, nom=?, nomVendeur=?, estTTC=?, tabNumeros=?, hashPass=?, logged=? WHERE login=? AND idClient=?',[utilisateur.civilite,utilisateur.nom,utilisateur.nomVendeur,utilisateur.estTTC,utilisateur.tabNumeros,utilisateur.hashPass,1,utilisateur.login,utilisateur.idClient]);
	    			}
	    		},onError);
	         });	
	}

	//***************************************************************
	// Vérification si utilisateur connecté
	//***************************************************************
	this.checkUtilisateurLogged = function(callback){		
		this.open();		
		db.transaction(function(tx){
    		tx.executeSql('SELECT * FROM UTILISATEURS WHERE logged = 1',[],function (tx,res){
    			if (res.rows.length == 0){
    				callback(false);
    			}else{
    				var row = res.rows.item(0);
    				callback(row['login']);
    			}
    		},onError);
        });	
	}

	//***************************************************************
	// Déconnexion de utilisateur
	//***************************************************************
	this.logoutUtilisateur = function(){		
		this.open();		
		db.transaction(function(tx){
			tx.executeSql('UPDATE UTILISATEURS SET logged = 0',[]);
        });	
	}
	 
	//***************************************************************
    // Succes de la requete
	//***************************************************************
    function successCB() {
    }
	
	//***************************************************************
    //recuperation de la version en base de données
	//***************************************************************
	this.getVersionConnue = function(login,callback){	
		this.open();
		db.transaction(function(tx){
			tx.executeSql('SELECT c.* FROM CLIENTS c LEFT JOIN UTILISATEURS u ON (c.id = u.idClient) WHERE u.login = ?',[login],function (tx,res){
					if (res.rows.length != 0){
						callback(res.rows.item(0).version_structure);
					}
					else{
						callback(-1);
					}
				})
			},onError,successCB);		
	}
	
	//***************************************************************
	//Recupération de la structure produit en base de données
	//***************************************************************
	this.getStructureProduits = function(callback){

		this.open();
		db.transaction(function(tx){
			var clientId = mediator.data.utilisateur.idClient;
			var structureProduits = [];
			var sql = 'SELECT cp.id as idCategorieParent, cp.libelle as libelleCategorieParent, '
				+ 'c.id as idCategorie,c.libelle as libelleCategorie, '
				+ 'd.id as idDescriptif,d.libelle as libelleDescriptif,d.estObligatoire '
				+ 'FROM CATEGORIES_PARENTS cp '
				+ 'LEFT JOIN CATEGORIES c ON c.id_categorie_parent = cp.id '
				+ 'LEFT JOIN DESCRIPTIFS d ON d.id_categorie = c.id '
				+ 'WHERE cp.id_client = ? '
				+ 'GROUP BY idCategorie,idcategorieParent,idDescriptif '//Permet de ne pas avoir de duplication des champs descriptifs
				+ 'ORDER BY cp.ordre,c.ordre,d.ordre';
			tx.executeSql(sql,[clientId],function (tx,res){
				var categorieParent;
				var categorie;
				
				for(var c = 0; c < res.rows.length; c++){
					var row = res.rows.item(c);
					if(undefined !== categorieParent && categorieParent.id !== row.idCategorieParent){
						structureProduits.push(categorieParent);
						categorieParent = undefined;
					}
					if(undefined === categorieParent){
						categorieParent = {
								id:row.idCategorieParent,
								libelle:row.libelleCategorieParent,
								sousCategories:[]
						};
					}
					if(undefined !== categorie && categorie.id !== row.idCategorie){												
						categorieParent.sousCategories.push(categorie);
						categorie = undefined;						
					}
					if(undefined === categorie){
						categorie = {
								id:row.idCategorie,
								libelle:row.libelleCategorie,
								descriptifs:[]
						};
					}
					categorie.descriptifs.push({
						id:row.idDescriptif,
						libelle:row.libelleDescriptif,
						descriptifs:row.estObligatoire
					});
				} 
				if(undefined !== categorie){
					categorieParent.sousCategories.push(categorie);
				}
				if(undefined !== categorieParent){
					structureProduits.push(categorieParent);
				}
				callback(structureProduits);
			});
		},onError,successCB);
	}
	
	//***************************************************************
	//Enregistrement de la structure produit en base de données
	//***************************************************************
	this.storeStructureProduits = function(structureProduits){		
		
		this.open();
		var versionMiseAJour = false;
		var nouveauClient = false;
		
		db.transaction(function(tx){    			
    			if(undefined !== structureProduits){     				
    				var clientId = mediator.data.utilisateur.idClient;
    				
    				tx.executeSql('SELECT * FROM CLIENTS WHERE id = ?',[clientId],function (tx,res){
    					if (res.rows.length == 0)
    						{nouveauClient = true;}
    					
    					if (res.rows.length > 0 && res.rows.item(0).version_structure != mediator.data.versionStructure)
    						{versionMiseAJour = true;}    
    					    				    			    			
	    				if (nouveauClient || versionMiseAJour)
	    				{	    					 					        			
		        			if (nouveauClient){		        						        		
		        				tx.executeSql('INSERT INTO CLIENTS (id, modalite_paiement, version_structure) VALUES ( ? , ? , ? )',[clientId,mediator.data.utilisateur.modalitesPaiement,mediator.data.versionStructure],regenererStructureProduit(tx,structureProduits,versionMiseAJour,clientId));
		        			}
		        			else{		
		        				tx.executeSql('UPDATE CLIENTS SET modalite_paiement=?, version_structure=? WHERE id=?',[mediator.data.utilisateur.modalitesPaiement,mediator.data.versionStructure,clientId],regenererStructureProduit(tx,structureProduits,versionMiseAJour,clientId));		        				
		        			}
    					}
    				});
    			} 			
		 },onError,successCB);
	}
	
	//***************************************************************
	//Enregistrement de l'activation de l'application
	//***************************************************************
	this.storeAppActive = function(){				
		this.open();				
		
		db.transaction(function(tx){    			 
			tx.executeSql('UPDATE APP_ACTIVE SET is_active=?',[1]);
		 },onError,successCB);
	}
	
	this.getAppActive = function(callback){				
		this.open();				
		
		db.transaction(function(tx){    			 
			tx.executeSql('SELECT is_active FROM APP_ACTIVE',[],function (tx,res){				
				if (res.rows.length == 0){
					tx.executeSql('INSERT INTO APP_ACTIVE (is_active) VALUES ( ? )',[0]);
                    callback(false);
				}
				else{
					callback(res.rows.item(0).is_active);
				}
			});
		 },onError,successCB);
	}	
	
	//***************************************************************
	//regénération du coeur de la structure produit
	//***************************************************************
	var regenererStructureProduit = function(tx,structureProduits,versionMiseAJour, clientId){
	    if (versionMiseAJour)
	    {
    		tx.executeSql('DELETE FROM LISTE_PROVENANCES WHERE id_client=?',[clientId]); //delete
    		tx.executeSql('DELETE FROM CATEGORIES_PARENTS WHERE id_client=?',[clientId]);
    		tx.executeSql('DELETE FROM CATEGORIES WHERE id_client=?',[clientId]);
    		tx.executeSql('DELETE FROM DESCRIPTIFS WHERE id_client=?',[clientId]);
	    }
	    var cptCategorieParent = 1;
		$.each(structureProduits,function(i,categorieParent){
			tx.executeSql('INSERT INTO CATEGORIES_PARENTS (id_client, id, libelle, ordre) VALUES (?, ?, ?, ?)',[clientId,categorieParent.id,categorieParent.libelle,cptCategorieParent]);		        					 
			var cptCategorie = 1;	
			$.each(categorieParent.sousCategories,function(j,categorie){      						
				tx.executeSql('INSERT INTO CATEGORIES (id_client, id_categorie_parent, id, libelle, ordre) VALUES (?, ?, ?, ?, ?)',[clientId,categorieParent.id,categorie.id,categorie.libelle,cptCategorie]);
					var cptDescriptif = 1;	
					$.each(categorie.descriptifs,function(k,descriptif){
						tx.executeSql('INSERT INTO DESCRIPTIFS (id_client, id_categorie, id, libelle, estObligatoire, ordre) VALUES (?, ?, ?, ?, ?, ?)',[clientId,categorie.id,descriptif.id,descriptif.libelle,descriptif.estObligatoire,cptDescriptif]);
						cptDescriptif++; 
					});	        							
					cptCategorie++;
				});	        					
			cptCategorieParent++;
		});
	}
	
	this.getProduit = function(idProduit,callback){	
		this.open();
		
		db.transaction(function(tx){    			
			tx.executeSql('SELECT p.*, i.libelle as libelle_inventaire FROM PRODUITS p LEFT JOIN INVENTAIRES i ON i.id = p.id_inventaire WHERE p.id = ?',[idProduit],function (tx,res){
				if (res.rows.length == 0)
					return {};
				var row = res.rows.item(0);
				
				var produit = {
					idLocal:row.id,
					idCategorie:row.id_categorie,
					descriptifsCommuns:{
						libelle:row.libelle,
						prixInitial: row.prixInitial,
						pasEnchere: row.pasEnchere,
						tauxTVA: row.tauxTVA,
						dateDebutEnchere: row.dateDebutEnchere ? new Date(row.dateDebutEnchere) : null,
						dateFinEnchere: row.dateFinEnchere ? new Date(row.dateFinEnchere) : null,
						contactProduit: row.contactProduit,
						contactRetrait: row.contactRetrait,
						modaliteRetrait: row.modaliteRetrait,
						modalitePaiement: row.modalitePaiement,
						idProvenance: row.idProvenance
					},
					statutProduit:row.statutProduit,
                    idInventaire: row.id_inventaire,
                    libelleInventaire: row.libelle_inventaire || 'Pas d\'inventaire'
				};
				
				tx.executeSql('SELECT * FROM CHAMPS_PRODUITS WHERE id_produit = ?',[idProduit],function (tx,res){
					produit.descriptifsParticuliers = [];
					for(i=0; i < res.rows.length; i++){
						var row = res.rows.item(i);
						
						produit.descriptifsParticuliers.push({
							id:row.id_champ,
							valeur:row.valeur
						});
					}

					tx.executeSql('SELECT * FROM IMAGES_PRODUITS WHERE id_produit = ? ORDER BY ordre',[idProduit],function (tx,res){
						produit.images = [];
						for(i=0; i < res.rows.length; i++){
							var row = res.rows.item(i);
							
							produit.images.push({
								ordre:row.ordre,
								id:row.id_image,
								path:row.path
							});
						}

						callback(produit);
					});
				});
			});	
		 },onError,successCB);
	}
	
	this.getProduitsByInventaire = function(idClient,idInventaire,statut,callback){
		var selectProduits;
		switch(idInventaire){
		case '-1':
			selectProduits = function(tx,callback){
				tx.executeSql('SELECT p.*, lp.libelle as libelleProvenance, i.libelle as libelleInventaire ' +
				        'FROM PRODUITS p ' +
                        'LEFT JOIN LISTE_PROVENANCES lp ON lp.id_client = p.id_client AND lp.id = p.idProvenance ' +
                        'LEFT JOIN INVENTAIRES i ON i.id = p.id_inventaire ' +
				        'WHERE p.id_inventaire IS NULL AND p.id_client=? AND (p.statutProduit=? OR ?=?) ' +
                        'ORDER BY id DESC',[idClient,statut,statut,'*'],callback);
			}
			break;
		case '*':
			selectProduits = function(tx,callback){
				tx.executeSql('SELECT p.*, lp.libelle as libelleProvenance, i.libelle as libelleInventaire ' +
                        'FROM PRODUITS p ' +
                        'LEFT JOIN LISTE_PROVENANCES lp ON lp.id_client = p.id_client AND lp.id = p.idProvenance ' +
                        'LEFT JOIN INVENTAIRES i ON i.id = p.id_inventaire ' +
                        'WHERE p.id_client=? AND (p.statutProduit=? OR ?=?) ' +
                        'ORDER BY id DESC',[idClient,statut,statut,'*'],callback);
			}
			break;
		default:
			selectProduits = function(tx,callback){
				tx.executeSql('SELECT p.*, lp.libelle as libelleProvenance, i.libelle as libelleInventaire ' +
                        'FROM PRODUITS p ' +
                        'LEFT JOIN LISTE_PROVENANCES lp ON lp.id_client = p.id_client AND lp.id = p.idProvenance ' +
                        'LEFT JOIN INVENTAIRES i ON i.id = p.id_inventaire ' +
                        'WHERE p.id_inventaire=? AND p.id_client=? AND (p.statutProduit=? OR ?=?) ' +
                        'ORDER BY id DESC', [idInventaire,idClient,statut,statut,'*'],callback);
			}
			break;
		}
		this.open();

		var produits = [];
		db.transaction(function(tx){    			
			selectProduits(tx, function (tx,res){
				if (res.rows.length == 0)
					return [];
				for(var i = 0; i<res.rows.length; i++){
					var row = res.rows.item(i);
					
					var dateDebut = null, dateFin = null;
					if(row.dateDebutEnchere)
					    dateDebut = new Date(row.dateDebutEnchere);
                    if(row.dateFinEnchere)
                        dateFin = new Date(row.dateFinEnchere);
					
					produits.push({
						idLocal:row.id,
						idCategorie:row.id_categorie,
						descriptifsCommuns:{
							libelle:row.libelle,
							prixInitial: row.prixInitial,
							pasEnchere: row.pasEnchere,
							tauxTVA: row.tauxTVA,
							dateDebutEnchere: dateDebut,
							dateFinEnchere: dateFin,
							contactProduit: row.contactProduit,
							contactRetrait: row.contactRetrait,
							modaliteRetrait: row.modaliteRetrait,
							modalitePaiement: row.modalitePaiement,
                            idProvenance: row.idProvenance,
                            libelleProvenance: row.libelleProvenance
						},
						statutProduit:row.statutProduit,
                        idInventaire: row.id_inventaire,
                        libelleInventaire: row.libelleInventaire
					});
					
					(function(i){
						tx.executeSql('SELECT * FROM CHAMPS_PRODUITS WHERE id_produit = ?',[produits[i].idLocal],function (tx,res){
							produits[i].descriptifsParticuliers = [];
							for(j=0; j < res.rows.length; j++){
								var row = res.rows.item(j);
								
								produits[i].descriptifsParticuliers.push({
									id:row.id_champ,
									valeur:row.valeur
								});
							}
		
							tx.executeSql('SELECT * FROM IMAGES_PRODUITS WHERE id_produit = ? ORDER BY ordre',[produits[i].idLocal],function (tx,res){
								produits[i].images = [];
								for(j=0; j < res.rows.length; j++){
									var row = res.rows.item(j);
									
									produits[i].images.push({
										ordre:row.ordre,
										id:row.id_image,
										path:row.path
									});
								}
							});
						});
					})(i);
				}
			});	
		 },onError,function(){callback(produits);});
	}
	
	//***************************************************************
	//Enregistrement du produit en base de données locale
	//***************************************************************
	this.storeProduit = function(produit,callback){		
		var id_produit;

		this.open();	
		
		if(undefined === mediator.data.produitCourant.descriptifsCommuns){
			mediator.data.produitCourant.descriptifsCommuns = {};
		}

		db.transaction(function(tx){
			var debut = mediator.data.produitCourant.descriptifsCommuns.dateDebutEnchere;
			var fin = mediator.data.produitCourant.descriptifsCommuns.dateFinEnchere;
			var r1 = function(){tx.executeSql('DELETE FROM PRODUITS WHERE id=?',[produit.idLocal],r2);};
			var r2 = function(){tx.executeSql('DELETE FROM IMAGES_PRODUITS WHERE id_produit=?',[produit.idLocal],r3);};
			var r3 = function(){tx.executeSql('DELETE FROM CHAMPS_PRODUITS WHERE id_produit=?',[produit.idLocal],r4);};
			var r4 = function(){tx.executeSql('INSERT INTO PRODUITS (id_client, id_categorie, libelle,prixInitial,pasEnchere,tauxTVA,dateDebutEnchere,dateFinEnchere,contactProduit,contactRetrait,modaliteRetrait,modalitePaiement,statutProduit,idProvenance,id_inventaire) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?, ?, ?, ?, ?)',
					[mediator.data.utilisateur.idClient,
					 mediator.data.produitCourant.idCategorie,
					 mediator.data.produitCourant.descriptifsCommuns.libelle || null,
					 mediator.data.produitCourant.descriptifsCommuns.prixInitial || null,
					 mediator.data.produitCourant.descriptifsCommuns.pasEnchere || null,
					 mediator.data.produitCourant.descriptifsCommuns.tauxTVA || null,
					 debut?debut.toISOString():null,
					 fin?fin.toISOString():null,
					 mediator.data.produitCourant.descriptifsCommuns.contactProduit || null,
					 mediator.data.produitCourant.descriptifsCommuns.contactRetrait || null,
					 mediator.data.produitCourant.descriptifsCommuns.modaliteRetrait || null,
					 mediator.data.produitCourant.descriptifsCommuns.modalitePaiement || null,
					 mediator.data.produitCourant.statutProduit || 'brouillon',
					 mediator.data.produitCourant.descriptifsCommuns.idProvenance || null,
					 mediator.data.produitCourant.idInventaire || null],
					 
					 function (tx,res){				
						id_produit = res.insertId;
						mediator.data.produitCourant.idLocal = id_produit;
						
						if (undefined != mediator.data.produitCourant.descriptifsParticuliers){
							$.each(mediator.data.produitCourant.descriptifsParticuliers,
									function(i,descriptif){
										tx.executeSql('INSERT INTO CHAMPS_PRODUITS (id_produit, id_champ, valeur) VALUES (?, ?, ?)',[id_produit,descriptif.id, descriptif.valeur]);
									}
							);
						}
						
						if (undefined != mediator.data.produitCourant.images){							
							$.each(mediator.data.produitCourant.images,
									function(i,image){
										tx.executeSql('INSERT INTO IMAGES_PRODUITS (id_produit, id_image, path, ordre) VALUES (?, ?, ?, ?)',[id_produit,image.id,image.path, image.ordre]);										
									}						
							);
						}						
				}
			)};
			r1();
		},onError,callback);
	}
	
	//***************************************************************
	//Duplication d'un produit en base de données locale
	//***************************************************************
	this.duplicateProduit = function(idProduit,nbOccurrence,callback){
		var id_produit;
		db.transaction(function(tx){
			for(var i=0; i<nbOccurrence;i++){
				tx.executeSql('INSERT INTO PRODUITS (id_client, id_categorie, libelle,prixInitial,pasEnchere,tauxTVA,dateDebutEnchere,dateFinEnchere,contactProduit,contactRetrait,modaliteRetrait,modalitePaiement,statutProduit,idProvenance,id_inventaire) SELECT id_client, id_categorie, libelle,prixInitial,pasEnchere,tauxTVA,dateDebutEnchere,dateFinEnchere,contactProduit,contactRetrait,modaliteRetrait,modalitePaiement,statutProduit,idProvenance,id_inventaire from PRODUITS WHERE id=?',[idProduit],
					function (tx,res){				
						id_produit = res.insertId;
						tx.executeSql('INSERT INTO CHAMPS_PRODUITS (id_produit, id_champ, valeur) SELECT ?, id_champ, valeur from CHAMPS_PRODUITS where id_produit=?',[id_produit,idProduit]);
						tx.executeSql('INSERT INTO IMAGES_PRODUITS (id_produit, id_image, path, ordre) SELECT ?, id_image, path, ordre from IMAGES_PRODUITS where id_produit=?',[id_produit,idProduit]);
					}
				);
			}
		},onError,callback);
	};
	
	this.deleteProduit = function(idProduit,callback){
		db.transaction(function(tx){
			tx.executeSql('DELETE FROM PRODUITS WHERE id=?',[idProduit]);
			tx.executeSql('DELETE FROM IMAGES_PRODUITS WHERE id_produit=?',[idProduit]);
			tx.executeSql('DELETE FROM CHAMPS_PRODUITS WHERE id_produit=?',[idProduit]);
		},onError,callback);
	};
	
	this.deleteTousProduits = function(idClient,idInventaire,callback){
		db.transaction(function(tx){
			switch(idInventaire){
			case '-1':
				tx.executeSql('DELETE FROM IMAGES_PRODUITS WHERE id_produit IN '
						+'(SELECT id FROM PRODUITS WHERE id_inventaire IS NULL AND id_client=?)',[idClient]);
				tx.executeSql('DELETE FROM CHAMPS_PRODUITS WHERE id_produit IN '
						+'(SELECT id FROM PRODUITS WHERE id_inventaire IS NULL AND id_client=?)',[idClient]);
				tx.executeSql('DELETE FROM PRODUITS WHERE id_inventaire IS NULL AND id_client=?',[idClient]);
				break;
			case '*':
				tx.executeSql('DELETE FROM IMAGES_PRODUITS WHERE id_produit IN '
						+'(SELECT id FROM PRODUITS WHERE id_client=?)',[idClient]);
				tx.executeSql('DELETE FROM CHAMPS_PRODUITS WHERE id_produit IN '
						+'(SELECT id FROM PRODUITS WHERE id_client=?)',[idClient]);
				tx.executeSql('DELETE FROM PRODUITS WHERE id_client=?',[idClient]);
				tx.executeSql('DELETE FROM INVENTAIRES WHERE id_client=?',[idClient]);
				break;
			default:
				tx.executeSql('DELETE FROM IMAGES_PRODUITS WHERE id_produit IN '
						+'(SELECT id FROM PRODUITS WHERE id_inventaire=?)', [idInventaire]);
				tx.executeSql('DELETE FROM CHAMPS_PRODUITS WHERE id_produit IN '
						+'(SELECT id FROM PRODUITS WHERE id_inventaire=?)', [idInventaire]);
				tx.executeSql('DELETE FROM PRODUITS WHERE id_inventaire=?', [idInventaire]);
				tx.executeSql('DELETE FROM INVENTAIRES WHERE id=?', [idInventaire]);
			}
		},onError,callback);
	};
	
	this.getInventairesAvecProduits = function(idClient,callback){
		this.open();
		var versionMiseAJour = false;
		var nouveauClient = false;
		
		db.transaction(function(tx){
    		tx.executeSql('SELECT p.id, p.libelle, p.prixInitial, p.statutProduit, '
    				+ 'i.id as id_inventaire, i.libelle as libelle_inventaire, '
    				+ 'ip.path as image '
    				+ 'FROM PRODUITS p '
    				+ 'LEFT JOIN INVENTAIRES i ON i.id = p.id_inventaire AND p.id_client = i.id_client '
    				+ 'LEFT JOIN IMAGES_PRODUITS ip ON ip.id_produit = p.id AND ip.ordre = 1 '
    				+ 'WHERE p.id_client = ? ORDER BY p.id DESC',[idClient],function (tx,res){
    			var produits = [];
    			var inventaires = [];
    			for(i=0; i<res.rows.length; i++){
    				var row = res.rows.item(i);
    				
    				// stocke l'inventaire si absent
    				var found = false;
    				var idInventaire = (row['id_inventaire'] || -1);
    				var libelleInventaire = (row['libelle_inventaire'] || 'pas d\'inventaire');
    				for(j=0; j<inventaires.length; j++){
    					if(inventaires[j].id === idInventaire){
    						found = true;
    					}
    				}
    				if(!found){
    					inventaires.push({
    						id:idInventaire,
    						libelle:libelleInventaire
    					});
    				}
    				
    				produits.push({
    					id:row.id,
    					libelle:row.libelle,
    					prixInitial:row.prixInitial,
						idInventaire:idInventaire,
						libelleInventaire:libelleInventaire,
						image:row.image,
						statutProduit:row.statutProduit,
    				});
    			}
    			callback(inventaires,produits);
    		});
		},onError,successCB);
		
	};
	
	this.addInventaire = function(libelle, idClient, callback){
		this.open;
		db.transaction(function(tx){	        			    				
			tx.executeSql('INSERT INTO INVENTAIRES (libelle, id_client) VALUES (?,?)',[$.trim(libelle),idClient],function(tx,res){
				callback(res.insertId);
			});
		},onErrorInventaire,successCB);      	
	}
	
	this.getInventaires = function(idClient,callback){
		this.open();
		var versionMiseAJour = false;
		var nouveauClient = false;
		
		db.transaction(function(tx){
    		tx.executeSql('SELECT i.id, i.libelle '
    				+ 'FROM INVENTAIRES i '
    				+ 'WHERE i.id_client = ?',[idClient],function (tx,res){
				var inventaires = [];
				for(var i=0; i<res.rows.length; i++){
					inventaires.push(res.rows.item(i));
				}
    			callback(inventaires);
    		});
		},onError,successCB);
		
	};
	
	this.getListeProvenances = function(callback){
		this.open();
		db.transaction(function(tx){
    		tx.executeSql('SELECT * '
    				+ 'FROM LISTE_PROVENANCES '
    				+ 'WHERE id_client = ?',[mediator.data.utilisateur.idClient],function (tx,res){
    			var listeProvenances = [];
    			for(i=0; i<res.rows.length; i++){
    				listeProvenances.push(res.rows.item(i));
    			}
    			callback(listeProvenances);
    		});
		},onError,successCB);
	}
	
	this.storeListeProvenances = function(listeProvenances){
		this.open();
		db.transaction(function(tx){
			tx.executeSql('DELETE FROM LISTE_PROVENANCES WHERE id_client = ?',[mediator.data.utilisateur.idClient]);
		    $.each(listeProvenances,function(i,provenance){
		    	tx.executeSql('INSERT INTO LISTE_PROVENANCES (id, id_client, libelle) VALUES (?, ?, ?)',[provenance.id,mediator.data.utilisateur.idClient,provenance.libelle]);
			});		  
		},onError,successCB);      			    
	    	    
	}
	

	//***************************************************************
	//Affichage des erreurs
	//***************************************************************
	var onError = function(e){
		mediator.publish('error',e);
	};
	var onErrorInventaire = function (){
		alert('Cet inventaire existe déjà.');
	}
	
}