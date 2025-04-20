/**
 * A module defining `SliderWidget`.
 *
 * @module nmodule/ddctalk/rc/SliderWidget
 */
define([ 
  'baja!',
  'bajaux/Widget',
  'bajaux/mixin/subscriberMixIn',
  'nmodule/ddctalk/ext/rangeSliderJs/rangeslider-js.min',
  'log!nmodule/ddctalk/rc/SliderWidget/SliderWidget',
  'baja!baja:StatusNumeric'
], function (
    baja,
    Widget, 
    subscriberMixIn,
    RangeSliderJs,
    log
  ) {

  'use strict';

  //const logSevere = log.severe.bind(log);
  const logInfo = log.info.bind(log);

  /**
   * A class representing a slider widget that renders and interacts with a range slider control.
   * Uses rangeslider.js library to create interactive sliders for Niagara platforms.
   *
   * @class SliderWidget
   * @extends Widget
   */
  return class SliderWidget extends Widget {
    /**
     * Creates an instance of SliderWidget.
     * 
     * @constructor
     * @param {Object} params - The parameters used to initialize this widget
     * @param {Object} [params.properties] - Initial properties for the widget
     * @param {number} [params.properties.rsMin=0] - Minimum value for the slider
     * @param {number} [params.properties.rsMax=100] - Maximum value for the slider
     * @param {number} [params.properties.rsStep=1] - Step increment for the slider
     * @param {boolean} [params.properties.rsHorizontal=true] - Whether the slider is horizontal (true) or vertical (false)
     */
    constructor(params) {
      super({
        params,
        defaults: {
          properties: {
            // TODO: if rsAutoRange is true, then get the min and max values from the points facets.
            // rsAutoRange: true,
            rsMin: 0,
            rsMax: 100,
            rsStep: 1,
            rsHorizontal: true
          }
        }
      });

      subscriberMixIn(this);

      // Attach changed event handler to subscriber
      const that = this;
      that.$slider = null;
      that.getSubscriber().attach('changed', function () {
        that.value() && that.$updateDom(that.value());
      });
    }

    /**
     * Initializes the DOM for this widget. Creates the slider HTML structure
     * and applies initial CSS styling based on orientation.
     *
     * @override
     * @param {jQuery} dom - jQuery object representing the widget's DOM element
     * @returns {void}
     */
    doInitialize(dom) {
      logInfo('SliderWidget.doInitialize() called.');

      const isHorizontal = this.properties().getValue('rsHorizontal');
      const orientation = isHorizontal ? 'horizontal' : 'vertical';

      // Create container with appropriate styling for orientation
      dom.html(`
        <div class="sliderWidget-container ${orientation}">
          <input type="range" 
          class="js-amount-range" 
          data-orientation="${orientation}" />
        </div>
      `);

      dom.css({
        'background-color': 'transparent'
      });

      // Add specific styling for vertical orientation
      if (!isHorizontal) {
        dom.find('.sliderWidget-container').css({
          'height': '100%'
        });
      }

      this.$slider = dom.find('.js-amount-range');
    }

    /**
     * Loads data into the widget. Initializes the rangeslider with options and callbacks.
     * Sets up event handling for slider interactions.
     *
     * @override
     * @param {baja.Entity} value - The value entity to load into this widget
     * @returns {void}
     */
    doLoad(value) {
      logInfo('SliderWidget.doLoad() called.');
      this.$updateDom(value);

      const min = this.$getMin();
      const max = this.$getMax();
      const step = this.properties().getValue('rsStep');
      const isHorizontal = this.properties().getValue('rsHorizontal');
    
      // Store the latest value during dragging, but don't send it yet
      let currentValue = null;
    
      this.$slider
        .rangeslider({
          polyfill: false,
          min: min,
          max: max,
          step: step,
          rangeClass: 'rangeslider',
          fillClass: 'rangeslider__fill',
          handleClass: 'rangeslider__handle',
          horizontalClass: 'rangeslider--horizontal',
          verticalClass: 'rangeslider--vertical',
          enabledClass: 'rangeslider--enabled',
          disabledClass: 'rangeslider--disabled',
        
          /**
           * Callback for slider drag events.
           * Stores the current value but doesn't commit it until drag ends.
           * 
           * @param {number} position - The slider position
           * @param {number} sValue - The slider value
           */
          onSlide: function(position, sValue) {
            // Just store the value during sliding, but don't commit yet
            currentValue = sValue;
            logInfo('Slider sliding to: ' + sValue + ' (not committed yet)');
          },
          
          /**
           * Callback for slider drag end events.
           * Commits the final value to the bound Niagara point.
           * 
           * @param {number} position - The slider position
           * @param {number} sValue - The final slider value
           */
          onSlideEnd: function(position, sValue) {
            // When sliding ends (mouse up), actually commit the value
            const sliderValue = baja.$('baja:StatusNumeric', { 
              status: baja.Status.alarm,
              value: parseFloat(sValue)
            });
            logInfo('Slider finished at: ' + sValue + ' (now committing)');
            value.setFallback(sliderValue);
          }
        });
        
      // Fix vertical slider sizing after initialization
      // if (!isHorizontal) {
      //   // Apply these styles after the slider is created
      //   const $container = this.jq().find('.sliderWidget-container');
      //   const containerHeight = $container.height();
        
      //   // Make the rangeslider element match the container height
      //   // this.jq().find('.rangeslider--vertical').css({
      //   //   'height': '100%'
      //   // });
      // }
    }

    /**
     * Cleans up resources when the widget is destroyed.
     * Removes the rangeslider instance to prevent memory leaks.
     *
     * @override
     * @returns {Promise} A promise that resolves when destruction is complete
     */
    doDestroy() {
      logInfo('SliderWidget.doDestroy() called.');
      this.$slider.rangeslider('destroy');
      return super.doDestroy();
    }

    /**
     * Updates the DOM to reflect the current value.
     * Sets the slider value without triggering onSlide events.
     *
     * @private
     * @param {baja.Entity} value - The value entity to display
     * @returns {void}
     */
    $updateDom(value) {
      if (!value) {
        return;
      }
      logInfo('SliderWidget.$updateDom() called.');

      const newValue = value.getOut().getValue();
      
      // Add error handling here
      try {
        // Update the slider value (using the jQuery plugin pattern)
        if (this.$slider && this.$slider.length) {
          this.$slider.val(newValue).change();
          logInfo('Slider value updated to: ' + newValue);
        } else {
          logInfo('Slider element not found');
        }
      } catch (e) {
        logSevere('Error updating slider value:' + e);
      }
    }

    /**
     * Gets the minimum value for the slider.
     * 
     * @private
     * @returns {number} The minimum slider value
     */
    $getMin() {
      // TODO: if rsAutoRange is true, then get the min value from the points facets.
      return this.properties().getValue('rsMin');
    }

    /**
     * Gets the maximum value for the slider.
     * 
     * @private
     * @returns {number} The maximum slider value
     */
    $getMax() {
      // TODO: if rsAutoRange is true, then get the max value from the points facets.
      return this.properties().getValue('rsMax');
    }
  };
});
