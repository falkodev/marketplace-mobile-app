package com.agoraproject.plugins;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jxl.CellView;
import jxl.Workbook;
import jxl.format.Alignment;
import jxl.format.Border;
import jxl.format.BorderLineStyle;
import jxl.format.Colour;
import jxl.format.VerticalAlignment;
import jxl.write.Label;
import jxl.write.WritableCellFormat;
import jxl.write.WritableFont;
import jxl.write.WritableSheet;
import jxl.write.WritableWorkbook;
import jxl.write.WriteException;
import jxl.write.biff.RowsExceededException;



import org.apache.cordova.api.CallbackContext;
//import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Intent;
import android.net.Uri;

import com.agoraproject.plugins.export.CsvFileWriterImpl;
import com.agoraproject.plugins.export.ICsvFileWriter;


public class PluginExport extends CordovaPlugin {
	   
		@Override
		public boolean execute(String action, JSONArray args, CallbackContext callbackContext)throws JSONException {		
	        try {
	            if (action.equals("echo")) {
	                String echo = args.getString(0); 
	                if (echo != null && echo.length() > 0) { 
	                	File file = new File(cordova.getActivity().getExternalFilesDir(null), "DemoFile2.csv");
	                	ICsvFileWriter fileWriter = new CsvFileWriterImpl(file);
	                	 List<Map<String, String>> data = new ArrayList<Map<String, String>>();
	                	 Map<String, String> oneData;

	                	// parsing des args
	                	try {	
	                		 int size = args.length();
	                		 //size
	                		 for (int i = 0; i < 1; i++) {
	                			 JSONObject another_json_object = args.getJSONObject(i);
	                			 String categorie = another_json_object.getString("nomCategorie");
	                			 JSONArray listeProduits = another_json_object.getJSONArray("produits");
	                			 for (int j = 0; j < listeProduits.length(); j++) {
	                				 JSONArray produits = listeProduits.getJSONArray(j);
	                				 oneData = new HashMap<String, String>();
	                				 for (int k = 0; k < produits.length(); k++) {
	                					 JSONObject produit = produits.getJSONObject(k);
	                					 String champ = produit.getString("champ");
	                					 String valeur = produit.getString("valeur");
	                					 oneData.put(champ,valeur);
	                				 }
	                				 data.add(oneData);
	                			 }
	                		 }
	                		 fileWriter.write(data);
		                 } catch (JSONException e) {
	                         e.printStackTrace();
		                 } catch (IOException e) {
							e.printStackTrace();
						}
	                   
	                	callbackContext.success();
	                    return true;
	                } else {	                   
	                	callbackContext.error("Une erreur est survenue");
	                	return false;
	                }
	            } else if(action.equals("exportXls")) {                     
                    callbackContext.sendPluginResult(exportXls(args));
                    return true;
	            } else {
	            	callbackContext.error(String.format("Action invalide : %s", action));	                
	                return false;
	            }
	        } catch (JSONException e) {
	            callbackContext.error(String.format("Une erreur est survenue : %s", e.getMessage()));
	            return false;
	        }
	    }

		
		private PluginResult exportXls(JSONArray args) {
			try {
				JSONObject argsMail = args.getJSONObject(0);
				JSONArray argsExport = args.getJSONArray(1);
				
				File file = new File(cordova.getActivity().getExternalFilesDir(null), argsMail.getString("fileName"));
				WritableWorkbook workbook = Workbook.createWorkbook(file);
				
				WritableCellFormat normalFormat = new WritableCellFormat(new WritableFont(WritableFont.ARIAL,10));
				normalFormat.setWrap(true);
				normalFormat.setAlignment(Alignment.CENTRE);
				normalFormat.setVerticalAlignment(VerticalAlignment.CENTRE);
				WritableCellFormat headerFormat = new WritableCellFormat(new WritableFont(WritableFont.ARIAL,11,WritableFont.BOLD));
				headerFormat.setAlignment(Alignment.CENTRE);
				headerFormat.setVerticalAlignment(VerticalAlignment.CENTRE);
				headerFormat.setBackground(Colour.LIGHT_TURQUOISE);
				headerFormat.setBorder(Border.ALL, BorderLineStyle.THICK);
				
				int nCategories = argsExport.length();
				for (int i = 0; i < nCategories; i++) {
					JSONObject categorie = argsExport.getJSONObject(i);
					WritableSheet sheet = workbook.createSheet(categorie.getString("nomCategorie"), i);
					JSONArray produits = categorie.getJSONArray("produits");
					int nProduits = produits.length();
					if(nProduits < 1) continue;
					

					Label label = new Label(0,0,"",headerFormat);
					sheet.addCell(label);

					CellView cellView = new CellView();
					cellView.setSize(690);
					sheet.setRowView(0, cellView);
					
					JSONArray produit = produits.getJSONArray(0);
					int nChamps = produit.length();
					for (int j = 0; j < nChamps; j++){
						sheet.setRowView(j+1, cellView);
						label = new Label(0,j+1,produit.getJSONObject(j).getString("champ"),headerFormat);
						sheet.addCell(label);
					}

					cellView = new CellView();
					cellView.setSize(10000);
					sheet.setColumnView(0, cellView);
					
					for(int j = 0; j < nProduits; j++){
						sheet.setColumnView(j+1, cellView);
						label = new Label(j+1, 0, "Produit " + (j+1),headerFormat);
						sheet.addCell(label);
						produit = produits.getJSONArray(j);
						nChamps = produit.length();
						for (int k = 0; k < nChamps; k++){
							label = new Label(j+1, k+1, produit.getJSONObject(k).getString("valeur"),normalFormat);
							sheet.addCell(label);
						}
					}					
				}

				workbook.write(); 
				workbook.close();
				
				Intent emailIntent = new Intent(android.content.Intent.ACTION_SEND);
				emailIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
				emailIntent.setType("application/vnd.ms-excel");
				emailIntent.putExtra(Intent.EXTRA_STREAM, Uri.parse("file://"+file.getAbsolutePath()));
				emailIntent.putExtra(Intent.EXTRA_EMAIL, new String[] {argsMail.getString("email")});
				emailIntent.putExtra(Intent.EXTRA_SUBJECT, argsMail.getString("subject"));
				emailIntent.putExtra(Intent.EXTRA_TEXT, argsMail.getString("text"));
				cordova.startActivityForResult(this, Intent.createChooser(emailIntent, "Choisissez une application"), 0);

	            return new PluginResult(PluginResult.Status.OK,file.getPath());
			} catch (IOException e) {
				e.printStackTrace();
			} catch (RowsExceededException e) {
				e.printStackTrace();
			} catch (WriteException e) {
				e.printStackTrace();
	        } catch (JSONException e) {
	            return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
	        }
            return new PluginResult(PluginResult.Status.ERROR);
		}
		     
}
