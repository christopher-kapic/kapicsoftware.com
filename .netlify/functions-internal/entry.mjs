import * as adapter from '@astrojs/netlify/netlify-functions.js';
import { escape as escape$1 } from 'html-escaper';
/* empty css                                                             *//* empty css                        *//* empty css                          */import 'mime';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';
import { compile } from 'path-to-regexp';

function check$1(Component) {
	return Component['render'] && Component['$$render'];
}

async function renderToStaticMarkup$1(Component, props, slotted) {
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		slots[key] = () =>
			`<astro-slot${key === 'default' ? '' : ` name="${key}"`}>${value}</astro-slot>`;
	}
	const { html } = Component.render(props, { $$slots: slots });
	return { html };
}

const _renderer1 = {
	check: check$1,
	renderToStaticMarkup: renderToStaticMarkup$1,
};

const ASTRO_VERSION = "1.1.5";
function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error("Deprecated: Astro.fetchContent() has been replaced with Astro.glob().");
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(`Astro.glob(${JSON.stringify(globValue())}) - no matches found.`);
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), referenceURL).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}

const escapeHTML = escape$1;
class HTMLString extends String {
}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};

class Metadata {
  constructor(filePathname, opts) {
    this.modules = opts.modules;
    this.hoisted = opts.hoisted;
    this.hydratedComponents = opts.hydratedComponents;
    this.clientOnlyComponents = opts.clientOnlyComponents;
    this.hydrationDirectives = opts.hydrationDirectives;
    this.mockURL = new URL(filePathname, "http://example.com");
    this.metadataCache = /* @__PURE__ */ new Map();
  }
  resolvePath(specifier) {
    if (specifier.startsWith(".")) {
      const resolved = new URL(specifier, this.mockURL).pathname;
      if (resolved.startsWith("/@fs") && resolved.endsWith(".jsx")) {
        return resolved.slice(0, resolved.length - 4);
      }
      return resolved;
    }
    return specifier;
  }
  getPath(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentUrl) || null;
  }
  getExport(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentExport) || null;
  }
  getComponentMetadata(Component) {
    if (this.metadataCache.has(Component)) {
      return this.metadataCache.get(Component);
    }
    const metadata = this.findComponentMetadata(Component);
    this.metadataCache.set(Component, metadata);
    return metadata;
  }
  findComponentMetadata(Component) {
    const isCustomElement = typeof Component === "string";
    for (const { module, specifier } of this.modules) {
      const id = this.resolvePath(specifier);
      for (const [key, value] of Object.entries(module)) {
        if (isCustomElement) {
          if (key === "tagName" && Component === value) {
            return {
              componentExport: key,
              componentUrl: id
            };
          }
        } else if (Component === value) {
          return {
            componentExport: key,
            componentUrl: id
          };
        }
      }
    }
    return null;
  }
}
function createMetadata(filePathname, options) {
  return new Metadata(filePathname, options);
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7
};
function serializeArray(value) {
  return value.map((v) => convertToSerializedForm(v));
}
function serializeObject(value) {
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v)];
    })
  );
}
function convertToSerializedForm(value) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [PROP_TYPE.Map, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props) {
  return JSON.stringify(serializeObject(props));
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}

