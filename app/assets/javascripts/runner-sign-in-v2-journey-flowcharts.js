(function () {
  "use strict";

  var NODE_WIDTH = 200;
  var NODE_HEIGHT = 44;
  var RANK_GAP = 72;
  var NODE_GAP = 32;
  var PADDING = 32;

  function computeDAGLayout(options) {
    var nodes = options.nodes;
    var edges = options.edges;
    var nodeIds = nodes.map(function (node) {
      return node.id;
    });
    var idSet = new Set(nodeIds);
    var validEdges = edges.filter(function (edge) {
      return idSet.has(edge.from) && idSet.has(edge.to);
    });

    var rank = new Map(nodeIds.map(function (id) {
      return [id, 0];
    }));

    var changed = true;
    var iterations = 0;
    while (changed && iterations < nodeIds.length) {
      changed = false;
      iterations += 1;
      validEdges.forEach(function (edge) {
        var next = rank.get(edge.from) + 1;
        if (next > rank.get(edge.to)) {
          rank.set(edge.to, next);
          changed = true;
        }
      });
    }

    var ranks = new Map();
    nodeIds.forEach(function (id) {
      var r = rank.get(id);
      if (!ranks.has(r)) {
        ranks.set(r, []);
      }
      ranks.get(r).push(id);
    });

    var sortedRankKeys = Array.from(ranks.keys()).sort(function (a, b) {
      return a - b;
    });

    var maxRankWidth = 0;
    sortedRankKeys.forEach(function (r) {
      var count = ranks.get(r).length;
      var width = count * NODE_WIDTH + Math.max(0, count - 1) * NODE_GAP;
      maxRankWidth = Math.max(maxRankWidth, width);
    });

    var layoutNodes = [];
    sortedRankKeys.forEach(function (r) {
      var ids = ranks.get(r);
      var rankWidth = ids.length * NODE_WIDTH + Math.max(0, ids.length - 1) * NODE_GAP;
      var offsetX = PADDING + (maxRankWidth - rankWidth) / 2;
      var y = PADDING + r * (NODE_HEIGHT + RANK_GAP);
      ids.forEach(function (id, index) {
        layoutNodes.push({
          id: id,
          x: offsetX + index * (NODE_WIDTH + NODE_GAP),
          y: y,
          rank: r,
        });
      });
    });

    var posById = new Map(layoutNodes.map(function (node) {
      return [node.id, node];
    }));

    var layoutEdges = validEdges.map(function (edge) {
      var from = posById.get(edge.from);
      var to = posById.get(edge.to);
      return {
        from: edge.from,
        to: edge.to,
        sourceX: from.x + NODE_WIDTH / 2,
        sourceY: from.y + NODE_HEIGHT,
        targetX: to.x + NODE_WIDTH / 2,
        targetY: to.y,
        isBackEdge: to.rank <= from.rank,
      };
    });

    var maxY = Math.max.apply(
      null,
      layoutNodes.map(function (node) {
        return node.y + NODE_HEIGHT;
      })
    );

    return {
      nodes: layoutNodes,
      edges: layoutEdges,
      width: PADDING * 2 + maxRankWidth,
      height: PADDING + maxY,
    };
  }

  function nodeClassName(tone) {
    if (tone === "hub") {
      return "journey-flowchart__node journey-flowchart__node--hub";
    }
    if (tone === "branch") {
      return "journey-flowchart__node journey-flowchart__node--branch";
    }
    if (tone === "unexpected") {
      return "journey-flowchart__node journey-flowchart__node--unexpected";
    }
    return "journey-flowchart__node";
  }

  function renderFlowchart(journeyId, journeys, container) {
    var journey = journeys[journeyId];
    if (!journey || !container) {
      return;
    }

    var toneById = {};
    var labelById = {};
    journey.nodes.forEach(function (node) {
      toneById[node.id] = node.tone;
      labelById[node.id] = node.label;
    });

    var layout = computeDAGLayout({
      nodes: journey.nodes,
      edges: journey.edges,
    });

    var svgNs = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("width", String(layout.width));
    svg.setAttribute("height", String(layout.height));
    svg.setAttribute("viewBox", "0 0 " + layout.width + " " + layout.height);
    var hasLinks = journey.nodes.some(function (node) {
      return Boolean(node.href);
    });
    svg.setAttribute("role", hasLinks ? "group" : "img");
    svg.setAttribute("aria-label", "Flowchart for " + journey.title);
    svg.classList.add("journey-flowchart__svg");

    var defs = document.createElementNS(svgNs, "defs");
    var marker = document.createElementNS(svgNs, "marker");
    marker.setAttribute("id", "journey-flowchart-arrow");
    marker.setAttribute("markerWidth", "8");
    marker.setAttribute("markerHeight", "8");
    marker.setAttribute("refX", "7");
    marker.setAttribute("refY", "4");
    marker.setAttribute("orient", "auto");
    var markerPath = document.createElementNS(svgNs, "path");
    markerPath.setAttribute("d", "M0,0 L8,4 L0,8 Z");
    markerPath.setAttribute("class", "journey-flowchart__arrow-head");
    marker.appendChild(markerPath);
    defs.appendChild(marker);
    svg.appendChild(defs);

    layout.edges.forEach(function (edge) {
      var isUnexpected =
        toneById[edge.to] === "unexpected" || toneById[edge.from] === "unexpected";
      var line = document.createElementNS(svgNs, "line");
      line.setAttribute("x1", String(edge.sourceX));
      line.setAttribute("y1", String(edge.sourceY));
      line.setAttribute("x2", String(edge.targetX));
      line.setAttribute("y2", String(edge.targetY));
      line.setAttribute(
        "class",
        isUnexpected ? "journey-flowchart__edge journey-flowchart__edge--unexpected" : "journey-flowchart__edge"
      );
      if (edge.isBackEdge) {
        line.setAttribute("stroke-dasharray", "4 4");
      }
      line.setAttribute("marker-end", "url(#journey-flowchart-arrow)");
      svg.appendChild(line);
    });

    layout.nodes.forEach(function (node) {
      var meta = journey.nodes.find(function (item) {
        return item.id === node.id;
      });
      var href = meta && meta.href;
      var group = document.createElementNS(svgNs, href ? "a" : "g");
      if (href) {
        group.setAttribute("href", href);
        group.setAttribute("target", "_blank");
        group.setAttribute("rel", "noreferrer noopener");
        group.setAttribute("class", "journey-flowchart__node-link");
        group.setAttribute("aria-label", "Open page: " + labelById[node.id]);
      }
      var rect = document.createElementNS(svgNs, "rect");
      rect.setAttribute("x", String(node.x));
      rect.setAttribute("y", String(node.y));
      rect.setAttribute("width", String(NODE_WIDTH));
      rect.setAttribute("height", String(NODE_HEIGHT));
      rect.setAttribute("rx", "4");
      rect.setAttribute("class", nodeClassName(meta && meta.tone));
      group.appendChild(rect);

      var text = document.createElementNS(svgNs, "text");
      text.setAttribute("x", String(node.x + NODE_WIDTH / 2));
      text.setAttribute("y", String(node.y + 27));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute(
        "class",
        href ? "journey-flowchart__label journey-flowchart__label--link" : "journey-flowchart__label"
      );
      text.textContent = labelById[node.id];
      group.appendChild(text);
      svg.appendChild(group);
    });

    container.innerHTML = "";
    container.appendChild(svg);
  }

  function getInitialJourneyId(journeys, select) {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get("journey");
    if (fromQuery && journeys[fromQuery]) {
      return fromQuery;
    }
    if (select && select.value && journeys[select.value]) {
      return select.value;
    }
    return "overview";
  }

  function init() {
    var journeys = window.RUNNER_SIGN_IN_V2_JOURNEY_FLOWS;
    var select = document.getElementById("journey-flowchart-select");
    var title = document.getElementById("journey-flowchart-title");
    var description = document.getElementById("journey-flowchart-description");
    var stepCount = document.getElementById("journey-flowchart-step-count");
    var diagram = document.getElementById("journey-flowchart-diagram");

    if (!journeys || !select || !diagram) {
      return;
    }

    function showJourney(journeyId) {
      var journey = journeys[journeyId];
      if (!journey) {
        return;
      }

      select.value = journeyId;
      if (title) {
        title.textContent = journey.title;
      }
      if (description) {
        description.textContent = journey.description;
      }
      if (stepCount) {
        stepCount.textContent = journey.nodes.length + " steps";
      }
      renderFlowchart(journeyId, journeys, diagram);

      var nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("journey", journeyId);
      window.history.replaceState({}, "", nextUrl);
    }

    select.addEventListener("change", function () {
      showJourney(select.value);
    });

    showJourney(getInitialJourneyId(journeys, select));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
