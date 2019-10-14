
function buildMetadata(sample_id)
{

    // @TODO: Complete the following function that builds the metadata panel

    // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`

    d3.json(`/metadata/${sample_id}`).then(
        function (data) {
            let metadata_panel = d3.select('#sample-metadata');

            // Use `.html("") to clear any existing metadata
            metadata_panel.html('');


            let dlist = metadata_panel.append('dl');

            dlist.property('class', 'row');
            
            // Use `Object.entries` to add each key and value pair to the panel
            // Hint: Inside the loop, you will need to use d3 to append new
            // tags for each key-value in the metadata.
            Object.entries(data).forEach(
                function ([key, value]) {
                    dlist.append('dt').text(key).property('class', 'col-sm-3');
                    dlist.append('dd').text(value).property('class', 'col-sm-3');
                }
            );
            
            // BONUS: Build the Gauge Chart
            // buildGauge(data.WFREQ);

        }
    );

}

function buildCharts(sample_id)
{
    let selector = d3.select('#selDataset');
    
    // @TODO: Use `d3.json` to fetch the sample data for the plots
    d3.json(`/samples/${sample_id}`).then(
        function (sample) {
            console.log(`Processing data for sample ${sample_id}`);

            let  pie = d3.select('#pie'),
                gauge = d3.select('#gauge');

            // @TODO: Build a Bubble Chart using the sample data
            
            let trace = {
                x: sample.otu_ids,
                y: sample.sample_values,
                text: sample.otu_labels,
                mode: 'markers',
                marker: {
                    color: sample.otu_ids,
                    size: sample.sample_values
                },
                type: 'scatter'
            };

            let layout = {
                title: `Sample ID ${sample_id}`
            };
            
            Plotly.newPlot("bubble", [trace], layout);

            // @TODO: Build a Pie Chart
            // HINT: You will need to use slice() to grab the top 10 sample_values,
            // otu_ids, and labels (10 each).
            
            trace = {
                labels: sample.otu_ids.slice(0,10),
                values: sample.sample_values.slice(0,10),
		        hovertext: sample.otu_labels.slice(0,10),
                type: 'pie'
            };

            layout = {
                title: `Sample: ${sample_id}`
            };

            Plotly.newPlot("pie", [trace], layout);

        }
    );
}

function init()
{
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");
    
    // Use the list of sample names to populate the select options
    d3.json("/names").then((sampleNames) => {
        sampleNames.forEach((sample) => {
            selector
                .append("option")
                .text(sample)
                .property("value", sample);
        });
        
        // Use the first sample from the list to build the initial plots
        const firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
    });
}

function optionChanged(newSample)
{
    // Fetch new data each time a new sample is selected
    buildCharts(newSample);
    buildMetadata(newSample);
}

// Initialize the dashboard
init();
