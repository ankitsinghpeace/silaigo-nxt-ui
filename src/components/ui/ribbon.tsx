import React from "react";

type RibbonType = "a" | "b" | "c";

interface RibbonProps {
  type: RibbonType;
  content: string;
  className?: string;
  bgColor?: string;    // dynamic background color
  textColor?: string;  // dynamic text color
}

export const Ribbon: React.FC<RibbonProps> = ({
  type,
  content,
  className,
  bgColor = "",
  textColor = "white",
}) => {
  // Your original common CSS with color variables added
  const commonCss = `
    .ribbon-common {
      position: relative;
      text-transform: uppercase;
      color: var(--ribbon-text-color);
      overflow: visible;
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
    }
  `;

  // Original CSS for ribbons but with colors replaced by CSS variables (var(--ribbon-bg-color), var(--ribbon-text-color))
  const ribbonCssMap: Record<RibbonType, string> = {
    a: `
      .ribbon1 {
        position: absolute;
        top: -6.1px;
        right: 10px;
        z-index: 10;
        /* width fixed but you can adjust if needed */
        width: max-content;
        min-width: 90px;
      }
      .ribbon1:after {
        position: absolute;
        content: "";
        width: 0;
        height: 0;
        border-left: 53px solid transparent;
        border-right: 53px solid transparent;
        border-top: 10px solid var(--ribbon-bg-color);
        right: 0;
        top: 100%;
      }
      .ribbon1 span {
        position: relative;
        display: block;
        text-align: center;
        background: var(--ribbon-bg-color);
        font-size: 14px;
        line-height: 1;
        padding: 12px 8px 10px;
        border-top-right-radius: 8px;
        width: 90px;
      }
      .ribbon1 span:before,
      .ribbon1 span:after {
        position: absolute;
        content: "";
      }
      .ribbon1 span:before {
        height: 6px;
        width: 6px;
        left: -6px;
        top: 0;
        background: var(--ribbon-bg-color);
      }
      .ribbon1 span:after {
        height: 6px;
        width: 8px;
        left: -8px;
        top: 0;
        border-radius: 8px 8px 0 0;
        background: var(--ribbon-border-color, #c02031);
      }
    `,
    b: `
      .ribbon2 {
        width: auto;
        min-width: 60px;
        padding: 10px 0;
        position: absolute;
        top: -6px;
        left: 25px;
        text-align: center;
        border-top-left-radius: 3px;
        background: var(--ribbon-bg-color);
        color: var(--ribbon-text-color);
        z-index: 10;
      }
      .ribbon2:before,
      .ribbon2:after {
        content: "";
        position: absolute;
      }
      .ribbon2:before {
        height: 0;
        width: 0;
        right: -5.5px;
        top: 0.1px;
        border-bottom: 6px solid var(--ribbon-border-color, #8d5a20);
        border-right: 6px solid transparent;
      }
      .ribbon2:after {
        height: 0;
        width: 0;
        bottom: -29.5px;
        left: 0;
        border-left: 30px solid var(--ribbon-bg-color);
        border-right: 30px solid var(--ribbon-bg-color);
        border-bottom: 30px solid transparent;
      }
    `,
    c: `
      .wrap {
        width: auto;
        height: auto;
        position: absolute;
        top: -8px;
        left: 8px;
        overflow: visible;
      }
      .wrap:before,
      .wrap:after {
        content: "";
        position: absolute;
      }
      .wrap:before {
        width: 40px;
        height: 8px;
        right: 100px;
        background: var(--ribbon-border-color, #4d6530);
        border-radius: 8px 8px 0 0;
      }
      .wrap:after {
        width: 8px;
        height: 40px;
        right: 0;
        top: 100px;
        background: var(--ribbon-border-color, #4d6530);
        border-radius: 0 8px 8px 0;
      }
      .ribbon6 {
        width: auto;
        height: 40px;
        line-height: 40px;
        position: absolute;
        top: 30px;
        right: -50px;
        z-index: 10;
        overflow: hidden;
        transform: rotate(45deg);
        border: 1px dashed var(--ribbon-text-color);
        box-shadow: 0 0 0 3px var(--ribbon-bg-color), 0px 21px 5px -18px rgba(0, 0, 0, 0.6);
        background: var(--ribbon-bg-color);
        text-align: center;
        color: var(--ribbon-text-color);
        font-weight: 600;
        text-transform: uppercase;
        padding: 0 20px;
        white-space: nowrap;
      }
    `,
  };

  // Helper to darken color for border accents (simple approximation)
  function darkenColor(color: string, amount: number) {
    try {
      const c = color.charAt(0) === "#" ? color.substring(1) : color;
      const num = parseInt(c, 16);
      let r = (num >> 16) & 0xff;
      let g = (num >> 8) & 0xff;
      let b = num & 0xff;

      r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
      g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
      b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));

      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    } catch {
      return "#8d5a20";
    }
  }

  const styleVars = {
    "--ribbon-bg-color":
      bgColor ||
      (type === "b" ? "#f47530" : type === "a" ? "#f8463f" : "#57dd43"),
    "--ribbon-text-color": textColor,
    "--ribbon-border-color": bgColor
      ? darkenColor(bgColor, 0.3)
      : type === "a"
      ? "#c02031"
      : type === "b"
      ? "#8d5a20"
      : "#4d6530",
  } as React.CSSProperties;

  return (
    <>
      <style>{commonCss}</style>
      <style>{ribbonCssMap[type]}</style>

      {type === "a" && (
        <span
          className={`ribbon-common ribbon1 ${className || ""}`}
          style={styleVars}
          aria-label={content}
        >
          <span>{content}</span>
        </span>
      )}
      {type === "b" && (
        <div
          className={`ribbon-common ribbon2 ${className || ""}`}
          style={styleVars}
          aria-label={content}
        >
          {content}
        </div>
      )}
      {type === "c" && (
        <div
          className="ribbon-common wrap"
          style={{ ...styleVars, position: "absolute" }}
        >
          <span className={`ribbon6 ${className || ""}`} aria-label={content}>
            {content}
          </span>
        </div>
      )}
    </>
  );
};
