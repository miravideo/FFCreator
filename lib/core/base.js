'use strict';

/**
 * FFBase - Basic classes in FFCreator. Note: Its subclass is not necessarily a display class.
 *
 * ####Example:
 *
 *     class FFCon extends FFBase
 *
 * @class
 */
const Conf = require('../conf/conf');
const Utils = require('../utils/utils');
const FFEventer = require('../event/eventer');

class FFBase extends FFEventer {
  constructor(conf) {
    super();

    this.conf = { type: 'base', ...conf };
    this.parent = null;
    this.retry = 3;
    this.genId();

    if (this.conf.parent && typeof(this.conf.parent.addChild) === 'function') {
      this.conf.parent.addChild(this);
      delete this.conf['parent'];
    }
  }

  get changed() {
    return `${Date.now()}`;
  }

  set changed(change) {
    // do nothing
  }

  get groupId() {
    return this.conf.groupId;
  }

  set groupId(groupId) {
    return this.conf.groupId = groupId;
  }

  get type() {
    return this.conf.type;
  }

  set type(type) {
    return this.conf.type = type;
  }

  get name() {
    return this.conf.name;
  }

  set name(name) {
    return this.conf.name = name;
  }

  get parents() {
    if (!this.parent || !this.parent.parents) return [];
    return [...this.parent.parents, this.parent];
  }

  getParam(key) {
    if (!key || typeof(key) !== 'string') return undefined;
    if (!key.includes('.')) return this[key];
    let obj = this;
    for (const k of key.split('.')) {
      if (typeof(obj) !== 'object') return undefined;
      obj = obj[k];
    }
    return obj;
  }

  setParam(key, value) {
    if (!key || typeof(key) !== 'string') throw new Error(`Invalid key: ${key}`);
    let obj = this.conf;
    // if (typeof(value) != 'object') value = this.vu(value, this.getParam(key));
    if (!key.includes('.')) return obj[key] = value;
    let ks = key.split('.');
    for (let i = 0; i < ks.length; i++) {
      const k = ks[i];
      if (i === ks.length - 1) return obj[k] = value;
      if (typeof(obj[k]) !== 'object') obj[k] = isNaN(ks[i+1]) ? {} : [];
      obj = obj[k];
    }
  }

  vu(val, unitReferValue) {
    return val;
  }

  refresh() {
    ;
  }

  /**
   * Generate self-increasing unique id
   * @return {string} unique id
   * @public
   */
  genId() {
    const { type, id } = this.conf;
    this.id = Utils.genId(id || type);
  }

  /**
   * Get the logical root node of the instance
   * @return {FFBase} root node
   * @public
   */
  root() {
    if (this.parent && this.parent.root) return this.parent.root();
    else return this;
  }

  /**
   * Get the conf configuration on the logical root node of the instance
   * If the val parameter is set, the val value of conf is set
   * @param {string} key - configuration key
   * @param {any} val - configuration val
   * @return {object|any} root node
   * @public
   */
  rootConf(key, val) {
    let conf = Conf.getFakeConf();
    const root = this.root();
    if (root && root.type === 'creator' && root._conf) conf = root._conf;

    if (key) {
      if (val !== undefined) conf.setVal(key, val);
      return conf.getVal(key);
    } else {
      return conf;
    }
  }

  /**
   * Add callback hook
   * @public
   */
  addFrameCallback() {
    this.creator()?.addFrameCallback(this);
  }

  /**
   * Remove callback hook
   * @public
   */
  removeFrameCallback() {
    this.creator()?.removeFrameCallback(this);
  }

  creator() {
    if (!this._creator) {
      const root = this.root();
      if (root.type === 'creator') this._creator = root;
    }
    return this._creator;
  }

  /**
   * Destroy the component
   * @public
   */
  destroy() {
    super.destroy();
    this.conf = null;
    this.parent = null;
    this._creator = null;
  }
}

module.exports = FFBase;
