/* * Calculate Q based on the type of structure
  * @param {number} H - Water level in cm
  * @param {number} GO - Gate opening in cm
  * @param {Object} dim - Dimensions and type of structure (e.g., bc, p1, l, b, hc, numgates, type)
  * @returns {number|null} - Calculated flow rate Q or null if not applicable
* */
function calculateQ(H,GO, dim) {
    let Q = null;
    if (dim.type === "BCW") {
      console.log(">>> BCW structure");
      const Hm    = H/100;
      const HL    = Hm/dim.l;
      const Cd    = 0.93 + 0.1*HL;
      const AA1   = (Hm*dim.bc)/((Hm+dim.p1)*dim.bc);
      const CdAA1 = Cd*AA1;
      const Cv    = 0.255*CdAA1**3 + 0.06*CdAA1**2 + 0.0263*CdAA1 + 1.0001;
      Q = Cv*Cd*(2/3)*Math.sqrt(2*9.8/3)*dim.bc*Math.pow(Hm,1.5);

    } else if (dim.type === "SG") {
      const corrected = H - dim.hc;
      const table     = getUnpivotedTheory(dim.b, dim.hc, dim.numgates);
      Q = interpolateFromUnpivot(table, corrected, GO);
    }
    return Q;
}
/* * Generate the unpivoted table for the SG structure
 * @param {number} width - Width of the structure in cm
 * @param {number} Hc - Height correction in cm
 * @param {number} correctionFactor - Correction factor for the flow rate
 * @returns {Array} - Unpivoted table with rows of [correctedWaterLevel, gateOpening, flowRate]
 */
function getUnpivotedTheory(width, Hc, correctionFactor) {

  var MAX_RAW_WL = 400;  
  var maxCorr = Math.max(0, MAX_RAW_WL - Hc);

  //correctedWaterLevels
  var CORRs = [];
  for (var corr = 0; corr <= maxCorr; corr += 5) {
    CORRs.push(corr);
  }
  
  //gateOpenings
  var GOs = [];
  for (var g = 5; g <= 200; g += 5) {
    GOs.push(g);
  }

  // generate the table
  var unpivotedTable = [];
  CORRs.forEach(function(corr) {
    var trueH = corr + Hc;
    GOs.forEach(function(go) {
      if (corr < go) return;
      var r = go / corr;
      var poly =
        -0.82  * Math.pow(r, 5) +
         1.4048* Math.pow(r, 4) -
         0.6713* Math.pow(r, 3) +
         0.2075* Math.pow(r, 2) +
         0.0063 * r +
         0.5881;
      var q = poly 
        * (go / 100) 
        * (width / 100) 
        * Math.sqrt(19.6 * ((trueH / 100) - 0.61 * (go / 100)));

      var correctedQ = Math.round(q * correctionFactor * 100) / 100;
      unpivotedTable.push([corr, go, correctedQ]);
    });
  });
  // Sort the unpivoted table by water level and gate opening
  unpivotedTable.sort(function(a, b) {
    return a[0] - b[0] || a[1] - b[1];
  });
  return unpivotedTable;
}
/* * Interpolate the flow rate based on the unpivoted table
  * @param {Array} table - Unpivoted table with rows of [correctedWaterLevel, gateOpening, flowRate]
  * @param {number} wl - Water level in cm
  * @param {number} go - Gate opening in cm
  * @returns {number|null} - Interpolated flow rate or null if not applicable
 * */
function interpolateFromUnpivot(table, wl, go) {
  const wlLow  = Math.floor(wl/5)*5;
  const wlHigh = wlLow + 5;
  const goLow  = Math.floor(go/5)*5;
  const goHigh = goLow + 5;

  const matched = table.filter(r => {
    const corr = Number(r[0]);
    const gate = Number(r[1]);
    return (corr === wlLow || corr === wlHigh)
        && (gate === goLow || gate === goHigh);
  });

  const q11 = locateQ(table, wlLow, goLow);
  const q12 = locateQ(table, wlLow, goHigh);
  const q21 = locateQ(table, wlHigh, goLow);
  const q22 = locateQ(table, wlHigh, goHigh);
  console.log("    q11,q12,q21,q22 =", q11, q12, q21, q22);

  if ([q11,q12,q21,q22].every(q=>q==null)) return null;
  console.log(">>> all null → return null");

  const t = wlHigh===wlLow ? 0 : (wl-wlLow)/(wlHigh-wlLow);
  const u = goHigh===goLow ? 0 : (go-goLow)/(goHigh-goLow);
  console.log("    t,u =", t, u);

  const a11 = q11 ?? q21 ?? q12 ?? q22 ?? 0;
  const a12 = q12 ?? q22 ?? q11 ?? q21 ?? 0;
  const a21 = q21 ?? q11 ?? q22 ?? q12 ?? 0;
  const a22 = q22 ?? q12 ?? q21 ?? q11 ?? 0;
  console.log("    a11,a12,a21,a22 =", a11, a12, a21, a22);

  const q = (1-t)*(1-u)*a11
          + (1-t)*u   *a12
          + t   *(1-u)*a21
          + t   *u   *a22;
  return Math.round(q*1000)/1000;
}

/**
 * Find the flow rate in the unpivoted table based on water level and gate opening
 * @param {Array} table - Unpivoted table with rows of [correctedWaterLevel, gateOpening, flowRate]
 * @param {number} wl - Water level in cm
 * @param {number} go - Gate opening in cm
 * @returns {number|null} - Flow rate or null if not found
 */
function locateQ(table, wl, go) {
  for (let r of table) {
    if (r[0]===wl && r[1]===go) return r[2];
  }
  return null;
}

// Export functions
export {
  calculateQ,
  getUnpivotedTheory,
  interpolateFromUnpivot,
  locateQ
};