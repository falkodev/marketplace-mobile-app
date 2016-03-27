package com.agoraproject.plugins.export;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ICsvFileWriter {
	
	/**
	 * @param mappedData liste de Map(associations de clée/data)
	 * @throws IOException
	 */
    void write(List<Map<String, String>> mappedData) throws IOException;

    /**
	 * @param mappedData liste de Map(associations de clée/data)
	 * @param titles
	 * @throws IOException
	 */
    void write(List<Map<String, String>> mappedData, String[] titles) throws IOException;
}
