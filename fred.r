comment("
The formula for retrieving CSV files from FRED seems to be to insert the series symbol into the following template:

	http://research.stlouisfed.org/fred2/data/XXX.csv

where XXX can be DEXUSEU (Dollar/Euro exchange rate), etc. On the other hand, if you  want to see a series displayed on the FRED website, the following template seems to work:

	https://fred.stlouisfed.org/series/XXX

The field dollars_per_currency is TRUE if the data represent dollars per the indicated currency and is FALSE if the data represent the quantity of the indicated currency per dollar.
")

template = 'http://research.stlouisfed.org/fred2/data/XXX.csv'

fred = list(
	list(title = 'Euros per Dollar',
		citation = 'Source: Federal Reserve Bank of St. Louis (FRED)',
		symbol = 'DEXUSEU',
		dollars_per_currency = TRUE),
	list(title = 'Pounds per Dollar',
		citation = 'Source: Federal Reserve Bank of St. Louis (FRED)',
		symbol = 'DEXUSUK',
		dollars_per_currency = TRUE),
	list(title = 'Swiss Francs per Dollar',
		citation = 'Source: Federal Reserve Bank of St. Louis (FRED)',
		symbol = 'DEXSZUS',
		dollars_per_currency = FALSE)
)

#Assign names to the list members. Will be used as keywords when converted to Javascript.
names(fred) = c('euro', 'pound', 'swissfranc')
