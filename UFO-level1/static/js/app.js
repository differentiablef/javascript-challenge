// from data.js
var tableData = data;

// YOUR CODE HERE!
var ubody = d3.select("#ufo-table>tbody"),
    fbutton = d3.select("#filter-btn");


    
tableData.forEach(
    (entry) => {
        var row = ubody.append('tr');
        Object.entries(entry)
            .forEach(
                ([key, value]) => {
                    var cell = row.append('td');
                    if(value !== undefined)
                        cell.html(value.toString()
                                  .toUpperCase());
                }
            );
        
    }
);


//populateTable(

