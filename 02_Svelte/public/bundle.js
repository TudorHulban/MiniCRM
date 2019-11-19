
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, props) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : prop_values;
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const UrlParser = (urlString, namedUrl = "") => {
      const urlBase = new URL(urlString);

      /**
       * Wrapper for URL.host
       *
       **/
      function host() {
        return urlBase.host;
      }

      /**
       * Wrapper for URL.hostname
       *
       **/
      function hostname() {
        return urlBase.hostname;
      }

      /**
       * Returns an object with all the named params and their values
       *
       **/
      function namedParams() {
        const allPathName = pathNames();
        const allNamedParamsKeys = namedParamsWithIndex();

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values[paramKey.value] = allPathName[paramKey.index];
          return values;
        }, {});
      }

      /**
       * Returns an array with all the named param keys
       *
       **/
      function namedParamsKeys() {
        const allNamedParamsKeys = namedParamsWithIndex();

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values.push(paramKey.value);
          return values;
        }, []);
      }

      /**
       * Returns an array with all the named param values
       *
       **/
      function namedParamsValues() {
        const allPathName = pathNames();
        const allNamedParamsKeys = namedParamsWithIndex();

        return allNamedParamsKeys.reduce((values, paramKey) => {
          values.push(allPathName[paramKey.index]);
          return values;
        }, []);
      }

      /**
       * Returns an array with all named param ids and their position in the path
       * Private
       **/
      function namedParamsWithIndex() {
        const namedUrlParams = getPathNames(namedUrl);

        return namedUrlParams.reduce((validParams, param, index) => {
          if (param[0] === ":") {
            validParams.push({ value: param.slice(1), index });
          }
          return validParams;
        }, []);
      }

      /**
       * Wrapper for URL.port
       *
       **/
      function port() {
        return urlBase.port;
      }

      /**
       * Wrapper for URL.pathname
       *
       **/
      function pathname() {
        return urlBase.pathname;
      }

      /**
       * Wrapper for URL.protocol
       *
       **/
      function protocol() {
        return urlBase.protocol;
      }

      /**
       * Wrapper for URL.search
       *
       **/
      function search() {
        return urlBase.search;
      }

      /**
       * Returns an object with all query params and their values
       *
       **/
      function queryParams() {
        const params = {};
        urlBase.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        return params;
      }

      /**
       * Returns an array with all the query param keys
       *
       **/
      function queryParamsKeys() {
        const params = [];
        urlBase.searchParams.forEach((_value, key) => {
          params.push(key);
        });

        return params;
      }

      /**
       * Returns an array with all the query param values
       *
       **/
      function queryParamsValues() {
        const params = [];
        urlBase.searchParams.forEach(value => {
          params.push(value);
        });

        return params;
      }

      /**
       * Returns an array with all the elements of a pathname
       *
       **/
      function pathNames() {
        return getPathNames(urlBase.pathname);
      }

      /**
       * Returns an array with all the parts of a pathname
       * Private method
       **/
      function getPathNames(pathName) {
        if (pathName === "/" || pathName.trim().length === 0) return [pathName];
        if (pathName.slice(-1) === "/") {
          pathName = pathName.slice(0, -1);
        }
        if (pathName[0] === "/") {
          pathName = pathName.slice(1);
        }

        return pathName.split("/");
      }

      return Object.freeze({
        host: host(),
        hostname: hostname(),
        namedParams: namedParams(),
        namedParamsKeys: namedParamsKeys(),
        namedParamsValues: namedParamsValues(),
        pathNames: pathNames(),
        port: port(),
        pathname: pathname(),
        protocol: protocol(),
        search: search(),
        queryParams: queryParams(),
        queryParamsKeys: queryParamsKeys(),
        queryParamsValues: queryParamsValues()
      });
    };

    var url_parser = { UrlParser };

    const UrlParser$1 = url_parser.UrlParser;

    var urlParamsParser = {
      UrlParser: UrlParser$1
    };

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    var store = /*#__PURE__*/Object.freeze({
        __proto__: null,
        derived: derived,
        readable: readable,
        writable: writable,
        get: get_store_value
    });

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var require$$0 = getCjsExportFromNamespace(store);

    const writable$1 = require$$0.writable;

    const router = writable$1({});

    function set(route) {
      router.set(route);
    }

    function remove() {
      router.set({});
    }

    const activeRoute = {
      subscribe: router.subscribe,
      set,
      remove
    };

    var store$1 = { activeRoute };
    var store_1 = store$1.activeRoute;

    /**
     * Returns true if object has any nested routes empty
     * @param routeObject
     **/
    function anyEmptyNestedRoutes(routeObject) {
      let result = false;
      if (Object.keys(routeObject).length === 0) {
        return true
      }

      if (routeObject.childRoute && Object.keys(routeObject.childRoute).length === 0) {
        result = true;
      } else if (routeObject.childRoute) {
        result = anyEmptyNestedRoutes(routeObject.childRoute);
      }

      return result
    }

    /**
     * Updates the base route path when route.name has a nested inside like /admin/teams
     * @param basePath string
     * @param pathNames array
     * @param route object
     **/
    function compareRoutes(basePath, pathNames, route) {
      if (basePath === '/' || basePath.trim().length === 0) return basePath
      let basePathResult = basePath;
      let routeName = route.name;
      if (routeName[0] === '/') {
        routeName = routeName.slice(1);
      }
      if (basePathResult[0] === '/') {
        basePathResult = basePathResult.slice(1);
      }

      if (!route.childRoute) {
        let routeNames = routeName.split(':')[0];
        if (routeNames.slice(-1) === '/') {
          routeNames = routeNames.slice(0, -1);
        }
        routeNames = routeNames.split('/');
        routeNames.shift();
        routeNames.forEach(() => {
          const currentPathName = pathNames[0];
          if (currentPathName && route.name.includes(`${basePathResult}/${currentPathName}`)) {
            basePathResult += `/${pathNames.shift()}`;
          } else {
            return basePathResult
          }
        });
        return basePathResult
      } else {
        return basePath
      }
    }

    /**
     * Return all the consecutive named param (placeholders) of a pathname
     * @param pathname
     **/
    function getNamedParams(pathName = '') {
      if (pathName.trim().length === '') return []

      const namedUrlParams = getPathNames(pathName);
      return namedUrlParams.reduce((validParams, param, index) => {
        if (param[0] === ':') {
          validParams.push(param.slice(1));
        }
        return validParams
      }, [])
    }

    /**
     * Split a pathname based on /
     * @param pathName
     * Private method
     **/
    function getPathNames(pathName) {
      if (pathName === '/' || pathName.trim().length === 0) return [pathName]
      if (pathName.slice(-1) === '/') {
        pathName = pathName.slice(0, -1);
      }
      if (pathName[0] === '/') {
        pathName = pathName.slice(1);
      }

      return pathName.split('/')
    }

    /**
     * Return the first part of a pathname until the first named param
     * @param name
     **/
    function nameToPath(name = '') {
      let routeName;
      if (name === '/' || name.trim().length === 0) return name
      if (name[0] === '/') {
        name = name.slice(1);
      }

      routeName = name.split(':')[0];
      if (routeName.slice(-1) === '/') {
        routeName = routeName.slice(0, -1);
      }

      return routeName.toLowerCase()
    }

    /**
     * Return the path name including query params
     * @param name
     **/
    function pathWithSearch(currentRoute) {
      let queryParams = [];
      if (currentRoute.queryParams) {
        for (let [key, value] of Object.entries(currentRoute.queryParams)) {
          queryParams.push(`${key}=${value}`);
        }
      }
      if (queryParams.length > 0) {
        return `${currentRoute.path}?${queryParams.join('&')}`
      } else {
        return currentRoute.path
      }
    }

    var utils = {
      anyEmptyNestedRoutes,
      compareRoutes,
      getNamedParams,
      getPathNames,
      nameToPath,
      pathWithSearch
    };

    const { UrlParser: UrlParser$2 } = urlParamsParser;
    const { activeRoute: activeRoute$1 } = store$1;
    const { anyEmptyNestedRoutes: anyEmptyNestedRoutes$1, compareRoutes: compareRoutes$1, getNamedParams: getNamedParams$1, nameToPath: nameToPath$1, pathWithSearch: pathWithSearch$1 } = utils;

    const NotFoundPage = '/404.html';
    let userDefinedRoutes = [];
    let routerOptions = {};
    let currentActiveRoute = '';

    /**
     * Object exposes one single property: activeRoute
     * @param routes  Array of routes
     * @param currentUrl current url
     * @param options configuration options
     **/
    function SpaRouter(routes, currentUrl, options = {}) {
      let redirectTo = '';
      routerOptions = options;
      if (typeof currentUrl === 'undefined' || currentUrl === '') {
        currentUrl = document.location.href;
      }

      if (currentUrl.trim().length > 1 && currentUrl.slice(-1) === '/') {
        currentUrl = currentUrl.slice(0, -1);
      }

      const urlParser = UrlParser$2(currentUrl);
      let routeNamedParams = {};
      userDefinedRoutes = routes;

      function findActiveRoute() {
        redirectTo = '';
        let searchActiveRoute = searchActiveRoutes(routes, '', urlParser.pathNames);

        if (!searchActiveRoute || anyEmptyNestedRoutes$1(searchActiveRoute)) {
          if (typeof window !== 'undefined') {
            forceRedirect(NotFoundPage);
          } else {
            searchActiveRoute = { name: '404', component: '', path: '404' };
          }
        } else {
          searchActiveRoute.path = urlParser.pathname;
        }

        return searchActiveRoute
      }

      /**
       * Redirect current route to another
       * @param destinationUrl
       **/
      function forceRedirect(destinationUrl) {
        if (typeof window !== 'undefined') {
          currentActiveRoute = destinationUrl;
          if (destinationUrl === NotFoundPage) {
            window.location = destinationUrl;
          } else {
            navigateTo(destinationUrl);
          }
        }

        return destinationUrl
      }

      function gaTracking(newPage) {
        if (typeof ga !== 'undefined') {
          ga('set', 'page', newPage);
          ga('send', 'pageview');
        }
      }

      function generate() {
        const currentRoute = findActiveRoute();

        if (currentRoute.redirectTo) {
          return forceRedirect(redirectTo)
        }
        currentActiveRoute = currentRoute.path;
        activeRoute$1.set(currentRoute);

        pushActiveRoute(currentRoute);

        return currentRoute
      }

      /**
       * Updates the browser pathname and history with the active route.
       * @param currentRoute
       **/
      function pushActiveRoute(currentRoute) {
        if (typeof window !== 'undefined') {
          const pathAndSearch = pathWithSearch$1(currentRoute);
          window.history.pushState({ page: pathAndSearch }, '', pathAndSearch);
          if (routerOptions.gaPageviews) {
            gaTracking(pathAndSearch);
          }
        }
      }

      /**
       * Gets an array of routes and the browser pathname and return the active route
       * @param routes
       * @param basePath
       * @param pathNames
       **/
      function searchActiveRoutes(routes, basePath, pathNames) {
        let currentRoute = {};
        let basePathName = pathNames.shift().toLowerCase();

        routes.forEach(function(route) {
          basePathName = compareRoutes$1(basePathName, pathNames, route);

          if (basePathName === nameToPath$1(route.name)) {
            let namedPath = `${basePath}/${route.name}`;
            let routePath = `${basePath}/${nameToPath$1(route.name)}`;
            if (routePath === '//') {
              routePath = '/';
            }

            if (route.redirectTo && route.redirectTo.length > 0) {
              redirectTo = route.redirectTo;
            }

            if (route.onlyIf && route.onlyIf.guard) {
              if (!route.onlyIf.guard()) {
                let destinationUrl = '/';
                if (route.onlyIf.redirect && route.onlyIf.redirect.length > 0) {
                  destinationUrl = route.onlyIf.redirect;
                }
                redirectTo = destinationUrl;
              }
            }

            const namedParams = getNamedParams$1(route.name);
            if (namedParams && namedParams.length > 0) {
              namedParams.forEach(function() {
                if (pathNames.length > 0) {
                  routePath += `/${pathNames.shift()}`;
                }
              });
            }

            if (currentRoute.name !== routePath) {
              const parsedParams = UrlParser$2(`https://fake.com${urlParser.pathname}`, namedPath).namedParams;
              routeNamedParams = { ...routeNamedParams, ...parsedParams };
              currentRoute = {
                name: routePath,
                component: route.component,
                layout: route.layout,
                queryParams: urlParser.queryParams,
                namedParams: routeNamedParams
              };
            }

            if (route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length > 0) {
              currentRoute.childRoute = searchActiveRoutes(route.nestedRoutes, routePath, pathNames);
            } else if (route.nestedRoutes && route.nestedRoutes.length > 0 && pathNames.length === 0) {
              const indexRoute = searchActiveRoutes(route.nestedRoutes, routePath, ['index']);
              if (indexRoute && Object.keys(indexRoute).length > 0) {
                currentRoute.childRoute = indexRoute;
              }
            }
          }
        });

        if (redirectTo) {
          currentRoute['redirectTo'] = redirectTo;
        }

        return currentRoute
      }

      return Object.freeze({
        activeRoute: generate()
      })
    }

    /**
     * Updates the current active route and updates the browser pathname
     * @param pathName
     **/
    function navigateTo(pathName) {
      if (pathName.trim().length > 1 && pathName[0] === '/') {
        pathName = pathName.slice(1);
      }

      const activeRoute = SpaRouter(userDefinedRoutes, 'http://fake.com/' + pathName, routerOptions).activeRoute;

      return activeRoute
    }

    /**
     * Returns true if pathName is current active route
     * @param pathName
     **/
    function routeIsActive(queryPath, includePath = false) {
      if (queryPath[0] !== '/') {
        queryPath = '/' + queryPath;
      }

      let pathName = UrlParser$2(`http://fake.com${queryPath}`).pathname;
      if (pathName.slice(-1) === '/') {
        pathName = pathName.slice(0, -1);
      }

      let activeRoute = currentActiveRoute || pathName;
      if (activeRoute.slice(-1) === '/') {
        activeRoute = activeRoute.slice(0, -1);
      }

      if (includePath) {
        return activeRoute.includes(pathName)
      } else {
        return activeRoute === pathName
      }
    }

    if (typeof window !== 'undefined') {
      // Avoid full page reload on local routes
      window.addEventListener('click', event => {
        if (event.target.pathname && event.target.hostname === window.location.hostname && event.target.localName === 'a') {
          event.preventDefault();
          // event.stopPropagation()
          navigateTo(event.target.pathname + event.target.search);
        }
      });

      window.onpopstate = function(_event) {
        navigateTo(window.location.pathname + window.location.search);
      };
    }

    var router$1 = { SpaRouter, navigateTo, routeIsActive };
    var router_1 = router$1.SpaRouter;
    var router_2 = router$1.navigateTo;
    var router_3 = router$1.routeIsActive;

    /* node_modules/svelte-router-spa/src/components/route.svelte generated by Svelte v3.15.0 */

    // (10:34) 
    function create_if_block_2(ctx) {
    	let current;

    	const route = new Route({
    			props: {
    				currentRoute: ctx.currentRoute.childRoute,
    				params: ctx.params
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			const route_changes = {};
    			if (changed.currentRoute) route_changes.currentRoute = ctx.currentRoute.childRoute;
    			if (changed.params) route_changes.params = ctx.params;
    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(10:34) ",
    		ctx
    	});

    	return block;
    }

    // (8:33) 
    function create_if_block_1(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = ctx.currentRoute.component;

    	function switch_props(ctx) {
    		return {
    			props: {
    				currentRoute: { ...ctx.currentRoute, component: "" },
    				params: ctx.params
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			const switch_instance_changes = {};
    			if (changed.currentRoute) switch_instance_changes.currentRoute = { ...ctx.currentRoute, component: "" };
    			if (changed.params) switch_instance_changes.params = ctx.params;

    			if (switch_value !== (switch_value = ctx.currentRoute.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(8:33) ",
    		ctx
    	});

    	return block;
    }

    // (6:0) {#if currentRoute.layout}
    function create_if_block(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = ctx.currentRoute.layout;

    	function switch_props(ctx) {
    		return {
    			props: {
    				currentRoute: { ...ctx.currentRoute, layout: "" },
    				params: ctx.params
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			const switch_instance_changes = {};
    			if (changed.currentRoute) switch_instance_changes.currentRoute = { ...ctx.currentRoute, layout: "" };
    			if (changed.params) switch_instance_changes.params = ctx.params;

    			if (switch_value !== (switch_value = ctx.currentRoute.layout)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(6:0) {#if currentRoute.layout}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.currentRoute.layout) return 0;
    		if (ctx.currentRoute.component) return 1;
    		if (ctx.currentRoute.childRoute) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(changed, ctx);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { currentRoute = {} } = $$props;
    	let { params = {} } = $$props;
    	const writable_props = ["currentRoute", "params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("currentRoute" in $$props) $$invalidate("currentRoute", currentRoute = $$props.currentRoute);
    		if ("params" in $$props) $$invalidate("params", params = $$props.params);
    	};

    	$$self.$capture_state = () => {
    		return { currentRoute, params };
    	};

    	$$self.$inject_state = $$props => {
    		if ("currentRoute" in $$props) $$invalidate("currentRoute", currentRoute = $$props.currentRoute);
    		if ("params" in $$props) $$invalidate("params", params = $$props.params);
    	};

    	return { currentRoute, params };
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { currentRoute: 0, params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get currentRoute() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentRoute(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get params() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var route = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Route
    });

    /* node_modules/svelte-router-spa/src/components/router.svelte generated by Svelte v3.15.0 */

    function create_fragment$1(ctx) {
    	let current;

    	const route = new Route({
    			props: { currentRoute: ctx.$activeRoute },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			const route_changes = {};
    			if (changed.$activeRoute) route_changes.currentRoute = ctx.$activeRoute;
    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	validate_store(store_1, "activeRoute");
    	component_subscribe($$self, store_1, $$value => $$invalidate("$activeRoute", $activeRoute = $$value));
    	let { routes = [] } = $$props;
    	let { options = {} } = $$props;

    	onMount(function () {
    		router_1(routes, document.location.href, options).activeRoute;
    	});

    	const writable_props = ["routes", "options"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate("routes", routes = $$props.routes);
    		if ("options" in $$props) $$invalidate("options", options = $$props.options);
    	};

    	$$self.$capture_state = () => {
    		return { routes, options, $activeRoute };
    	};

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate("routes", routes = $$props.routes);
    		if ("options" in $$props) $$invalidate("options", options = $$props.options);
    		if ("$activeRoute" in $$props) store_1.set($activeRoute = $$props.$activeRoute);
    	};

    	return { routes, options, $activeRoute };
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { routes: 0, options: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var router$2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Router
    });

    /* node_modules/svelte-router-spa/src/components/navigate.svelte generated by Svelte v3.15.0 */
    const file = "node_modules/svelte-router-spa/src/components/navigate.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let dispose;
    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			attr_dev(a, "href", ctx.to);
    			attr_dev(a, "title", ctx.title);
    			attr_dev(a, "class", ctx.styles);
    			toggle_class(a, "active", router_3(ctx.to));
    			add_location(a, file, 13, 0, 255);
    			dispose = listen_dev(a, "click", ctx.navigate, false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},
    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_template, ctx, changed, null), get_slot_context(default_slot_template, ctx, null));
    			}

    			if (!current || changed.to) {
    				attr_dev(a, "href", ctx.to);
    			}

    			if (!current || changed.title) {
    				attr_dev(a, "title", ctx.title);
    			}

    			if (!current || changed.styles) {
    				attr_dev(a, "class", ctx.styles);
    			}

    			if (changed.styles || changed.routeIsActive || changed.to) {
    				toggle_class(a, "active", router_3(ctx.to));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { to = "/" } = $$props;
    	let { title = "" } = $$props;
    	let { styles = "" } = $$props;

    	function navigate(event) {
    		event.preventDefault();
    		event.stopPropagation();
    		router_2(to);
    	}

    	const writable_props = ["to", "title", "styles"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigate> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("to" in $$props) $$invalidate("to", to = $$props.to);
    		if ("title" in $$props) $$invalidate("title", title = $$props.title);
    		if ("styles" in $$props) $$invalidate("styles", styles = $$props.styles);
    		if ("$$scope" in $$props) $$invalidate("$$scope", $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { to, title, styles };
    	};

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate("to", to = $$props.to);
    		if ("title" in $$props) $$invalidate("title", title = $$props.title);
    		if ("styles" in $$props) $$invalidate("styles", styles = $$props.styles);
    	};

    	return {
    		to,
    		title,
    		styles,
    		navigate,
    		$$slots,
    		$$scope
    	};
    }

    class Navigate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 0, title: 0, styles: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigate",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styles() {
    		throw new Error("<Navigate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<Navigate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var navigate = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Navigate
    });

    var Route$1 = getCjsExportFromNamespace(route);

    var Router$1 = getCjsExportFromNamespace(router$2);

    var Navigate$1 = getCjsExportFromNamespace(navigate);

    const SpaRouter$1 = router$1.SpaRouter;
    const navigateTo$1 = router$1.navigateTo;
    const routeIsActive$1 = router$1.routeIsActive;




    var src = {
      SpaRouter: SpaRouter$1,
      navigateTo: navigateTo$1,
      routeIsActive: routeIsActive$1,
      Route: Route$1,
      Router: Router$1,
      Navigate: Navigate$1
    };
    var src_2 = src.navigateTo;
    var src_4 = src.Route;
    var src_5 = src.Router;

    let userstate = { isLogged: false, token: '', id: -1 };

    function createUser() {
      const { subscribe, update } = writable(userstate);
      return {
        subscribe,
        updateLoggedUserState: (pNewIsLogged, pNewToken, pNewID) => {
          update(user => {
            user.isLogged = pNewIsLogged;
            user.token = pNewToken;
            user.id = pNewID;
            return user;
          });
        }
      };
    }
    let user = createUser();

    /* src/views/landing.svelte generated by Svelte v3.15.0 */

    const file$1 = "src/views/landing.svelte";

    function create_fragment$3(ctx) {
    	let h5;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "Landing Page";
    			add_location(h5, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Landing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Landing",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const urls = {
      Login: 'http://localhost:1323/login',
      GetUserByPK: 'http://localhost:1323/r/userid'
    };

    /* src/views/login.svelte generated by Svelte v3.15.0 */
    const file$2 = "src/views/login.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let h5;
    	let t1;
    	let form;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let p;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Login Page";
    			t1 = space();
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "User CODE";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "Password";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			p = element("p");
    			button = element("button");
    			button.textContent = "Login";
    			attr_dev(h5, "class", "w3-center alata svelte-1q7giy3");
    			add_location(h5, file$2, 40, 4, 988);
    			add_location(label0, file$2, 43, 6, 1112);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "logincode");
    			set_style(input0, "width", "90%");
    			attr_dev(input0, "class", "w3-input w3-margin-bottom");
    			add_location(input0, file$2, 44, 6, 1143);
    			add_location(label1, file$2, 51, 6, 1303);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "name", "password");
    			set_style(input1, "width", "90%");
    			attr_dev(input1, "class", "w3-input");
    			add_location(input1, file$2, 52, 6, 1333);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "w3-button w3-blue alata svelte-1q7giy3");
    			add_location(button, file$2, 60, 8, 1491);
    			add_location(p, file$2, 59, 6, 1479);
    			attr_dev(form, "class", "w3-container ");
    			add_location(form, file$2, 42, 4, 1037);
    			attr_dev(div0, "class", "w3-container w3-display-middle w3-card-4 alata svelte-1q7giy3");
    			add_location(div0, file$2, 39, 2, 923);
    			attr_dev(div1, "class", "w3-container w3-half w3-margin-top");
    			set_style(div1, "height", "200px");
    			add_location(div1, file$2, 38, 0, 850);

    			dispose = [
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(input1, "input", ctx.input1_input_handler),
    				listen_dev(form, "submit", prevent_default(ctx.handleSubmit), false, false, true)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(div0, t1);
    			append_dev(div0, form);
    			append_dev(form, label0);
    			append_dev(form, t3);
    			append_dev(form, input0);
    			set_input_value(input0, ctx.usercode);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(form, t6);
    			append_dev(form, input1);
    			set_input_value(input1, ctx.password);
    			append_dev(form, t7);
    			append_dev(form, p);
    			append_dev(p, button);
    		},
    		p: function update(changed, ctx) {
    			if (changed.usercode && input0.value !== ctx.usercode) {
    				set_input_value(input0, ctx.usercode);
    			}

    			if (changed.password && input1.value !== ctx.password) {
    				set_input_value(input1, ctx.password);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function fetchToken(pURL, pBody) {
    	const resp = await fetch(pURL, { method: "POST", body: pBody });
    	return await resp.json();
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let usercode = "admin";
    	let password = "xxx";

    	function handleSubmit() {
    		const bodyFormData = new FormData();
    		bodyFormData.set("logincode", usercode);
    		bodyFormData.set("password", password);

    		fetchToken(urls.Login, bodyFormData).then(function (r) {
    			if (r.token == undefined) {
    				user.updateIsLogged(false);
    				return;
    			}

    			user.updateLoggedUserState(true, r.token, r.id);
    			src_2("admin");
    		});
    	}

    	function input0_input_handler() {
    		usercode = this.value;
    		$$invalidate("usercode", usercode);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate("password", password);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("usercode" in $$props) $$invalidate("usercode", usercode = $$props.usercode);
    		if ("password" in $$props) $$invalidate("password", password = $$props.password);
    	};

    	return {
    		usercode,
    		password,
    		handleSubmit,
    		input0_input_handler,
    		input1_input_handler
    	};
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    let token, id;

    user.subscribe(u => {
      if (u.isLogged) {
        token = u.token;
        id = u.id;
      }
      console.log('subscribed:', u.isLogged, u.token, u.id);
    });

    async function fetchUserByID(pURL, pToken, pID) {
      const myHeaders = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + pToken
      });
      const resp = await fetch(pURL + '/' + pID, {
        headers: myHeaders
      });
      return await resp.json();
    }

    function userState() {
      return {
        getLoggedUserData: _ => {
          return fetchUserByID(urls.GetUserByPK, token, id);
        }
      };
    }
    let loggedUserData = userState();

    /* src/views/authorized.svelte generated by Svelte v3.15.0 */
    const file$3 = "src/views/authorized.svelte";

    // (22:0) {:else}
    function create_else_block(ctx) {
    	let h6;

    	const block = {
    		c: function create() {
    			h6 = element("h6");
    			h6.textContent = "loading ..";
    			add_location(h6, file$3, 22, 2, 499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h6, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(22:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:0) {#if data != {}}
    function create_if_block$1(ctx) {
    	let h6;
    	let t_value = JSON.stringify(ctx.data) + "";
    	let t;

    	const block = {
    		c: function create() {
    			h6 = element("h6");
    			t = text(t_value);
    			add_location(h6, file$3, 20, 2, 457);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h6, anchor);
    			append_dev(h6, t);
    		},
    		p: function update(changed, ctx) {
    			if (changed.data && t_value !== (t_value = JSON.stringify(ctx.data) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(20:0) {#if data != {}}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let h50;
    	let t1;
    	let h51;
    	let t3;
    	let h6;
    	let t4_value = JSON.stringify(ctx.$user) + "";
    	let t4;
    	let t5;
    	let t6;
    	let button;
    	let dispose;

    	function select_block_type(changed, ctx) {
    		if (ctx.data != ({})) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(null, ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h50 = element("h5");
    			h50.textContent = "Admin Area";
    			t1 = space();
    			h51 = element("h5");
    			h51.textContent = "Restricted Page";
    			t3 = space();
    			h6 = element("h6");
    			t4 = text(t4_value);
    			t5 = space();
    			if_block.c();
    			t6 = space();
    			button = element("button");
    			button.textContent = "Logout";
    			add_location(h50, file$3, 14, 0, 358);
    			add_location(h51, file$3, 15, 0, 378);
    			add_location(h6, file$3, 17, 0, 404);
    			attr_dev(button, "class", "w3-button w3-blue");
    			add_location(button, file$3, 25, 0, 526);
    			dispose = listen_dev(button, "click", handleLogout, false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h50, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h51, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h6, anchor);
    			append_dev(h6, t4);
    			insert_dev(target, t5, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, button, anchor);
    		},
    		p: function update(changed, ctx) {
    			if (changed.$user && t4_value !== (t4_value = JSON.stringify(ctx.$user) + "")) set_data_dev(t4, t4_value);

    			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t6.parentNode, t6);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h50);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h51);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h6);
    			if (detaching) detach_dev(t5);
    			if_block.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleLogout() {
    	user.updateLoggedUserState(false, "", -1);
    	src_2("login");
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $user;
    	validate_store(user, "user");
    	component_subscribe($$self, user, $$value => $$invalidate("$user", $user = $$value));
    	let data;
    	loggedUserData.getLoggedUserData().then(d => $$invalidate("data", data = d));

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate("data", data = $$props.data);
    		if ("$user" in $$props) user.set($user = $$props.$user);
    	};

    	return { data, $user };
    }

    class Authorized extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Authorized",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/navbar.svelte generated by Svelte v3.15.0 */

    const file$4 = "src/components/navbar.svelte";

    function create_fragment$6(ctx) {
    	let nav;
    	let h3;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			h3 = element("h3");
    			h3.textContent = "This is Navigation.";
    			add_location(h3, file$4, 1, 2, 37);
    			attr_dev(nav, "class", "w3-container w3-teal");
    			add_location(nav, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, h3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/footer.svelte generated by Svelte v3.15.0 */

    const file$5 = "src/components/footer.svelte";

    function create_fragment$7(ctx) {
    	let footer;
    	let nav;
    	let a0;
    	let t1;
    	let a1;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "FORUM";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "ABOUT";
    			attr_dev(a0, "href", "/forum/default.asp");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$5, 3, 4, 97);
    			attr_dev(a1, "href", "/about/default.asp");
    			attr_dev(a1, "target", "_top");
    			add_location(a1, file$5, 4, 4, 156);
    			add_location(nav, file$5, 2, 2, 87);
    			attr_dev(footer, "class", "w3-container w3-padding-large w3-light-grey w3-justify w3-opacity");
    			add_location(footer, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/layouts/admin_layout.svelte generated by Svelte v3.15.0 */
    const file$6 = "src/layouts/admin_layout.svelte";

    function create_fragment$8(ctx) {
    	let div10;
    	let t0;
    	let h10;
    	let t2;
    	let t3;
    	let div4;
    	let div0;
    	let a0;
    	let i0;
    	let t4;
    	let a1;
    	let i1;
    	let t5;
    	let a2;
    	let i2;
    	let t6;
    	let div1;
    	let a3;
    	let t8;
    	let a4;
    	let img;
    	let img_src_value;
    	let t9;
    	let a5;
    	let t11;
    	let a6;
    	let t13;
    	let a7;
    	let t15;
    	let a8;
    	let t17;
    	let a9;
    	let t19;
    	let div3;
    	let div2;
    	let h11;
    	let t21;
    	let ul;
    	let li0;
    	let t23;
    	let li1;
    	let t25;
    	let li2;
    	let t27;
    	let li3;
    	let t29;
    	let li4;
    	let t31;
    	let li5;
    	let t33;
    	let li6;
    	let t35;
    	let div5;
    	let t36;
    	let div9;
    	let div6;
    	let i3;
    	let t37;
    	let header;
    	let h12;
    	let t39;
    	let div7;
    	let a10;
    	let t41;
    	let div8;
    	let p;
    	let a11;
    	let t43;
    	let script;
    	let t45;
    	let current;
    	const navbar = new Navbar({ $$inline: true });

    	const route = new src_4({
    			props: { currentRoute: ctx.currentRoute },
    			$$inline: true
    		});

    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h10 = element("h1");
    			h10.textContent = "Admin Layout";
    			t2 = space();
    			create_component(route.$$.fragment);
    			t3 = space();
    			div4 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			i0 = element("i");
    			t4 = space();
    			a1 = element("a");
    			i1 = element("i");
    			t5 = space();
    			a2 = element("a");
    			i2 = element("i");
    			t6 = space();
    			div1 = element("div");
    			a3 = element("a");
    			a3.textContent = "×";
    			t8 = space();
    			a4 = element("a");
    			img = element("img");
    			t9 = space();
    			a5 = element("a");
    			a5.textContent = "Learn HTML";
    			t11 = space();
    			a6 = element("a");
    			a6.textContent = "Learn W3.CSS";
    			t13 = space();
    			a7 = element("a");
    			a7.textContent = "Learn JavaScript";
    			t15 = space();
    			a8 = element("a");
    			a8.textContent = "Learn SQL";
    			t17 = space();
    			a9 = element("a");
    			a9.textContent = "Learn PHP";
    			t19 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h11 = element("h1");
    			h11.textContent = "W3.CSS";
    			t21 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Smaller and faster";
    			t23 = space();
    			li1 = element("li");
    			li1.textContent = "Easier to use";
    			t25 = space();
    			li2 = element("li");
    			li2.textContent = "Easier to learn";
    			t27 = space();
    			li3 = element("li");
    			li3.textContent = "CSS only";
    			t29 = space();
    			li4 = element("li");
    			li4.textContent = "Speeds up apps";
    			t31 = space();
    			li5 = element("li");
    			li5.textContent = "CSS equality for all";
    			t33 = space();
    			li6 = element("li");
    			li6.textContent = "PC Laptop Tablet Mobile";
    			t35 = space();
    			div5 = element("div");
    			t36 = space();
    			div9 = element("div");
    			div6 = element("div");
    			i3 = element("i");
    			t37 = space();
    			header = element("header");
    			h12 = element("h1");
    			h12.textContent = "W3Schools.com";
    			t39 = space();
    			div7 = element("div");
    			a10 = element("a");
    			a10.textContent = "Try it Yourself";
    			t41 = space();
    			div8 = element("div");
    			p = element("p");
    			a11 = element("a");
    			a11.textContent = "Try it Yourself";
    			t43 = space();
    			script = element("script");
    			script.textContent = "function w3_open() {\n      document.getElementById(\"mySidebar\").style.display = \"block\";\n      document.getElementById(\"myOverlay\").style.display = \"block\";\n    }\n\n    function w3_close() {\n      document.getElementById(\"mySidebar\").style.display = \"none\";\n      document.getElementById(\"myOverlay\").style.display = \"none\";\n    }\n\n    openNav(\"nav01\");\n    function openNav(id) {\n      document.getElementById(\"nav01\").style.display = \"none\";\n      document.getElementById(\"nav02\").style.display = \"none\";\n      document.getElementById(\"nav03\").style.display = \"none\";\n      document.getElementById(id).style.display = \"block\";\n    }";
    			t45 = space();
    			create_component(footer.$$.fragment);
    			add_location(h10, file$6, 10, 2, 247);
    			attr_dev(i0, "class", "fa fa-bars w3-xlarge");
    			add_location(i0, file$6, 24, 8, 627);
    			attr_dev(a0, "class", "w3-bar-item w3-button");
    			set_style(a0, "width", "33.33%");
    			attr_dev(a0, "href", "javascript:void(0)");
    			attr_dev(a0, "onclick", "openNav('nav01')");
    			add_location(a0, file$6, 19, 6, 479);
    			attr_dev(i1, "class", "fa fa-file w3-xlarge");
    			add_location(i1, file$6, 31, 8, 827);
    			attr_dev(a1, "class", "w3-bar-item w3-button");
    			set_style(a1, "width", "33.33%");
    			attr_dev(a1, "href", "javascript:void(0)");
    			attr_dev(a1, "onclick", "openNav('nav03')");
    			add_location(a1, file$6, 26, 6, 679);
    			attr_dev(i2, "class", "fa fa-camera w3-xlarge");
    			add_location(i2, file$6, 38, 8, 1027);
    			attr_dev(a2, "class", "w3-bar-item w3-button");
    			set_style(a2, "width", "33.33%");
    			attr_dev(a2, "href", "javascript:void(0)");
    			attr_dev(a2, "onclick", "openNav('nav02')");
    			add_location(a2, file$6, 33, 6, 879);
    			attr_dev(div0, "class", "w3-bar w3-black w3-center");
    			add_location(div0, file$6, 18, 4, 433);
    			attr_dev(a3, "class", "w3-button w3-hover-teal w3-hide-large w3-large w3-right");
    			attr_dev(a3, "href", "javascript:void(0)");
    			attr_dev(a3, "onclick", "w3_close()");
    			add_location(a3, file$6, 43, 6, 1135);
    			if (img.src !== (img_src_value = "https://www.w3schools.com/images/w3schools.png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "width", "80%");
    			attr_dev(img, "alt", "xxx");
    			add_location(img, file$6, 50, 8, 1378);
    			attr_dev(a4, "class", "w3-bar-item w3-button w3-border-bottom w3-large");
    			attr_dev(a4, "href", "#");
    			add_location(a4, file$6, 49, 6, 1301);
    			attr_dev(a5, "class", "w3-bar-item w3-button");
    			attr_dev(a5, "href", "#");
    			add_location(a5, file$6, 55, 6, 1515);
    			attr_dev(a6, "class", "w3-bar-item w3-button");
    			attr_dev(a6, "href", "#");
    			add_location(a6, file$6, 56, 6, 1578);
    			attr_dev(a7, "class", "w3-bar-item w3-button");
    			attr_dev(a7, "href", "#");
    			add_location(a7, file$6, 57, 6, 1643);
    			attr_dev(a8, "class", "w3-bar-item w3-button");
    			attr_dev(a8, "href", "#");
    			add_location(a8, file$6, 58, 6, 1712);
    			attr_dev(a9, "class", "w3-bar-item w3-button");
    			attr_dev(a9, "href", "#");
    			add_location(a9, file$6, 59, 6, 1774);
    			attr_dev(div1, "id", "nav01");
    			attr_dev(div1, "class", "w3-bar-block");
    			add_location(div1, file$6, 42, 4, 1091);
    			attr_dev(h11, "class", "w3-text-theme");
    			add_location(h11, file$6, 64, 8, 1921);
    			attr_dev(div2, "class", "w3-container w3-border-bottom");
    			add_location(div2, file$6, 63, 6, 1869);
    			attr_dev(li0, "class", "w3-padding-16");
    			add_location(li0, file$6, 67, 8, 2014);
    			attr_dev(li1, "class", "w3-padding-16");
    			add_location(li1, file$6, 68, 8, 2072);
    			attr_dev(li2, "class", "w3-padding-16");
    			add_location(li2, file$6, 69, 8, 2125);
    			attr_dev(li3, "class", "w3-padding-16");
    			add_location(li3, file$6, 70, 8, 2180);
    			attr_dev(li4, "class", "w3-padding-16");
    			add_location(li4, file$6, 71, 8, 2228);
    			attr_dev(li5, "class", "w3-padding-16");
    			add_location(li5, file$6, 72, 8, 2282);
    			attr_dev(li6, "class", "w3-padding-16");
    			add_location(li6, file$6, 73, 8, 2342);
    			attr_dev(ul, "class", "w3-ul w3-large");
    			add_location(ul, file$6, 66, 6, 1978);
    			attr_dev(div3, "id", "nav03");
    			add_location(div3, file$6, 62, 4, 1846);
    			attr_dev(div4, "class", "w3-sidebar w3-collapse w3-white w3-animate-left w3-large");
    			set_style(div4, "z-index", "3");
    			set_style(div4, "width", "300px");
    			attr_dev(div4, "id", "mySidebar");
    			add_location(div4, file$6, 13, 2, 299);
    			attr_dev(div5, "class", "w3-overlay w3-hide-large");
    			attr_dev(div5, "onclick", "w3_close()");
    			set_style(div5, "cursor", "pointer");
    			attr_dev(div5, "id", "myOverlay");
    			add_location(div5, file$6, 78, 2, 2432);
    			attr_dev(i3, "class", "fa fa-bars w3-button w3-teal w3-xlarge");
    			attr_dev(i3, "onclick", "w3_open()");
    			add_location(i3, file$6, 87, 6, 2664);
    			attr_dev(div6, "class", "w3-top w3-theme w3-large w3-hide-large");
    			add_location(div6, file$6, 86, 4, 2605);
    			attr_dev(h12, "class", "w3-xxxlarge w3-padding-16");
    			add_location(h12, file$6, 91, 6, 2822);
    			attr_dev(header, "class", "w3-container w3-theme w3-padding-64 w3-center");
    			add_location(header, file$6, 90, 4, 2753);
    			attr_dev(a10, "class", "w3-button w3-theme w3-hover-white");
    			attr_dev(a10, "href", "/css/tryit.asp?filename=trycss_default");
    			attr_dev(a10, "target", "_blank");
    			add_location(a10, file$6, 95, 6, 2973);
    			attr_dev(div7, "class", "w3-container w3-padding-large w3-section w3-light-grey");
    			add_location(div7, file$6, 94, 4, 2898);
    			attr_dev(a11, "class", "w3-button w3-theme w3-hover-white");
    			attr_dev(a11, "href", "/js/tryit.asp?filename=tryjs_default");
    			attr_dev(a11, "target", "_blank");
    			add_location(a11, file$6, 105, 8, 3243);
    			add_location(p, file$6, 104, 6, 3231);
    			attr_dev(div8, "class", "w3-container w3-padding-large w3-section w3-light-grey");
    			add_location(div8, file$6, 103, 4, 3156);
    			attr_dev(div9, "class", "w3-main");
    			set_style(div9, "margin-left", "300px");
    			add_location(div9, file$6, 84, 2, 2551);
    			add_location(script, file$6, 115, 2, 3452);
    			attr_dev(div10, "class", "w3-container w3-sand");
    			add_location(div10, file$6, 8, 0, 197);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			mount_component(navbar, div10, null);
    			append_dev(div10, t0);
    			append_dev(div10, h10);
    			append_dev(div10, t2);
    			mount_component(route, div10, null);
    			append_dev(div10, t3);
    			append_dev(div10, div4);
    			append_dev(div4, div0);
    			append_dev(div0, a0);
    			append_dev(a0, i0);
    			append_dev(div0, t4);
    			append_dev(div0, a1);
    			append_dev(a1, i1);
    			append_dev(div0, t5);
    			append_dev(div0, a2);
    			append_dev(a2, i2);
    			append_dev(div4, t6);
    			append_dev(div4, div1);
    			append_dev(div1, a3);
    			append_dev(div1, t8);
    			append_dev(div1, a4);
    			append_dev(a4, img);
    			append_dev(div1, t9);
    			append_dev(div1, a5);
    			append_dev(div1, t11);
    			append_dev(div1, a6);
    			append_dev(div1, t13);
    			append_dev(div1, a7);
    			append_dev(div1, t15);
    			append_dev(div1, a8);
    			append_dev(div1, t17);
    			append_dev(div1, a9);
    			append_dev(div4, t19);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h11);
    			append_dev(div3, t21);
    			append_dev(div3, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t23);
    			append_dev(ul, li1);
    			append_dev(ul, t25);
    			append_dev(ul, li2);
    			append_dev(ul, t27);
    			append_dev(ul, li3);
    			append_dev(ul, t29);
    			append_dev(ul, li4);
    			append_dev(ul, t31);
    			append_dev(ul, li5);
    			append_dev(ul, t33);
    			append_dev(ul, li6);
    			append_dev(div10, t35);
    			append_dev(div10, div5);
    			append_dev(div10, t36);
    			append_dev(div10, div9);
    			append_dev(div9, div6);
    			append_dev(div6, i3);
    			append_dev(div9, t37);
    			append_dev(div9, header);
    			append_dev(header, h12);
    			append_dev(div9, t39);
    			append_dev(div9, div7);
    			append_dev(div7, a10);
    			append_dev(div9, t41);
    			append_dev(div9, div8);
    			append_dev(div8, p);
    			append_dev(p, a11);
    			append_dev(div10, t43);
    			append_dev(div10, script);
    			insert_dev(target, t45, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			const route_changes = {};
    			if (changed.currentRoute) route_changes.currentRoute = ctx.currentRoute;
    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(route.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(route.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			destroy_component(navbar);
    			destroy_component(route);
    			if (detaching) detach_dev(t45);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { currentRoute } = $$props;
    	const writable_props = ["currentRoute"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Admin_layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("currentRoute" in $$props) $$invalidate("currentRoute", currentRoute = $$props.currentRoute);
    	};

    	$$self.$capture_state = () => {
    		return { currentRoute };
    	};

    	$$self.$inject_state = $$props => {
    		if ("currentRoute" in $$props) $$invalidate("currentRoute", currentRoute = $$props.currentRoute);
    	};

    	return { currentRoute };
    }

    class Admin_layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$8, safe_not_equal, { currentRoute: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Admin_layout",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (ctx.currentRoute === undefined && !("currentRoute" in props)) {
    			console.warn("<Admin_layout> was created without expected prop 'currentRoute'");
    		}
    	}

    	get currentRoute() {
    		throw new Error("<Admin_layout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentRoute(value) {
    		throw new Error("<Admin_layout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/sidebar.svelte generated by Svelte v3.15.0 */

    const file$7 = "src/components/sidebar.svelte";

    function create_fragment$9(ctx) {
    	let div4;
    	let div0;
    	let a0;
    	let i0;
    	let t0;
    	let a1;
    	let i1;
    	let t1;
    	let div1;
    	let a2;
    	let t3;
    	let a3;
    	let img;
    	let img_src_value;
    	let t4;
    	let a4;
    	let t6;
    	let a5;
    	let t8;
    	let a6;
    	let t10;
    	let a7;
    	let t12;
    	let a8;
    	let t14;
    	let div3;
    	let div2;
    	let h1;
    	let t16;
    	let ul;
    	let li0;
    	let t18;
    	let li1;
    	let t20;
    	let li2;
    	let t22;
    	let li3;
    	let t24;
    	let li4;
    	let t26;
    	let li5;
    	let t28;
    	let li6;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			i0 = element("i");
    			t0 = space();
    			a1 = element("a");
    			i1 = element("i");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			a2.textContent = "�";
    			t3 = space();
    			a3 = element("a");
    			img = element("img");
    			t4 = space();
    			a4 = element("a");
    			a4.textContent = "Learn HTML";
    			t6 = space();
    			a5 = element("a");
    			a5.textContent = "Learn W3.CSS";
    			t8 = space();
    			a6 = element("a");
    			a6.textContent = "Learn JavaScript";
    			t10 = space();
    			a7 = element("a");
    			a7.textContent = "Learn SQL";
    			t12 = space();
    			a8 = element("a");
    			a8.textContent = "Learn PHP";
    			t14 = space();
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "W3.CSS";
    			t16 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Smaller and faster";
    			t18 = space();
    			li1 = element("li");
    			li1.textContent = "Easier to use";
    			t20 = space();
    			li2 = element("li");
    			li2.textContent = "Easier to learn";
    			t22 = space();
    			li3 = element("li");
    			li3.textContent = "CSS only";
    			t24 = space();
    			li4 = element("li");
    			li4.textContent = "Speeds up apps";
    			t26 = space();
    			li5 = element("li");
    			li5.textContent = "CSS equality for all";
    			t28 = space();
    			li6 = element("li");
    			li6.textContent = "PC Laptop Tablet Mobile";
    			attr_dev(i0, "class", "fa fa-bars w3-xlarge");
    			add_location(i0, file$7, 11, 6, 308);
    			attr_dev(a0, "class", "w3-bar-item w3-button");
    			set_style(a0, "width", "33.33%");
    			attr_dev(a0, "href", "javascript:void(0)");
    			attr_dev(a0, "onclick", "openNav('nav01')");
    			add_location(a0, file$7, 6, 4, 170);
    			attr_dev(i1, "class", "fa fa-file w3-xlarge");
    			add_location(i1, file$7, 18, 6, 494);
    			attr_dev(a1, "class", "w3-bar-item w3-button");
    			set_style(a1, "width", "33.33%");
    			attr_dev(a1, "href", "javascript:void(0)");
    			attr_dev(a1, "onclick", "openNav('nav02')");
    			add_location(a1, file$7, 13, 4, 356);
    			attr_dev(div0, "class", "w3-bar w3-black w3-center");
    			add_location(div0, file$7, 5, 2, 126);
    			attr_dev(a2, "class", "w3-button w3-hover-teal w3-hide-large w3-large w3-right");
    			attr_dev(a2, "href", "javascript:void(0)");
    			attr_dev(a2, "onclick", "w3_close()");
    			add_location(a2, file$7, 23, 4, 592);
    			if (img.src !== (img_src_value = "https://www.w3schools.com/images/w3schools.png")) attr_dev(img, "src", img_src_value);
    			set_style(img, "width", "80%");
    			add_location(img, file$7, 30, 6, 821);
    			attr_dev(a3, "class", "w3-bar-item w3-button w3-border-bottom w3-large");
    			attr_dev(a3, "href", "#");
    			add_location(a3, file$7, 29, 4, 746);
    			attr_dev(a4, "class", "w3-bar-item w3-button");
    			attr_dev(a4, "href", "#");
    			add_location(a4, file$7, 34, 4, 930);
    			attr_dev(a5, "class", "w3-bar-item w3-button");
    			attr_dev(a5, "href", "#");
    			add_location(a5, file$7, 35, 4, 991);
    			attr_dev(a6, "class", "w3-bar-item w3-button");
    			attr_dev(a6, "href", "#");
    			add_location(a6, file$7, 36, 4, 1054);
    			attr_dev(a7, "class", "w3-bar-item w3-button");
    			attr_dev(a7, "href", "#");
    			add_location(a7, file$7, 37, 4, 1121);
    			attr_dev(a8, "class", "w3-bar-item w3-button");
    			attr_dev(a8, "href", "#");
    			add_location(a8, file$7, 38, 4, 1181);
    			attr_dev(div1, "id", "nav01");
    			attr_dev(div1, "class", "w3-bar-block");
    			add_location(div1, file$7, 22, 2, 550);
    			attr_dev(h1, "class", "w3-text-theme");
    			add_location(h1, file$7, 43, 6, 1320);
    			attr_dev(div2, "class", "w3-container w3-border-bottom");
    			add_location(div2, file$7, 42, 4, 1270);
    			attr_dev(li0, "class", "w3-padding-16");
    			add_location(li0, file$7, 46, 6, 1407);
    			attr_dev(li1, "class", "w3-padding-16");
    			add_location(li1, file$7, 47, 6, 1463);
    			attr_dev(li2, "class", "w3-padding-16");
    			add_location(li2, file$7, 48, 6, 1514);
    			attr_dev(li3, "class", "w3-padding-16");
    			add_location(li3, file$7, 49, 6, 1567);
    			attr_dev(li4, "class", "w3-padding-16");
    			add_location(li4, file$7, 50, 6, 1613);
    			attr_dev(li5, "class", "w3-padding-16");
    			add_location(li5, file$7, 51, 6, 1665);
    			attr_dev(li6, "class", "w3-padding-16");
    			add_location(li6, file$7, 52, 6, 1723);
    			attr_dev(ul, "class", "w3-ul w3-large");
    			add_location(ul, file$7, 45, 4, 1373);
    			attr_dev(div3, "id", "nav02");
    			add_location(div3, file$7, 41, 2, 1249);
    			attr_dev(div4, "class", "w3-sidebar w3-collapse w3-white w3-animate-left w3-large");
    			set_style(div4, "z-index", "3");
    			set_style(div4, "width", "250px");
    			attr_dev(div4, "id", "mySidebar");
    			add_location(div4, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, a0);
    			append_dev(a0, i0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, i1);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, a2);
    			append_dev(div1, t3);
    			append_dev(div1, a3);
    			append_dev(a3, img);
    			append_dev(div1, t4);
    			append_dev(div1, a4);
    			append_dev(div1, t6);
    			append_dev(div1, a5);
    			append_dev(div1, t8);
    			append_dev(div1, a6);
    			append_dev(div1, t10);
    			append_dev(div1, a7);
    			append_dev(div1, t12);
    			append_dev(div1, a8);
    			append_dev(div4, t14);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(div3, t16);
    			append_dev(div3, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t18);
    			append_dev(ul, li1);
    			append_dev(ul, t20);
    			append_dev(ul, li2);
    			append_dev(ul, t22);
    			append_dev(ul, li3);
    			append_dev(ul, t24);
    			append_dev(ul, li4);
    			append_dev(ul, t26);
    			append_dev(ul, li5);
    			append_dev(ul, t28);
    			append_dev(ul, li6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/layouts/public_layout.svelte generated by Svelte v3.15.0 */
    const file$8 = "src/layouts/public_layout.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let h1;
    	let t3;
    	let t4;
    	let current;
    	const navbar = new Navbar({ $$inline: true });
    	const sidebar = new Sidebar({ $$inline: true });

    	const route = new src_4({
    			props: { currentRoute: ctx.currentRoute },
    			$$inline: true
    		});

    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(sidebar.$$.fragment);
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "Public Layout";
    			t3 = space();
    			create_component(route.$$.fragment);
    			t4 = space();
    			create_component(footer.$$.fragment);
    			add_location(h1, file$8, 12, 2, 315);
    			attr_dev(div, "class", "w3-container w3-sand");
    			add_location(div, file$8, 9, 0, 251);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(navbar, div, null);
    			append_dev(div, t0);
    			mount_component(sidebar, div, null);
    			append_dev(div, t1);
    			append_dev(div, h1);
    			append_dev(div, t3);
    			mount_component(route, div, null);
    			append_dev(div, t4);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: function update(changed, ctx) {
    			const route_changes = {};
    			if (changed.currentRoute) route_changes.currentRoute = ctx.currentRoute;
    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(route.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(route.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(navbar);
    			destroy_component(sidebar);
    			destroy_component(route);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { currentRoute } = $$props;
    	const writable_props = ["currentRoute"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Public_layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("currentRoute" in $$props) $$invalidate("currentRoute", currentRoute = $$props.currentRoute);
    	};

    	$$self.$capture_state = () => {
    		return { currentRoute };
    	};

    	$$self.$inject_state = $$props => {
    		if ("currentRoute" in $$props) $$invalidate("currentRoute", currentRoute = $$props.currentRoute);
    	};

    	return { currentRoute };
    }

    class Public_layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$a, safe_not_equal, { currentRoute: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Public_layout",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (ctx.currentRoute === undefined && !("currentRoute" in props)) {
    			console.warn("<Public_layout> was created without expected prop 'currentRoute'");
    		}
    	}

    	get currentRoute() {
    		throw new Error("<Public_layout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentRoute(value) {
    		throw new Error("<Public_layout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let auth;
    user.subscribe(u => {
      auth = u.isLogged;
    });

    function userIsAdmin() {
      return auth;
    }

    const routes = [
      {
        name: '/',
        component: Landing,
        layout: Public_layout
      },
      {
        name: 'login',
        component: Login
      },
      {
        name: 'admin',
        component: Authorized,
        layout: Admin_layout,
        onlyIf: {
          guard: userIsAdmin,
          redirect: '/login'
        }
      }
    ];

    /* src/App.svelte generated by Svelte v3.15.0 */

    function create_fragment$b(ctx) {
    	let t;
    	let current;
    	const router = new src_5({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
