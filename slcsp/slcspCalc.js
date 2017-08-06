/*
1. Load zips, plans into DB
2. Read in zip codes in slcsp.csv, split lines
3. Loop through zips in slcsp. For each zip:
    1. Find associated rate areas using zips. If more than one, skip
    2. Get silver plans for rate area, sorted by price ascending. Limit query to 2
    3. Take second cheapest, update line in slcsp
4. Join lines, save back to slcsp.csv
*/

var alasql = require("alasql");
var Promise = require("es6-promise").Promise;
var _ = require("lodash");
var fs = require("fs");


//initialize our SQL Database with data from zips.csv and plans.csv
var zipInsert = alasql.promise("CREATE TABLE zips; SELECT * INTO zips FROM CSV('zips.csv', {separator: ','})");
var plansInsert = alasql.promise("CREATE TABLE plans; SELECT * INTO plans FROM CSV('plans.csv', {separator: ','})");

//Once our DB is initialized, loop through zip codes to find the SLCSP for
Promise.all([zipInsert, plansInsert]).then(
    function() {
        var inputLines = _.split(_.trim(fs.readFileSync("slcsp.csv")), "\n");
        //compiled queries to get rate area and plans
        //Don't pre-compile zip query because of a bug in alasql (Source code says "TODO: Problem with DISTINCT on objects")
        //var getRateAreasForZip = alasql.compile("SELECT DISTINCT rate_area, state FROM zips WHERE zipcode=$zip");
        var getCheapestTwoSilverPlans = alasql.compile("SELECT rate FROM plans WHERE metal_level='Silver' AND rate_area=$rate_area AND state=$state ORDER BY rate ASC LIMIT 2");

        var newLines = _.map(_.tail(inputLines), 
            function(line) {
                var zip = _.replace(line, ",", "");
                var rateAreas = alasql("SELECT DISTINCT rate_area, state from zips where zipcode=" + zip);
                //if we do not have exactly one rate area then the answer is ambiguous, so we leave it blank
                if(rateAreas.length != 1) {
                    return line;
                }
                //TODO: Convert our two queries into a single JOIN to speed up our total query time
                var plans = getCheapestTwoSilverPlans(rateAreas[0]);
                //if we didn't find two plans then the answer is ambiguous, so leave it blank
                if(plans.length != 2) {
                    return line;
                }
                return _.join([zip, plans[1].rate], ",");
            }
        );
        //add back the header line and write back to file
        newLines.unshift(inputLines[0]);
        var output = _.join(newLines, "\n");
        fs.writeFileSync("slcsp.csv", output);

    }    
).catch(
    function(error) {
        console.log(error);
    }    
);


