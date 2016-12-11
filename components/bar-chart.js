Vue.component('bar-chart',
{
    template: '<div class = "bar-chart"></div>',

    mixins: [DataProvider],

    props: ['metricsource', 'year', 'metricRelationship'],

    mounted: function()
    {
        let year = this.year|| 2000

        this.getData(this.metricsource, year, this.metricRelationship, data => this.drawChart(this.$el, data))
    },

    methods:
    {
        drawChart: function(element, data)
        {
            let canvas = d3
                .select(element)

            // Sort the data bt the metric
            // Interesting decision for implementation of sort on chrome
            // http://stackoverflow.com/questions/1969145/sorting-javascript-array-with-chrome
            var data = data
                    .filter(d => d.metric !== undefined)
                    .sort((a, b) => (this.metricRelationship == 'reversed') ? a.metric - b.metric : b.metric - a.metric)

            let bars = this.drawBars(canvas, data)
            let identifiers = this.drawIdentifiers(bars)
            let icons = this.drawIcons(identifiers)
            let labels = this.drawLabels(identifiers)
            let valuBars = this.drawValues(bars, data)
        },

        drawBars: function(canvas, data)
        {
            return canvas
                .selectAll('div')
                .data(data)
                .enter()
                .append('div')
                .attr('class', 'bar')
                .on('mouseenter', (element, index, collection) => collection[index].dispatchEvent(new CustomEvent('country:focused', {detail: element, bubbles: true})))
                .on('mouseleave', (element, index, collection) => collection[index].dispatchEvent(new CustomEvent('country:unfocused', {detail: element, bubbles: true})))
        },

        drawIdentifiers: function(bars)
        {
            return bars
                .append('div')
                .attr('class', 'identifier')
        },

        drawLabels: function(identifiers)
        {
            return identifiers
                .append('label')
                .html(c => c.name)
        },

        drawIcons: function(identifiers)
        {
            return identifiers
                .append('img')
                .attr('src', c => 'icons/' + c.name.toLowerCase() + '.png')
        },

        drawValues: function(bars, data)
        {
            let max = Math.max.apply(Math, data.map(d => d.metric))

            bars
                .append('div')
                .attr('class', 'value')
                .html(c => this.formatNumber(c.metric))
                .style('width', '0%')
                .transition()
                .duration(1000)
                .style('width', c => this.rangeConverter(c.metric, 0, max, 0, 40) + 10 + '%')
                .style('background-color', c => c.color)
        }
    }
})
