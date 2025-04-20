
define([
  'nmodule/ddctalk/rc/SliderWidget/SliderWidget',
  'jquery' ], function (
  SliderWidget,
  $) {

  'use strict';

  describe('nmodule/ddctalk/rc/SliderWidget/SliderWidget', () => {
    var widget,
        elem;

    beforeEach(() => {
      widget = new SliderWidget();
      elem = $('<div/>');
    });

    describe('#doInitialize()', () => {
      it('does something', () => {
        return widget.initialize(elem)
          .then(() => {
            //assert something about the widget after initialization.
            //expect(widget.js().text()).toBe('ready to go');
          });
      });
    });

    describe('#doLoad()', () => {
      it('does something', () => {
        return widget.initialize(elem)
          .then(() => {
            return widget.load('something');
          })
          .then(() => {
            //assert something about the widget after value is loaded.
            //expect(widget.jq().find('input').val()).toBe('something good'):
          });
      });
    });

    describe('#doRead()', () => {
      it('does something', () => {
        return widget.initialize(elem)
          .then(() => {
            return widget.load('something good');
          })
          .then(() => {
            return widget.read();
          })
          .then(function (result) {
            //assert something about the result read from the widget.
            //expect(result).toBe('something resplendent');
          });
      });
    });
  });
});


