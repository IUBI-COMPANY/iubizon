// src/image.ts
import {
  getRenderedAttributes,
  mergeAttributes,
  Node,
  nodeInputRule,
  ResizableNodeView
} from "@tiptap/core";
var inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;
var Image = Node.create({
  name: "image",
  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      resize: false
    };
  },
  inline() {
    return this.options.inline;
  },
  group() {
    return this.options.inline ? "inline" : "block";
  },
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: null
      },
      alt: {
        default: null
      },
      title: {
        default: null
      },
      width: {
        default: null
      },
      height: {
        default: null
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: this.options.allowBase64 ? "img[src]" : 'img[src]:not([src^="data:"])'
      }
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },
  parseMarkdown: (token, helpers) => {
    return helpers.createNode("image", {
      src: token.href,
      title: token.title,
      alt: token.text
    });
  },
  renderMarkdown: (node) => {
    var _a, _b, _c, _d, _e, _f;
    const src = (_b = (_a = node.attrs) == null ? void 0 : _a.src) != null ? _b : "";
    const alt = (_d = (_c = node.attrs) == null ? void 0 : _c.alt) != null ? _d : "";
    const title = (_f = (_e = node.attrs) == null ? void 0 : _e.title) != null ? _f : "";
    return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
  },
  addNodeView() {
    if (!this.options.resize || !this.options.resize.enabled || typeof document === "undefined") {
      return null;
    }
    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = this.options.resize;
    const resizeManagedAttributes = /* @__PURE__ */ new Set(["src", "width", "height"]);
    return ({ node, getPos, HTMLAttributes, editor }) => {
      const el = document.createElement("img");
      el.draggable = false;
      const mergedAttributes = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);
      Object.entries(mergedAttributes).forEach(([key, value]) => {
        if (value != null) {
          switch (key) {
            case "src":
            case "width":
            case "height":
              break;
            default:
              el.setAttribute(key, value);
              break;
          }
        }
      });
      if (mergedAttributes.src !== null) {
        el.src = mergedAttributes.src;
      }
      let previousHTMLAttributes = { ...HTMLAttributes };
      const syncImageSource = (src) => {
        if (typeof src === "string" && src !== "") {
          if (el.getAttribute("src") !== src) {
            el.src = src;
          }
          return;
        }
        if (el.hasAttribute("src")) {
          el.removeAttribute("src");
        }
        if (el.src !== "") {
          el.src = "";
        }
      };
      syncImageSource(HTMLAttributes.src);
      const onUpdate = (updatedNode) => {
        if (updatedNode.type !== node.type) {
          return false;
        }
        const extensionAttributes = editor.extensionManager.attributes.filter(
          (attribute) => attribute.type === updatedNode.type.name
        );
        const newHTMLAttributes = getRenderedAttributes(updatedNode, extensionAttributes);
        Object.keys(previousHTMLAttributes).forEach((key) => {
          if (!resizeManagedAttributes.has(key) && !(key in newHTMLAttributes)) {
            el.removeAttribute(key);
          }
        });
        Object.entries(newHTMLAttributes).forEach(([key, value]) => {
          if (resizeManagedAttributes.has(key)) {
            return;
          }
          if (value != null) {
            el.setAttribute(key, value);
          } else {
            el.removeAttribute(key);
          }
        });
        syncImageSource(newHTMLAttributes.src);
        previousHTMLAttributes = newHTMLAttributes;
        return true;
      };
      const nodeView = new ResizableNodeView({
        element: el,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          el.style.width = `${width}px`;
          el.style.height = `${height}px`;
        },
        onCommit: (width, height) => {
          const pos = getPos();
          if (pos === void 0) {
            return;
          }
          this.editor.chain().setNodeSelection(pos).updateAttributes(this.name, {
            width,
            height
          }).run();
        },
        onUpdate,
        options: {
          directions,
          min: {
            width: minWidth,
            height: minHeight
          },
          preserveAspectRatio: alwaysPreserveAspectRatio === true
        }
      });
      const dom = nodeView.dom;
      dom.style.visibility = "hidden";
      dom.style.pointerEvents = "none";
      el.onload = () => {
        dom.style.visibility = "";
        dom.style.pointerEvents = "";
      };
      return nodeView;
    };
  },
  addCommands() {
    return {
      setImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options
        });
      }
    };
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title] = match;
          return { src, alt, title };
        }
      })
    ];
  }
});

// src/index.ts
var index_default = Image;
export {
  Image,
  index_default as default,
  inputRegex
};
//# sourceMappingURL=index.js.map