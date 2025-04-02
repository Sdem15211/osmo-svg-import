import React, { useState, useEffect } from "react";
import { processSvgForWebflow } from "./process-svg-webflow";
import { OsmoLogo } from "./osmo-logo";

const App: React.FC = () => {
  const [fillsUseCurrentColor, setFillsUseCurrentColor] = useState(() => {
    const saved = localStorage.getItem("fillsUseCurrentColor");
    return saved ? JSON.parse(saved) : true;
  });
  const [strokesUseCurrentColor, setStrokesUseCurrentColor] = useState(() => {
    const saved = localStorage.getItem("strokesUseCurrentColor");
    return saved ? JSON.parse(saved) : true;
  });
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [isFocusCanvasActive, setIsFocusCanvasActive] = useState(false);
  const [svgPasteSuccess, setSvgPasteSuccess] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "fillsUseCurrentColor",
      JSON.stringify(fillsUseCurrentColor)
    );
  }, [fillsUseCurrentColor]);

  useEffect(() => {
    localStorage.setItem(
      "strokesUseCurrentColor",
      JSON.stringify(strokesUseCurrentColor)
    );
  }, [strokesUseCurrentColor]);

  useEffect(() => {
    const unsubscribe = webflow.subscribe("selectedelement", (element) => {
      setSelectedElement(element);

      if (!element) {
        setIsFocusCanvasActive(false);
        setSvgPasteSuccess(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFocusCanvasClick = () => {
    setIsFocusCanvasActive(true);
  };

  const handleProcessAnother = () => {
    setSvgPasteSuccess(false);
    setIsFocusCanvasActive(true);
  };

  const handleSvgPaste = (pastedText: string) => {
    try {
      if (!pastedText || pastedText.trim() === "") {
        webflow.notify({
          type: "Error",
          message: "Empty content. Please paste valid SVG code.",
        });
        return;
      }

      if (!pastedText.includes("<svg") || !pastedText.includes("</svg>")) {
        webflow.notify({
          type: "Error",
          message: "Invalid SVG format. Please check your SVG code.",
        });
        return;
      }

      setSvgPasteSuccess(true);
      processSvgForWebflow(pastedText, {
        fillsUseCurrentColor,
        strokesUseCurrentColor,
      });
    } catch (error) {
      webflow.notify({
        type: "Error",
        message: "Failed to process SVG. Please try again.",
      });
    }
  };

  const handleSvgFile = (file: File) => {
    try {
      if (!file) {
        webflow.notify({
          type: "Error",
          message: "No file selected.",
        });
        return;
      }

      if (file.type !== "image/svg+xml") {
        webflow.notify({
          type: "Error",
          message: "Please select an SVG file.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          handleSvgPaste(result);
        } catch (error) {
          webflow.notify({
            type: "Error",
            message: "Failed to read the SVG file.",
          });
        }
      };

      reader.onerror = () => {
        webflow.notify({
          type: "Error",
          message: "Failed to read the file. Please try again.",
        });
      };

      reader.readAsText(file);
    } catch (error) {
      webflow.notify({
        type: "Error",
        message: "An error occurred when processing the file.",
      });
    }
  };

  return (
    <div className="app-container">
      <div className="canvas">
        {!selectedElement ? (
          <div className="canvas-wrapper">
            <div className="canvas-first-state">
              <svg
                width="25"
                height="41"
                viewBox="0 0 25 41"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="18"
                  height="18"
                  rx="9"
                  fill="#FF412C"
                  fillOpacity="0.12"
                />
                <rect
                  x="0.5"
                  y="0.5"
                  width="17"
                  height="17"
                  rx="8.5"
                  stroke="#FF412C"
                  strokeOpacity="0.7"
                />
                <path
                  d="M10.2 9H7.28571V10.4522H5.82857V23.5219H4.37143V22.0697H0V26.4263H1.45714V27.8785H2.91429V30.7829H4.37143V33.6873H5.82857V36.5917H7.28571V40.9483H21.8571V36.5917H23.3143V32.2351H24.7714V22.0697H23.3143V20.6176H21.8571V19.1654H18.9429V17.7132H14.5714V16.261H11.6571V10.4522H10.2V9Z"
                  fill="#131313"
                />
                <path
                  d="M7.2856 10.9263V26.9004H5.82846V25.4482H4.37132V23.996H1.45703V26.9004H2.91417V28.3526H4.37132V31.257H5.82846V34.1614H7.2856V37.0658H8.74274V39.9702H20.3999V37.0658H21.857V32.7092H23.3142V22.5438H21.857V21.0916H20.3999V25.4482H18.9427V19.6394H16.0285V23.996H14.5713V18.1872H11.657V23.996H10.1999V10.9263H7.2856Z"
                  fill="#EFEEEC"
                />
              </svg>

              <div className="canvas-text-content">
                <h2 className="canvas-title">
                  Select an element on the canvas
                </h2>
                <p className="canvas-subtitle">
                  This is where we will insert the {`<svg>`} element.
                </p>
              </div>
            </div>
          </div>
        ) : svgPasteSuccess ? (
          <div className="canvas-wrapper">
            <div className="canvas-fourth-state">
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="21"
                  height="21"
                  rx="10.5"
                  fill="#0BA954"
                  fillOpacity="0.15"
                  stroke="#0BA954"
                />
                <path
                  d="M7 10.75L10 13.75L15.5 8.25"
                  stroke="#0BA954"
                  strokeWidth="1.4"
                  strokeMiterlimit="10"
                />
              </svg>
              <div className="canvas-text-content">
                <h2 className="canvas-title">SVG pasted successfully!</h2>
                <p className="canvas-subtitle">Let's do another one?</p>
              </div>
              <button
                className="process-another-button"
                onClick={handleProcessAnother}
              >
                Import another {`<svg>`}
              </button>
            </div>
          </div>
        ) : isFocusCanvasActive ? (
          <div className="canvas-wrapper">
            <div className="canvas-third-state">
              <div className="canvas-text-content">
                <h2 className="canvas-title">
                  {isDraggingOver ? "Aaaand let go!" : "Great, now paste it!"}
                </h2>
                <p className="canvas-subtitle">
                  {isDraggingOver
                    ? "we'll do the rest"
                    : "or drop your .svg file below"}
                </p>
              </div>
              <div
                className={`focus-canvas ${
                  isDraggingOver ? "is-dragging-over" : ""
                }`}
                onClick={() =>
                  document.getElementById("svg-paste-area")?.focus()
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    handleSvgFile(files[0]);
                  }
                }}
              >
                <textarea
                  id="svg-paste-area"
                  style={{
                    position: "absolute",
                    opacity: 0,
                    height: "1px",
                    width: "1px",
                    pointerEvents: "none",
                  }}
                  autoFocus
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData("text/plain");
                    handleSvgPaste(pastedText);
                  }}
                />
                {!isDraggingOver && (
                  <div className="focus-instructions">
                    <div className="focus-instructions-item">CMND</div>/
                    <div className="focus-instructions-item">CTRL</div>+
                    <div className="focus-instructions-item">V</div>
                  </div>
                )}
                {isDraggingOver && <OsmoLogo />}
              </div>
            </div>
          </div>
        ) : (
          <div className="canvas-wrapper">
            <div className="canvas-second-state">
              <div className="canvas-text-content">
                <h2 className="canvas-title">
                  {isDraggingOver
                    ? "Aaaand let go!"
                    : "Click below to paste your <svg>"}
                </h2>
                <p className="canvas-subtitle">
                  {isDraggingOver
                    ? "we'll do the rest"
                    : "or drop your .svg file below"}
                </p>
              </div>
              <div
                className={`focus-canvas ${
                  isDraggingOver ? "is-dragging-over is-third" : ""
                }`}
                onClick={handleFocusCanvasClick}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    setIsFocusCanvasActive(true);
                    handleSvgFile(files[0]);
                  } else {
                    setIsFocusCanvasActive(true);
                  }
                }}
              >
                <OsmoLogo />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="controls">
        <div className="control-item">
          <input
            type="checkbox"
            id="fills-checkbox"
            checked={fillsUseCurrentColor}
            onChange={() => setFillsUseCurrentColor(!fillsUseCurrentColor)}
          />
          <label htmlFor="fills-checkbox">Fills use currentColor</label>
        </div>
        <div className="control-item">
          <input
            type="checkbox"
            id="strokes-checkbox"
            checked={strokesUseCurrentColor}
            onChange={() => setStrokesUseCurrentColor(!strokesUseCurrentColor)}
          />
          <label htmlFor="strokes-checkbox">Strokes use currentColor</label>
        </div>
      </div>
    </div>
  );
};

export default App;
