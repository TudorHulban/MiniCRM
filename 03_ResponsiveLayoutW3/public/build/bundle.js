
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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

    /* src/components/footer.svelte generated by Svelte v3.15.0 */

    const file = "src/components/footer.svelte";

    function create_fragment(ctx) {
    	let footer;
    	let p;
    	let t0;
    	let nav;
    	let a0;
    	let t2;
    	let a1;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			p = element("p");
    			t0 = space();
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Link 1";
    			t2 = text("\n    |\n    ");
    			a1 = element("a");
    			a1.textContent = "Link 2";
    			add_location(p, file, 1, 2, 61);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "w3-text-theme");
    			add_location(a0, file, 3, 4, 79);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "target", "_top");
    			attr_dev(a1, "class", "w3-text-theme");
    			add_location(a1, file, 5, 4, 150);
    			add_location(nav, file, 2, 2, 69);
    			attr_dev(footer, "class", " w3-padding-large w3-theme-l4 w3-justify ");
    			add_location(footer, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p);
    			append_dev(footer, t0);
    			append_dev(footer, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t2);
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
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/main.svelte generated by Svelte v3.15.0 */

    const file$1 = "src/components/main.svelte";

    function create_fragment$1(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let div;
    	let a;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Header";
    			t1 = space();
    			div = element("div");
    			a = element("a");
    			a.textContent = "Section 1";
    			attr_dev(h1, "class", "");
    			add_location(h1, file$1, 1, 2, 53);
    			attr_dev(header, "class", " w3-theme w3-padding-16 w3-center");
    			add_location(header, file$1, 0, 0, 0);
    			attr_dev(a, "class", "w3-button w3-theme w3-hover-white");
    			attr_dev(a, "href", "#");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 5, 2, 145);
    			attr_dev(div, "class", "w3-padding-large w3-section w3-theme-l4");
    			add_location(div, file$1, 4, 0, 89);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
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

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/sidebar.svelte generated by Svelte v3.15.0 */
    const file$2 = "src/components/sidebar.svelte";

    function create_fragment$2(ctx) {
    	let div3;
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
    	let t5;
    	let a4;
    	let t7;
    	let div2;
    	let a5;
    	let t9;
    	let a6;
    	let t11;
    	let a7;
    	let t13;
    	let div4;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			i0 = element("i");
    			t0 = space();
    			a1 = element("a");
    			i1 = element("i");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			a2.textContent = "x";
    			t3 = space();
    			a3 = element("a");
    			a3.textContent = "Option 1";
    			t5 = space();
    			a4 = element("a");
    			a4.textContent = "Option 2";
    			t7 = space();
    			div2 = element("div");
    			a5 = element("a");
    			a5.textContent = "x";
    			t9 = space();
    			a6 = element("a");
    			a6.textContent = "Option 3";
    			t11 = space();
    			a7 = element("a");
    			a7.textContent = "Option 4";
    			t13 = space();
    			div4 = element("div");
    			attr_dev(i0, "class", "fa fa-bars w3-xlarge");
    			add_location(i0, file$2, 28, 6, 775);
    			attr_dev(a0, "class", "w3-bar-item w3-button");
    			set_style(a0, "width", "50%");
    			attr_dev(a0, "href", "javascript:void(0)");
    			add_location(a0, file$2, 23, 4, 633);
    			attr_dev(i1, "class", "fa fa-wrench w3-xlarge");
    			add_location(i1, file$2, 35, 6, 965);
    			attr_dev(a1, "class", "w3-bar-item w3-button");
    			set_style(a1, "width", "50%");
    			attr_dev(a1, "href", "javascript:void(0)");
    			add_location(a1, file$2, 30, 4, 823);
    			attr_dev(div0, "class", "w3-bar w3-theme-dark w3-center");
    			add_location(div0, file$2, 22, 2, 584);
    			attr_dev(a2, "class", "w3-button w3-hover-theme w3-hide-large w3-large w3-right");
    			attr_dev(a2, "href", "javascript:void(0)");
    			add_location(a2, file$2, 40, 4, 1065);
    			attr_dev(a3, "class", "w3-bar-item w3-button");
    			attr_dev(a3, "href", "#");
    			add_location(a3, file$2, 46, 4, 1219);
    			attr_dev(a4, "class", "w3-bar-item w3-button");
    			attr_dev(a4, "href", "#");
    			add_location(a4, file$2, 47, 4, 1278);
    			attr_dev(div1, "id", "nav01");
    			attr_dev(div1, "class", "w3-bar-block");
    			add_location(div1, file$2, 39, 2, 1023);
    			attr_dev(a5, "class", "w3-button w3-hover-theme w3-hide-large w3-large w3-right");
    			attr_dev(a5, "href", "javascript:void(0)");
    			add_location(a5, file$2, 51, 4, 1387);
    			attr_dev(a6, "class", "w3-bar-item w3-button");
    			attr_dev(a6, "href", "#");
    			add_location(a6, file$2, 57, 4, 1541);
    			attr_dev(a7, "class", "w3-bar-item w3-button");
    			attr_dev(a7, "href", "#");
    			add_location(a7, file$2, 58, 4, 1600);
    			attr_dev(div2, "id", "nav02");
    			attr_dev(div2, "class", "w3-bar-block");
    			add_location(div2, file$2, 50, 2, 1345);
    			attr_dev(div3, "class", "w3-sidebar w3-collapse w3-white w3-large");
    			set_style(div3, "z-index", "3");
    			set_style(div3, "width", "250px");
    			attr_dev(div3, "id", "mySidebar");
    			add_location(div3, file$2, 17, 0, 474);
    			attr_dev(div4, "class", "w3-overlay w3-hide-large");
    			set_style(div4, "cursor", "pointer");
    			attr_dev(div4, "id", "myOverlay");
    			add_location(div4, file$2, 62, 0, 1672);

    			dispose = [
    				listen_dev(a0, "click", ctx.click_handler, false, false, false),
    				listen_dev(a1, "click", ctx.click_handler_1, false, false, false),
    				listen_dev(a2, "click", w3_close, false, false, false),
    				listen_dev(a5, "click", w3_close, false, false, false),
    				listen_dev(div4, "click", w3_close, false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, a0);
    			append_dev(a0, i0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, i1);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, a2);
    			append_dev(div1, t3);
    			append_dev(div1, a3);
    			append_dev(div1, t5);
    			append_dev(div1, a4);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, a5);
    			append_dev(div2, t9);
    			append_dev(div2, a6);
    			append_dev(div2, t11);
    			append_dev(div2, a7);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div4, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div4);
    			run_all(dispose);
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

    function w3_close() {
    	document.getElementById("mySidebar").style.display = "none";
    	document.getElementById("myOverlay").style.display = "none";
    }

    function openNav(id) {
    	document.getElementById("nav01").style.display = "none";
    	document.getElementById("nav02").style.display = "none";
    	document.getElementById(id).style.display = "block";
    }

    function instance($$self) {
    	onMount(function () {
    		openNav("nav01");
    	});

    	const click_handler = () => openNav("nav01");
    	const click_handler_1 = () => openNav("nav02");

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return { click_handler, click_handler_1 };
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/layouts/responsivew3.svelte generated by Svelte v3.15.0 */
    const file$3 = "src/layouts/responsivew3.svelte";

    function create_fragment$3(ctx) {
    	let t0;
    	let div1;
    	let div0;
    	let i;
    	let t1;
    	let t2;
    	let current;
    	let dispose;
    	const sidebar = new Sidebar({ $$inline: true });
    	const main = new Main({ $$inline: true });
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(sidebar.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			i = element("i");
    			t1 = space();
    			create_component(main.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(i, "class", "fa fa-bars w3-button w3-xlarge");
    			add_location(i, file$3, 15, 4, 467);
    			attr_dev(div0, "class", "w3-top w3-theme w3-large w3-hide-large");
    			add_location(div0, file$3, 14, 2, 410);
    			attr_dev(div1, "class", "w3-main w3-theme-l5");
    			set_style(div1, "margin-left", "250px");
    			add_location(div1, file$3, 13, 0, 347);
    			dispose = listen_dev(i, "click", w3_open, false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sidebar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(div1, t1);
    			mount_component(main, div1, null);
    			append_dev(div1, t2);
    			mount_component(footer, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sidebar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(main);
    			destroy_component(footer);
    			dispose();
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

    function w3_open() {
    	document.getElementById("mySidebar").style.display = "block";
    	document.getElementById("myOverlay").style.display = "block";
    }

    class Responsivew3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Responsivew3",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.15.0 */
    const file$4 = "src/App.svelte";

    function create_fragment$4(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let t;
    	let current;
    	const layout = new Responsivew3({ $$inline: true });

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			t = space();
    			create_component(layout.$$.fragment);
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://www.w3schools.com/w3css/4/w3.css");
    			add_location(link0, file$4, 5, 2, 90);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://www.w3schools.com/lib/w3-theme-indigo.css");
    			add_location(link1, file$4, 6, 2, 166);
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
    			add_location(link2, file$4, 9, 2, 259);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			insert_dev(target, t, anchor);
    			mount_component(layout, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			if (detaching) detach_dev(t);
    			destroy_component(layout, detaching);
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

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
