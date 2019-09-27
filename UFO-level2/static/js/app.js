/* 
 * Name: build_filter
 * Synop: construct and return a function which takes a single
 *    parameter, `entry` and returns whether or not `entry` satisfies
 *    the conditions represented by `conditions`
 */
function build_filter(conditions)
{
    let atomic_formula, preprocessed, filter;
    
    atomic_formula=(attr,val)=>
        `(entry.${attr}.toUpperCase() === "${val.toString().toUpperCase()}")`;

    // preprocess `conditions` into an appropriately grouped
    //   family of atomic statements
    preprocessed = Object.entries(conditions)
        .map(([key, val]) => val.map(entry => atomic_formula(key, entry)));

    // assemble statement with free variable `entry`
    //   which determines whether or not entry meets the filtering
    //   criteria
    filter = preprocessed
        .filter(x => x.length>0)
        .map(disjunct => `(${disjunct.join('||')})`).join('&&');

    // return anonymous function testing assembled statement
    return eval('entry => '+(filter.length === 0 ? 'true' : filter));
}


/*
 * Name: extract_values
 * Synop: processes the array `objects` (assumed to 
 *    all have the same set of attributes) and extracts the _set_'s
 *    of values which occur for each attribute.
 */
function extract_values(objects)
{
    let values = {};
    
    // extract unique attribute values
    objects.forEach(
        x => {
            Object.entries(x).forEach(
                y => {
                    if(y[0] in values) {
                        let idx = values[y[0]].indexOf(y[1])
                        if( idx == -1 )
                            values[y[0]].push(y[1]);
                    } else
                        values[y[0]] = [y[1]];
                });
        });

    // sort resulting arrays
    Object.keys(values).forEach(
        k => values[k].sort()
    );

    // return object
    return values;
}


/* 
 * Name: append_control 
 * Synop: ...
 */
function append_control(elm, control)
{
    let item, attrs;
    
    switch(control.type) {
    case 'options':
        let button, menu, option;

        // add container for new dropdown selector
        item = elm.append('div').attr('class', 'dropright');
    
        // create dropdown selector toggle button
        button = item.append('button');
        attrs = { 'id': `${control.key}-button`,
                  'type': 'button',
                  'class':
                    'dropdown-toggle btn btn-secondary btn-sm form-control text-right',
                  'aria-haspopup': 'true',
                  'aria-expanded': 'false',
                  'data-toggle': 'dropdown' };
    
        // set button attributes
        Object.entries(attrs).forEach(([k,v]) => button.attr(k,v))
    
        // add button label
        button.html(`${control.label}`);
            /*.append('span')
            .attr('class', 'glyphicon glyphicon-chevron-right'); */
    
        // create dropdown selector menu
        menu = item.append('div');
        attrs = {'class': 'dropdown-menu',
                 'aria-labelledby': `${control.key}-button`};
    
        // set menu attributes
        Object.entries(attrs).forEach(([k,v]) => menu.attr(k,v))

        // add checkboxs for elements of `control.values`
        control.values.forEach(
            value => {
                option = menu.append('a');
                attrs = {'data-key': control.key,
                         'data-value': value,
                         'href': '#',
                         'class':
                            'dropdown-item form-control'};

                // set menu option attributes
                Object.entries(attrs).forEach(([k,v]) => option.attr(k,v))
                
                // add label and checkbox
                option.append('input').attr('type', 'checkbox');
                option.append('label').html(`&nbsp;${value.toUpperCase()}`);
            }
        );
        break;

    case 'text':
        let input, label;
        item = elm.append('div').attr('class','form-group');
        //item = filters.append('li').attr('class', 'list-group-item');
        label = item.append('label').html(`${control.label} `)
        input = item.append('input');
        attrs = {'data-key': control.key,
                 'type': 'text',
                 'placeholder': control.placeholder,
                 'class': 'form-control form-control-sm'};
        Object.entries(attrs).forEach(([k,v])=>input.attr(k,v));
        break;
    
    default:
        break;
    }
}


/*
 * Name: update_table
 * Synop:
 *    clear body of table with id `ufo-table` and 
 *    populate with appropriately filtered data from `tableData`
 */
