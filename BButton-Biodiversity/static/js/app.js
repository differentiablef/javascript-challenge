function buildMetadata(sample) {

    // @TODO: Complete the following function that builds the metadata panel

    // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`

    // Use `.html("") to clear any existing metadata

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
}

function buildCharts(sample_id)
{
    let selector = d3.select('#selDataset');
    
    // @TODO: Use `d3.json` to fetch the sample data for the plots
    d3.json(`/samples/${sample_id}`).then(
        function (sample) {
            console.log(`Processing data for sample ${sample_id}`);
            let bubble = d3.select('#bubble'),
                pie = d3.select('#pie'),
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
                    //colorscale: "flat"
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

        }
    );

    console.log(
        sample_id
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

function selDataset_onchange()
{
    var sel = d3.select('#selDataset');
    optionChanged(sel.property('value'));
}

// Initialize the dashboard
d3.select('#selDataset').on('change', selDataset_onchange);

init();