const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));
function extractDirectives(inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps
              ).join(", ")}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new Error(
              'Error: Media query must be provided for "client:media", similar to client:media="(max-width: 600px)"'
            );
          }
          break;
        }
      }
    } else if (key === "class:list") {
      extracted.props[key.slice(0, -5)] = serializeListValue(value);
    } else {
      extracted.props[key] = value;
    }
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = value;
    }
  }
  island.props["component-url"] = await result.resolve(componentUrl);
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(renderer.clientEntrypoint);
    island.props["props"] = escapeHTML(serializeProps(props));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  island.props["before-hydration-url"] = await result.resolve("astro:scripts/before-hydration.js");
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=t=>{const e=async()=>{await(await t())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)},window.dispatchEvent(new Event("astro:idle"));`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()},window.dispatchEvent(new Event("astro:load"));`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}},window.dispatchEvent(new Event("astro:media"));`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=t=>{(async()=>await(await t())())()},window.dispatchEvent(new Event("astro:only"));`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(s,c,n)=>{const r=async()=>{await(await s())()};let i=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){i.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];i.observe(t)}},window.dispatchEvent(new Event("astro:visible"));`;

var astro_island_prebuilt_default = `var l;{const c={0:t=>t,1:t=>JSON.parse(t,o),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,o)),5:t=>new Set(JSON.parse(t,o)),6:t=>BigInt(t),7:t=>new URL(t)},o=(t,i)=>{if(t===""||!Array.isArray(i))return i;const[e,n]=i;return e in c?c[e](n):void 0};customElements.get("astro-island")||customElements.define("astro-island",(l=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement&&this.parentElement.closest("astro-island[ssr]"))return;const i=this.querySelectorAll("astro-slot"),e={},n=this.querySelectorAll("template[data-astro-template]");for(const s of n){const r=s.closest(this.tagName);!r||!r.isSameNode(this)||(e[s.getAttribute("data-astro-template")||"default"]=s.innerHTML,s.remove())}for(const s of i){const r=s.closest(this.tagName);!r||!r.isSameNode(this)||(e[s.getAttribute("name")||"default"]=s.innerHTML)}const a=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),o):{};this.hydrator(this)(this.Component,a,e,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((i,e)=>{e.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate),await import(this.getAttribute("before-hydration-url")),this.start()}start(){const i=JSON.parse(this.getAttribute("opts")),e=this.getAttribute("client");if(Astro[e]===void 0){window.addEventListener(\`astro:\${e}\`,()=>this.start(),{once:!0});return}Astro[e](async()=>{const n=this.getAttribute("renderer-url"),[a,{default:s}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),r=this.getAttribute("component-export")||"default";if(!r.includes("."))this.Component=a[r];else{this.Component=a;for(const d of r.split("."))this.Component=this.Component[d]}return this.hydrator=s,this.hydrate},i,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},l.observedAttributes=["props"],l))}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}

const Fragment = Symbol.for("astro:fragment");
const Renderer = Symbol.for("astro:renderer");
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case "directive": {
      const { hydration } = chunk;
      let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return "";
      }
    }
    default: {
      return chunk.toString();
    }
  }
}

function validateComponentProps(props, displayName) {
  var _a;
  if (((_a = (Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{_:process.env._,}))) == null ? void 0 : _a.DEV) && props != null) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
class AstroComponent {
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.expressions = expressions;
  }
  get [Symbol.toStringTag]() {
    return "AstroComponent";
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* renderChild(expression);
    }
  }
}
function isAstroComponent(obj) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object AstroComponent]";
}
function isAstroComponentFactory(obj) {
  return obj == null ? false : !!obj.isAstroComponentFactory;
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
async function renderToString(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    const response = Component;
    throw response;
  }
  let html = "";
  for await (const chunk of renderAstroComponent(Component)) {
    html += stringifyChunk(result, chunk);
  }
  return html;
}
async function renderToIterable(result, componentFactory, displayName, props, children) {
  validateComponentProps(props, displayName);
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(
      `Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`
    );
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
async function renderTemplate(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof HTMLString) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0) ; else if (child instanceof AstroComponent || Object.prototype.toString.call(child) === "[object AstroComponent]") {
    yield* renderAstroComponent(child);
  } else if (typeof child === "object" && Symbol.asyncIterator in child) {
    yield* child;
  } else {
    yield child;
  }
}
async function renderSlot(result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        content += stringifyChunk(result, chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(content);
  }
  return fallback;
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) => k.trim().replace(/(?:(?<!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
  if (/[^\w]|\s/.test(match))
    return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).map(([k, v]) => `${kebab(k)}:${v}`).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `let ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(serializeListValue(value));
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toStyleString(value)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact"];
    default:
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/vue", "@astrojs/svelte"];
  }
}
function getComponentType(Component) {
  if (Component === Fragment) {
    return "fragment";
  }
  if (Component && typeof Component === "object" && Component["astro:html"]) {
    return "html";
  }
  if (isAstroComponentFactory(Component)) {
    return "astro-factory";
  }
  return "unknown";
}
async function renderComponent(result, displayName, Component, _props, slots = {}) {
  var _a;
  Component = await Component;
  switch (getComponentType(Component)) {
    case "fragment": {
      const children2 = await renderSlot(result, slots == null ? void 0 : slots.default);
      if (children2 == null) {
        return children2;
      }
      return markHTMLString(children2);
    }
    case "html": {
      const children2 = {};
      if (slots) {
        await Promise.all(
          Object.entries(slots).map(
            ([key, value]) => renderSlot(result, value).then((output) => {
              children2[key] = output;
            })
          )
        );
      }
      const html2 = Component.render({ slots: children2 });
      return markHTMLString(html2);
    }
    case "astro-factory": {
      async function* renderAstroComponentInline() {
        let iterable = await renderToIterable(result, Component, displayName, _props, slots);
        yield* iterable;
      }
      return renderAstroComponentInline();
    }
  }
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(_props);
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  if (Array.isArray(renderers) && renderers.length === 0 && typeof Component !== "string" && !componentIsHTMLElement(Component)) {
    const message = `Unable to render ${metadata.displayName}!

There are no \`integrations\` set in your \`astro.config.mjs\` file.
Did you mean to add ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`;
    throw new Error(message);
  }
  const children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          children[key] = output;
        })
      )
    );
  }
  let renderer;
  if (metadata.hydrate !== "only") {
    if (Component && Component[Renderer]) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ?? (error = e);
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && renderers.length === 1) {
      renderer = renderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new Error(`Unable to render ${metadata.displayName}!

Using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.
Did you mean to pass <${metadata.displayName} client:only="${probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")}" />
`);
    } else if (typeof Component !== "string") {
      const matchingRenderers = renderers.filter((r) => probableRendererNames.includes(r.name));
      const plural = renderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new Error(`Unable to render ${metadata.displayName}!

There ${plural ? "are" : "is"} ${renderers.length} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render ${metadata.displayName}.

Did you mean to enable ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`);
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new Error(
      `${metadata.displayName} component has a \`client:${metadata.hydrate}\` directive, but no client entrypoint was provided by ${renderer.name}!`
    );
  }
  if (!html && typeof Component === "string") {
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroComponent(
      await renderTemplate`<${Component}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Component) ? `/>` : `>${childSlots}</${Component}>`
      )}`
    );
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
      return html;
    }
    return markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (!html.includes(key === "default" ? `<astro-slot>` : `<astro-slot name="${key}">`)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement$1("astro-island", island, false));
  }
  return renderAll();
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
const alreadyHeadRenderedResults = /* @__PURE__ */ new WeakSet();
function renderHead(result) {
  alreadyHeadRenderedResults.add(result);
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement$1("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
async function* maybeRenderHead(result) {
  if (alreadyHeadRenderedResults.has(result)) {
    return;
  }
  yield renderHead(result);
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

new TextEncoder();

function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = "astro:jsx";
const Empty = Symbol("empty");
const toSlotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const ClientOnlyPlaceholder = "astro-client-only";
const skipAstroJSXCheck = /* @__PURE__ */ new WeakSet();
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  if (isVNode(vnode)) {
    switch (true) {
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(await renderToString(result, vnode.type, props, slots));
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skipAstroJSXCheck.add(vnode.type);
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function" && !skipAstroJSXCheck.has(vnode.type)) {
        useConsoleFilter();
        try {
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2 && output2[AstroJSX]) {
            return await renderJSX(result, output2);
          } else if (!output2) {
            return await renderJSX(result, output2);
          }
        } catch (e) {
          skipAstroJSXCheck.add(vnode.type);
        } finally {
          finishUsingConsoleFilter();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponent(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponent(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let body = "";
        for await (const chunk of output) {
          let html = stringifyChunk(result, chunk);
          body += html;
        }
        return markHTMLString(body);
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, children)}</${tag}>`
    )}`
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup
};

const $$metadata$d = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/components/layout/Footer.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$e = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/components/layout/Footer.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$Footer;
  const { logo, logoHref, title, pages, socials } = Astro2.props;
  const { facebook, twitter, instagram, github, linkedin } = socials;
  return renderTemplate`${maybeRenderHead($$result)}<section class="overflow-hidden" style="background-image: url('/footer-background.svg'); background-position: center;">
  <div class="container px-4 mx-auto">
    <div class="flex flex-wrap lg:items-center pt-24 pb-12 -mx-4">
      <div class="w-full md:w-1/4 lg:w-auto px-4">
        <a class="flex items-center mb-5 md:mb-0 max-w-max"${addAttribute(logoHref, "href")}>
          <img class="h-8 mr-2"${addAttribute(logo, "src")}${addAttribute(`${title} logo`, "alt")}>
          <span class="text-neutral font-extrabold text-2xl hover:text-neutral-focus transition hover:underline decoration-primary">${title}
          </span>
        </a>
      </div>
      <div class="w-full md:w-3/4 lg:flex-1 px-4">
        <div class="flex flex-wrap justify-end -mx-3 lg:-mx-6">
          ${pages.map((page) => {
    return renderTemplate`<div class="w-full md:w-auto p-3 md:py-0 md:px-6">
                  <a class="inline-block text-lg md:text-xl text-gray-500 hover:text-gray-600 font-medium"${addAttribute(page.href, "href")}>
                    ${page.title}
                  </a>
                </div>`;
  })}
        </div>
      </div>
    </div>
  </div>
  <div class="border-b border-gray-100"></div>
  <div class="container px-4 mx-auto">
    <div class="flex flex-wrap items-center py-12 md:pb-32">
      <div class="w-full md:w-1/2 mb-6 md:mb-0">
        <p class="text-gray-400 font-medium">
          © 2022 Kapic Media, LLC. All rights reserved.
        </p>
      </div>
      <div class="w-full md:w-1/2">
        <div class="flex flex-wrap md:justify-end -mx-5">
          ${facebook ? renderTemplate`<div class="px-5">
            <a class="inline-block text-gray-300 hover:text-gray-400"${addAttribute(facebook, "href")} aria-label="Facebook profile">
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.63494 17.7273V9.76602H9.3583L9.76688 6.66246H6.63494V4.68128C6.63494 3.78301 6.88821 3.17085 8.20297 3.17085L9.87712 3.17017V0.394238C9.5876 0.357335 8.59378 0.272728 7.43708 0.272728C5.0217 0.272728 3.3681 1.71881 3.3681 4.37391V6.66246H0.636475V9.76602H3.3681V17.7273H6.63494Z" fill="currentColor"></path>
              </svg>
            </a>
          </div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
          ${twitter ? renderTemplate`<div class="px-5">
            <a class="inline-block text-gray-300 hover:text-gray-400"${addAttribute(twitter, "href")} aria-label="Twitter profile">
              <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M18.8181 2.14597C18.1356 2.44842 17.4032 2.65355 16.6336 2.74512C17.4194 2.27461 18.0208 1.5283 18.3059 0.641757C17.5689 1.07748 16.7553 1.39388 15.8885 1.56539C15.1943 0.824879 14.2069 0.363636 13.1118 0.363636C11.0108 0.363636 9.30722 2.06718 9.30722 4.16706C9.30722 4.46488 9.34083 4.75576 9.40574 5.03391C6.24434 4.87512 3.44104 3.36048 1.56483 1.05894C1.23686 1.61985 1.05028 2.27342 1.05028 2.97109C1.05028 4.29106 1.72243 5.45573 2.74225 6.13712C2.11877 6.11627 1.53237 5.94476 1.01901 5.65967V5.70718C1.01901 7.54979 2.33086 9.08761 4.07031 9.43761C3.75161 9.52336 3.41555 9.57088 3.06789 9.57088C2.82222 9.57088 2.58464 9.54655 2.35171 9.50018C2.8361 11.0125 4.24067 12.1123 5.90483 12.1424C4.6034 13.1622 2.96243 13.7683 1.1801 13.7683C0.873008 13.7683 0.570523 13.7498 0.272705 13.7162C1.95655 14.7974 3.95561 15.4278 6.10416 15.4278C13.1026 15.4278 16.928 9.63115 16.928 4.60397L16.9153 4.11145C17.6627 3.57833 18.3094 2.90851 18.8181 2.14597Z" fill="currentColor"></path>
              </svg>
            </a>
          </div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
          ${instagram ? renderTemplate`<div class="px-5">
            <a class="inline-block text-gray-300 hover:text-gray-400"${addAttribute(instagram, "href")} aria-label="Instagram profile">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.6007 0.181818H14.3992C17.3874 0.181818 19.8184 2.61281 19.8182 5.60074V14.3993C19.8182 17.3872 17.3874 19.8182 14.3992 19.8182H5.6007C2.61276 19.8182 0.181885 17.3873 0.181885 14.3993V5.60074C0.181885 2.61281 2.61276 0.181818 5.6007 0.181818ZM14.3993 18.0759C16.4267 18.0759 18.0761 16.4266 18.0761 14.3993H18.076V5.60074C18.076 3.57348 16.4266 1.92405 14.3992 1.92405H5.6007C3.57343 1.92405 1.92412 3.57348 1.92412 5.60074V14.3993C1.92412 16.4266 3.57343 18.0761 5.6007 18.0759H14.3993ZM4.85721 10.0001C4.85721 7.16424 7.16425 4.85714 10.0001 4.85714C12.8359 4.85714 15.1429 7.16424 15.1429 10.0001C15.1429 12.8359 12.8359 15.1429 10.0001 15.1429C7.16425 15.1429 4.85721 12.8359 4.85721 10.0001ZM6.62805 10C6.62805 11.8593 8.14081 13.3719 10.0001 13.3719C11.8593 13.3719 13.3721 11.8593 13.3721 10C13.3721 8.14058 11.8594 6.6279 10.0001 6.6279C8.14069 6.6279 6.62805 8.14058 6.62805 10Z" fill="currentColor"></path>
              </svg>
            </a>
          </div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
          ${github ? renderTemplate`<div class="px-5">
            <a class="inline-block text-gray-300 hover:text-gray-400"${addAttribute(github, "href")} aria-label="Github profile">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 0C4.0275 0 0 4.13211 0 9.22838C0 13.3065 2.5785 16.7648 6.15375 17.9841C6.60375 18.0709 6.76875 17.7853 6.76875 17.5403C6.76875 17.3212 6.76125 16.7405 6.7575 15.9712C4.254 16.5277 3.726 14.7332 3.726 14.7332C3.3165 13.6681 2.72475 13.3832 2.72475 13.3832C1.9095 12.8111 2.78775 12.8229 2.78775 12.8229C3.6915 12.887 4.16625 13.7737 4.16625 13.7737C4.96875 15.1847 6.273 14.777 6.7875 14.5414C6.8685 13.9443 7.10025 13.5381 7.3575 13.3073C5.35875 13.0764 3.258 12.2829 3.258 8.74709C3.258 7.73988 3.60675 6.91659 4.18425 6.27095C4.083 6.03774 3.77925 5.0994 4.263 3.82846C4.263 3.82846 5.01675 3.58116 6.738 4.77462C7.458 4.56958 8.223 4.46785 8.988 4.46315C9.753 4.46785 10.518 4.56958 11.238 4.77462C12.948 3.58116 13.7017 3.82846 13.7017 3.82846C14.1855 5.0994 13.8818 6.03774 13.7917 6.27095C14.3655 6.91659 14.7142 7.73988 14.7142 8.74709C14.7142 12.2923 12.6105 13.0725 10.608 13.2995C10.923 13.5765 11.2155 14.1423 11.2155 15.0071C11.2155 16.242 11.2043 17.2344 11.2043 17.5341C11.2043 17.7759 11.3617 18.0647 11.823 17.9723C15.4237 16.7609 18 13.3002 18 9.22838C18 4.13211 13.9703 0 9 0Z" fill="currentColor"></path>
              </svg>
            </a>
          </div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
          ${linkedin ? renderTemplate`<div class="px-5">
            <a class="inline-block text-gray-300 hover:text-gray-400"${addAttribute(linkedin, "href")} aria-label="LinkedIn profile">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.2 0H1.8C0.81 0 0 0.81 0 1.8V16.2C0 17.19 0.81 18 1.8 18H16.2C17.19 18 18 17.19 18 16.2V1.8C18 0.81 17.19 0 16.2 0ZM5.4 15.3H2.7V7.2H5.4V15.3ZM4.05 5.67C3.15 5.67 2.43 4.95 2.43 4.05C2.43 3.15 3.15 2.43 4.05 2.43C4.95 2.43 5.67 3.15 5.67 4.05C5.67 4.95 4.95 5.67 4.05 5.67ZM15.3 15.3H12.6V10.53C12.6 9.81004 11.97 9.18 11.25 9.18C10.53 9.18 9.9 9.81004 9.9 10.53V15.3H7.2V7.2H9.9V8.28C10.35 7.56 11.34 7.02 12.15 7.02C13.86 7.02 15.3 8.46 15.3 10.17V15.3Z" fill="currentColor"></path>
              </svg>
            </a>
          </div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
        </div>
      </div>
    </div>
  </div>
</section>`;
});

const $$file$d = "/Users/christopherkapic/Projects/kapicsoftware.com/src/components/layout/Footer.astro";
const $$url$d = undefined;

const $$module1$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$d,
	default: $$Footer,
	file: $$file$d,
	url: $$url$d
}, Symbol.toStringTag, { value: 'Module' }));

function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function null_to_empty(value) {
    return value == null ? '' : value;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
Promise.resolve();
const ATTR_REGEX = /[&"]/g;
const CONTENT_REGEX = /[&<]/g;
/**
 * Note: this method is performance sensitive and has been optimized
 * https://github.com/sveltejs/svelte/pull/5701
 */
function escape(value, is_attr = false) {
    const str = String(value);
    const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
    pattern.lastIndex = 0;
    let escaped = '';
    let last = 0;
    while (pattern.test(str)) {
        const i = pattern.lastIndex - 1;
        const ch = str[i];
        escaped += str.substring(last, i) + (ch === '&' ? '&amp;' : (ch === '"' ? '&quot;' : '&lt;'));
        last = i + 1;
    }
    return escaped + str.substring(last);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots, context) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(context || (parent_component ? parent_component.$$.context : [])),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
            on_destroy = [];
            const result = { title: '', head: '', css: new Set() };
            const html = $$render(result, props, {}, $$slots, context);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.title + result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    const assignment = (boolean && value === true) ? '' : `="${escape(value, true)}"`;
    return ` ${name}${assignment}`;
}

/* src/components/layout/Navbar.svelte generated by Svelte v3.50.0 */

const css = {
	code: ".desktop-navbar.svelte-7ub1a7{background:rgb(16,23,40);background:linear-gradient(0deg, rgba(16,23,40,1) 0%, rgba(63,11,66,1) 71%, rgba(55,29,95,1) 100%)}",
	map: null
};

const Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { pages = [] } = $$props;
	let { logo = "/favicon.svg" } = $$props;
	let { title = "Kapic Software" } = $$props;
	let { logoHref = "/" } = $$props;
	if ($$props.pages === void 0 && $$bindings.pages && pages !== void 0) $$bindings.pages(pages);
	if ($$props.logo === void 0 && $$bindings.logo && logo !== void 0) $$bindings.logo(logo);
	if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
	if ($$props.logoHref === void 0 && $$bindings.logoHref && logoHref !== void 0) $$bindings.logoHref(logoHref);
	$$result.css.add(css);

	return `<section class="${"bg-white"}"><nav class="${"flex justify-between p-6 px-4 desktop-navbar svelte-7ub1a7"}"><a${add_attribute("href", logoHref, 0)} class="${"flex items-center"}" rel="${"prefetch"}"><img class="${"h-8 mr-2"}"${add_attribute("src", logo, 0)}${add_attribute("alt", `${title} logo`, 0)}>
      <span class="${"text-gray-200 font-extrabold text-2xl hover:text-gray-300 transition hover:underline decoration-primary"}">${escape(title)}</span></a>
    <div class="${"hidden xl:flex items-center"}"><ul class="${"flex mr-12"}">${each(pages, page => {
		return `<li class="${"mr-12"}"><a class="${"text-gray-200 hover:text-gray-300 transition decoration-primary hover:underline font-medium"}"${add_attribute("href", page.href, 0)} rel="${"prefetch"}">${escape(page.title)}</a>
          </li>`;
	})}</ul>
      <a class="${"inline-block py-2 px-4 text-sm leading-5 transition text-primary-content hover:text-primary-content bg-primary hover:bg-primary-focus font-medium focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded-md"}" href="${"/contact"}" rel="${"prefetch"}">Contact Us</a></div>
    <button aria-label="${"Mobile Navbar"}" class="${"navbar-burger self-center xl:hidden"}"><svg width="${"35"}" height="${"35"}" viewBox="${"0 0 32 32"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><rect class="${"text-gray-50 bg-opacity-10"}" width="${"32"}" height="${"32"}" rx="${"6"}" fill="${"currentColor"}" fill-opacity="${".1"}"></rect><path class="${"text-gray-500"}" d="${"M7 12H25C25.2652 12 25.5196 11.8946 25.7071 11.7071C25.8946 11.5196 26 11.2652 26 11C26 10.7348 25.8946 10.4804 25.7071 10.2929C25.5196 10.1054 25.2652 10 25 10H7C6.73478 10 6.48043 10.1054 6.29289 10.2929C6.10536 10.4804 6 10.7348 6 11C6 11.2652 6.10536 11.5196 6.29289 11.7071C6.48043 11.8946 6.73478 12 7 12ZM25 15H7C6.73478 15 6.48043 15.1054 6.29289 15.2929C6.10536 15.4804 6 15.7348 6 16C6 16.2652 6.10536 16.5196 6.29289 16.7071C6.48043 16.8946 6.73478 17 7 17H25C25.2652 17 25.5196 16.8946 25.7071 16.7071C25.8946 16.5196 26 16.2652 26 16C26 15.7348 25.8946 15.4804 25.7071 15.2929C25.5196 15.1054 25.2652 15 25 15ZM25 20H7C6.73478 20 6.48043 20.1054 6.29289 20.2929C6.10536 20.4804 6 20.7348 6 21C6 21.2652 6.10536 21.5196 6.29289 21.7071C6.48043 21.8946 6.73478 22 7 22H25C25.2652 22 25.5196 21.8946 25.7071 21.7071C25.8946 21.5196 26 21.2652 26 21C26 20.7348 25.8946 20.4804 25.7071 20.2929C25.5196 20.1054 25.2652 20 25 20Z"}" fill="${"currentColor"}"></path></svg></button></nav>
  <div class="${escape(null_to_empty(`${"hidden"} navbar-menu fixed top-0 left-0 z-50 w-full h-full bg-gray-900 bg-opacity-50`), true) + " svelte-7ub1a7"}"><div class="${"fixed top-0 left-0 bottom-0 w-full w-4/6 max-w-xs bg-white"}"><nav class="${"relative p-6 h-full overflow-y-auto"}"><div class="${"flex flex-col justify-between h-full"}"><div><a class="${"inline-block mb-6 flex items-center"}" href="${"/"}"><img class="${"h-8 mr-2"}"${add_attribute("src", logo, 0)}${add_attribute("alt", `${title} logo`, 0)}>
              <span class="${"text-neutral font-extrabold text-2xl hover:text-neutral-focus transition hover:underline decoration-primary"}">${escape(title)}</span></a>
            <ul class="${"mb-6"}">${each(pages, page => {
		return `<li><a class="${"block py-3 px-4 text-neutral hover:text-neutral-focus font-medium transition hover:bg-base-100 rounded-md"}"${add_attribute("href", page.href, 0)}>${escape(page.title)}</a>
                </li>`;
	})}</ul></div>
          <a class="${"inline-block py-2 px-4 w-full text-sm leading-5 text-primary-content transition bg-primary hover:bg-primary-focus font-medium text-center focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded-md"}" href="${"/contact"}">Contact Us</a></div></nav>
      <button class="${"navbar-close absolute top-5 p-4 right-3"}"><svg width="${"12"}" height="${"12"}" viewBox="${"0 0 12 12"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M6.94004 6L11.14 1.80667C11.2656 1.68113 11.3361 1.51087 11.3361 1.33333C11.3361 1.1558 11.2656 0.985537 11.14 0.860002C11.0145 0.734466 10.8442 0.66394 10.6667 0.66394C10.4892 0.66394 10.3189 0.734466 10.1934 0.860002L6.00004 5.06L1.80671 0.860002C1.68117 0.734466 1.51091 0.663941 1.33337 0.663941C1.15584 0.663941 0.985576 0.734466 0.860041 0.860002C0.734505 0.985537 0.66398 1.1558 0.66398 1.33333C0.66398 1.51087 0.734505 1.68113 0.860041 1.80667L5.06004 6L0.860041 10.1933C0.797555 10.2553 0.747959 10.329 0.714113 10.4103C0.680267 10.4915 0.662842 10.5787 0.662842 10.6667C0.662842 10.7547 0.680267 10.8418 0.714113 10.9231C0.747959 11.0043 0.797555 11.078 0.860041 11.14C0.922016 11.2025 0.99575 11.2521 1.07699 11.2859C1.15823 11.3198 1.24537 11.3372 1.33337 11.3372C1.42138 11.3372 1.50852 11.3198 1.58976 11.2859C1.671 11.2521 1.74473 11.2025 1.80671 11.14L6.00004 6.94L10.1934 11.14C10.2554 11.2025 10.3291 11.2521 10.4103 11.2859C10.4916 11.3198 10.5787 11.3372 10.6667 11.3372C10.7547 11.3372 10.8419 11.3198 10.9231 11.2859C11.0043 11.2521 11.0781 11.2025 11.14 11.14C11.2025 11.078 11.2521 11.0043 11.286 10.9231C11.3198 10.8418 11.3372 10.7547 11.3372 10.6667C11.3372 10.5787 11.3198 10.4915 11.286 10.4103C11.2521 10.329 11.2025 10.2553 11.14 10.1933L6.94004 6Z"}" fill="${"#556987"}"></path></svg></button></div></div>
</section>`;
});

const $$module2$5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: Navbar
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$c = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphArticleTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$d = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphArticleTags.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$OpenGraphArticleTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$OpenGraphArticleTags;
  const { publishedTime, modifiedTime, expirationTime, authors, section, tags } = Astro2.props.openGraph.article;
  return renderTemplate`${publishedTime ? renderTemplate`<meta property="article:published_time"${addAttribute(publishedTime, "content")}>` : null}
${modifiedTime ? renderTemplate`<meta property="article:modified_time"${addAttribute(modifiedTime, "content")}>` : null}
${expirationTime ? renderTemplate`<meta property="article:expiration_time"${addAttribute(expirationTime, "content")}>` : null}
${authors ? authors.map((author) => renderTemplate`<meta property="article:author"${addAttribute(author, "content")}>`) : null}
${section ? renderTemplate`<meta property="article:section"${addAttribute(section, "content")}>` : null}
${tags ? tags.map((tag) => renderTemplate`<meta property="article:tag"${addAttribute(tag, "content")}>`) : null}
`;
});

const $$file$c = "/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphArticleTags.astro";
const $$url$c = undefined;

const $$module1$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$c,
	default: $$OpenGraphArticleTags,
	file: $$file$c,
	url: $$url$c
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$b = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphBasicTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$c = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphBasicTags.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$OpenGraphBasicTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$OpenGraphBasicTags;
  const { openGraph } = Astro2.props;
  return renderTemplate`<meta property="og:title"${addAttribute(openGraph.basic.title, "content")}>
<meta property="og:type"${addAttribute(openGraph.basic.type, "content")}>
<meta property="og:image"${addAttribute(openGraph.basic.image, "content")}>
<meta property="og:url"${addAttribute(openGraph.basic.url || Astro2.url.href, "content")}>
`;
});

const $$file$b = "/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphBasicTags.astro";
const $$url$b = undefined;

const $$module2$4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$b,
	default: $$OpenGraphBasicTags,
	file: $$file$b,
	url: $$url$b
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$a = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphImageTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$b = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphImageTags.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$OpenGraphImageTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$OpenGraphImageTags;
  const { image } = Astro2.props.openGraph.basic;
  const { url, secureUrl, type, width, height, alt } = Astro2.props.openGraph.image;
  return renderTemplate`<meta property="og:image:url"${addAttribute(image, "content")}>
${secureUrl ? renderTemplate`<meta property="og:image:secure_url"${addAttribute(secureUrl, "content")}>` : null}
${type ? renderTemplate`<meta property="og:image:type"${addAttribute(type, "content")}>` : null}
${width ? renderTemplate`<meta property="og:image:width"${addAttribute(width, "content")}>` : null}
${!(height === null) ? renderTemplate`<meta property="og:image:height"${addAttribute(height, "content")}>` : null}
${!(alt === null) ? renderTemplate`<meta property="og:image:alt"${addAttribute(alt, "content")}>` : null}
`;
});

const $$file$a = "/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphImageTags.astro";
const $$url$a = undefined;

const $$module3$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$a,
	default: $$OpenGraphImageTags,
	file: $$file$a,
	url: $$url$a
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$9 = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphOptionalTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$a = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphOptionalTags.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$OpenGraphOptionalTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$OpenGraphOptionalTags;
  const { optional } = Astro2.props.openGraph;
  return renderTemplate`${optional.audio ? renderTemplate`<meta property="og:audio"${addAttribute(optional.audio, "content")}>` : null}
${optional.description ? renderTemplate`<meta property="og:description"${addAttribute(optional.description, "content")}>` : null}
${optional.determiner ? renderTemplate`<meta property="og:determiner"${addAttribute(optional.determiner, "content")}>` : null}
${optional.locale ? renderTemplate`<meta property="og:locale"${addAttribute(optional.locale, "content")}>` : null}
${optional.localeAlternate?.map((locale) => renderTemplate`<meta property="og:locale:alternate"${addAttribute(locale, "content")}>`)}
${optional.siteName ? renderTemplate`<meta property="og:site_name"${addAttribute(optional.siteName, "content")}>` : null}
${optional.video ? renderTemplate`<meta property="og:video"${addAttribute(optional.video, "content")}>` : null}
`;
});

const $$file$9 = "/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/OpenGraphOptionalTags.astro";
const $$url$9 = undefined;

const $$module4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$9,
	default: $$OpenGraphOptionalTags,
	file: $$file$9,
	url: $$url$9
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$8 = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/ExtendedTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$9 = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/ExtendedTags.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$ExtendedTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$ExtendedTags;
  const { props } = Astro2;
  return renderTemplate`${props.extend.link?.map((attributes) => renderTemplate`<link${spreadAttributes(attributes)}>`)}
${props.extend.meta?.map(({ content, httpEquiv, name, property }) => renderTemplate`<meta${addAttribute(content, "content")}${addAttribute(httpEquiv, "http-eqiv")}${addAttribute(name, "name")}${addAttribute(property, "property")}>`)}
`;
});

const $$file$8 = "/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/ExtendedTags.astro";
const $$url$8 = undefined;

const $$module5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$8,
	default: $$ExtendedTags,
	file: $$file$8,
	url: $$url$8
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$7 = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/TwitterTags.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$8 = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/TwitterTags.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$TwitterTags = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$TwitterTags;
  const { card, site, creator } = Astro2.props.twitter;
  return renderTemplate`${card ? renderTemplate`<meta name="twitter:card"${addAttribute(card, "content")}>` : null}
${site ? renderTemplate`<meta name="twitter:site"${addAttribute(site, "content")}>` : null}
${creator ? renderTemplate`<meta name="twitter:creator"${addAttribute(creator, "content")}>` : null}
`;
});

const $$file$7 = "/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/components/TwitterTags.astro";
const $$url$7 = undefined;

const $$module6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$7,
	default: $$TwitterTags,
	file: $$file$7,
	url: $$url$7
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$6 = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/SEO.astro", { modules: [{ module: $$module1$1, specifier: "./components/OpenGraphArticleTags.astro", assert: {} }, { module: $$module2$4, specifier: "./components/OpenGraphBasicTags.astro", assert: {} }, { module: $$module3$1, specifier: "./components/OpenGraphImageTags.astro", assert: {} }, { module: $$module4, specifier: "./components/OpenGraphOptionalTags.astro", assert: {} }, { module: $$module5, specifier: "./components/ExtendedTags.astro", assert: {} }, { module: $$module6, specifier: "./components/TwitterTags.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$7 = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/SEO.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$SEO = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$SEO;
  const { props } = Astro2;
  const { title, description, canonical, noindex, nofollow } = props;
  function validateProps(props2) {
    const { openGraph, description: description2 } = props2;
    if (openGraph) {
      if (!openGraph.basic || openGraph.basic.title == null || openGraph.basic.type == null || openGraph.basic.image == null) {
        throw new Error(
          "If you pass the openGraph prop, you have to at least define the title, type, and image basic properties!"
        );
      }
    }
    if (title && openGraph?.basic.title) {
      if (title == openGraph.basic.title) {
        console.warn(
          "WARNING(astro-seo): You passed the same value to `title` and `openGraph.optional.title`. This is most likely not what you want. See docs for more."
        );
      }
    }
    if (openGraph?.basic?.image && !openGraph?.image?.alt) {
      console.warn(
        "WARNING(astro-seo): You defined `openGraph.basic.image`, but didn't define `openGraph.image.alt`. This is stongly discouraged.'"
      );
    }
  }
  validateProps(props);
  return renderTemplate`${title ? renderTemplate`<title>${markHTMLString(title)}</title>` : null}

<link rel="canonical"${addAttribute(canonical || Astro2.url.href, "href")}>

${description ? renderTemplate`<meta name="description"${addAttribute(description, "content")}>` : null}

<meta name="robots"${addAttribute(`${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}`, "content")}>

${props.openGraph && renderTemplate`${renderComponent($$result, "OpenGraphBasicTags", $$OpenGraphBasicTags, { ...props })}`}
${props.openGraph?.optional && renderTemplate`${renderComponent($$result, "OpenGraphOptionalTags", $$OpenGraphOptionalTags, { ...props })}`}
${props.openGraph?.image && renderTemplate`${renderComponent($$result, "OpenGraphImageTags", $$OpenGraphImageTags, { ...props })}`}
${props.openGraph?.article && renderTemplate`${renderComponent($$result, "OpenGraphArticleTags", $$OpenGraphArticleTags, { ...props })}`}
${props.twitter && renderTemplate`${renderComponent($$result, "TwitterTags", $$TwitterTags, { ...props })}`}
${props.extend && renderTemplate`${renderComponent($$result, "ExtendedTags", $$ExtendedTags, { ...props })}`}
`;
});

const $$file$6 = "/Users/christopherkapic/Projects/kapicsoftware.com/node_modules/astro-seo/src/SEO.astro";
const $$url$6 = undefined;

const $$module3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	SEO: $$SEO,
	$$metadata: $$metadata$6,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const config = {
  site: "https://kapicsoftware.com",
  openGraph: {
    title: "Schedule your FREE consultation today!",
    image: "https://kapicsoftware.com/og/kapic-software-og.png",
    description: "Kapic Software brings the speed of JAMstack to YOUR website."
  },
  contact: {
    email: "christopher@kapicmedia.com",
    socials: {
      facebook: void 0,
      twitter: "https://twitter.com/kapicode",
      instagram: void 0,
      github: "https://github.com/christopher-kapic",
      linkedin: "https://linkedin.com/in/christopher-kapic"
    },
    phone: void 0,
    address: void 0
  },
  navbarLinks: [
    {
      title: "Home",
      href: "/"
    },
    {
      title: "Features",
      href: "/#features"
    }
  ],
  footerLinks: [
    {
      title: "Home",
      href: "/"
    },
    {
      title: "Contact",
      href: "/contact"
    }
  ]
};

const $$module2$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	config
}, Symbol.toStringTag, { value: 'Module' }));

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$metadata$5 = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/layouts/Layout.astro", { modules: [{ module: $$module1$2, specifier: "@components/layout/Footer.astro", assert: {} }, { module: $$module2$5, specifier: "@components/layout/Navbar.svelte", assert: {} }, { module: $$module3, specifier: "astro-seo", assert: {} }, { module: $$module2$3, specifier: "src/config", assert: {} }], hydratedComponents: [Navbar], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set(["visible"]), hoisted: [] });
const $$Astro$6 = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/layouts/Layout.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="en">\n  <head>\n    ', '\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width">\n    <link rel="icon" type="image/svg+xml" href="/favicon.svg">\n    <link rel="stylesheet" href="custom.css">\n    <meta name="generator"', '>\n    <script defer data-domain="kapicsoftware.com" src="https://plausible.kapic.io/js/plausible.js"><\/script>\n  ', "</head>\n  <body>\n    ", "\n    ", "\n    ", "\n  </body></html>"])), renderComponent($$result, "SEO", $$SEO, { "title": title, "description": description || title, "openGraph": {
    image: {
      alt: "Kapic Software | Schedule your FREE consultation today!"
    },
    basic: {
      title: config.openGraph.title || title,
      image: config.openGraph.image,
      type: "website"
    },
    optional: {
      description: config.openGraph.description
    }
  } }), addAttribute(Astro2.generator, "content"), renderHead($$result), renderComponent($$result, "Navbar", Navbar, { "client:visible": true, "pages": config.navbarLinks, "logo": "/favicon.svg", "title": "Kapic Software", "logoHref": "/", "client:component-hydration": "visible", "client:component-path": "@components/layout/Navbar.svelte", "client:component-export": "default" }), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, { "logo": "/favicon.svg", "logoHref": "/", "title": "Kapic Software", "socials": config.contact.socials, "pages": config.footerLinks }));
});

const $$file$5 = "/Users/christopherkapic/Projects/kapicsoftware.com/src/layouts/Layout.astro";
const $$url$5 = undefined;

const $$module1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$5,
	default: $$Layout,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$4 = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/components/landing/features.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$5 = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/components/landing/features.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$Features = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Features;
  const { features } = Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<section class="py-24 md:pb-32" style="background-image: url('/hero/features-background-image.svg'); background-position: center;">
  <div class="container p-4 mx-auto bg-gray-100 rounded-md" id="features">
    <div class="md:max-w-4xl mb-12 mx-auto text-center">
      <span class="inline-block py-px px-2 mb-4 text-xs leading-5 text-primary bg-primary bg-opacity-20 font-medium uppercase rounded-full shadow-sm">Features</span>
      <h1 class="mb-4 text-3xl md:text-4xl leading-tight font-bold tracking-tighter">
        Take advantage of modern infrastructure
      </h1>
      <p class="text-lg md:text-xl text-gray-500 font-medium">
        Looking to expand your web presence? Consider building with up-to-date tools like a headless CMS, Stripe, scalable infrastructure, and more.
      </p>
    </div>
    <div class="flex flex-wrap -mx-4">
      ${features.map((feature) => {
    return renderTemplate`<div class="w-full md:w-1/2 lg:w-1/3 px-4">
              <div class="h-full p-8 text-center hover:bg-white rounded-md hover:shadow-xl transition duration-200">
                <div class="inline-flex h-16 w-16 mb-6 mx-auto items-center justify-center text-white bg-primary rounded-lg text-4xl drop-shadow-md">
                  <span style="text-shadow: 1px 1px 2px #dddddd;">${feature.emoji}</span>
                </div>
                <h3 class="mb-4 text-xl md:text-2xl leading-tight font-bold">
                  ${feature.title}
                </h3>
                <p class="text-gray-500 font-medium text-justify">${feature.description}</p>
              </div>
            </div>`;
  })}
    </div>
  </div>
</section>`;
});

const $$file$4 = "/Users/christopherkapic/Projects/kapicsoftware.com/src/components/landing/features.astro";
const $$url$4 = undefined;

const $$module2$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$4,
	default: $$Features,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$3 = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/index.astro", { modules: [{ module: $$module1, specifier: "@layouts/Layout.astro", assert: {} }, { module: $$module2$2, specifier: "@components/landing/features.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$4 = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/index.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$Index$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Index$1;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Welcome to Kapic Software.", "description": "Bringing speed to your website with the JAMstack.", "class": "astro-ACGI5GTM" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<section class="relative bg-white overflow-hidden astro-ACGI5GTM" style="background-image: url('https://shuffle.dev/flex-ui-assets/elements/pattern-white.svg'); background-position: center;">
    <div class="bg-transparent astro-ACGI5GTM">
      <div class="navbar-menu hidden fixed top-0 left-0 z-50 w-full h-full bg-gray-900 bg-opacity-50 astro-ACGI5GTM">
        <div class="fixed top-0 left-0 bottom-0 w-full w-4/6 max-w-xs bg-white astro-ACGI5GTM">
          <a class="navbar-close absolute top-5 p-4 right-3 astro-ACGI5GTM" href="#">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="astro-ACGI5GTM">
              <path d="M6.94004 6L11.14 1.80667C11.2656 1.68113 11.3361 1.51087 11.3361 1.33333C11.3361 1.1558 11.2656 0.985537 11.14 0.860002C11.0145 0.734466 10.8442 0.66394 10.6667 0.66394C10.4892 0.66394 10.3189 0.734466 10.1934 0.860002L6.00004 5.06L1.80671 0.860002C1.68117 0.734466 1.51091 0.663941 1.33337 0.663941C1.15584 0.663941 0.985576 0.734466 0.860041 0.860002C0.734505 0.985537 0.66398 1.1558 0.66398 1.33333C0.66398 1.51087 0.734505 1.68113 0.860041 1.80667L5.06004 6L0.860041 10.1933C0.797555 10.2553 0.747959 10.329 0.714113 10.4103C0.680267 10.4915 0.662842 10.5787 0.662842 10.6667C0.662842 10.7547 0.680267 10.8418 0.714113 10.9231C0.747959 11.0043 0.797555 11.078 0.860041 11.14C0.922016 11.2025 0.99575 11.2521 1.07699 11.2859C1.15823 11.3198 1.24537 11.3372 1.33337 11.3372C1.42138 11.3372 1.50852 11.3198 1.58976 11.2859C1.671 11.2521 1.74473 11.2025 1.80671 11.14L6.00004 6.94L10.1934 11.14C10.2554 11.2025 10.3291 11.2521 10.4103 11.2859C10.4916 11.3198 10.5787 11.3372 10.6667 11.3372C10.7547 11.3372 10.8419 11.3198 10.9231 11.2859C11.0043 11.2521 11.0781 11.2025 11.14 11.14C11.2025 11.078 11.2521 11.0043 11.286 10.9231C11.3198 10.8418 11.3372 10.7547 11.3372 10.6667C11.3372 10.5787 11.3198 10.4915 11.286 10.4103C11.2521 10.329 11.2025 10.2553 11.14 10.1933L6.94004 6Z" fill="#556987" class="astro-ACGI5GTM"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
    <div class="py-20 md:py-28 astro-ACGI5GTM" style="background-image: url( '/hero/background-image.svg' );">
      <div class="container px-4 mx-auto astro-ACGI5GTM">
        <div class="flex flex-wrap xl:items-center -mx-4 astro-ACGI5GTM">
          <div class="w-full md:w-1/2 p-4 mb-16 md:mb-0 bg-slate-200 rounded-xl backdrop-blur-sm bg-opacity-90 astro-ACGI5GTM">
            <span class="inline-block py-px px-2 mb-4 text-xs leading-5 text-white kapic-bg-gradient uppercase rounded-9xl astro-ACGI5GTM">Kapic Software</span>
            <h1 class="mb-6 text-3xl md:text-5xl lg:text-6xl leading-tight font-bold tracking-tight astro-ACGI5GTM">
              <!-- We rapidly build<br/> <span class="text-7xl hidden lg:inline">🚀</span> <span class="kapic-text-gradient text-7xl">fast sites</span> <span class="text-7xl hidden lg:inline">🚀</span> -->
              We rapidly build<br class="astro-ACGI5GTM">
              <span class="kapic-text-gradient text-7xl italic astro-ACGI5GTM">fast</span><span class="kapic-text-gradient text-7xl astro-ACGI5GTM">
                sites</span><span class="text-7xl astro-ACGI5GTM">.</span>
            </h1>
            <p class="mb-8 text-lg md:text-xl text-gray-500 font-medium astro-ACGI5GTM">
              We bring <a href="https://jamstack.org/" class="underline decoration-blue-400 kapic-text-gradient astro-ACGI5GTM">JAMstack</a> technologies to non-technical businesses, building your site with
              more speed, reliability, accessibility, and functionality.
            </p>
            <div class="flex flex-wrap astro-ACGI5GTM">
              <div class="w-full md:w-auto py-1 md:py-0 md:mr-4 astro-ACGI5GTM">
                <a class="inline-block py-5 px-7 w-full text-base md:text-lg leading-4 text-green-50 font-medium text-center kapic-bg-gradient hover:kapic-bg-shadow hover:bg-primary-focus focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 border border-green-500 rounded-md shadow-sm astro-ACGI5GTM" href="/contact">Request a free consultation</a>
              </div>
            </div>
          </div>
          <div class="w-full md:w-1/2 px-4 astro-ACGI5GTM">
            <div class="relative mx-auto md:mr-0 max-w-max astro-ACGI5GTM">
              <img class="absolute z-10 -left-14 -top-12 w-28 md:w-auto astro-ACGI5GTM" src="https://shuffle.dev/flex-ui-assets/elements/circle3-yellow.svg" alt="">
              <img class="absolute z-10 -right-7 -bottom-8 w-28 md:w-auto astro-ACGI5GTM" src="https://shuffle.dev/flex-ui-assets/elements/dots3-blue.svg" alt="">
              <div class="relative overflow-hidden rounded-7xl astro-ACGI5GTM">
                <img class="rounded-xl astro-ACGI5GTM" src="/kapicsoftware-hero-001.gif" alt="">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>${renderComponent($$result, "Features", $$Features, { "features": [
    {
      title: "Speed",
      description: "Accelerated sites from bleeding edge JAMstack technology, including static sites, edge functions, and cache optimizations.",
      emoji: "\u{1F680}"
    },
    {
      title: "Reliability",
      description: "Websites built on JAMstack integrate with hosting options like Netlify and Vercel, so you can cost-effectively host on the same infrastructure as top enterprise companies.",
      emoji: "\u{1F4AF}"
    },
    {
      title: "Extensibility",
      description: "We interact directly with code, allowing us to implement all sorts of custom features. Have an idea? Get in touch!",
      emoji: "\u{1F468}\u{1F3FB}\u200D\u{1F4BB}"
    },
    {
      title: "Accessibility",
      description: "Accessibility can be difficult to get just right. We test our sites by manually navigating using a screen reader. This way, all of your users will get the best experience.",
      emoji: "\u267F\uFE0F"
    },
    {
      title: "Efficiency",
      description: "Manually building our sites allows us to use more free and open-source tools. This means fewer recurring bills, and more money in your hands.",
      emoji: "\u{1F4B8}"
    },
    {
      title: "Expertise",
      description: "Our team has experience building and running high-traffic websites. Schedule your free consultation today!",
      emoji: "\u{1F4C8}"
    }
  ], "class": "astro-ACGI5GTM" })}<section class="relative overflow-hidden astro-ACGI5GTM">
    <div class="p-20 md:py-28 astro-ACGI5GTM" style="background-image: url( '/hero/background-image.svg' );">
      <div class="rounded-md p-8 form-background astro-ACGI5GTM">
        <h3 class="text-4xl text-slate-100 font-bold mb-4 astro-ACGI5GTM">
          Get a free consultation
        </h3>
        <form action="/api/contact" method="POST" class="astro-ACGI5GTM">
          <div class="mb-6 astro-ACGI5GTM">
            <label class="block mb-2 text-slate-200 font-medium leading-6 astro-ACGI5GTM" for="">Email</label>
            <input class="bg-slate-800 block w-full py-2 px-3 appearance-none border border-slate-900 rounded-lg shadow-md text-slate-200 leading-6 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 placeholder-slate-500 astro-ACGI5GTM" type="email" placeholder="me@example.com" name="email" id="contact-email">
          </div>
          <div class="mb-6 astro-ACGI5GTM">
            <label class="block mb-2 text-slate-200 font-medium leading-6 astro-ACGI5GTM" for="">Message (describe your goals)</label>
            <textarea class="bg-slate-800 block h-32 md:h-52 w-full py-2 px-3 appearance-none border border-slate-900 rounded-lg shadow-md text-slate-200 leading-6 focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 placeholder-slate-500 resize-none astro-ACGI5GTM" placeholder="Your goals..." name="message" id="contact-message"></textarea>
          </div>
          <button class="block w-full py-4 px-6 text-lg leading-6 text-gray-50 font-medium text-center bg-primary hover:bg-primary-focus focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-md shadow-sm astro-ACGI5GTM">Send</button>
        </form>
      </div>
    </div>
  </section>` })}

`;
});

const $$file$3 = "/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/index.astro";
const $$url$3 = "";

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$3,
	default: $$Index$1,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$2 = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/contact.astro", { modules: [{ module: $$module1, specifier: "@layouts/Layout.astro", assert: {} }, { module: $$module2$3, specifier: "../config", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$3 = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/contact.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$Contact = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Contact;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Contact" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<section class="py-16 bg-white" style="background-image: url( '/hero/background-image.svg' );">
    <div class="container p-4 md:p-8 mx-auto bg-slate-200 rounded-md">
      <div class="flex flex-wrap md:mb-24 lg:mb-18 justify-between items-center">
        <div class="w-full lg:w-1/2 mb-10 lg:mb-0">
          <span class="inline-block py-px px-2 mb-4 text-xs leading-5 text-primary bg-primary bg-opacity-10 font-medium uppercase rounded-9xl">Contact</span>
          <h3 class="mb-4 text-4xl md:text-5xl text-darkgray-900 font-bold tracking-tighter leading-tight">
            Let&apos;s stay connected
          </h3>
          <p class="text-lg md:text-xl text-gray-500 font-medium">
            It's never been easier to get in touch with Flex. Call us, use our
            live chat widget or email and we'll get back to you as soon as
            possible!
          </p>
        </div>
        <div class="w-full lg:w-auto">
          <div class="flex flex-wrap justify-center items-center md:justify-start -mb-2">
            <!-- <a
              class="inline-block py-4 px-6 w-full md:w-auto text-lg leading-6 font-medium text-center text-gray-500 bg-white border border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 rounded-md shadow-sm"
              href="/about">About Us</a> -->
          </div>
        </div>
      </div>
      <div class="flex flex-wrap -mx-4">
        <div class="w-full lg:w-1/2 px-4 mb-14 lg:mb-0">
          <div class="flex flex-wrap -mx-4">
              ${config.contact.email ? renderTemplate`<div class="w-full md:w-1/2 px-4 mb-10">
                  <div class="max-w-xs mx-auto">
                    <div class="inline-flex mb-6 items-center justify-center w-12 h-12 bg-primary rounded-full">
                      <svg class="h-6 text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.21 8.82L14 2.78C13.474 2.27986 12.7759 2.00095 12.05 2.00095C11.3241 2.00095 10.626 2.27986 10.1 2.78L3.89 8.78C3.61408 9.02087 3.39216 9.31731 3.23879 9.64991C3.08541 9.98251 3.00404 10.3438 3 10.71V19.29C3.01054 20.0176 3.30904 20.7114 3.83012 21.2193C4.35119 21.7273 5.05235 22.008 5.78 22H18.22C18.9476 22.008 19.6488 21.7273 20.1699 21.2193C20.691 20.7114 20.9895 20.0176 21 19.29V10.71C20.9992 10.3585 20.929 10.0106 20.7935 9.68623C20.6579 9.36189 20.4596 9.06752 20.21 8.82V8.82ZM11.44 4.22C11.593 4.08016 11.7927 4.00262 12 4.00262C12.2073 4.00262 12.407 4.08016 12.56 4.22L18 9.5L12.53 14.78C12.377 14.9198 12.1773 14.9974 11.97 14.9974C11.7627 14.9974 11.563 14.9198 11.41 14.78L6 9.5L11.44 4.22ZM19 19.29C18.9871 19.4863 18.8987 19.6699 18.7532 19.8023C18.6078 19.9347 18.4166 20.0056 18.22 20H5.78C5.58338 20.0056 5.39225 19.9347 5.24678 19.8023C5.10132 19.6699 5.01286 19.4863 5 19.29V11.35L9.05 15.25L7.39 16.85C7.20375 17.0374 7.09921 17.2908 7.09921 17.555C7.09921 17.8192 7.20375 18.0726 7.39 18.26C7.48295 18.3575 7.59463 18.4352 7.71836 18.4885C7.84208 18.5418 7.97529 18.5695 8.11 18.57C8.36747 18.569 8.61462 18.4687 8.8 18.29L10.57 16.59C11.0096 16.8586 11.5148 17.0008 12.03 17.0008C12.5452 17.0008 13.0504 16.8586 13.49 16.59L15.26 18.29C15.4454 18.4687 15.6925 18.569 15.95 18.57C16.0847 18.5695 16.2179 18.5418 16.3416 18.4885C16.4654 18.4352 16.5771 18.3575 16.67 18.26C16.8563 18.0726 16.9608 17.8192 16.9608 17.555C16.9608 17.2908 16.8563 17.0374 16.67 16.85L15 15.25L19 11.35V19.29Z" fill="currentColor"></path>
                      </svg>
                    </div>
                  <h3 class="mb-4 text-2xl md:text-3xl font-bold leading-9 text-gray-900">
                    Email
                  </h3>
                  <a class="text-lg md:text-xl text-gray-500 hover:text-gray-600 font-small xl:font-medium"${addAttribute(`mailto:${config.contact.email}`, "href")}>${config.contact.email}</a>
                </div></div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
              ${config.contact.phone ? renderTemplate`<div class="w-full md:w-1/2 px-4 mb-10">
              <div class="max-w-xs mx-auto">
                <div class="inline-flex mb-6 items-center justify-center w-12 h-12 bg-primary rounded-full">
                  <svg class="h-6 text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.41 13C19.1901 13 18.96 12.93 18.74 12.88C18.2949 12.7805 17.8572 12.6501 17.43 12.49C16.9661 12.3212 16.4562 12.33 15.9984 12.5146C15.5405 12.6992 15.1671 13.0466 14.95 13.49L14.73 13.95C13.7589 13.3992 12.8617 12.7271 12.0601 11.95C11.2829 11.1484 10.6108 10.2512 10.0601 9.28L10.5201 9.07C10.9634 8.85292 11.3108 8.47953 11.4954 8.02169C11.6801 7.56385 11.6888 7.05391 11.5201 6.59C11.3612 6.15903 11.231 5.71808 11.13 5.27C11.08 5.05 11.04 4.82 11.01 4.6C10.8886 3.89562 10.5197 3.25774 9.96967 2.80124C9.41967 2.34474 8.72475 2.09961 8.01005 2.11H5.00005C4.5773 2.10945 4.1592 2.19825 3.77317 2.37058C3.38714 2.54292 3.04189 2.7949 2.76005 3.11C2.47237 3.43365 2.25817 3.81575 2.13215 4.23004C2.00614 4.64432 1.97131 5.08098 2.03005 5.51C2.57364 9.67214 4.47526 13.5387 7.44005 16.51C10.4114 19.4748 14.2779 21.3764 18.4401 21.92C18.5699 21.9299 18.7002 21.9299 18.83 21.92C19.5675 21.9211 20.2794 21.6505 20.83 21.16C21.1452 20.8782 21.3971 20.5329 21.5695 20.1469C21.7418 19.7609 21.8306 19.3428 21.83 18.92V15.92C21.8247 15.229 21.5809 14.5611 21.14 14.0291C20.6991 13.4971 20.088 13.1336 19.41 13ZM19.9 19C19.8997 19.1395 19.8702 19.2775 19.8134 19.4049C19.7565 19.5324 19.6736 19.6465 19.57 19.74C19.4604 19.8399 19.33 19.9141 19.1882 19.9573C19.0464 20.0006 18.8967 20.0117 18.75 19.99C15.0183 19.5026 11.5503 17.802 8.88005 15.15C6.20752 12.4775 4.49208 8.99737 4.00005 5.25C3.97833 5.10333 3.98949 4.95367 4.03272 4.81185C4.07596 4.67003 4.1502 4.5396 4.25005 4.43C4.34467 4.32515 4.46043 4.24154 4.5897 4.18466C4.71897 4.12778 4.85882 4.09892 5.00005 4.1H8.00005C8.23121 4.09435 8.45719 4.16898 8.63951 4.3112C8.82184 4.45341 8.94925 4.65442 9.00005 4.88C9.00005 5.15 9.09005 5.43 9.15005 5.7C9.26563 6.22386 9.41937 6.73857 9.61005 7.24L8.21005 7.9C7.96941 8.01046 7.78241 8.21185 7.69005 8.46C7.59003 8.70346 7.59003 8.97654 7.69005 9.22C9.12925 12.3028 11.6073 14.7808 14.69 16.22C14.9335 16.32 15.2066 16.32 15.45 16.22C15.6982 16.1276 15.8996 15.9406 16.01 15.7L16.64 14.3C17.156 14.4881 17.6838 14.6418 18.22 14.76C18.48 14.82 18.76 14.87 19.0301 14.91C19.2556 14.9608 19.4566 15.0882 19.5989 15.2705C19.7411 15.4529 19.8157 15.6788 19.81 15.91L19.9 19ZM14 2C13.7701 2 13.53 2 13.3 2C13.0348 2.02254 12.7894 2.14952 12.6178 2.353C12.4462 2.55647 12.3625 2.81978 12.385 3.085C12.4076 3.35022 12.5346 3.59562 12.738 3.76721C12.9415 3.93881 13.2048 4.02254 13.47 4H14C15.5913 4 17.1175 4.63214 18.2427 5.75736C19.3679 6.88258 20 8.4087 20 10C20 10.18 20 10.35 20 10.53C19.9779 10.7938 20.0612 11.0556 20.2318 11.2581C20.4024 11.4606 20.6463 11.5871 20.91 11.61H20.99C21.2404 11.611 21.482 11.5181 21.6671 11.3496C21.8523 11.1811 21.9675 10.9493 21.99 10.7C21.99 10.47 21.99 10.23 21.99 10C21.9901 7.88 21.1486 5.84668 19.6504 4.34668C18.1523 2.84667 16.12 2.00265 14 2ZM16 10C16 10.2652 16.1054 10.5196 16.2929 10.7071C16.4805 10.8946 16.7348 11 17 11C17.2653 11 17.5196 10.8946 17.7072 10.7071C17.8947 10.5196 18 10.2652 18 10C18 8.93913 17.5786 7.92172 16.8285 7.17157C16.0783 6.42143 15.0609 6 14 6C13.7348 6 13.4805 6.10536 13.2929 6.29289C13.1054 6.48043 13 6.73478 13 7C13 7.26522 13.1054 7.51957 13.2929 7.70711C13.4805 7.89464 13.7348 8 14 8C14.5305 8 15.0392 8.21071 15.4143 8.58579C15.7893 8.96086 16 9.46957 16 10Z" fill="currentColor"></path>
                  </svg>
                </div>
                <h3 class="mb-4 text-2xl md:text-3xl font-bold leading-9 text-gray-900">
                  Phone
                </h3>
                <p class="text-lg md:text-xl text-gray-500 font-medium">
                  ${config.contact.phone}
                </p>
              </div>
            </div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
          ${config.contact.address ? renderTemplate`<div class="w-full md:w-1/2 px-4 mb-10 md:mb-0">
              <div class="max-w-xs mx-auto">
                <div class="inline-flex mb-6 items-center justify-center w-12 h-12 bg-primary rounded-full">
                  <svg class="h-6 text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.0001 4.48C16.4088 2.8887 14.2505 1.99472 12.0001 1.99472C9.74961 1.99472 7.59135 2.8887 6.00005 4.48C4.40875 6.0713 3.51477 8.22957 3.51477 10.48C3.51477 12.7304 4.40875 14.8887 6.00005 16.48L11.2701 21.76C11.363 21.8537 11.4736 21.9281 11.5955 21.9789C11.7173 22.0297 11.848 22.0558 11.9801 22.0558C12.1121 22.0558 12.2428 22.0297 12.3646 21.9789C12.4865 21.9281 12.5971 21.8537 12.6901 21.76L18.0001 16.43C19.5847 14.8453 20.4749 12.6961 20.4749 10.455C20.4749 8.21395 19.5847 6.06468 18.0001 4.48ZM16.5701 15L12.0001 19.59L7.43005 15C6.5272 14.0963 5.91253 12.9452 5.66375 11.6923C5.41497 10.4393 5.54324 9.14075 6.03236 7.96068C6.52147 6.78062 7.34947 5.77205 8.41168 5.06248C9.4739 4.35291 10.7226 3.97418 12.0001 3.97418C13.2775 3.97418 14.5262 4.35291 15.5884 5.06248C16.6506 5.77205 17.4786 6.78062 17.9677 7.96068C18.4569 9.14075 18.5851 10.4393 18.3364 11.6923C18.0876 12.9452 17.4729 14.0963 16.5701 15ZM9.00005 7.41C8.19277 8.21977 7.73945 9.31657 7.73945 10.46C7.73945 11.6034 8.19277 12.7002 9.00005 13.51C9.59981 14.1108 10.3636 14.5211 11.1957 14.6894C12.0278 14.8577 12.891 14.7766 13.6771 14.4562C14.4632 14.1357 15.1372 13.5903 15.6145 12.8883C16.0918 12.1862 16.3512 11.3589 16.3601 10.51C16.3646 9.94321 16.2554 9.38126 16.039 8.85739C15.8225 8.33352 15.5033 7.85836 15.1001 7.46C14.7037 7.05458 14.2311 6.73154 13.7095 6.50947C13.1878 6.2874 12.6274 6.17068 12.0605 6.16603C11.4935 6.16138 10.9313 6.2689 10.406 6.48239C9.8808 6.69588 9.40297 7.01113 9.00005 7.41ZM13.6901 12.09C13.3111 12.4747 12.8103 12.7159 12.2732 12.7723C11.7361 12.8286 11.1961 12.6966 10.7456 12.3989C10.295 12.1012 9.96185 11.6562 9.80306 11.1401C9.64427 10.6239 9.6697 10.0686 9.87501 9.56916C10.0803 9.06967 10.4528 8.65702 10.9286 8.40174C11.4045 8.14646 11.9543 8.06441 12.484 8.16962C13.0137 8.27483 13.4904 8.56076 13.8326 8.97853C14.1748 9.39631 14.3612 9.91997 14.3601 10.46C14.3455 11.0773 14.0865 11.6635 13.6401 12.09H13.6901Z" fill="currentColor"></path>
                  </svg>
                </div>
                <h3 class="mb-4 text-2xl md:text-3xl font-bold leading-9 text-gray-900">
                  Office
                </h3>
                <p class="text-lg md:text-xl text-gray-500 font-medium">
                  ${config.contact.address.street}
                </p>
                <p class="text-lg md:text-xl text-gray-500 font-medium">
                  ${config.contact.address.city}, ${config.contact.address.state} ${config.contact.address.zip}
                </p>
              </div>
            </div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
          ${config.contact.socials ? renderTemplate`<div class="w-full md:w-1/2 px-4">
              <div class="max-w-xs mx-auto">
                <div class="inline-flex mb-6 items-center justify-center w-12 h-12 bg-primary rounded-full">
                  <svg class="h-6 text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V21C2 21.2652 2.10536 21.5196 2.29289 21.7071C2.48043 21.8946 2.73478 22 3 22H21C21.2652 22 21.5196 21.8946 21.7071 21.7071C21.8946 21.5196 22 21.2652 22 21V3C22 2.73478 21.8946 2.48043 21.7071 2.29289C21.5196 2.10536 21.2652 2 21 2V2ZM8 20H4V16H8V20ZM8 14H4V10H8V14ZM8 8H4V4H8V8ZM14 20H10V16H14V20ZM14 14H10V10H14V14ZM14 8H10V4H14V8ZM20 20H16V16H20V20ZM20 14H16V10H20V14ZM20 8H16V4H20V8Z" fill="currentColor"></path>
                  </svg>
                </div>
                <h3 class="mb-9 text-2xl md:text-3xl font-bold leading-9 text-gray-900">
                  Socials
                </h3>
                ${config.contact.socials.facebook ? renderTemplate`<a class="inline-block mr-8 text-primary hover:text-primary-focus" href="https://facebook.com/">
                  <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.63482 17.7273V9.76603H9.35818L9.76676 6.66246H6.63482V4.68129C6.63482 3.78302 6.88809 3.17086 8.20285 3.17086L9.877 3.17018V0.394245C9.58748 0.357342 8.59366 0.272736 7.43696 0.272736C5.02158 0.272736 3.36797 1.71881 3.36797 4.37392V6.66246H0.636353V9.76603H3.36797V17.7273H6.63482Z" fill="currentColor"></path>
                  </svg>
                </a>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
                ${config.contact.socials.twitter ? renderTemplate`<a class="inline-block mr-8 text-primary hover:text-primary-focus" href="#">
                  <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.8181 2.14598C18.1356 2.44844 17.4032 2.65356 16.6336 2.74513C17.4194 2.27462 18.0208 1.52831 18.3059 0.641769C17.5689 1.0775 16.7553 1.39389 15.8885 1.56541C15.1943 0.82489 14.2069 0.363647 13.1118 0.363647C11.0108 0.363647 9.30722 2.06719 9.30722 4.16707C9.30722 4.46489 9.34083 4.75577 9.40574 5.03392C6.24434 4.87513 3.44104 3.3605 1.56483 1.05895C1.23686 1.61986 1.05028 2.27344 1.05028 2.9711C1.05028 4.29107 1.72243 5.45574 2.74225 6.13713C2.11877 6.11628 1.53237 5.94477 1.01901 5.65968V5.70719C1.01901 7.5498 2.33086 9.08762 4.07031 9.43762C3.75161 9.52337 3.41555 9.57089 3.06789 9.57089C2.82222 9.57089 2.58464 9.54656 2.35171 9.50019C2.8361 11.0125 4.24068 12.1123 5.90483 12.1424C4.6034 13.1623 2.96243 13.7683 1.1801 13.7683C0.873008 13.7683 0.570523 13.7498 0.272705 13.7162C1.95655 14.7974 3.95561 15.4279 6.10416 15.4279C13.1026 15.4279 16.928 9.63116 16.928 4.60398L16.9153 4.11147C17.6627 3.57834 18.3094 2.90853 18.8181 2.14598Z" fill="currentColor"></path>
                  </svg>
                </a>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
                ${config.contact.socials.instagram ? renderTemplate`<a class="inline-block mr-8 text-primary hover:text-primary-focus" href="#">
                  <svg width="20" height="20" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.60057 2.18182H16.3991C19.3872 2.18182 21.8182 4.61282 21.8181 7.60075V16.3993C21.8181 19.3872 19.3872 21.8182 16.3991 21.8182H7.60057C4.61264 21.8182 2.18176 19.3873 2.18176 16.3993V7.60075C2.18176 4.61282 4.61264 2.18182 7.60057 2.18182ZM16.3992 20.076C18.4266 20.076 20.076 18.4266 20.076 16.3993H20.0759V7.60075C20.0759 5.57349 18.4265 3.92406 16.3991 3.92406H7.60057C5.57331 3.92406 3.924 5.57349 3.924 7.60075V16.3993C3.924 18.4266 5.57331 20.0761 7.60057 20.076H16.3992ZM6.85709 12.0001C6.85709 9.16424 9.16413 6.85715 11.9999 6.85715C14.8358 6.85715 17.1428 9.16424 17.1428 12.0001C17.1428 14.8359 14.8358 17.1429 11.9999 17.1429C9.16413 17.1429 6.85709 14.8359 6.85709 12.0001ZM8.62792 12C8.62792 13.8593 10.1407 15.3719 11.9999 15.3719C13.8592 15.3719 15.372 13.8593 15.372 12C15.372 10.1406 13.8593 8.62791 11.9999 8.62791C10.1406 8.62791 8.62792 10.1406 8.62792 12Z" fill="currentColor"></path>
                    <mask id="mask0_382_5883" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="2" y="2" width="20" height="20">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.60057 2.18182H16.3991C19.3872 2.18182 21.8182 4.61282 21.8181 7.60075V16.3993C21.8181 19.3872 19.3872 21.8182 16.3991 21.8182H7.60057C4.61264 21.8182 2.18176 19.3873 2.18176 16.3993V7.60075C2.18176 4.61282 4.61264 2.18182 7.60057 2.18182ZM16.3992 20.076C18.4266 20.076 20.076 18.4266 20.076 16.3993H20.0759V7.60075C20.0759 5.57349 18.4265 3.92406 16.3991 3.92406H7.60057C5.57331 3.92406 3.924 5.57349 3.924 7.60075V16.3993C3.924 18.4266 5.57331 20.0761 7.60057 20.076H16.3992ZM6.85709 12.0001C6.85709 9.16424 9.16413 6.85715 11.9999 6.85715C14.8358 6.85715 17.1428 9.16424 17.1428 12.0001C17.1428 14.8359 14.8358 17.1429 11.9999 17.1429C9.16413 17.1429 6.85709 14.8359 6.85709 12.0001ZM8.62792 12C8.62792 13.8593 10.1407 15.3719 11.9999 15.3719C13.8592 15.3719 15.372 13.8593 15.372 12C15.372 10.1406 13.8593 8.62791 11.9999 8.62791C10.1406 8.62791 8.62792 10.1406 8.62792 12Z" fill="white"></path>
                    </mask>
                  </svg>
                </a>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
                ${config.contact.socials.linkedin ? renderTemplate`<a class="inline-block text-primary hover:text-primary-focus" href="#">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.2 0H1.8C0.81 0 0 0.81 0 1.8V16.2C0 17.19 0.81 18 1.8 18H16.2C17.19 18 18 17.19 18 16.2V1.8C18 0.81 17.19 0 16.2 0ZM5.4 15.3H2.7V7.2H5.4V15.3ZM4.05 5.67C3.15 5.67 2.43 4.95 2.43 4.05C2.43 3.15 3.15 2.43 4.05 2.43C4.95 2.43 5.67 3.15 5.67 4.05C5.67 4.95 4.95 5.67 4.05 5.67ZM15.3 15.3H12.6V10.53C12.6 9.81004 11.97 9.18 11.25 9.18C10.53 9.18 9.9 9.81004 9.9 10.53V15.3H7.2V7.2H9.9V8.28C10.35 7.56 11.34 7.02 12.15 7.02C13.86 7.02 15.3 8.46 15.3 10.17V15.3Z" fill="currentColor"></path>
                  </svg>
                </a>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
              </div>
            </div>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {})}`}
          </div>
        </div>
        <div class="w-full lg:w-1/2 px-4">
          <div class="px-4 py-8 md:p-10 bg-gray-50 rounded-md">
            <form action="/api/contact" method="POST">
              <div class="mb-6">
                <label class="block mb-2 text-gray-800 font-medium leading-6" for="">Email</label>
                <input class="block w-full py-2 px-3 appearance-none border border-gray-200 rounded-lg shadow-md text-gray-500 leading-6 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50" type="email" placeholder="me@example.com" name="email" id="contact-email">
              </div>
              <div class="mb-6">
                <label class="block mb-2 text-gray-800 font-medium leading-6" for="">Message (describe your website goals)</label>
                <textarea class="block h-32 md:h-52 w-full py-2 px-3 appearance-none border border-gray-200 rounded-lg shadow-md text-gray-500 leading-6 focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 placeholder-gray-200 resize-none" placeholder="Your goals..." name="message" id="contact-message"></textarea>
              </div>
              <button class="block w-full py-4 px-6 text-lg leading-6 text-gray-50 font-medium text-center bg-primary hover:bg-primary-focus focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 rounded-md shadow-sm">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>` })}`;
});

const $$file$2 = "/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/contact.astro";
const $$url$2 = "/contact";

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$2,
	default: $$Contact,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$1 = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/success.astro", { modules: [{ module: $$module1, specifier: "@layouts/Layout.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$2 = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/success.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$Success = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Success;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Welcome to Kapic Software.", "class": "astro-TFQBTMO4" }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<section class="relative bg-white overflow-hidden astro-TFQBTMO4" style="background-image: url('https://shuffle.dev/flex-ui-assets/elements/pattern-white.svg'); background-position: center;">
    <div class="bg-transparent astro-TFQBTMO4">
      <div class="navbar-menu hidden fixed top-0 left-0 z-50 w-full h-full bg-gray-900 bg-opacity-50 astro-TFQBTMO4">
      </div>
    </div>
    <div class="py-20 md:py-28 astro-TFQBTMO4" style="background-image: url( '/hero/background-image.svg' );">
      <div class="container px-4 mx-auto astro-TFQBTMO4">
        <div class="flex flex-wrap xl:items-center -mx-4 astro-TFQBTMO4">
          <div class="w-full md:w-1/2 p-4 mb-16 md:mb-0 bg-slate-200 rounded-xl backdrop-blur-sm bg-opacity-90 astro-TFQBTMO4">
            <span class="inline-block py-px px-2 mb-4 text-xs leading-5 text-white kapic-bg-gradient uppercase rounded-9xl astro-TFQBTMO4">Kapic Software</span>
            <h1 class="mb-6 text-3xl md:text-5xl lg:text-6xl leading-tight font-bold tracking-tight astro-TFQBTMO4">
              <!-- We rapidly build<br/> <span class="text-7xl hidden lg:inline">🚀</span> <span class="kapic-text-gradient text-7xl">fast sites</span> <span class="text-7xl hidden lg:inline">🚀</span> -->
              We got your request.<br class="astro-TFQBTMO4">
              <span class="kapic-text-gradient text-7xl astro-TFQBTMO4">Thank you</span><span class="text-7xl astro-TFQBTMO4">.</span>
            </h1>
            <p class="mb-8 text-lg md:text-xl text-gray-500 font-medium astro-TFQBTMO4">
              We will reach out shortly to schedule a call. You will have a site up and running in no time!
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>` })}

