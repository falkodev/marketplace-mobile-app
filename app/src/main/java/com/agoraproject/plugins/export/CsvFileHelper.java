package com.agoraproject.plugins.export;

import java.io.File;

public class CsvFileHelper {
	
  public static String getResourcePath(String fileName) {
       final File f = new File("");
       final String dossierPath = f.getAbsolutePath() + File.separator + fileName;
       return dossierPath;
   }

   public static File getResource(String fileName,boolean isResourcePath) {
	   File file;
	   if(isResourcePath){
		   final String completeFileName = getResourcePath(fileName);
	       file = new File(completeFileName);
	   }else{
		   file = new File(fileName);
	   }
       
       return file;
   }
}
