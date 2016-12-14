comment("
The formula for retrieving CSV files from FRED seems to be to insert the series symbol into the following template:

	http://research.stlouisfed.org/fred2/data/XXX.csv

where XXX can be DEXUSEU (Dollar/Euro exchange rate), etc. On the other hand, if you  want to see a series displayed on the FRED website, the following template seems to work:

	https://fred.stlouisfed.org/series/XXX

The field dollars_per_currency is TRUE if the data represent dollars per the indicated currency and is FALSE if the data represent the quantity of the indicated currency per dollar.
")

template = 'http://research.stlouisfed.org/fred2/data/XXX.csv'

fred = list(
	list(my_title = 'Dollars per Euro',
		fred_title = 'U.S. / Euro Foreign Exchange Rate',
		citation = 'U.S. / Euro Foreign Exchange Rate [DEXUSEU], retrieved from FRED, Federal Reserve Bank of St. Louis',
		symbol = 'DEXUSEU',
		dollars_per_currency = TRUE),
	list(my_title = 'Dollars per Pound',
		fred_title = 'U.S. / U.K. Foreign Exchange Rate',
		citation = 'Board of Governors of the Federal Reserve System (US), U.S. / U.K. Foreign Exchange Rate [DEXUSUK], retrieved from FRED, Federal Reserve Bank of St. Louis',
		symbol = 'DEXUSUK',
		dollars_per_currency = TRUE),
	list(my_title = 'Dollars per Swiss Franc',
		fred_title = 'Switzerland / U.S. Foreign Exchange Rate',
		citation = 'Board of Governors of the Federal Reserve System (US), Switzerland / U.S. Foreign Exchange Rate [DEXSZUS], retrieved from FRED, Federal Reserve Bank of St. Louis',
		symbol = 'DEXSZUS',
		dollars_per_currency = FALSE)
)

#Assign names to the list members. Will be used as keywords when converted to Javascript.
names(fred) = c('euro', 'pound', 'swissfranc')
