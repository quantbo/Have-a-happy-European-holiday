comment("
fred_download.r:
Download CSV files specified in 'fred.r'. Place in the current directory.

To run from the command line:
Rscript fred_download.r
")

fred_download = function() {
	source('fred.r', local=TRUE) #Load 'fred' list, 'template' string.
	system('Rscript fred2js.r') #Translate 'fred.r' to 'fred.js'.
	for (ii in 1:length(fred)) {
		message('===== ', fred[[ii]]$title, ' =====')
		symbol = fred[[ii]]$symbol
		message(symbol)
		url = sub('XXX', symbol, template)
		dfr = utils::read.csv(url)

		#There are missing records for the weekends.
		#If we decide to generate graphs in D3 and want to avoid interpolation--so as to only graph actual data--it is necessary to provide the missing records and to give them a non-numeric value. The code below does this, with a value of '<NA>' being supplied automatically. This is the R representation of NA for character data.
		#Generating the missing records also allows us to easily quantify the proportion of missing data in the time series.
		d1 = as.Date(dfr$DATE[1])
		d2 = as.Date(dfr$DATE[nrow(dfr)])
		date_seq = seq(d1, d2, 1)
		temp = as.data.frame(format(date_seq))
		names(temp) = 'DATE'
		dfr = merge(temp, dfr, all.x=TRUE)
		
		#A missing VALUE is represented as a period. When graphing in D3 I have found this interpreted as 0. To prevent misinterpretation convert to '<NA>'.
		dfr$VALUE = sub('^[\\.]$', '<NA>', dfr$VALUE)

		#Calculate proportion of missing data.
		message('Percent missing data: ', 100 * round(sum(is.na(dfr$VALUE))/nrow(dfr), 2), '%')
		
		#If data are in dollars per currency, invert.
		suppressWarnings((dfr$VALUE = as.numeric(dfr$VALUE)))
		if (fred[[ii]]$dollars_per_currency) {
			dfr$VALUE = 1 / dfr$VALUE
		}

		#Provide visual feedback showing gap at weekend.
		print(tail(dfr, 12))
		file = paste(symbol, '.csv', sep='')
		write.table(dfr, file=file, sep=',', row.names=FALSE)
	}
}

#If run from the command line, execute fred_download.
if (!interactive()) fred_download()
