const { isBrowser } = require("browser-or-node");
let oParser, xml2string;
if (isBrowser) {
  oParser = new DOMParser();
} else {
  const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
  oParser = new DOMParser();
  xml2string = new XMLSerializer().serializeToString;
}

const measure = (data) => {
  const num = Number(data);
  if (!isNaN(num)) return num;

  let lower_data = data.toLowerCase().trim();
  if (['true', 'false'].includes(lower_data)) {
    return lower_data == 'true';
  }

  if (lower_data.match(/^\[(.*)\]$/)) {
    const arr = JSON.parse(lower_data);
    return Array.isArray(arr) ? arr.map(i => measure(i)) : data;
  }

  // number with unit
  const unit = (input, unit) => {
    if (!input.endsWith(unit)) return null;
    const inum = Number(input.substring(0, input.length - unit.length));
    return isNaN(inum) ? null : inum;
  }

  for (const ut of [ 'rpx', 'px', 'vw', 'vh' ]) {
    const inum = unit(lower_data, ut);
    if (inum !== null) return `${inum}${ut}`;
  }

  return data;
}

function parseNode(node) {
  const data = { type: node.nodeName };
  if (node.attributes.length > 0) {
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i]
      data[attr.name] = measure(attr.value);
    }
  }

  data.children = [];
  if (node.childNodes.length > 0) {
    const nodes = Array.isArray(node.childNodes) ? node.childNodes : Object.values(node.childNodes);
    nodes.map(cn => {
      if (typeof(cn) !== 'object' || !cn.nodeName || cn.nodeName.startsWith('#')) return;
      data.children.push(parseNode(cn));
    });
  }

  if (isBrowser) {
    data.innerHTML = node.innerHTML;
  } else {
    const html = xml2string(node);
    const headReg = new RegExp(`\\<${data.type}[^\\>]*\\>`, 'g');
    const tailReg = new RegExp(`\\<\\/${data.type}[^\\>]*\\>`, 'g');
    data.innerHTML = html.replace(headReg, '').replace(tailReg, '');
  }
  let html = data.innerHTML.trim();
  if (html && html.startsWith('<![CDATA[') && html.endsWith(']]>')) {
    data.innerHTML = html.substring(9, html.length - 3);
  }
  return data;
}

module.exports = {
  parseXml: function (xml) {
    const oDOM = oParser.parseFromString(xml, "application/xml");
    if (oDOM.documentElement.nodeName.toLowerCase() == 'miraml') {
      return parseNode(oDOM.documentElement);
    }
  },
  getValue: function(v) {
    if (typeof(v) !== 'object') return v;
    if (v.innerHTML) return v.innerHTML.replace('<![CDATA[', '').replace(']]>', '');
  }
};