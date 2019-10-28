/* Functions *******************************************************************/

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
                        let idx = values[y[0]].indexOf(y[1]);
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
 * Name: range
 * Synop: returns an array consisting of numbers between `start` and `end`
 */
function range(start, end) {
    return (new Array(end - start + 1)).fill(undefined).map((_, i) => i + start);
}

function build_plot(objs, xattr='obesity', yattr='smokes')
{

    let plot = d3.select('#scatter').html('').append('svg'),
        yaxis = plot.append('g'),
        xaxis = plot.append('g'),
        points = plot.append('g'),
        line = d3.line();

    // layout
    let height=600,
        width=800,
        padding=5,
        margin={ top:    0,
                 bottom: 100,
                 left:   100,
                 right:  0 };
    
    // tics
    let num_xtics = 10,
        num_ytics = 10,
        tic_length = 10,
        label_px = 11;

    if(!data)
        data = objs;
    
    if(!values)
        values = extract_values(objs);
         
    // info about data to plot
    let xmin = Math.floor(Math.min(...values[xattr])),
        xmax = Math.ceil(Math.max(...values[xattr])),
        ymin = Math.floor(Math.min(...values[yattr])),
        ymax = Math.ceil(Math.max(...values[yattr])),
        dx = (xmax - xmin)/num_xtics,
        dy = (ymax - ymin)/num_ytics;
        
    // utility objects
    coord = { x: d3.scaleLinear()
                   .domain([xmin-dx/2, xmax+dx/2])
                   .range([padding+margin.left, width-margin.right-padding]),
              y: d3.scaleLinear()
                   .domain([ymax+dy/2, ymin-dy/2])
                   .range([padding+margin.top, height-margin.bottom-padding]) },

    tics = { x: d3.scaleLinear()
                  .domain([1, num_xtics]).range([xmin, xmax]),
             y: d3.scaleLinear()
                  .domain([1, num_ytics]).range([ymin, ymax]) };
    
    // set width and height
    plot.attr('width', width)
        .attr('height', height);
        
    // plot data points //////////////////////////////////////////////
    points.selectAll('circle').data(objs).enter()
        .append('circle')
        .attr('cx', (obj) => coord.x(obj[xattr]))
        .attr('cy', (obj) => coord.y(obj[yattr]))
        .attr('class', 'data-point');

    // data point labels /////////////////////////////////////////////
    points.selectAll('text').data(objs).enter()
        .append('text')
        .attr('x', (obj) => coord.x(obj[xattr]))
        .attr('y', (obj) => coord.y(obj[yattr])+label_px*0.3)
        .text((obj) => obj.abbr)
        .attr('class', 'data-label');
    
    // setup x/y axis //////////////////////////////////////////////
    let ytics = range(1,num_ytics),
        xtics = range(1,num_xtics),
        ytic_pts = (val) => {
            let p0 = [ margin.left+padding, coord.y(tics.y(val)) ],
                p1 = [ margin.left+padding-tic_length, coord.y(tics.y(val)) ];
            return [p0,p1]; },
        xtic_pts = (val) => {
            let p0 = [ coord.x(tics.x(val)), height-margin.bottom-padding ],
                p1 = [ coord.x(tics.x(val)), height-margin.bottom-padding+tic_length ];
            return [p0,p1]; },
        ytic_label = (val) => `${tics.y(val).toFixed(2)}`,
        xtic_label = (val) => `${tics.x(val).toFixed(2)}`;

    // y tic labels 
    yaxis.selectAll('text').data(ytics).enter()
        .append('text')
        .attr('x', (val) => ytic_pts(val)[0][0]-tic_length*1.3)
        .attr('y', (val) => ytic_pts(val)[0][1]+label_px*0.3)
        .text(ytic_label)
        .attr('class', 'tic-label ytic-label');

    // y tic marks
    yaxis.selectAll('path').data(ytics).enter()
        .append('path')
        .attr('d', (val) => line(ytic_pts(val)))
        .attr('stroke', 'black');

    // y bounding-box line
    yaxis.append('path')
        .attr('stroke', 'black')
        .attr('d', line([[ margin.left+padding, margin.top+padding ],
                         [ margin.left+padding, height-margin.bottom-padding+tic_length ]]));

    // y label
    let x0 = margin.left+padding-tic_length-4.5*label_px,
        y0 = coord.y(0.5*(ymin+ymax));
    
    yaxis.append('text')
        .attr('x', x0)
        .attr('y', y0)
        .attr('transform', `rotate(-90, ${x0}, ${y0})`)
        .text( variable_labels[yattr] )
        .attr('class', 'y-label');

    // x tic labels
    xaxis.selectAll('text').data(xtics).enter()
        .append('text')
        .attr('x', (val) => xtic_pts(val)[1][0])
        .attr('y', (val) => xtic_pts(val)[1][1]+label_px)
        .text(xtic_label)
        .attr('class', 'tic-label xtic-label');

    // x tic marks
    xaxis.selectAll('path').data(xtics).enter()
        .append('path')
        .attr('d', (val) => line(xtic_pts(val)))
        .attr('stroke', 'black');

    // x bound-box line
    xaxis.append('path')
        .attr('stroke', 'black')
        .attr('d', line([[ margin.left+padding-tic_length, height-margin.bottom-padding ],
                         [ width-margin.right-padding,     height-margin.bottom-padding ]]));

    // add x label
    xaxis.append('text')
        .attr('x', coord.x(0.5*(xmin+xmax)))
        .attr('y', height-margin.bottom-padding+tic_length+label_px*3.5)
        .text( variable_labels[xattr] )
        .attr('class', 'x-label');

}


/*

id: "2"
state: "Alaska"
abbr: "AK"

age: "33.3"
ageMoe: "0.3"

healthcare: "15"
healthcareHigh: "16.6"
healthcareLow: "13.3"

income: "71583"
incomeMoe: "1784"

obesity: "29.7"
obesityHigh: "31.6"
obesityLow: "27.8"

poverty: "11.2"
povertyMoe: "0.9"

smokes: "19.9"
smokesHigh: "21.6"
smokesLow: "18.2"
*/

/* Variables *******************************************************************/

var coord, tics;

var data_path = 'assets/data/data.csv',
    data=undefined,
    values=undefined;

var variable_labels=
    { obesity: "Obese (%)",
      smokes: "Smokes (%)",
      healthcare: "Lacks Healthcare (%)",
      poverty: "In Poverty (%)",
      age: "Age (Median)",
      income: "Household Income (Median)" };

d3.csv(data_path).then(build_plot);