`;
});

const $$file$1 = "/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/success.astro";
const $$url$1 = "/success";

const _page2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$1,
	default: $$Success,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

/* src/components/blog/Posts.svelte generated by Svelte v3.50.0 */

const Posts = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { headline = "Bringing enterprise website quality to small businesses." } = $$props;
	let { subline = "With our services your web presence will reach a quality like you never imagined." } = $$props;

	const dateOptions = {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	};

	let { posts = [] } = $$props;

	posts.sort((a, b) => {
		const a_date = new Date(a.frontmatter.publishDate);
		const b_date = new Date(b.frontmatter.publishDate);

		if (a_date < b_date) {
			return 1;
		}

		return -1;
	});

	// let search = ""; // not yet implemented
	let tags = ["All Categories"];

	let tagIndex = 0;

	posts.map(post => {
		for (let tag of post.frontmatter.tags) {
			if (!tags.includes(tag)) {
				tags.push(tag);
			}
		}
	});

	if ($$props.headline === void 0 && $$bindings.headline && headline !== void 0) $$bindings.headline(headline);
	if ($$props.subline === void 0 && $$bindings.subline && subline !== void 0) $$bindings.subline(subline);
	if ($$props.posts === void 0 && $$bindings.posts && posts !== void 0) $$bindings.posts(posts);

	return `<section class="${"py-24 bg-white"}" style="${"background-image: url('footer-background.svg'); background-repeat: no-repeat; background-position: left top;"}"><div class="${"container px-4 mx-auto"}"><div class="${"md:max-w-5xl mx-auto mb-8 md:mb-16 text-center"}"><span class="${"inline-block py-px px-2 mb-4 text-xs leading-5 text-primary bg-primary bg-opacity-10 font-medium uppercase rounded-full shadow-sm"}">Blog</span>
      <h3 class="${"mb-4 text-3xl md:text-5xl leading-tight text-darkgray-900 font-bold tracking-tighter"}">${escape(headline)}</h3>
      <p class="${"mb-10 text-lg md:text-xl text-gray-500 font-medium"}">${escape(subline)}</p>
      </div>
    <ul class="${"flex flex-wrap mb-8 -mx-2 text-center"}">${each(tags, (tag, i) => {
		return `<li class="${"w-full md:w-auto px-2"}"><button${add_attribute(
			"class",
			`${tagIndex === i
			? "text-primary bg-primary-focus bg-opacity-20 shadow-sm"
			: "text-neutral bg-opacity-10"} inline-block w-full py-2 px-4 my-4 md:mb-0 text-sm hover:text-primary bg-primary font-bold rounded-md hover:shadow-md hover:bg-opacity-20 transition`,
			0
		)}>${escape(tag.toUpperCase())}</button>
        </li>`;
	})}</ul>
    <div class="${"flex flex-wrap -mx-4 mb-12 md:mb-20"}">${each(posts, post => {
		return `${`<div class="${"w-full md:w-1/2 px-4 mb-8"}"><a class="${"block mb-6 overflow-hidden rounded-md hover:shadow-lg transition"}"${add_attribute("href", post.url, 0)}><img class="${"w-full aspect-video"}"${add_attribute("src", post.frontmatter.image, 0)}${add_attribute("alt", `${post.frontmatter.title} Image`, 0)}></a>
            <div class="${"mb-4"}">${each(post.frontmatter.tags, tag => {
				return `<button class="${"inline-block py-1 px-3 text-xs leading-5 text-primary hover:text-primary-focus font-medium uppercase bg-primary bg-opacity-10 hover:bg-opacity-20 rounded-full shadow-sm mr-2"}">${escape(tag)}</button>`;
			})}</div>
            <p class="${"mb-2 text-gray-500 font-medium"}">${escape(post.frontmatter.author)} • ${escape(new Date(post.frontmatter.publishDate).toLocaleDateString('en-US', dateOptions))}</p>
            <a class="${"inline-block mb-4 text-2xl leading-tight text-gray-800 hover:text-gray-900 font-bold hover:underline"}"${add_attribute("href", post.url, 0)}>${escape(post.frontmatter.title)}</a>
            <p class="${"mb-4 text-base md:text-lg text-gray-400 font-medium"}">${escape(post.frontmatter.summary)}</p>
            <a class="${"inline-flex items-center text-base md:text-lg text-primary hover:text-primary-focus font-semibold"}"${add_attribute("href", post.url, 0)}><span class="${"mr-3"}">Read Post</span>
              <svg width="${"8"}" height="${"10"}" viewBox="${"0 0 8 10"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M7.94667 4.74665C7.91494 4.66481 7.86736 4.59005 7.80666 4.52665L4.47333 1.19331C4.41117 1.13116 4.33738 1.08185 4.25617 1.04821C4.17495 1.01457 4.08791 0.997253 4 0.997253C3.82246 0.997253 3.6522 1.06778 3.52667 1.19331C3.46451 1.25547 3.4152 1.32927 3.38156 1.41048C3.34792 1.4917 3.33061 1.57874 3.33061 1.66665C3.33061 1.84418 3.40113 2.01445 3.52667 2.13998L5.72667 4.33331H0.666667C0.489856 4.33331 0.320286 4.40355 0.195262 4.52858C0.070238 4.6536 0 4.82317 0 4.99998C0 5.17679 0.070238 5.34636 0.195262 5.47138C0.320286 5.59641 0.489856 5.66665 0.666667 5.66665H5.72667L3.52667 7.85998C3.46418 7.92196 3.41458 7.99569 3.38074 8.07693C3.34689 8.15817 3.32947 8.24531 3.32947 8.33331C3.32947 8.42132 3.34689 8.50846 3.38074 8.5897C3.41458 8.67094 3.46418 8.74467 3.52667 8.80665C3.58864 8.86913 3.66238 8.91873 3.74361 8.95257C3.82485 8.98642 3.91199 9.00385 4 9.00385C4.08801 9.00385 4.17514 8.98642 4.25638 8.95257C4.33762 8.91873 4.41136 8.86913 4.47333 8.80665L7.80666 5.47331C7.86736 5.40991 7.91494 5.33515 7.94667 5.25331C8.01334 5.09101 8.01334 4.90895 7.94667 4.74665Z"}" fill="${"currentColor"}"></path></svg></a>
          </div>`
		}`;
	})}</div>
    </div></section>`;
});

const $$module2$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: Posts
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata = createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/blog/index.astro", { modules: [{ module: $$module1, specifier: "@layouts/Layout.astro", assert: {} }, { module: $$module2$1, specifier: "@components/blog/Posts.svelte", assert: {} }], hydratedComponents: [Posts], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set(["visible"]), hoisted: [] });
const $$Astro$1 = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/blog/index.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Index;
  const posts = await Astro2.glob(/* #__PURE__ */ Object.assign({"./post.md": () => Promise.resolve().then(() => _page4)}), () => "../blog/*.md");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Kapic Software Blog" }, { "default": () => renderTemplate`${renderComponent($$result, "Posts", Posts, { "client:visible": true, "posts": posts, "client:component-hydration": "visible", "client:component-path": "@components/blog/Posts.svelte", "client:component-export": "default" })}` })}`;
});

