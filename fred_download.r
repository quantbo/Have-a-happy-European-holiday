comment("
fred_download.r:
Download CSV files specified in 'fred.r'. Place in the current directory.

To run from the command line:
Rscript fred_download.r
")

fred_download = function() {
	source('fred.r', local=TRUE) #Load 'fred' list, 'template' string.
	for (ii in 1:length(fred)) {
		symbol = fred[[ii]]$symbol
		print(symbol)
		url = sub('XXX', symbol, template)
		dfr = utils::read.csv(url)

		#There are missing records for the weekends.
		#If we decide to generate graphs in D3 and want to avoid interpolation--so as to only graph actual data--it is necessary to provide the missing records and to give them a non-numeric value. The code below does this, with a value of '<NA>' being supplied automatically.
		d1 = as.Date(dfr$DATE[1])
		d2 = as.Date(dfr$DATE[nrow(dfr)])
		date_seq = seq(d1, d2, 1)
		temp = as.data.frame(format(date_seq))
		names(temp) = 'DATE'
		dfr = merge(temp, dfr, all.x=TRUE)
		
		#A missing VALUE is represented as a period. This can be construed by Javascript as the number 0.0. To prevent misinterpretation, convert to the string '<NA>'.
		dfr$VALUE = sub('^[\\.]$', '<NA>', dfr$VALUE)

		#Provide visual feedback showing gap at weekend.
		print(tail(dfr, 12))
		file = paste(symbol, '.csv', sep='')
		write.table(dfr, file=file, sep=',', row.names=FALSE)
	}
}

#If run from the command line, execute fred_download.
if (!interactive()) fred_download()
