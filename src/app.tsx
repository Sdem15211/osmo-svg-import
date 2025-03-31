import React, { useState, useEffect } from "react";
import { OsmoCursor } from "./osmo-cursor";
import { processSvgForWebflow } from "./process-svg-webflow";
import { OsmoLogo } from "./osmo-logo";

const App: React.FC = () => {
  const [fillsUseCurrentColor, setFillsUseCurrentColor] = useState(() => {
    const saved = localStorage.getItem("fillsUseCurrentColor");
    return saved ? JSON.parse(saved) : false;
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

  const handleCloseApp = () => {
    webflow.closeExtension();
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
              <OsmoCursor />
              <div className="canvas-text-content">
                <h2 className="canvas-title">
                  Select an element on the canvas
                </h2>
                <p className="canvas-subtitle">
                  This is where we will add your SVG element.
                </p>
              </div>
            </div>
          </div>
        ) : svgPasteSuccess ? (
          <div className="canvas-wrapper">
            <div className="canvas-fourth-state">
              <OsmoLogo />
              <h2 className="canvas-title">SVG code pasted successfully!</h2>
              <div className="button-container">
                <button
                  className="process-another-button"
                  onClick={handleProcessAnother}
                >
                  import another SVG
                </button>
                <button
                  className="close-app-button secondary"
                  onClick={handleCloseApp}
                >
                  close app
                </button>
              </div>
            </div>
          </div>
        ) : isFocusCanvasActive ? (
          <div className="canvas-wrapper">
            <div className="canvas-third-state">
              <div className="canvas-text-content">
                <h2 className="canvas-title">
                  {isDraggingOver ? "Aaaand let go!" : "Now paste your SVG"}
                </h2>
                <p className="canvas-subtitle">
                  {isDraggingOver
                    ? "we'll do the rest"
                    : "or simply drag and drop an SVG"}
                </p>
              </div>
              <div
                className={`focus-canvas is-third ${
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
                    : "Click below to focus in here"}
                </h2>
                <p className="canvas-subtitle">
                  {isDraggingOver
                    ? "we'll do the rest"
                    : "or simply drag and drop an SVG"}
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
