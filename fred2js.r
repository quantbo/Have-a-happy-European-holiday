comment("
fred2js.r:
Convert the 'fred' data strucutre (a list of lists) to a Javascript object literal. Store in a file.
")

#Place the argument between single quotes.
#R logical values are converted to Javascript logical values.
#Different from the R sQuote function, which does not work here.
s_quote = function(x) {
	if (x == 'TRUE') {
		return('true') #Javascript form of TRUE.
	}
	if (x == 'FALSE') {
		return('false') #Javascript form of FALSE.
	}
	paste("'", x, "'", sep='')
}

fred2js = function() {
	file = 'fred.js' #Write output here.
	#The intial cat, by default, overwrites previous versions of file.
	#Subsequent calls to cat must append.
	cat('fred = {\n', file=file)
	#Abbreviate.
	cat1 = function(...) cat(..., file=file, append=TRUE, sep='')
	source('fred.r', local=TRUE) #Load 'fred' list.
	nmz = names(fred)
	for (ii in 1:length(fred)) {
		item = fred[[ii]]
		cat1('\t', s_quote(nmz[ii]), ': {\n')
		for (jj in 1:length(item)) {
			cat1('\t\t')
			cat1(s_quote(names(item[jj])), ': ', s_quote(item[[jj]]))
			if (jj < length(item)) {
				cat1(',\n')
			} else {
				cat1('\n') #No comma after last item.
			}
		}
		if (ii < length(fred)) {
			cat1('\t},\n')
		} else {
			cat1('\t}\n') #No comma after last item.		
		}
	}
	cat1('}\n')
}

#If run from the command line, execute the program.
if (!interactive()) fred2js()
