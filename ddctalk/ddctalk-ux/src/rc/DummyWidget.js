
/**
 * A module defining `DummyWidget`.
 *
 * @module nmodule/ddctalk/rc/DummyWidget
 */
define([ 'bajaux/Widget', 'jquery', 'Promise' ], function (Widget, $, Promise) {
  'use strict';

  /**
   * Description of your widget.
   *
   * @class
   * @extends module:bajaux/Widget
   * @alias module:nmodule/ddctalk/rc/DummyWidget
   */
  var DummyWidget = function DummyWidget() {
    Widget.apply(this, arguments);
  };

  //extend and set up prototype chain
  DummyWidget.prototype = Object.create(Widget.prototype);
  DummyWidget.prototype.constructor = DummyWidget;

  /**
   * Describe how your widget does its initial setup of the DOM.
   *
   * @param {jQuery} element the DOM element into which to load this widget
   */
  DummyWidget.prototype.doInitialize = function (dom) {
    dom.html('<input type="text" value="value goes here" />');
  };

  /**
   * Describe how your widget loads in a value.
   *
   * @param value description of the value to be loaded into this widget
   */
  DummyWidget.prototype.doLoad = function (value) {
    this.jq().find('input').val(String(value));
  };

  /**
   * Describe what kind of data you can read out of this widget.
   *
   * @returns {Promise} promise to be resolved with the current value
   */
  DummyWidget.prototype.doRead = function () {
    return Promise.resolve(this.jq().find('input').val());
  };

  return DummyWidget;
});

