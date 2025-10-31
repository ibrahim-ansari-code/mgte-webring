let mobileExists = false,
  desktopExists = false;

function checkIfGraphNeeded() {
  if (window.innerWidth < 640 && !mobileExists) {
    mobileExists = true;
    makeGraph("chart-container-mobile");
  } else if (window.innerWidth > 640 && !desktopExists) {
    desktopExists = true;
    makeGraph("chart-container");
  }
}

function makeGraph(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const width = container.clientWidth;
  const height = container.clientHeight;

  const svg = d3
    .select(`#${containerId}`)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background-color", "#FFFFFF");

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.28;
  const numSites = webringData.sites.length;
  const nodeRadius = 10;
  const labelRadius = radius + 45;

  const nodes = webringData.sites.map((site, i) => {
    const angle = (i / numSites) * Math.PI * 2 - Math.PI / 2;
    return {
      ...site,
      angle,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      labelX: centerX + labelRadius * Math.cos(angle),
      labelY: centerY + labelRadius * Math.sin(angle)
    };
  });

  const lineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveLinearClosed);

  const ringLine = svg
    .append("path")
    .datum(nodes)
    .attr("d", lineGenerator)
    .attr("fill", "none")
    .attr("stroke", "#7C3AED")
    .attr("stroke-width", 2.5)
    .style("opacity", 0.4);

  const nodeGroup = svg
    .append("g")
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .style("cursor", "pointer");

  nodeGroup
    .append("circle")
    .attr("r", nodeRadius)
    .attr("fill", "#7C3AED")
    .attr("stroke", "#FFFFFF")
    .attr("stroke-width", 2);

  const labels = svg
    .append("g")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("x", d => d.labelX)
    .attr("y", d => d.labelY)
    .attr("text-anchor", d => {
      const angleDeg = (d.angle * 180) / Math.PI;
      if (angleDeg >= -90 && angleDeg <= 90) return "start";
      return "end";
    })
    .attr("dy", "0.35em")
    .text(d => d.website.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, ""))
    .attr("fill", "#111827")
    .style("font-size", "13px")
    .style("font-family", "'Barlow Condensed', sans-serif")
    .style("font-weight", "500")
    .style("pointer-events", "none");

  nodeGroup.on("click", (event, d) => {
    window.open(d.website, "_blank");
  });

  nodeGroup.on("mouseenter", function(event, d) {
    d3.select(this).select("circle")
      .attr("fill", "#6B21A8")
      .attr("r", nodeRadius + 2);
    
    const label = labels.filter((_, i) => nodes[i] === d);
    label.attr("fill", "#6B21A8")
         .style("font-weight", "600");
  });

  nodeGroup.on("mouseleave", function(event, d) {
    d3.select(this).select("circle")
      .attr("fill", "#7C3AED")
      .attr("r", nodeRadius);
    
    const label = labels.filter((_, i) => nodes[i] === d);
    label.attr("fill", "#111827")
         .style("font-weight", "500");
  });

  const searchInput = document.getElementById("search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      updateHighlight(e.target.value);
    });
  }

  function updateHighlight(searchTerm) {
    const searchLower = (searchTerm || "").toLowerCase();
    nodeGroup.each(function(d) {
      const matches = d.name.toLowerCase().includes(searchLower) ||
        d.year.toString().includes(searchLower) ||
        d.website.toLowerCase().includes(searchLower);
      
      d3.select(this).select("circle")
        .attr("fill", matches ? "#6B21A8" : "#7C3AED")
        .attr("r", matches ? nodeRadius + 1 : nodeRadius);
      
      const label = labels.filter((_, i) => nodes[i] === d);
      label.attr("fill", matches ? "#6B21A8" : "#111827")
           .style("font-weight", matches ? "600" : "500");
    });
  }

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        updateHighlight(decodeURIComponent(hash));
      }, 100);
    }
  });

  if (window.location.hash) {
    const hash = window.location.hash.slice(1);
    setTimeout(() => {
      updateHighlight(decodeURIComponent(hash));
    }, 100);
  }

  window.addEventListener("resize", () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
    
    const newCenterX = newWidth / 2;
    const newCenterY = newHeight / 2;
    const newRadius = Math.min(newWidth, newHeight) * 0.28;
    const newLabelRadius = newRadius + 45;
    
    const updatedNodes = webringData.sites.map((site, i) => {
      const angle = (i / numSites) * Math.PI * 2 - Math.PI / 2;
      return {
        ...site,
        angle,
        x: newCenterX + newRadius * Math.cos(angle),
        y: newCenterY + newRadius * Math.sin(angle),
        labelX: newCenterX + newLabelRadius * Math.cos(angle),
        labelY: newCenterY + newLabelRadius * Math.sin(angle)
      };
    });

    ringLine.datum(updatedNodes).attr("d", lineGenerator);

    nodeGroup
      .data(updatedNodes)
      .attr("transform", d => `translate(${d.x},${d.y})`);

    labels
      .data(updatedNodes)
      .attr("x", d => d.labelX)
      .attr("y", d => d.labelY)
      .attr("text-anchor", d => {
        const angleDeg = (d.angle * 180) / Math.PI;
        if (angleDeg >= -90 && angleDeg <= 90) return "start";
        return "end";
      });
  });
}

document.addEventListener("DOMContentLoaded", checkIfGraphNeeded);
window.addEventListener("resize", checkIfGraphNeeded);

