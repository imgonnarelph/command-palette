(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.AutocompleteElement = factory());
}(this, (function () { 'use strict';

  function debounce(callback, wait) {
    var timeout = void 0;
    return function debounced() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var self = this;
      function later() {
        clearTimeout(timeout);
        callback.apply(self, args);
      }
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  var requests = new WeakMap();

  function fragment(el, url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'text/html; fragment');
    return request(el, xhr);
  }

  function request(el, xhr) {
    var pending = requests.get(el);
    if (pending) pending.abort();
    requests.set(el, xhr);

    var clear = function clear() {
      return requests.delete(el);
    };
    var result = send(xhr);
    result.then(clear, clear);
    return result;
  }

  function send(xhr) {
    return new Promise(function (resolve, reject) {
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(new Error(xhr.responseText));
        }
      };
      xhr.onerror = reject;
      xhr.send();
    });
  }

  function scrollTo(container, target) {
    if (!inViewport(container, target)) {
      container.scrollTop = target.offsetTop;
    }
  }

  function inViewport(container, element) {
    var scrollTop = container.scrollTop;
    var containerBottom = scrollTop + container.clientHeight;
    var top = element.offsetTop;
    var bottom = top + element.clientHeight;
    return top >= scrollTop && bottom <= containerBottom;
  }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var ctrlBindings = navigator.userAgent.match(/Macintosh/);

  var Autocomplete = function () {
    function Autocomplete(container, input, results) {
      classCallCheck(this, Autocomplete);

      this.container = container;
      this.input = input;
      this.results = results;

      this.results.hidden = true;
      this.input.setAttribute('autocomplete', 'off');
      this.input.setAttribute('spellcheck', 'false');

      this.mouseDown = false;

      this.onInputChange = debounce(this.onInputChange.bind(this), 300);
      this.onResultsClick = this.onResultsClick.bind(this);
      this.onResultsMouseDown = this.onResultsMouseDown.bind(this);
      this.onInputBlur = this.onInputBlur.bind(this);
      this.onInputFocus = this.onInputFocus.bind(this);
      this.onKeydown = this.onKeydown.bind(this);

      this.input.addEventListener('keydown', this.onKeydown);
      this.input.addEventListener('focus', this.onInputFocus);
      this.input.addEventListener('blur', this.onInputBlur);
      this.input.addEventListener('input', this.onInputChange);
      this.results.addEventListener('mousedown', this.onResultsMouseDown);
      this.results.addEventListener('click', this.onResultsClick);
    }

    createClass(Autocomplete, [{
      key: 'destroy',
      value: function destroy() {
        this.input.removeEventListener('keydown', this.onKeydown);
        this.input.removeEventListener('focus', this.onInputFocus);
        this.input.removeEventListener('blur', this.onInputBlur);
        this.input.removeEventListener('input', this.onInputChange);
        this.results.removeEventListener('mousedown', this.onResultsMouseDown);
        this.results.removeEventListener('click', this.onResultsClick);
      }
    }, {
      key: 'sibling',
      value: function sibling(next) {
        var options = Array.from(this.results.querySelectorAll('[role="option"]'));
        var selected = this.results.querySelector('[aria-selected="true"]');
        var index = options.indexOf(selected);
        var sibling = next ? options[index + 1] : options[index - 1];
        var def = next ? options[0] : options[options.length - 1];
        return sibling || def;
      }
    }, {
      key: 'select',
      value: function select(target) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.results.querySelectorAll('[aria-selected="true"]')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var el = _step.value;

            el.removeAttribute('aria-selected');
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        target.setAttribute('aria-selected', 'true');
        this.input.setAttribute('aria-activedescendant', target.id);
        scrollTo(this.results, target);
      }
    }, {
      key: 'onKeydown',
      value: function onKeydown(event) {
        switch (event.key) {
          case 'Escape':
            if (this.container.open) {
              this.container.open = false;
              event.stopPropagation();
              event.preventDefault();
            }
            break;
          case 'ArrowDown':
            {
              var item = this.sibling(true);
              if (item) this.select(item);
              event.preventDefault();
            }
            break;
          case 'ArrowUp':
            {
              var _item = this.sibling(false);
              if (_item) this.select(_item);
              event.preventDefault();
            }
            break;
          case 'n':
            if (ctrlBindings && event.ctrlKey) {
              var _item2 = this.sibling(true);
              if (_item2) this.select(_item2);
              event.preventDefault();
            }
            break;
          case 'p':
            if (ctrlBindings && event.ctrlKey) {
              var _item3 = this.sibling(false);
              if (_item3) this.select(_item3);
              event.preventDefault();
            }
            break;
          case 'Tab':
            {
              var selected = this.results.querySelector('[aria-selected="true"]');
              if (selected) {
                this.commit(selected);
              }
            }
            break;
          case 'Enter':
            {
              var _selected = this.results.querySelector('[aria-selected="true"]');
              if (_selected && this.container.open) {
                this.commit(_selected);
                event.preventDefault();
              }
            }
            break;
        }
      }
    }, {
      key: 'onInputFocus',
      value: function onInputFocus() {
        this.fetchResults();
      }
    }, {
      key: 'onInputBlur',
      value: function onInputBlur() {
        if (this.mouseDown) return;
        this.container.open = false;
      }
    }, {
      key: 'commit',
      value: function commit(selected) {
        if (selected.getAttribute('aria-disabled') === 'true') return;

        if (selected instanceof HTMLAnchorElement) {
          selected.click();
          this.container.open = false;
          return;
        }

        var value = selected.getAttribute('data-autocomplete-value') || selected.textContent;
        this.container.value = value;
        this.container.open = false;
      }
    }, {
      key: 'onResultsClick',
      value: function onResultsClick(event) {
        if (!(event.target instanceof Element)) return;
        var selected = event.target.closest('[role="option"]');
        if (selected) this.commit(selected);
      }
    }, {
      key: 'onResultsMouseDown',
      value: function onResultsMouseDown() {
        var _this = this;

        this.mouseDown = true;
        this.results.addEventListener('mouseup', function () {
          return _this.mouseDown = false;
        }, { once: true });
      }
    }, {
      key: 'onInputChange',
      value: function onInputChange() {
        this.container.removeAttribute('value');
        this.fetchResults();
      }
    }, {
      key: 'identifyOptions',
      value: function identifyOptions() {
        var id = 0;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.results.querySelectorAll('[role="option"]:not([id])')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var el = _step2.value;

            el.id = this.results.id + '-option-' + id++;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }, {
      key: 'fetchResults',
      value: function fetchResults() {
        var _this2 = this;

        var query = this.input.value.trim();
        if (!query) {
          this.container.open = false;
          return;
        }

        var src = this.container.src;
        if (!src) return;

        var url = new URL(src, window.location.href);
        var params = new URLSearchParams(url.search.slice(1));
        params.append('q', query);
        url.search = params.toString();

        this.container.dispatchEvent(new CustomEvent('loadstart'));
        fragment(this.input, url.toString()).then(function (html) {
          _this2.results.innerHTML = html;
          _this2.identifyOptions();
          var hasResults = !!_this2.results.querySelector('[role="option"]');
          _this2.container.open = hasResults;
          _this2.container.dispatchEvent(new CustomEvent('load'));
          _this2.container.dispatchEvent(new CustomEvent('loadend'));
        }).catch(function () {
          _this2.container.dispatchEvent(new CustomEvent('error'));
          _this2.container.dispatchEvent(new CustomEvent('loadend'));
        });
      }
    }, {
      key: 'open',
      value: function open() {
        if (!this.results.hidden) return;
        this.results.hidden = false;
        this.container.setAttribute('aria-expanded', 'true');
        this.container.dispatchEvent(new CustomEvent('toggle', { detail: { input: this.input, results: this.results } }));
      }
    }, {
      key: 'close',
      value: function close() {
        if (this.results.hidden) return;
        this.results.hidden = true;
        this.input.removeAttribute('aria-activedescendant');
        this.container.setAttribute('aria-expanded', 'false');
        this.container.dispatchEvent(new CustomEvent('toggle', { detail: { input: this.input, results: this.results } }));
      }
    }]);
    return Autocomplete;
  }();

  function _CustomElement() {
    return Reflect.construct(HTMLElement, [], this.__proto__.constructor);
  }
  Object.setPrototypeOf(_CustomElement.prototype, HTMLElement.prototype);
  Object.setPrototypeOf(_CustomElement, HTMLElement);

  var state = new WeakMap();

  var AutocompleteElement = function (_CustomElement2) {
    inherits(AutocompleteElement, _CustomElement2);

    function AutocompleteElement() {
      classCallCheck(this, AutocompleteElement);
      return possibleConstructorReturn(this, (AutocompleteElement.__proto__ || Object.getPrototypeOf(AutocompleteElement)).call(this));
    }

    createClass(AutocompleteElement, [{
      key: 'connectedCallback',
      value: function connectedCallback() {
        var owns = this.getAttribute('aria-owns');
        if (!owns) return;

        var input = this.querySelector('input');
        var results = document.getElementById(owns);
        if (!(input instanceof HTMLInputElement) || !results) return;
        state.set(this, new Autocomplete(this, input, results));

        this.setAttribute('role', 'combobox');
        this.setAttribute('aria-haspopup', 'listbox');
        this.setAttribute('aria-expanded', 'false');

        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('aria-controls', owns);

        results.setAttribute('role', 'listbox');
      }
    }, {
      key: 'disconnectedCallback',
      value: function disconnectedCallback() {
        var autocomplete = state.get(this);
        if (autocomplete) {
          autocomplete.destroy();
          state.delete(this);
        }
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        var autocomplete = state.get(this);
        if (!autocomplete) return;

        switch (name) {
          case 'open':
            newValue === null ? autocomplete.close() : autocomplete.open();
            break;
          case 'value':
            if (newValue !== null) {
              autocomplete.input.value = newValue;
            }
            this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
            break;
        }
      }
    }, {
      key: 'src',
      get: function get$$1() {
        return this.getAttribute('src') || '';
      },
      set: function set$$1(url) {
        this.setAttribute('src', url);
      }
    }, {
      key: 'value',
      get: function get$$1() {
        return this.getAttribute('value') || '';
      },
      set: function set$$1(value) {
        this.setAttribute('value', value);
      }
    }, {
      key: 'open',
      get: function get$$1() {
        return this.hasAttribute('open');
      },
      set: function set$$1(value) {
        if (value) {
          this.setAttribute('open', '');
        } else {
          this.removeAttribute('open');
        }
      }
    }], [{
      key: 'observedAttributes',
      get: function get$$1() {
        return ['open', 'value'];
      }
    }]);
    return AutocompleteElement;
  }(_CustomElement);

  if (!window.customElements.get('auto-complete')) {
    window.AutocompleteElement = AutocompleteElement;
    window.customElements.define('auto-complete', AutocompleteElement);
  }

  return AutocompleteElement;

})));