const $$file = "/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/blog/index.astro";
const $$url = "/blog";

const _page3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

/* src/components/blog/Copy.svelte generated by Svelte v3.50.0 */

const Copy = create_ssr_component(($$result, $$props, $$bindings, slots) => {

	return `<button class="${"inline-flex mr-4 items-center justify-center py-2 px-4 text-gray-300 hover:text-gray-400 bg-white hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-md shadow-md transition duration-200"}"><svg width="${"20"}" height="${"16"}" viewBox="${"0 0 20 16"}" fill="${"none"}" xmlns="${"http://www.w3.org/2000/svg"}"><path d="${"M15 13.8333H5C4.33696 13.8333 3.70108 13.5699 3.23224 13.1011C2.76339 12.6323 2.5 11.9964 2.5 11.3333V4.66667C2.5 4.44565 2.41221 4.23369 2.25592 4.07741C2.09964 3.92113 1.88768 3.83333 1.66667 3.83333C1.44566 3.83333 1.23369 3.92113 1.07741 4.07741C0.921133 4.23369 0.833336 4.44565 0.833336 4.66667V11.3333C0.833336 12.4384 1.27232 13.4982 2.05372 14.2796C2.44063 14.6665 2.89996 14.9734 3.40549 15.1828C3.91101 15.3922 4.45283 15.5 5 15.5H15C15.221 15.5 15.433 15.4122 15.5893 15.2559C15.7455 15.0996 15.8333 14.8877 15.8333 14.6667C15.8333 14.4457 15.7455 14.2337 15.5893 14.0774C15.433 13.9211 15.221 13.8333 15 13.8333ZM19.1667 6.28333C19.158 6.20678 19.1412 6.13136 19.1167 6.05833V5.98333C19.0766 5.89765 19.0232 5.81889 18.9583 5.75V5.75L13.9583 0.75C13.8894 0.68518 13.8107 0.631734 13.725 0.591667H13.65L13.3833 0.5H6.66667C6.00363 0.5 5.36774 0.763392 4.8989 1.23223C4.43006 1.70107 4.16667 2.33696 4.16667 3V9.66667C4.16667 10.3297 4.43006 10.9656 4.8989 11.4344C5.36774 11.9033 6.00363 12.1667 6.66667 12.1667H16.6667C17.3297 12.1667 17.9656 11.9033 18.4344 11.4344C18.9033 10.9656 19.1667 10.3297 19.1667 9.66667V6.33333C19.1667 6.33333 19.1667 6.33333 19.1667 6.28333ZM14.1667 3.34167L16.325 5.5H15C14.779 5.5 14.567 5.4122 14.4107 5.25592C14.2545 5.09964 14.1667 4.88768 14.1667 4.66667V3.34167ZM17.5 9.66667C17.5 9.88768 17.4122 10.0996 17.2559 10.2559C17.0996 10.4122 16.8877 10.5 16.6667 10.5H6.66667C6.44565 10.5 6.23369 10.4122 6.07741 10.2559C5.92113 10.0996 5.83334 9.88768 5.83334 9.66667V3C5.83334 2.77899 5.92113 2.56702 6.07741 2.41074C6.23369 2.25446 6.44565 2.16667 6.66667 2.16667H12.5V4.66667C12.5 5.32971 12.7634 5.96559 13.2322 6.43443C13.7011 6.90327 14.337 7.16667 15 7.16667H17.5V9.66667Z"}" fill="${"currentColor"}"></path></svg>
  <span class="${"ml-2 text-sm text-gray-500 hover:text-gray-600 font-medium"}">Copy Link</span></button>`;
});