function update_table()
{
    let body, valid_entry;

    // select table body
    body = d3.select("#ufo-table>tbody");

    // build function to filter data
    valid_entry =
        build_filter(conditions);
    
    // filter data using constructed function
    let valid = data.filter(valid_entry);
    
    // clear and populate table with contents of `valid`
    body.html('')
        .selectAll('tr')
        .data(valid).enter()
        .append('tr')
        .selectAll('td')
        .data(Object.values).enter()
        .append('td')
        .html(v => v.toString().toUpperCase());
}


/* 
 * Name: menu_option_onclick
 * Synop: updates the appropriate attribute of `conditions`
 *     using the 'data-key' and 'data-value' attributes of the 
 *     event target.
 */
function menu_option_onclick()
{
    // prevent default behavior 
    d3.event.preventDefault();

    // select target and extract attributes
    let target = d3.select(this),
        key = target.attr('data-key'),
        val = target.attr('data-value'),
        checkbox = target.select('input'),
        idx = conditions[key].indexOf(val);

    // is this condition already selected?
    if (idx > -1) {
        // if so, then unset it and remove it from `conditions[key]`
        conditions[key].splice(idx, 1);
        setTimeout(x => checkbox.property( 'checked', false ), 0);
        // NOTE: setTimeout used because of drawing bullshit.
    } else {
        // if not, then set it and update `conditions[key]`
        conditions[key].push(val);
        setTimeout(x => checkbox.property( 'checked', true ), 0);

    }

    // redraw is needed
    target.dispatch('blur');
    return false;
}

/* 
 * Name: text_input_onchange
 * Synop: handle 'change' event for an input of type 'text' and
 *    updating `conditions`.
 */
function text_input_onchange()
{
    // inhibit default event handler
    d3.event.preventDefault();

    // extract relevant information
    let target = d3.select(this),
        value = target.property('value'),
        key = target.attr('data-key');

    // update appropriate attribute of `conditions`
    if(value.length > 0)
        conditions[key] = [value];
    else
        conditions[key] = [];
    
    return false;
}


/* 
 * Name: apply_filter_onclick
 * Synop:
 *    handles the `click` event emitted for button with id `filter-btn`.
 *    calls `update_table`
 */
function apply_filter_onclick()
{
    // prevent default behavior 
    d3.event.preventDefault();
    
    // update the contents of the table
    update_table();
    return;
}


var data = data; /* from data.js */

var values = {},     /* Holds sets of values which occur as attributes in data*/
    controls = {},   /* Holds information on filter panel elements */
    conditions = {}; /* Holds conjunctive normal form of filtering criteria */

/*
 * The CNF representation we'll use is vaugely as follows, arrays represent
 *   collections of conditions which will be joined together with an 'or',
 *   while the attributes of the object correspond to compound statements 
 *   and are joined together by 'and'
 * (see function `build_filter` for details.) 
 */

conditions = { datetime: [],
               city: [],
               state: [],
               country: [],
               shape: [] };

/*
 * Collect values witnessed as some attribute 
 *   of a member of `data`
 */

values = extract_values( data );

/*
 * Describes the controls which will be part of 
 *   the form used to specify conditions used to filter `data`
 */

controls = [{ label: 'Date:',
              key: 'datetime',
              type: 'text',
              placeholder: '1/11/2010' },
            
            { label: 'City:',
              key: 'city',
              type: 'text',
              placeholder: 'Charlotte' },

            { label: 'Country',
              key: 'country',
              type: 'options',
              values: values.country },
            
            { label: 'State',
              key: 'state',
              type: 'options',
              values: values.state },
           
            { label: 'Shape',
              key: 'shape',
              type: 'options',
              values: values.shape }];
                   

/* 
 * Create "Filter Results" Form
 */

controls.forEach(obj=>append_control(d3.select(`#filters>.${obj.type}`), obj));

/* 
 * Connect Event Handlers 
 */

d3.select("#filter-btn" ).on('click',  apply_filter_onclick);
d3.select('#filter-form').on('submit', apply_filter_onclick);

d3.select('#filters>.options')
    .selectAll('a').on('click',  menu_option_onclick);
d3.select('#filters>.text')
    .selectAll('input').on('change', text_input_onchange);

// populate table with initial data
update_table();

