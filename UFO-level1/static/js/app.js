// from data.js
var tableData = data;

/*
 * Name: populate_table
 * Synop:
 *    clear the body of the table with id `ufo-table` and 
 *    populate with appropriate data from `tableData`
 *
 * Note: 
 *    if `date` is not undefined, then the function check if it is a valid
 *    date and use it to filter the results
 */
function populate_table
(date=undefined) {
    let ubody=d3.select("#ufo-table>tbody"),   // select table body
        dt=new Date(date),           // attempt to parse `date`
        filter_func=(x) => true; // set default filter function
    
    // if not undefined, check that the date is valid
    if( date !== undefined ) {
        if(dt.getYear() === NaN) {
            // TODO: inform user of issue with date
            throw("Invalid date");
        } else {
            filter_func = function(entry) {
                    let m = dt.getMonth()+1,
                        d = dt.getDate(),
                        y = dt.getFullYear();
                    
                    return entry.datetime === `${m}/${d}/${y}`;
            };
        }
    }
    
    // clear table body
    ubody.html('');

    // filter table data appropriately
    let tdata = tableData.filter( filter_func );

    // populate table with contents of `tdata`
    tdata.forEach(
        (entry) => {
            let row = ubody.append('tr');
            Object
                .entries(entry)
                .forEach(
                    ([key, value]) => {
                        let cell = row.append('td');
                        if(value !== undefined)
                            cell.html(value.toString()
                                      .toUpperCase());
                    });
        });

    return;
}


/* 
 * Name: filter_button_onclick
 * Synop:
 *    handles the `click` event emitted for button with id `filter-btn`.
 *    calls `populate_table` with contents of the input element with
 *    id `datetime` being passed as the `date` parameter
 */
function filter_button_onclick
() {
    d3.event.preventDefault();
    
    // extract value of `#datetime` element
    let dvalue = d3.select('#datetime').property('value');
    
    // call populate_table passing `dvalue` as `date`
    populate_table(dvalue);

    return;
}

// setup event handlers
d3.select("#filter-btn").on('click', filter_button_onclick);
d3.select('form').on('submit', filter_button_onclick);

// populate table with initial data
populate_table();

