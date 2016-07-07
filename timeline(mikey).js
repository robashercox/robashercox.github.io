var timeline = (function() {
    var timeline = {};

    var event_timeline = function(data, selector, x_dom) {

        var el = d3.select(selector);
        el.selectAll('svg').remove();

        // var sidebar_width = Math.round(0.2*el.node().clientWidth);

        var margin = {
                top: 2,
                right: 20 + 0.2 * el.node().clientWidth,
                bottom: 2,
                left: 40
            },
            width = el.node().clientWidth - margin.left - margin.right,
            height = el.node().clientHeight - margin.top - margin.bottom;

        var x = d3.time.scale()
            .range([0, width]);

        var color = d3.scale.category10();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        //create and attach svg axis - really cool
        var svg = el.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // needs data

        // x.domain(d3.extent(data, function(d) { return d.date; }));
        x.domain(x_dom);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height / 2) + ")")
            .call(xAxis);


        var drag_year;
        var drag = d3.behavior.drag()
            .on("dragstart", function() {
                // d3.event.sourceEvent.stopPropagation(); // silence other listeners
                // d3.event.sourceEvent.preventDefault(); // TODO not sure
                d3.select(this).style('fill', 'red');
            })
            .on("drag", function(d, i) {

                var x0 = d3.event.x;
                // var x0 = d3.mouse(this)[0];
                drag_year = d3.time.year.round(d3.min([d3.max([x.invert(x0), x_dom[0]]), x_dom[1]]));

                // no idea why 0.925*height works!. <g> is offset from parent <svg> despite y transform=0
                d3.select(this)
                    .attr("transform", function() {
                        return "translate(" + (-height / 4 + x(drag_year)) + "," + (0.925 * height - (height / 2) * (i % 2)) + ")";
                    }); // TOOD


                // could be in dragend to speed thigns up
                d.update(drag_year.getFullYear());


                inputs.render();
                outputs.render();

            })
            .on("dragend", function(d, i) {
                d3.select(this).style('fill', undefined);


            });


        var events = svg.selectAll(".events")
            .data(data)
            .enter().append("g")
            .attr("class", "events")
            .attr("transform", function(d, i) {
                return "translate(" + (-height / 4 + x(d.date)) + "," + (0.925 * height - (height / 2) * (i % 2)) + ")";
            }) // TOOD
            .call(drag);

        events
            .on("click", function(d) {
                if (!d3.event.defaultPrevented) d.click();
            });



        events
            .append("text")
            .style({
                "font-family": "fontello",
                "font-size": (height / 2) + "px",
                // "line-height": (height/2)+"px",
                "text-align": "center",
                "cursor": "pointer"
            })
            .text(function(d) {
                return d.icon;
            });

        var currently_adding_x;
        var drag_add = d3.behavior.drag()
            .on("dragstart", function() {
                d3.event.sourceEvent.stopPropagation(); // silence other listeners
            })
            .on("drag", function() {
                d3.select(this)
                    .attr('transform', "translate(" + (d3.event.x) + "," + d3.event.y + ")")

                currently_adding_x = d3.event.x;

            })
            .on("dragend", function() {
                drag_date = d3.time.year.round(d3.min([d3.max([x.invert(currently_adding_x), x_dom[0]]), x_dom[1]]));

                model["Children"].push({
                    "Year of birth": drag_date.getFullYear(),
                    "Carer": 0,
                    "Care years": 2,
                    "Name": "Next kid"
                });

                inputs.render();
                timeline.render();
                outputs.render();


            });

        // add
        svg.append('text')
            .attr("transform", function(d, i) {
                return "translate(" + (-30 + 0.8 * el.node().clientWidth) + "," + (height / 2) + ")"
            })
            .style({
                "font-size": (height / 2) + "px"
            })
            .text("+");

        var add_icons = svg.selectAll(".add-events")
            .data([''])
            .enter().append("g")
            .attr("class", "add-events")
            .attr("transform", function(d, i) {
                return "translate(" + (-30 + (0.8 + 0.07 * (i + 1)) * el.node().clientWidth) + "," + (height / 2) + ")"
            })
            .call(drag_add);

        add_icons.append("text")
            .style({
                "font-family": "fontello",
                "font-size": (height / 2) + "px",
                "text-align": "center",
                "cursor": "pointer"
            })
            .text(function(d) {
                return d;
            });

    }

    var render = timeline.render = function() {
        var first = model["Dates"][model["Context extent"][0]];
        var last = model["Dates"][model["Context extent"][1] - 1];

        events = [];
        // +"Another Financial Calculator. </br> Brought to you by Asher, Burnett and Cameron.";
        for (var i = 0; i < model["Children"].length; i++) {
            events.push({
                date: new Date(model["Children"][i]["Year of birth"], 0),
                icon: '',
                index: i,
                // slide 
                update: function(year) {
                    model["Children"][this.index]["Year of birth"] = year;
                },

                click: function() {
                    var index = this.index;
                    // list of views, each has three functions 1. create html 2. setup interaction on that html 3. update model with value               
                    var create_update = [{
                        create_html: function() {
                            return 'Year of birth: <input id="year" type="number" value="' + model["Children"][index]["Year of birth"] + '">';
                        },
                        post_html: function() {},
                        model_update: function(val) {
                            model["Children"][index]["Year of birth"] = +val;
                        }
                    }, {
                        create_html: function() {
                            var html = 'Carer :';
                            for (var j = 0; j < model["Adults"].length; j++) {
                                var checked = model["Children"][index]["Carer"] === j ? "checked" : "";
                                html += '<input type="radio" name="sex" value="'+j+'" '+checked+'>' + model["Adults"][j]["Name"];
                            };
                            return html;
                        },
                        post_html: function() {},
                        model_update: function(val) {
                            model["Children"][index]["Carer"] = +val;
                        }
                    }, {
                        create_html: function() {
                            return 'Care years : <input id="carer_years" type="number" value="' + model["Children"][index]["Care years"] + '"> years';
                        },
                        post_html: function() {},
                        model_update: function(val) {
                            model["Children"][index]["Care years"] = +val;
                        }
                    }];
                    // create modal
                    modal.render(create_update);
                },
            });
        };


        events.push({
            date: new Date(model["Shared"]["Year of home purchase"], 0),
            icon: '',
            update: function(year) {
                model["Shared"]["Year of home purchase"] = year;
            },
            click: function() {
                // list of views, each has three functions 1. create html 2. setup interaction on that html 3. update model with value               
                var create_update = [{
                    create_html: function() {
                        return 'Purchase year: <input id="year" type="number" value="' + model["Shared"]["Year of home purchase"] + '">';
                    },
                    post_html: function() {},
                    model_update: function(val) {
                        model["Shared"]["Year of home purchase"] = +val;
                    }
                }, {
                    create_html: function() {
                        return 'Mortgage term : <input id="term" type="number" value="' + model["Shared"]["Mortgage term"] + '"> years';
                    },
                    post_html: function() {},
                    model_update: function(val) {
                        model["Shared"]["Mortgage term"] = +val;
                    }
                }, {
                    create_html: function() {
                        if (model["Shared"]["Year of home purchase"] <= model["Dates"][0].getFullYear()) {
                            return 'Remaining mortgage: $<input id="outstanding" type="number" value="' + model["Shared"]["Outstanding mortgage"] + '">';
                        } else return 'Purchased for: $<input id="price" type="number" value="' + model["Shared"]["Home value"] + '">';
                    },
                    post_html: function() {},
                    model_update: function(val) {
                        if (model["Shared"]["Year of home purchase"] <= model["Dates"][0].getFullYear()) {
                            model["Shared"]["Outstanding mortgage"] = +val;
                        } else model["Shared"]["Home value"] = +val;
                    }
                }];
                // create modal
                modal.render(create_update);
            },
        });

        for (var i = 0; i < model["Adults"].length; i++) {
            events.push({
                date: new Date(model["Adults"][i]["Retirement year"], 0),
                icon: '',
                index: i,
                update: function(year) {
                    model["Adults"][this.index]["Retirement year"] = year;
                },
                // click: function() {
                //     // list of views, each has three functions 1. create html 2. setup interaction on that html 3. update model with value               
                //     var create_update = [{
                //         create_html: function() {
                //             return 'Purchase year: <input id="year" type="number" value="' + model["Shared"]["Year of home purchase"] + '">';
                //         },
                //         post_html: function() {},
                //         model_update: function(val) {
                //             model["Shared"]["Year of home purchase"] = +val;
                //         }
                //     }];
                //     // create modal
                //     modal.render( create_update );
                // },

            })
        };


        event_timeline(events.filter(function(d) {
            return first <= d.date && d.date <= last;
        }), "#timeline", [first, last]);
    }

    return timeline;
})();