const $$module2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: Copy
}, Symbol.toStringTag, { value: 'Module' }));

createMetadata("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/layouts/Post.astro", { modules: [{ module: $$module1, specifier: "@layouts/Layout.astro", assert: {} }, { module: $$module2, specifier: "@components/blog/Copy.svelte", assert: {} }], hydratedComponents: [Copy], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set(["visible"]), hoisted: [] });
const $$Astro = createAstro("/@fs/Users/christopherkapic/Projects/kapicsoftware.com/src/layouts/Post.astro", "https://kapicsoftware.com/", "file:///Users/christopherkapic/Projects/kapicsoftware.com/");
const $$Post = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Post;
  const { content } = Astro2.props;
  const dateOptions = { month: "short", day: "numeric", year: "numeric" };
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": content.title }, { "default": () => renderTemplate`${maybeRenderHead($$result)}<section class="py-16 md:py-24 bg-white" style="background-image: url('flex-ui-assets/elements/pattern-white.svg'); background-position: center top;">
    <div class="container px-4 mx-auto">
      <div class="md:max-w-2xl mx-auto mb-12 text-center">
        <div class="flex items-center justify-center">
          <p class="inline-block text-primary font-medium">${content.author}</p>
          <span class="mx-1 text-primary">•</span>
          <p class="inline-block text-primary font-medium">${new Date(content.publishDate).toLocaleDateString("en-US", dateOptions)}</p>
        </div>
        <h2 class="mb-4 text-3xl md:text-5xl leading-tight text-darkgray-900 font-bold tracking-tighter">${content.title}</h2>
        <p class="mb-6 text-lg md:text-xl font-medium text-gray-500">${content.summary}</p>
        ${content.tags.map((tag) => {
    return renderTemplate`<div class="inline-block py-1 px-3 mx-1 text-xs leading-5 text-primary font-medium uppercase bg-green-100 rounded-full shadow-sm">${tag}</div>`;
  })}
      </div>
      <div class="mb-10 mx-auto max-w-max overflow-hidden rounded-lg aspect-video">
        <img${addAttribute(content.image, "src")}${addAttribute(`${content.title} Header Image`, "alt")}>
      </div>
      <div class="md:max-w-3xl mx-auto">
        <article class="prose">
          ${renderSlot($$result, $$slots["default"])}
        </article>
        <div class="flex items-center justify-center">
          ${renderComponent($$result, "Copy", Copy, { "client:visible": true, "client:component-hydration": "visible", "client:component-path": "@components/blog/Copy.svelte", "client:component-export": "default" })}
          <!-- <a class="inline-flex mr-2 h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-md shadow-md transition duration-200" href="#">
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.6 3.43332H9.16667V0.783318C8.40813 0.70444 7.64596 0.665497 6.88333 0.666651C4.61667 0.666651 3.06667 2.04998 3.06667 4.58332V6.76665H0.508333V9.73332H3.06667V17.3333H6.13333V9.73332H8.68333L9.06667 6.76665H6.13333V4.87498C6.13333 3.99998 6.36667 3.43332 7.6 3.43332Z" fill="currentColor"></path>
            </svg>
          </a>
          <a class="inline-flex mr-2 h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-md shadow-md transition duration-200" href="#">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.3333 1.83339C16.7069 2.10513 16.0445 2.28477 15.3667 2.36672C16.0818 1.93949 16.6177 1.26737 16.875 0.475053C16.203 0.875105 15.4673 1.15697 14.7 1.30839C14.1871 0.752196 13.5041 0.381966 12.7582 0.255762C12.0122 0.129558 11.2455 0.254518 10.5782 0.611044C9.91087 0.96757 9.38078 1.5355 9.07104 2.22575C8.76129 2.916 8.68941 3.68954 8.86667 4.42505C7.50786 4.35632 6.1787 4.00251 4.96555 3.3866C3.75239 2.77069 2.68237 1.90646 1.825 0.850052C1.52428 1.37519 1.36627 1.9699 1.36667 2.57505C1.3656 3.13704 1.50352 3.69057 1.76813 4.18636C2.03275 4.68215 2.41585 5.10481 2.88333 5.41672C2.33998 5.40194 1.80824 5.25613 1.33333 4.99172V5.03339C1.33741 5.82079 1.61333 6.58263 2.11443 7.19002C2.61553 7.79742 3.31105 8.21309 4.08333 8.36672C3.78605 8.45719 3.4774 8.50489 3.16667 8.50839C2.95158 8.50587 2.73702 8.48637 2.525 8.45005C2.74493 9.1274 3.17052 9.71934 3.74256 10.1435C4.31461 10.5677 5.00465 10.803 5.71667 10.8167C4.51434 11.7628 3.0299 12.2791 1.5 12.2834C1.22145 12.2843 0.943114 12.2676 0.666668 12.2334C2.22869 13.2419 4.04901 13.7773 5.90833 13.7751C7.19141 13.7884 8.46428 13.5459 9.6526 13.0618C10.8409 12.5777 11.9209 11.8616 12.8293 10.9555C13.7378 10.0493 14.4566 8.97121 14.9438 7.78414C15.431 6.59707 15.6767 5.32483 15.6667 4.04172C15.6667 3.90005 15.6667 3.75005 15.6667 3.60005C16.3206 3.11239 16.8846 2.51457 17.3333 1.83339V1.83339Z" fill="currentColor"></path>
            </svg>
          </a>
          <a class="inline-flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-md shadow-md transition duration-200" href="#">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.45 3.54996C13.2522 3.54996 13.0589 3.60861 12.8944 3.71849C12.73 3.82837 12.6018 3.98455 12.5261 4.16728C12.4504 4.35 12.4306 4.55107 12.4692 4.74505C12.5078 4.93903 12.603 5.11721 12.7429 5.25707C12.8827 5.39692 13.0609 5.49216 13.2549 5.53074C13.4489 5.56933 13.65 5.54953 13.8327 5.47384C14.0154 5.39815 14.1716 5.26998 14.2815 5.10553C14.3913 4.94108 14.45 4.74774 14.45 4.54996C14.45 4.28474 14.3446 4.03039 14.1571 3.84285C13.9696 3.65532 13.7152 3.54996 13.45 3.54996V3.54996ZM17.2833 5.56663C17.2671 4.87521 17.1376 4.19113 16.9 3.54163C16.6881 2.9859 16.3583 2.48269 15.9333 2.06663C15.5207 1.63948 15.0163 1.31177 14.4583 1.10829C13.8105 0.863427 13.1257 0.730968 12.4333 0.716626C11.55 0.666626 11.2667 0.666626 9 0.666626C6.73333 0.666626 6.45 0.666626 5.56666 0.716626C4.87429 0.730968 4.18945 0.863427 3.54166 1.10829C2.98473 1.31383 2.48078 1.64126 2.06666 2.06663C1.63952 2.47927 1.31181 2.98366 1.10833 3.54163C0.863465 4.18941 0.731006 4.87425 0.716664 5.56663C0.666664 6.44996 0.666664 6.73329 0.666664 8.99996C0.666664 11.2666 0.666664 11.55 0.716664 12.4333C0.731006 13.1257 0.863465 13.8105 1.10833 14.4583C1.31181 15.0163 1.63952 15.5206 2.06666 15.9333C2.48078 16.3587 2.98473 16.6861 3.54166 16.8916C4.18945 17.1365 4.87429 17.269 5.56666 17.2833C6.45 17.3333 6.73333 17.3333 9 17.3333C11.2667 17.3333 11.55 17.3333 12.4333 17.2833C13.1257 17.269 13.8105 17.1365 14.4583 16.8916C15.0163 16.6881 15.5207 16.3604 15.9333 15.9333C16.3602 15.5188 16.6903 15.0151 16.9 14.4583C17.1376 13.8088 17.2671 13.1247 17.2833 12.4333C17.2833 11.55 17.3333 11.2666 17.3333 8.99996C17.3333 6.73329 17.3333 6.44996 17.2833 5.56663V5.56663ZM15.7833 12.3333C15.7773 12.8623 15.6815 13.3864 15.5 13.8833C15.3669 14.246 15.1532 14.5736 14.875 14.8416C14.6047 15.117 14.2777 15.3303 13.9167 15.4666C13.4197 15.6481 12.8956 15.7439 12.3667 15.75C11.5333 15.7916 11.225 15.8 9.03333 15.8C6.84166 15.8 6.53333 15.8 5.7 15.75C5.15074 15.7602 4.60383 15.6757 4.08333 15.5C3.73815 15.3567 3.42613 15.1439 3.16666 14.875C2.89007 14.6072 2.67903 14.2793 2.55 13.9166C2.34654 13.4126 2.2337 12.8766 2.21666 12.3333C2.21666 11.5 2.16666 11.1916 2.16666 8.99996C2.16666 6.80829 2.16666 6.49996 2.21666 5.66663C2.2204 5.12584 2.31912 4.58991 2.50833 4.08329C2.65504 3.73155 2.88022 3.41801 3.16666 3.16663C3.41984 2.8801 3.73274 2.65254 4.08333 2.49996C4.59129 2.31666 5.12666 2.22086 5.66666 2.21663C6.5 2.21663 6.80833 2.16663 9 2.16663C11.1917 2.16663 11.5 2.16663 12.3333 2.21663C12.8623 2.22269 13.3864 2.3185 13.8833 2.49996C14.262 2.6405 14.6019 2.869 14.875 3.16663C15.1481 3.42261 15.3615 3.73557 15.5 4.08329C15.6852 4.59074 15.7811 5.12644 15.7833 5.66663C15.825 6.49996 15.8333 6.80829 15.8333 8.99996C15.8333 11.1916 15.825 11.5 15.7833 12.3333ZM9 4.72496C8.15484 4.72661 7.32913 4.97873 6.62721 5.44947C5.92529 5.92022 5.37865 6.58846 5.05636 7.36975C4.73407 8.15105 4.6506 9.01035 4.81649 9.83907C4.98238 10.6678 5.39019 11.4287 5.98839 12.0258C6.58659 12.6228 7.34834 13.0291 8.17738 13.1934C9.00642 13.3577 9.86555 13.2725 10.6462 12.9487C11.4269 12.6249 12.0941 12.077 12.5634 11.3742C13.0328 10.6713 13.2833 9.84512 13.2833 8.99996C13.2844 8.43755 13.1743 7.88047 12.9594 7.36076C12.7444 6.84105 12.4288 6.36897 12.0307 5.97167C11.6326 5.57437 11.16 5.25969 10.6398 5.04573C10.1197 4.83178 9.56241 4.72276 9 4.72496V4.72496ZM9 11.775C8.45115 11.775 7.91464 11.6122 7.45829 11.3073C7.00194 11.0024 6.64627 10.569 6.43623 10.0619C6.2262 9.55484 6.17124 8.99688 6.27832 8.45858C6.38539 7.92029 6.64969 7.42583 7.03778 7.03774C7.42587 6.64965 7.92033 6.38535 8.45862 6.27828C8.99692 6.17121 9.55488 6.22616 10.0619 6.43619C10.569 6.64623 11.0024 7.00191 11.3073 7.45825C11.6122 7.9146 11.775 8.45112 11.775 8.99996C11.775 9.36438 11.7032 9.72523 11.5638 10.0619C11.4243 10.3986 11.2199 10.7045 10.9622 10.9622C10.7045 11.2199 10.3986 11.4243 10.0619 11.5637C9.72527 11.7032 9.36442 11.775 9 11.775V11.775Z" fill="currentColor"></path>
            </svg>
          </a> -->
        </div>
      </div>
    </div>
  </section>` })}`;
});

