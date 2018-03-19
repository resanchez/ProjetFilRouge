import fillWithDefault from "./defaultOptions.js";

const defaultOptions = {
    opacity: 0.5,
    colorScatter: "orange",
    width: 600,
    height: 600,
    pointSize: 2
};

const colorScales = {
    "linear": d3.scaleLinear(),
    "sqrt": d3.scaleSqrt(),
    "pow": d3.scalePow().exponent(2),
    "log": d3.scaleLog()
};

class ScatterPlotGeneralized {
    constructor(id, data, spFiles, options = {}) {
        this.divHTML = document.querySelector("#" + id);
        this.div = d3.select("#" + id);
        this.data = data;
        this.spFiles = spFiles;
        this.selectedFiles = Object.keys(spFiles);
        let opts = fillWithDefault(options, defaultOptions, false);
        console.log(opts);
        this.opacity = opts.opacity;
        this.colorScatter = opts.colorScatter;
        this.margin = {top: 0, right: 0, bottom: 50, left: 50};
        this.width = opts.width - this.margin.left - this.margin.right;
        this.height = opts.height - this.margin.top - this.margin.bottom;
        this.innerHeight = this.height - 2;
        this.step = 5;
        this.pointSize = opts.pointSize;
        this.traits = d3.keys(data[0]);
        let idx1 = this.traits.indexOf("date_time");
        if (idx1 > -1) {
            this.traits.splice(idx1, 1);
        }
        let idx2 = this.traits.indexOf("idxFile");
        if (idx2 > -1) {
            this.traits.splice(idx2, 1);
        }
        this._xAxis = this.traits[0];
        this._yAxis = this.traits[1];
        this._cAxis = this.traits[2];
        this._colorScale = "linear";
        console.log(this.traits);
        this.instantiateLi();
        this.instantiateSupport();
    }

    get xAxis() {
        return this._xAxis;
    }

    get yAxis() {
        return this._yAxis;
    }

    get cAxis() {
        return this._cAxis;
    }

    get colorScale() {
        return this._colorScale;
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

    set cAxis(val) {
        console.log("cAxis", val);
        this.render.invalidate();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this._cAxis = val;
        this.color = this.color1;
        if (this._cAxis !== "phase_no") {
            this.color = this.color2;
            this.color.domain(d3.extent(this.data, (d) => {
                return d[this._cAxis];
            }))
        }
        this.data = this.data.sort((a, b) => {
            return a[this._cAxis] - b[this._cAxis];
        });
        this.render(this.data);
        // TODO - Attention quand il y a selection
    }

    set colorScale(val) {
        console.log("colorScale", val);
        this.render.invalidate();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this._colorScale = val;
        this.color = this.color1;
        this.color2 = colorScales[this._colorScale]
            .domain(d3.extent(this.data, (d) => {
                return d[this._cAxis];
            }))
            .range(['mediumturquoise', 'hotpink'])
            .interpolate(d3.interpolateHcl);
        if (this._cAxis !== "phase_no") {
            this.color = this.color2;
        }
        this.render(this.data);
        // TODO - Attention quand il y a selection
    }

    instantiateLi() {
        for (let k of Object.keys(this.spFiles)){
            this.spFiles[k].addEventListener("click", (ev) => {
                this.render.invalidate();
                this.ctx.clearRect(0, 0, this.width, this.height);
                let idx = this.selectedFiles.indexOf(k);
                if (idx > -1) {
                    this.selectedFiles.splice(idx, 1);
                    this.spFiles[k].style.textDecoration = "line-through";
                } else {
                    this.selectedFiles.push(k);
                    this.spFiles[k].style.textDecoration = "none";
                }
                this.render(this.data);
            });
        }
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
        // data = d3.shuffle(data);
        data = data.sort((a, b) => {
            return a[this._cAxis] - b[this._cAxis];
        });
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

        this.color1 = d3.scaleOrdinal()
            .range(["#5DA5B3", "#D58323", "#DD6CA7", "#54AF52", "#8C92E8", "#E15E5A", "#725D82", "#776327", "#50AB84", "#954D56", "#AB9C27", "#517C3F", "#9D5130", "#357468", "#5E9ACF", "#C47DCB", "#7D9E33", "#DB7F85", "#BA89AD", "#4C6C86", "#B59248", "#D8597D", "#944F7E", "#D67D4B", "#8F86C2"]);

        this.color2 = colorScales[this._colorScale]
            .domain(d3.extent(data, function (d) {
                return d[that._cAxis];
            }))
            .range(['mediumturquoise', 'hotpink'])
            .interpolate(d3.interpolateHcl);

        this.color = this.color1;

        if (this._cAxis !== "phase_no") {
            this.color = this.color2;
        }


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
            if (that.selectedFiles.includes(d.idxFile)) {
                // ctx.fillStyle = that.color(d[that._cAxis]);
                ctx.strokeStyle = that.color(d[that._cAxis]);
                ctx.beginPath();
                ctx.ellipse(xSc(d[that._xAxis]), ySc(d[that._yAxis]) , 3, 3, 45 * Math.PI/180, 0, 2 * Math.PI);
                ctx.stroke();
            } else {
                ctx.fillStyle = "lightgrey";
                // ctx.fillStyle = that.color(d[that._cAxis]);
                ctx.fillRect(xSc(d[that._xAxis]), ySc(d[that._yAxis]), that.pointSize, that.pointSize);
            }
        }

        let brushSc = d3.brush()
            .extent([[0, 0], [width, height]])
            .on("brush end", brush);

        this.nodeBrushSc = svg.append("g")
            .attr("class", "brush brushSc")
            .call(brushSc);

        function brush() {
            console.log("brush end");
            let selection = d3.event.selection || [0, width];
            that.selection = selection;

            console.log(selection);
            let x0 = selection[0][0],
                x1 = selection[1][0],
                y0 = selection[0][1],
                y1 = selection[1][1];

            let selected = data.filter(function (d) {
                let cx = xSc(d[that._xAxis]),
                    cy = ySc(d[that._yAxis]);

                return (x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1);
            });

            that.selected = selected;
            let files = new Set();
            const reducer = (accumulator, currentValue) => accumulator.add(currentValue.idxFile);
            selected.reduce(reducer, files);

            for (let li of Object.values(that.spFiles)) {
                li.style.color = "black";
            }

            for (let f of files){
                that.spFiles[f].style.color = "crimson";
            }
            console.log(files);
        }

        // PC line 407 stop
    }
}

export default ScatterPlotGeneralized;