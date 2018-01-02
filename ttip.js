/**
 *	Project		Ttip with jQuery
 *	Build 		16 Apr, 2014
 * 	Author		Dariusz Szymczyk 
 */

(function($) {
	var instances = [],
		identificator = 1273182641241;
	
	$.fn.ttip = function(options) {
		var settings = $.extend({
			position		: "auto",
			finalPosition	: "bottom-left-right",
			arrow			: true,
			delay			: 250,
			tooltipSpace	: 10,
			maxWidth		: "100px",
			bgColor			: "auto",
			color			: "auto",
			alignToCorner	: false,
			tooltipIndent	: 30,
			animatedUpdate	: true,
			removeAfterHide	: true,
			showTooltip		: function() {},
			hideTooltip		: function() {}
		}, options),
		
		// Ttip config
		config = {
			tooltipContainerClass: "plugin-ttip-container",
			transitionClass: "ttip-transition",
		    availablePositions: {
		    	"auto": {},
		    	"top-left-right": {
		    		top: "this.elementTop - this.tooltipHeight - this.tooltipSpace",
		    		left: "this.elementLeft",
		    		arrowName: "top",
					cornerXDistance: -14
		    	},
		    	"top-right-left": {
		    		top: "this.elementTop - this.tooltipHeight - this.tooltipSpace",
		    		left: "this.elementLeft + this.elementWidth - this.tooltipWidth",
		    		arrowName: "top",
					cornerXDistance: 14
		    	},
		    	"right-top-bottom": {
		    		top: "this.elementTop",
		    		left: "this.elementLeft + this.elementWidth + this.tooltipSpace",
		    		arrowName: "right",
					cornerYDistance: -14
		    	},
		    	"right-bottom-top": {
		    		top: "this.elementTop + this.elementHeight - this.tooltipHeight",
		    		left: "this.elementLeft + this.elementWidth + this.tooltipSpace",
		    		arrowName: "right",
					cornerYDistance: 14
		    	},
		    	"bottom-right-left": {
		    		top: "this.elementTop + this.elementHeight + this.tooltipSpace",
		    		left: "this.elementLeft + this.elementWidth - this.tooltipWidth",
		    		arrowName: "bottom",
					cornerXDistance: 14
		    	},
		    	"bottom-left-right": {
		    		top: "this.elementTop + this.elementHeight + this.tooltipSpace",
		    		left: "this.elementLeft",
		    		arrowName: "bottom",
					cornerXDistance: -14
		    	},
		    	"left-bottom-top": {
		    		top: "this.elementTop + this.elementHeight - this.tooltipHeight",
		    		left: "this.elementLeft - this.tooltipWidth - this.tooltipSpace",
		    		arrowName: "left",
					cornerYDistance: 14
		    	},
		    	"left-top-bottom": {
		    		top: "this.elementTop",
		    		left: "this.elementLeft - this.tooltipWidth - this.tooltipSpace",
		    		arrowName: "left",
					cornerYDistance: -14
		    	},
		    	"top-left-left": {
		    		top: "this.elementTop - this.tooltipHeight - this.tooltipSpace",
		    		left: "this.elementLeft - this.tooltipWidth + this.settings.tooltipIndent",
		    		arrowName: "top",
					cornerXDistance: "14 - this.settings.tooltipIndent"
		    	},
		    	"top-right-right": {
		    		top: "this.elementTop - this.tooltipHeight - this.tooltipSpace",
		    		left: "this.elementLeft + this.elementWidth - this.settings.tooltipIndent",
		    		arrowName: "top",
					cornerXDistance: "this.settings.tooltipIndent - 14"
		    	},
		    	"right-top-top": {
		    		top: "this.elementTop - this.tooltipHeight + this.settings.tooltipIndent",
		    		left: "this.elementLeft + this.elementWidth + this.tooltipSpace",
		    		arrowName: "right",
					cornerYDistance: "14 - this.settings.tooltipIndent"
		    	},
		    	"right-bottom-bottom": {
		    		top: "this.elementTop + this.elementHeight - this.settings.tooltipIndent",
		    		left: "this.elementLeft + this.elementWidth + this.tooltipSpace",
		    		arrowName: "right",
					cornerYDistance: "this.settings.tooltipIndent - 14"
		    	},
		    	"bottom-right-right": {
		    		top: "this.elementTop + this.elementHeight + this.tooltipSpace",
		    		left: "this.elementLeft + this.elementWidth - this.settings.tooltipIndent",
		    		arrowName: "bottom",
					cornerXDistance: "this.settings.tooltipIndent - 14"
		    	},
		    	"bottom-left-left": {
		    		top: "this.elementTop + this.elementHeight + this.tooltipSpace",
		    		left: "this.elementLeft - this.tooltipWidth + this.settings.tooltipIndent",
		    		arrowName: "bottom",
					cornerXDistance: "14 - this.settings.tooltipIndent"
		    	},
		    	"left-bottom-bottom": {
		    		top: "this.elementTop + this.elementHeight - this.settings.tooltipIndent",
		    		left: "this.elementLeft - this.tooltipWidth - this.tooltipSpace",
		    		arrowName: "left",
					cornerYDistance: "this.settings.tooltipIndent - 14"
		    	},
		    	"left-top-top": {
		    		top: "this.elementTop - this.tooltipHeight + this.settings.tooltipIndent",
		    		left: "this.elementLeft - this.tooltipWidth - this.tooltipSpace",
		    		arrowName: "left",
					cornerYDistance: "14 - this.settings.tooltipIndent"
		    	}
		    }
		},
		
		// Ttip constructor
		Ttip = function(element) {
			this.element = element;
			this.settings = this.validSettings();
			this.addEvents();
			
			return this;
		};
		
		// This function adds events to the element
		Ttip.prototype.addEvents = function() {
			var that = this,
				element = that.element,
				mouseover = null;
			
			element.on("mouseover", function(e) {
				e.stopPropagation();
				mouseover = setTimeout(function() {
					that.showTooltip.apply(that);
					if ($.type(that.settings.showTooltip) == "function") {
						that.settings.showTooltip.apply(that.element, [that.element]);
					}
				}, that.settings.delay);
			});
			element.on("mouseout", function(e) {
				e.stopPropagation();
				if (mouseover) {
					clearTimeout(mouseover);
					mouseover = null;
				}
				that.hideTooltip.apply(that);
				
				$(window).unbind("mousemove", that.mouseMove);
			});
		};
		
		// This function show the tooltip - the heart of plugin, checking conditions, setPosition
		Ttip.prototype.showTooltip = function() {
			// Whenever the element doesn't exist the tooltip doesn't appear.
			if (!fn.isExists(this.element)) {
				return false;
			}

			try {
				this.text = this.validText();
				this.position = this.validPosition();
				this.tooltip = this.createTooltip();
				this.fillTooltip();
				this.setExtraProperties();
				this.getDetails();
				this.setPosition();
				this.tooltip.show();
			}
			catch (e) {
				this.hideTooltip();
				return false;
			}
		};		
		
		// This function hides tooltip, id it still exists
		Ttip.prototype.hideTooltip = function() {
			if (this.tooltip) {
				this.tooltip.hide();
				
				if (this.settings.removeAfterHide) {
					this.tooltip.remove();
				}
				if ($.type(this.settings.hideTooltip) == "function") {
					this.settings.hideTooltip.apply(this.element, [this.element]);
				}
				
				this.tooltip = null;
			}
			return;
		};
		
		Ttip.prototype.validSettings = function() {
			var that = this,
				instanceSettings = $.extend({}, settings);

			$.each(instanceSettings, function(index, value) {
				if (index == "showTooltip" || index == "hideTooltip" || index == "text") {
					return;
				}

				if ($.type(value) == "function") {
					instanceSettings[index] = instanceSettings[index].apply(that.element);
				}
			});

			return instanceSettings;
		};
		
		// This function tests if the text-content will be not empty, if not end the plugin
		Ttip.prototype.validText = function() {
			var text;

			if ($.type(settings.text) == "string" && settings.text != "") {
				text = settings.text;
			}
			else if ($.type(settings.text) == "function") {
				text = settings.text.apply(this.element);
			}

			if (!text) {
				throw new Error("Element hasn't got required attribute.");
			}
			else if (text == "") {
				throw new Error("Empty tooltip");
			}

			return text;
		};
		
		// This function create tooltip structure if it doesn't exist
		Ttip.prototype.createTooltip = function() {
			var tooltip = $("." + config.tooltipContainerClass);
			if (fn.isExists(tooltip)) {
				tooltip.removeClass().addClass(config.tooltipContainerClass);
			}
			else {
				tooltip = $("<div/>").addClass(config.tooltipContainerClass);
				$("body").append(tooltip);
			}
			
			if (this.settings.animatedUpdate) {
				tooltip.addClass(config.transitionClass);
			}
			return tooltip;
		};
		
		// This function fill the text into the tooltip
		Ttip.prototype.fillTooltip = function() {
			return this.tooltip.html(this.text);
		};
		
		// This function adds extra properties from settings to tooltip
		Ttip.prototype.setExtraProperties = function() {
			this.tooltip.css({
				maxWidth: this.settings.maxWidth,
				backgroundColor: this.settings.bgColor,
				borderColor: this.settings.bgColor,
				color: this.settings.color
			});
		};		
		
		// This function sets the tooltip position according with user settings
		Ttip.prototype.setPosition = function(demand, mustBeVisible) {
			var position = demand || this.position,
				mustBeVisible = mustBeVisible || false,
				top,
				left;
			
			if (position == "auto") {
				this.setAuto();
				return false;
			}
			
			top = eval(config.availablePositions[position].top);
			left = eval(config.availablePositions[position].left);
			arrowName = config.availablePositions[position].arrowName;

			if (this.settings.alignToCorner) {
				var newPosition = this.alignToCorner(top, left, position);
				top = newPosition.top;
				left = newPosition.left;
			}
			
			if (mustBeVisible) {
				if (!this.willBeVisible(top, left)) {
					return false;
				}
			}
			
			this.tooltip.css({
				top: top,
				left: left
			});
			
			this.addArrow(position, arrowName);
				
			return true;
		};
		
		Ttip.prototype.setAuto = function() {
			var that = this,
				done = false;
			
			// Trying to positive set position in all modes, if not set on top even if it can be unvisible
			$.each(config.availablePositions, function(index) {
				if (done) {
					return false;
				}
				
				if (index == "auto") {
					return;
				}

				done = that.setPosition(index, true);
			});
			
			if (!done) {
				if (this.settings.finalPosition == "auto") {
					this.settings.finalPosition = "bottom-left-right";
				}
				this.setPosition(this.settings.finalPosition);
			}
		};
		
		Ttip.prototype.addArrow = function(tooltipClass, tooltipClass2) {
			if (this.settings.arrow) {
				this.tooltip.addClass(tooltipClass).addClass(tooltipClass2);
			}
		};
		
		Ttip.prototype.getDetails = function() {
			var tooltip = this.tooltip,
				element = this.element;
			
			this.tooltipHeight = parseInt(tooltip.outerHeight());
			this.tooltipWidth = parseInt(tooltip.outerWidth());
			this.elementHeight = parseInt(element.outerHeight());
			this.elementWidth = parseInt(element.outerWidth());
			this.elementTop = parseInt(element.offset().top);
			this.elementLeft = parseInt(element.offset().left);
			this.windowHeight = parseInt(window.innerHeight);
			this.windowWidth = parseInt($(window).width());
			this.tooltipSpace = parseInt(this.settings.tooltipSpace);
		};
		
		Ttip.prototype.willBeVisible = function(top, left) {
			top -= parseInt($(window).scrollTop());
			left -= parseInt($(window).scrollLeft());
						
			if (top >= 0 && top + this.tooltipHeight <= this.windowHeight && left >= 0 && left + this.tooltipWidth <= this.windowWidth) {
				return true;
			}
			return false;
		};
		
		Ttip.prototype.validPosition = function() {
			var position = this.settings.position;

			if ($.type(position) == "function") {
				position = position.apply(this.element);
			}

			if (!config.availablePositions[position]) {
				position = "auto";
			}
			
			position = position.toLowerCase();
			
			return position;
		};
		
		Ttip.prototype.alignToCorner = function(top, left, position) {
			var cornerYDistance = eval(config.availablePositions[position].cornerYDistance),
				cornerXDistance = eval(config.availablePositions[position].cornerXDistance)
			
			cornerYDistance = (cornerYDistance) ? cornerYDistance : 0,
			cornerXDistance = (cornerXDistance) ? cornerXDistance : 0;
				
			top += cornerYDistance;
			left += cornerXDistance;
			
			return {
				top: top,
				left: left
			};
		};
		
		
		
		// This object contains useful functions to this plugin
		var fn = {
			isExists: function(element) {
				return (element.size() > 0);
			}
		};
		
		// Plugin
		return this.each(function() {
			var that = $(this);
			
			if (!that.data("tooltip-identificator")) {
				identificator++;
				that.data("tooltip-identificator", identificator);
				instances[identificator] = new Ttip($(this));
			}
			else {
				instances[that.data("tooltip-identificator")].showTooltip();
			}
		});
	};
})(jQuery);