const html = "<h1 id=\"hello-there\">Hello there!</h1>\n<p>This is a paragraph</p>\n<ul>\n<li>here is a bullet</li>\n<li>here is another</li>\n</ul>";

				const frontmatter = {"layout":"../../layouts/Post.astro","title":"This is an example post.","author":"Christopher Kapic","summary":"This is an example summary.","image":"https://shuffle.dev/flex-ui-assets/images/blog/effect.jpg","tags":["netlify","netlifycms","cms","keystonejs"],"publishDate":"2022-08-29T15:06:10.427Z","updateDate":"2022-08-29T15:06:10.433Z"};
				const file = "/Users/christopherkapic/Projects/kapicsoftware.com/src/pages/blog/post.md";
				const url$1 = "/blog/post";
				function rawContent() {
					return "\n# Hello there!\n\nThis is a paragraph\n\n- here is a bullet\n- here is another";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [{"depth":1,"slug":"hello-there","text":"Hello there!"}];
				}
				function getHeaders() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings();
				}				async function Content() {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url$1;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html });
					return createVNode($$Post, {
									file,
									url: url$1,
									content,
									frontmatter: content,
									headings: getHeadings(),
									rawContent,
									compiledContent,
									'server:root': true,
									children: contentFragment
								});
				}
				Content[Symbol.for('astro.needsHeadRendering')] = false;

