function createGraph(elem, semester){
  $("svg").remove();
  var width = d3.select("#graph").style('width').replace('px',''), height = d3.select("#graph").style('height').replace('px','');
  var margin = {top: height / 2, right: width/ 2, bottom: height / 2, left: width / 2},
      radius = Math.min(margin.top, margin.right, margin.bottom, margin.left) - 10;

      var positions = ['President',
                       'Vice President',
                       'Treasurer',
                       'Recruitment',
                       'Social',
                       'Scholarship',
                       'Philantropy',
                       'Service',
                       'Fundraising',
                       'Family Relations',
                       'Secretary',
                       'Sergeant at Arms',
                       'Marshall',
                       'Membership Education',
                       'Alumni',
                       'Athletic',
                       'Brotherhood'];

  var hue = d3.scale.category10(positions.length);


  hue.domain(positions);
  drawLegend();

  var luminance = d3.scale.sqrt()
      .domain([0, 1e6])
      .clamp(true)
      .range([90, 20]);

  var svg = d3.select(elem).append("svg")
      .attr("width", margin.left + margin.right)
      .attr("height", margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var partition = d3.layout.partition()
      .sort(function(a, b) { return d3.ascending(a.name, b.name); })
      .size([2 * Math.PI, radius]);

  var arc = d3.svg.arc()
      .startAngle(function(d) { return d.x; })
      .endAngle(function(d) { return d.x + d.dx - 0.01 / (d.depth + 0.5); })
      .innerRadius(function(d) { return radius / 3 * d.depth; })
      .outerRadius(function(d) { return radius / 3 * (d.depth + 1) - 1; });

  d3.json('api/graphdata?sem='+semester, function(root){

    // Compute the initial layout on the entire tree to sum sizes.
    // Also compute the full name and fill color for each node,
    // and stash the children so they can be restored as we descend.
    partition
        .value(function(d) { return d.size; })
        .nodes(root)
        .forEach(function(d) {
          d._children = d.children;
          d.sum = d.value;
          d.key = key(d);
          d.fill = fill(d);
        });

    // Now redefine the value function to use the previously-computed sum.
    partition
        .children(function(d, depth) { return depth < 2 ? d._children : null; })
        .value(function(d) { return d.sum; });

    var center = svg.append("circle")
        .attr("r", radius / 3)
        .on("click", zoomOut);

    center.append("title")
        .text("zoom out");


    var path = svg.selectAll("path")
        .data(partition.nodes(root).slice(1))
      .enter().append("path")
        .attr("d", arc)
        .style("fill", function(d) { return d.fill; })
        .style("fill-opacity", function(d) { return d.name === "Unused" || d.type === "position" ? 1 : 0.75; })
        .each(function(d) { this._current = updateArc(d); })
        .on("mouseover", update_hover)
        .on("mouseout", remove_hover)
        .on("click", zoomIn);



    function zoomIn(p) {
      if (p.depth > 1) p = p.parent;
      if (!p.children) return;
      zoom(p, p);
    }

    function zoomOut(p) {
      if (!p.parent) return;
      zoom(p.parent, p);
    }

    // Zoom to the specified new root.
    function zoom(root, p) {
      if (document.documentElement.__transition__) return;

      // Rescale outside angles to match the new layout.
      var enterArc,
          exitArc,
          outsideAngle = d3.scale.linear().domain([0, 2 * Math.PI]);

      function insideArc(d) {
        if(p.key > d.key){
          return {depth: d.depth - 1, x: 0, dx: 0};
        }else if(p.key < d.key){
          return {depth: d.depth - 1, x: 2 * Math.PI, dx: 0};
        }else{
          return {depth: 0, x: 0, dx: 2 * Math.PI};
        }
      }

      function outsideArc(d) {
        return {depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)};
      }

      center.datum(root);

      // When zooming in, arcs enter from the outside and exit to the inside.
      // Entering outside arcs start from the old layout.
      if (root === p) {
        enterArc = outsideArc;
        exitArc = insideArc;
        outsideAngle.range([p.x, p.x + p.dx]);
      }

      path = path.data(partition.nodes(root).slice(1), function(d) { return d.key; });

      // When zooming out, arcs enter from the inside and exit to the outside.
      // Exiting outside arcs transition to the new layout.
      if (root !== p){
        enterArc = insideArc;
        exitArc = outsideArc;
        outsideAngle.range([p.x, p.x + p.dx]);
      }

      d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function() {
        path.exit().transition()
            .style("fill-opacity", function(d) { return d.depth === 1 + (root === p) ? 1 : 0; })
            .attrTween("d", function(d) { return arcTween.call(this, exitArc(d)); })
            .remove();

        path.enter().append("path")
            .style("fill-opacity", function(d) { return d.depth === 2 - (root === p) ? 1 : 0; })
            .style("fill", function(d) { return d.fill; })
            .on("click", zoomIn)
            .on("mouseover", update_hover)
            .on("mouseout", remove_hover)
            .each(function(d) { this._current = enterArc(d); });

        path.transition()
            .style("fill-opacity", function(d) { return d.name === "Unused" || d.type === "position" ? 1 : 0.65; })
            .attrTween("d", function(d) { return arcTween.call(this, updateArc(d)); });
      });
    }

      });

    function drawLegend() {

      // Dimensions of legend item: width, height, spacing, radius of rounded rect.
      var li = {
        w: 200, h: 30, s: 3, r: 3
      };

      var legend = d3.select("#legend").append("svg:svg")
          .attr("width", li.w)
          .attr("height", hue.domain().length * (li.h + li.s));

      var g = legend.selectAll("g")
          .data(hue.domain())
          .enter().append("svg:g")
          .attr("transform", function(d, i) {
                  return "translate(0," + i * (li.h + li.s) + ")";
               });

      g.append("svg:rect")
          .attr("rx", li.r)
          .attr("ry", li.r)
          .attr("width", li.w)
          .attr("height", li.h)
          .style("fill", function(d) { return hue(d); });

      g.append("svg:text")
          .attr("x", li.w / 2)
          .attr("y", li.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .text(function(d) { return d; });
    }

  function key(d) {
    var k = [], p = d;
    while (p.depth){
      k.push(p.name);
      p = p.parent;
    } 
    return k.reverse().join(".");
  }

  function fill(d) {
    var p = d;
    while (p.depth > 1) p = p.parent;
    var c = hue(p.name);
    // c.l = luminance(d.sum);
    return c;
  }

  function arcTween(b) {
    var i = d3.interpolate(this._current, b);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  }

  function updateArc(d) {
    return {depth: d.depth, x: d.x, dx: d.dx};
  }


  var mouse = d3.select("#mouse");
    function update_hover(d)
      {
        mouse.html("<p>$"+d.size + " " + d.name + "</p>");
          mouse.transition().duration(200).style("opacity","1");
    //  mouse.attr("display", function(d) { return (d.type == "holder" ? "none" : null); }); // hide text from holder elements
      }
    
      function remove_hover(d)
      {
          mouse.transition().duration(1000).style("opacity","0");
  //        mouse.html("<h2>&nbsp;</h2>")
      }

  d3.select(self.frameElement).style("height", margin.top + margin.bottom + "px");

}