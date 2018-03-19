import fillWithDefault from "./defaultOptions.js";

const defaultOptions = {
    opacity: 0.5,
    colorScatter: "orange",
    width: 600,
    height: 600,
};

class ScatterPlotGeneralized {
    constructor(id, data, options = {}) {
        this.divHTML = document.querySelector("#" + id);
        this.div = d3.select("#" + id);
        this.data = data;
        let opts = fillWithDefault(options, defaultOptions, false);
        console.log(opts);
        this.opacity = opts.opacity;
        this.colorScatter = opts.colorScatter;
        this.margin = {top: 0, right: 0, bottom: 50, left: 50};
        this.width = opts.width - this.margin.left - this.margin.right;
        this.height = opts.height - this.margin.top - this.margin.bottom;
        this.innerHeight = this.height - 2;
        this.step = 5;
        this.traits = d3.keys(data[0]);
        this._xAxis = this.traits[0];
        this._yAxis = this.traits[1];
        let idx1 = this.traits.indexOf("date_time");
        if (idx1 > -1) {
            this.traits.splice(idx1, 1);
        }
        let idx2 = this.traits.indexOf("idxFile");
        if (idx2 > -1) {
            this.traits.splice(idx2, 1);
        }
        console.log(this.traits);
        this.instantiateSupport();
    }

    get xAxis() {
        return this.traits[0];
    }

    get yAxis() {
        return this.traits[1];
    }

    set xAxis(val) {
        console.log("xAxis", val);
        this.render.invalidate();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this._xAxis = val;
        this.xSc.domain([d3.min(this.data, (d) => {
            return d[this._xAxis];
        }), d3.max(this.data, (d) => {
            return d[this._xAxis];
        })]);
        this.xLine.call(d3.axisBottom(this.xSc));
        this.xLabel.text(this._xAxis);
        this.render(this.data);
        // TODO - Attention quand il y a selection
    }

    set yAxis(val) {
        console.log("yAxis", val);
        this.render.invalidate();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this._yAxis = val;
        this.ySc.domain([d3.min(this.data, (d) => {
            return d[this._yAxis];
        }), d3.max(this.data, (d) => {
            return d[this._yAxis];
        })]);
        this.yLine.call(d3.axisLeft(this.ySc));
        this.yLabel.text(this._yAxis);
        this.render(this.data);
        // TODO - Attention quand il y a selection
    }

    instantiateSupport() {
        let that = this;
        let devicePixelRatio = window.devicePixelRatio || 1;
        // let dimensions = this.dimensions;
        let width = this.width;
        let height = this.height;
        let margin = this.margin;

        let innerHeight = this.innerHeight;

        let data = this.data;
        data = d3.shuffle(data);
        that.selected = data;

        this.container = this.div.append("div")
            .attr("class", "spGeneralized")
            .style("width", width + margin.left + margin.right + "px")
            .style("height", height + margin.top + margin.bottom + "px");

        this.svg = this.container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.canvas = this.container.append("canvas")
            .attr("width", width * devicePixelRatio)
            .attr("height", height * devicePixelRatio)
            .style("width", 2 * width + "px")
            .style("height", 2 * height + "px")
            .style("margin-top", margin.top + "px")
            .style("margin-left", margin.left + "px")
            .style("transform-origin", "0 0")
            .style("transform", "scale(0.5, 0.5)");

        let svg = this.svg;
        let canvas = this.canvas;
        let container = this.container;

        let ctx = canvas.node().getContext("2d");
        this.ctx = ctx;
        // ctx.globalCompositeOperation = 'source-over';
        ctx.globalCompositeOperation = 'darken';
        // ctx.globalAlpha = 1;
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 1;
        ctx.scale(devicePixelRatio, devicePixelRatio);

        let xSc = d3.scaleLinear().range([0, width]);
        let ySc = d3.scaleLinear().range([height, 0]);

        this.xSc = xSc;
        this.ySc = ySc;

        xSc.domain([d3.min(data, function (d) {
            return d[that._xAxis];
        }), d3.max(data, function (d) {
            return d[that._xAxis];
        })]);
        ySc.domain([d3.min(data, function (d) {
            return d[that._yAxis];
        }), d3.max(data, function (d) {
            return d[that._yAxis];
        })]);

        let render = renderQueue(draw).rate(1000);
        this.render = render;
        ctx.clearRect(0, 0, width, height);
        // ctx.globalAlpha = 1;
        ctx.globalAlpha = d3.min([0.85 / Math.pow(data.length, 0.15), 1]);
        render(data);

        this.xLine = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "firstAxis")
            .call(d3.axisBottom(xSc));

        // // add the X gridlines
        // svg.append("g")
        //     .attr("class", "grid")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(make_x_gridlines(xSc)
        //         .tickSize(-height)
        //         .tickFormat("")
        //     );

        // text label for the x axis
        this.xLabel = svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 30) + ")")
            .style("text-anchor", "middle")
            .attr("class", "firstLabel")
            .text(that._xAxis);

        // Add the Y Axis
        this.yLine = svg.append("g")
            .attr("class", "secondAxis")
            .call(d3.axisLeft(ySc));

        // // add the Y gridlines
        // svg.append("g")
        //     .attr("class", "grid")
        //     .call(make_y_gridlines(ySc)
        //         .tickSize(-width)
        //         .tickFormat("")
        //     );

        // text label for the y axis
        this.yLabel = svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("class", "secondLabel")
            .text(that._yAxis);

        function draw(d) {
            ctx.fillStyle = that.colorScatter;
            ctx.fillRect(xSc(d[that._xAxis]), ySc(d[that._yAxis]), 2, 2);
        }
        // PC line 407 stop
    }
}

export default ScatterPlotGeneralized;