const _page4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	frontmatter,
	file,
	url: url$1,
	rawContent,
	compiledContent,
	getHeadings,
	getHeaders,
	Content,
	default: Content
}, Symbol.toStringTag, { value: 'Module' }));

function queryStringToJSON(qs) {
  qs = qs || location.search.slice(1);
  let pairs = qs.split("&");
  let result = {};
  pairs.forEach(function(p) {
    let pair = p.split("=");
    let key = pair[0];
    let value = decodeURIComponent(pair[1] || "");
    if (result[key]) {
      if (Object.prototype.toString.call(result[key]) === "[object Array]") {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  });
  return JSON.parse(JSON.stringify(result));
}

function getUrl() {
  if (Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true}, { SITE: "https://kapicsoftware.com/" }).MODE === "production") {
    return "https://kapicsoftware.com/";
  }
  return "http://localhost:3000/";
}
const url = getUrl();

async function post({ request }) {
  const body = queryStringToJSON(await request.text());
  console.log(body);
  await fetch(Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true}, { _: process.env._ }).SLACK_NOTIFICATION_URL, {
    method: "POST",
    body: JSON.stringify({
      text: `${body.email} just requested a consultation for a website.
${body.message}`
    })
  });
  return Response.redirect(`${url}success`, 307);
}

const _page5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	post
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['src/pages/index.astro', _page0],['src/pages/contact.astro', _page1],['src/pages/success.astro', _page2],['src/pages/blog/index.astro', _page3],['src/pages/blog/post.md', _page4],['src/pages/api/contact.ts', _page5],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),Object.assign({"name":"@astrojs/svelte","clientEntrypoint":"@astrojs/svelte/client.js","serverEntrypoint":"@astrojs/svelte/server.js"}, { ssr: _renderer1 }),];

if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) ; else if (process.argv.includes("--silent")) ; else ;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

const STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".pcss",
  ".postcss",
  ".scss",
  ".sass",
  ".styl",
  ".stylus",
  ".less"
]);
new RegExp(
  `\\.(${Array.from(STYLE_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return segment[0].spread ? `/:${segment[0].content.slice(3)}(.*)?` : "/" + segment.map((part) => {
      if (part)
        return part.dynamic ? `:${part.content}` : part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  return {
    ...serializedManifest,
    assets,
    routes
  };
}

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/netlify/functions","routes":[{"file":"","links":["assets/blog-index-blog-post-contact-index-success.aa88fafa.css","assets/index.f3b0bf10.css"],"scripts":[{"type":"external","value":"page.3aa82516.js"},{"stage":"head-inline","children":"!(function(w,p,f,c){c=w[p]=Object.assign(w[p]||{},{\"lib\":\"/~partytown/\",\"debug\":false});c[f]=(c[f]||[])})(window,'partytown','forward');/* Partytown 0.4.5 - MIT builder.io */\n!function(t,e,n,i,r,o,a,d,s,c,p,l){function u(){l||(l=1,\"/\"==(a=(o.lib||\"/~partytown/\")+(o.debug?\"debug/\":\"\"))[0]&&(s=e.querySelectorAll('script[type=\"text/partytown\"]'),i!=t?i.dispatchEvent(new CustomEvent(\"pt1\",{detail:t})):(d=setTimeout(w,1e4),e.addEventListener(\"pt0\",f),r?h(1):n.serviceWorker?n.serviceWorker.register(a+(o.swPath||\"partytown-sw.js\"),{scope:a}).then((function(t){t.active?h():t.installing&&t.installing.addEventListener(\"statechange\",(function(t){\"activated\"==t.target.state&&h()}))}),console.error):w())))}function h(t){c=e.createElement(t?\"script\":\"iframe\"),t||(c.setAttribute(\"style\",\"display:block;width:0;height:0;border:0;visibility:hidden\"),c.setAttribute(\"aria-hidden\",!0)),c.src=a+\"partytown-\"+(t?\"atomics.js?v=0.4.5\":\"sandbox-sw.html?\"+Date.now()),e.body.appendChild(c)}function w(t,n){for(f(),t=0;t<s.length;t++)(n=e.createElement(\"script\")).innerHTML=s[t].innerHTML,e.head.appendChild(n);c&&c.parentNode.removeChild(c)}function f(){clearTimeout(d)}o=t.partytown||{},i==t&&(o.forward||[]).map((function(e){p=t,e.split(\".\").map((function(e,n,i){p=p[i[n]]=n+1<i.length?\"push\"==i[n+1]?[]:p[i[n]]||{}:function(){(t._ptf=t._ptf||[]).push(i,arguments)}}))})),\"complete\"==e.readyState?u():(t.addEventListener(\"DOMContentLoaded\",u),t.addEventListener(\"load\",u))}(window,document,navigator,top,window.crossOriginIsolated);"}],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog-index-blog-post-contact-index-success.aa88fafa.css"],"scripts":[{"type":"external","value":"page.3aa82516.js"},{"stage":"head-inline","children":"!(function(w,p,f,c){c=w[p]=Object.assign(w[p]||{},{\"lib\":\"/~partytown/\",\"debug\":false});c[f]=(c[f]||[])})(window,'partytown','forward');/* Partytown 0.4.5 - MIT builder.io */\n!function(t,e,n,i,r,o,a,d,s,c,p,l){function u(){l||(l=1,\"/\"==(a=(o.lib||\"/~partytown/\")+(o.debug?\"debug/\":\"\"))[0]&&(s=e.querySelectorAll('script[type=\"text/partytown\"]'),i!=t?i.dispatchEvent(new CustomEvent(\"pt1\",{detail:t})):(d=setTimeout(w,1e4),e.addEventListener(\"pt0\",f),r?h(1):n.serviceWorker?n.serviceWorker.register(a+(o.swPath||\"partytown-sw.js\"),{scope:a}).then((function(t){t.active?h():t.installing&&t.installing.addEventListener(\"statechange\",(function(t){\"activated\"==t.target.state&&h()}))}),console.error):w())))}function h(t){c=e.createElement(t?\"script\":\"iframe\"),t||(c.setAttribute(\"style\",\"display:block;width:0;height:0;border:0;visibility:hidden\"),c.setAttribute(\"aria-hidden\",!0)),c.src=a+\"partytown-\"+(t?\"atomics.js?v=0.4.5\":\"sandbox-sw.html?\"+Date.now()),e.body.appendChild(c)}function w(t,n){for(f(),t=0;t<s.length;t++)(n=e.createElement(\"script\")).innerHTML=s[t].innerHTML,e.head.appendChild(n);c&&c.parentNode.removeChild(c)}function f(){clearTimeout(d)}o=t.partytown||{},i==t&&(o.forward||[]).map((function(e){p=t,e.split(\".\").map((function(e,n,i){p=p[i[n]]=n+1<i.length?\"push\"==i[n+1]?[]:p[i[n]]||{}:function(){(t._ptf=t._ptf||[]).push(i,arguments)}}))})),\"complete\"==e.readyState?u():(t.addEventListener(\"DOMContentLoaded\",u),t.addEventListener(\"load\",u))}(window,document,navigator,top,window.crossOriginIsolated);"}],"routeData":{"route":"/contact","type":"page","pattern":"^\\/contact\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact.astro","pathname":"/contact","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog-index-blog-post-contact-index-success.aa88fafa.css","assets/success.477946fe.css"],"scripts":[{"type":"external","value":"page.3aa82516.js"},{"stage":"head-inline","children":"!(function(w,p,f,c){c=w[p]=Object.assign(w[p]||{},{\"lib\":\"/~partytown/\",\"debug\":false});c[f]=(c[f]||[])})(window,'partytown','forward');/* Partytown 0.4.5 - MIT builder.io */\n!function(t,e,n,i,r,o,a,d,s,c,p,l){function u(){l||(l=1,\"/\"==(a=(o.lib||\"/~partytown/\")+(o.debug?\"debug/\":\"\"))[0]&&(s=e.querySelectorAll('script[type=\"text/partytown\"]'),i!=t?i.dispatchEvent(new CustomEvent(\"pt1\",{detail:t})):(d=setTimeout(w,1e4),e.addEventListener(\"pt0\",f),r?h(1):n.serviceWorker?n.serviceWorker.register(a+(o.swPath||\"partytown-sw.js\"),{scope:a}).then((function(t){t.active?h():t.installing&&t.installing.addEventListener(\"statechange\",(function(t){\"activated\"==t.target.state&&h()}))}),console.error):w())))}function h(t){c=e.createElement(t?\"script\":\"iframe\"),t||(c.setAttribute(\"style\",\"display:block;width:0;height:0;border:0;visibility:hidden\"),c.setAttribute(\"aria-hidden\",!0)),c.src=a+\"partytown-\"+(t?\"atomics.js?v=0.4.5\":\"sandbox-sw.html?\"+Date.now()),e.body.appendChild(c)}function w(t,n){for(f(),t=0;t<s.length;t++)(n=e.createElement(\"script\")).innerHTML=s[t].innerHTML,e.head.appendChild(n);c&&c.parentNode.removeChild(c)}function f(){clearTimeout(d)}o=t.partytown||{},i==t&&(o.forward||[]).map((function(e){p=t,e.split(\".\").map((function(e,n,i){p=p[i[n]]=n+1<i.length?\"push\"==i[n+1]?[]:p[i[n]]||{}:function(){(t._ptf=t._ptf||[]).push(i,arguments)}}))})),\"complete\"==e.readyState?u():(t.addEventListener(\"DOMContentLoaded\",u),t.addEventListener(\"load\",u))}(window,document,navigator,top,window.crossOriginIsolated);"}],"routeData":{"route":"/success","type":"page","pattern":"^\\/success\\/?$","segments":[[{"content":"success","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/success.astro","pathname":"/success","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog-index-blog-post-contact-index-success.aa88fafa.css"],"scripts":[{"type":"external","value":"page.3aa82516.js"},{"stage":"head-inline","children":"!(function(w,p,f,c){c=w[p]=Object.assign(w[p]||{},{\"lib\":\"/~partytown/\",\"debug\":false});c[f]=(c[f]||[])})(window,'partytown','forward');/* Partytown 0.4.5 - MIT builder.io */\n!function(t,e,n,i,r,o,a,d,s,c,p,l){function u(){l||(l=1,\"/\"==(a=(o.lib||\"/~partytown/\")+(o.debug?\"debug/\":\"\"))[0]&&(s=e.querySelectorAll('script[type=\"text/partytown\"]'),i!=t?i.dispatchEvent(new CustomEvent(\"pt1\",{detail:t})):(d=setTimeout(w,1e4),e.addEventListener(\"pt0\",f),r?h(1):n.serviceWorker?n.serviceWorker.register(a+(o.swPath||\"partytown-sw.js\"),{scope:a}).then((function(t){t.active?h():t.installing&&t.installing.addEventListener(\"statechange\",(function(t){\"activated\"==t.target.state&&h()}))}),console.error):w())))}function h(t){c=e.createElement(t?\"script\":\"iframe\"),t||(c.setAttribute(\"style\",\"display:block;width:0;height:0;border:0;visibility:hidden\"),c.setAttribute(\"aria-hidden\",!0)),c.src=a+\"partytown-\"+(t?\"atomics.js?v=0.4.5\":\"sandbox-sw.html?\"+Date.now()),e.body.appendChild(c)}function w(t,n){for(f(),t=0;t<s.length;t++)(n=e.createElement(\"script\")).innerHTML=s[t].innerHTML,e.head.appendChild(n);c&&c.parentNode.removeChild(c)}function f(){clearTimeout(d)}o=t.partytown||{},i==t&&(o.forward||[]).map((function(e){p=t,e.split(\".\").map((function(e,n,i){p=p[i[n]]=n+1<i.length?\"push\"==i[n+1]?[]:p[i[n]]||{}:function(){(t._ptf=t._ptf||[]).push(i,arguments)}}))})),\"complete\"==e.readyState?u():(t.addEventListener(\"DOMContentLoaded\",u),t.addEventListener(\"load\",u))}(window,document,navigator,top,window.crossOriginIsolated);"}],"routeData":{"route":"/blog","type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/blog-index-blog-post-contact-index-success.aa88fafa.css"],"scripts":[{"type":"external","value":"page.3aa82516.js"},{"stage":"head-inline","children":"!(function(w,p,f,c){c=w[p]=Object.assign(w[p]||{},{\"lib\":\"/~partytown/\",\"debug\":false});c[f]=(c[f]||[])})(window,'partytown','forward');/* Partytown 0.4.5 - MIT builder.io */\n!function(t,e,n,i,r,o,a,d,s,c,p,l){function u(){l||(l=1,\"/\"==(a=(o.lib||\"/~partytown/\")+(o.debug?\"debug/\":\"\"))[0]&&(s=e.querySelectorAll('script[type=\"text/partytown\"]'),i!=t?i.dispatchEvent(new CustomEvent(\"pt1\",{detail:t})):(d=setTimeout(w,1e4),e.addEventListener(\"pt0\",f),r?h(1):n.serviceWorker?n.serviceWorker.register(a+(o.swPath||\"partytown-sw.js\"),{scope:a}).then((function(t){t.active?h():t.installing&&t.installing.addEventListener(\"statechange\",(function(t){\"activated\"==t.target.state&&h()}))}),console.error):w())))}function h(t){c=e.createElement(t?\"script\":\"iframe\"),t||(c.setAttribute(\"style\",\"display:block;width:0;height:0;border:0;visibility:hidden\"),c.setAttribute(\"aria-hidden\",!0)),c.src=a+\"partytown-\"+(t?\"atomics.js?v=0.4.5\":\"sandbox-sw.html?\"+Date.now()),e.body.appendChild(c)}function w(t,n){for(f(),t=0;t<s.length;t++)(n=e.createElement(\"script\")).innerHTML=s[t].innerHTML,e.head.appendChild(n);c&&c.parentNode.removeChild(c)}function f(){clearTimeout(d)}o=t.partytown||{},i==t&&(o.forward||[]).map((function(e){p=t,e.split(\".\").map((function(e,n,i){p=p[i[n]]=n+1<i.length?\"push\"==i[n+1]?[]:p[i[n]]||{}:function(){(t._ptf=t._ptf||[]).push(i,arguments)}}))})),\"complete\"==e.readyState?u():(t.addEventListener(\"DOMContentLoaded\",u),t.addEventListener(\"load\",u))}(window,document,navigator,top,window.crossOriginIsolated);"}],"routeData":{"route":"/blog/post","type":"page","pattern":"^\\/blog\\/post\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}],[{"content":"post","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/post.md","pathname":"/blog/post","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"page.3aa82516.js"},{"stage":"head-inline","children":"!(function(w,p,f,c){c=w[p]=Object.assign(w[p]||{},{\"lib\":\"/~partytown/\",\"debug\":false});c[f]=(c[f]||[])})(window,'partytown','forward');/* Partytown 0.4.5 - MIT builder.io */\n!function(t,e,n,i,r,o,a,d,s,c,p,l){function u(){l||(l=1,\"/\"==(a=(o.lib||\"/~partytown/\")+(o.debug?\"debug/\":\"\"))[0]&&(s=e.querySelectorAll('script[type=\"text/partytown\"]'),i!=t?i.dispatchEvent(new CustomEvent(\"pt1\",{detail:t})):(d=setTimeout(w,1e4),e.addEventListener(\"pt0\",f),r?h(1):n.serviceWorker?n.serviceWorker.register(a+(o.swPath||\"partytown-sw.js\"),{scope:a}).then((function(t){t.active?h():t.installing&&t.installing.addEventListener(\"statechange\",(function(t){\"activated\"==t.target.state&&h()}))}),console.error):w())))}function h(t){c=e.createElement(t?\"script\":\"iframe\"),t||(c.setAttribute(\"style\",\"display:block;width:0;height:0;border:0;visibility:hidden\"),c.setAttribute(\"aria-hidden\",!0)),c.src=a+\"partytown-\"+(t?\"atomics.js?v=0.4.5\":\"sandbox-sw.html?\"+Date.now()),e.body.appendChild(c)}function w(t,n){for(f(),t=0;t<s.length;t++)(n=e.createElement(\"script\")).innerHTML=s[t].innerHTML,e.head.appendChild(n);c&&c.parentNode.removeChild(c)}function f(){clearTimeout(d)}o=t.partytown||{},i==t&&(o.forward||[]).map((function(e){p=t,e.split(\".\").map((function(e,n,i){p=p[i[n]]=n+1<i.length?\"push\"==i[n+1]?[]:p[i[n]]||{}:function(){(t._ptf=t._ptf||[]).push(i,arguments)}}))})),\"complete\"==e.readyState?u():(t.addEventListener(\"DOMContentLoaded\",u),t.addEventListener(\"load\",u))}(window,document,navigator,top,window.crossOriginIsolated);"}],"routeData":{"route":"/api/contact","type":"endpoint","pattern":"^\\/api\\/contact$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/contact.ts","pathname":"/api/contact","_meta":{"trailingSlash":"ignore"}}}],"site":"https://kapicsoftware.com/","base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"github-dark","wrap":false},"remarkPlugins":[],"rehypePlugins":[],"remarkRehype":{},"extendDefaultPlugins":false,"isAstroFlavoredMd":false},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","@components/blog/Posts.svelte":"Posts.c6600103.js","@components/layout/Navbar.svelte":"Navbar.faec1fff.js","@components/blog/Copy.svelte":"Copy.e7164c14.js","@astrojs/svelte/client.js":"client.b27523fa.js","astro:scripts/page.js":"page.3aa82516.js","astro:scripts/before-hydration.js":"data:text/javascript;charset=utf-8,//[no before-hydration script]"},"assets":["/assets/blog-index-blog-post-contact-index-success.aa88fafa.css","/assets/index.f3b0bf10.css","/assets/success.477946fe.css","/Copy.e7164c14.js","/Navbar.faec1fff.js","/Posts.c6600103.js","/client.b27523fa.js","/custom.css","/favicon.svg","/faviconold.svg","/footer-background.svg","/kapicsoftware-hero-001.gif","/page.3aa82516.js","/search.svg","/admin/config.yml","/admin/index.html","/chunks/index.814c94ee.js","/hero/background-image.svg","/hero/features-background-image.svg","/og/kapic-software-og.png","/page.3aa82516.js","/~partytown/partytown-atomics.js","/~partytown/partytown-media.js","/~partytown/partytown-sw.js","/~partytown/partytown.js"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = {};

const _exports = adapter.createExports(_manifest, _args);
const handler = _exports['handler'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { handler };
